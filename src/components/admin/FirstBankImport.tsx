'use client';
import { useState, useEffect } from 'react';
import { createBatchId } from '@/lib/import-batches';
import { Upload, Loader2, CheckCircle2, Image as ImageIcon, FileSpreadsheet, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type RowStatus = 'ok' | 'advertencia' | 'error';
type FBVehicle = {
  lote: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage: number | null;
  exterior_color: string;
  tablilla: string;
  puertas: string;
  observaciones: string;
  images: { name: string; file: File }[];
  status: RowStatus;
  issues: string[];
};

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

function parseCSVLine(line: string, delim: string): string[] {
  const cols: string[] = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if (c === delim && !inQ) { cols.push(cur.trim()); cur = ''; }
    else cur += c;
  }
  cols.push(cur.trim());
  return cols.map(c => c.replace(/^"|"$/g, '').trim());
}

function normalizeVin(raw: string): string {
  return (raw || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

function parseFirstBankCSV(text: string): FBVehicle[] {
  text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split(/\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const delim = lines[0].split(';').length > lines[0].split(',').length ? ';' : ',';
  const headers = parseCSVLine(lines[0], delim).map(h => h.toLowerCase().trim());
  const idx = (...names: string[]) => {
    for (const n of names) { const i = headers.findIndex(h => h.includes(n)); if (i !== -1) return i; }
    return -1;
  };
  const iLote = idx('lote', 'lot', 'order');
  const iBrand = idx('marca', 'make', 'brand');
  const iModel = idx('modelo', 'model');
  const iYear = idx('año', 'ano', 'year');
  const iVin = idx('vin');
  const iPlate = idx('tablilla', 'plate');
  const iColor = idx('color');
  const iMile = idx('millaje', 'mileage', 'odo', 'millas');
  const iDoors = idx('puertas', 'doors');
  const iNotes = idx('observaciones', 'notes', 'observaciones');

  const seen = new Set<string>();
  return lines.slice(1).map(l => {
    const c = parseCSVLine(l, delim);
    const get = (i: number) => (i === -1 ? '' : (c[i] || '').trim());
    const vin = normalizeVin(get(iVin));
    const year = parseInt(get(iYear)) || 0;
    const mileageRaw = (get(iMile) || '').replace(/[^0-9]/g, '');
    const mileage = mileageRaw ? parseInt(mileageRaw) : null;
    const puertas = get(iDoors);
    const observaciones = get(iNotes);
    const issues: string[] = [];
    let status: RowStatus = 'ok';
    if (!get(iBrand) || !get(iModel)) { issues.push('Falta marca o modelo'); status = 'error'; }
    if (!year || year < 1900 || year > 2027) { issues.push('Año inválido'); status = 'error'; }
    if (vin.length !== 17) { issues.push(`VIN con ${vin.length} caracteres (debe tener 17)`); status = 'error'; }
    else if (!VIN_RE.test(vin)) { issues.push('VIN con caracteres inválidos (I, O, Q o símbolos)'); status = 'error'; }
    if (vin && seen.has(vin)) { issues.push('VIN duplicado en el listado'); status = 'error'; }
    if (vin) seen.add(vin);
    if (mileage === null) { issues.push('Sin millaje'); if (status === 'ok') status = 'advertencia'; }
    if (puertas && puertas !== '4') { issues.push(`Puertas: ${puertas} (revisar)`); if (status === 'ok') status = 'advertencia'; }
    if (/verificar vin/i.test(observaciones)) { issues.push('El listado marca: verificar VIN'); if (status === 'ok') status = 'advertencia'; }
    return {
      lote: get(iLote), brand: get(iBrand), model: get(iModel), year, vin, mileage,
      exterior_color: get(iColor), tablilla: get(iPlate), puertas, observaciones,
      images: [], status, issues,
    };
  });
}

export default function FirstBankImport({ initialBatchId, account }: { initialBatchId: string; account?: { email: string; role: string | null } }) {
  const [vehicles, setVehicles] = useState<FBVehicle[] | null>(null);
  const [unmatchedPhotos, setUnmatchedPhotos] = useState<string[]>([]);
  const [ambiguousPhotos, setAmbiguousPhotos] = useState<{ name: string; fragment: string; matches: string[] }[]>([]);
  const [totalPhotos, setTotalPhotos] = useState(0);
  const [batchId, setBatchId] = useState<string>(initialBatchId);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: number; fail: number; errs: string[]; batchId?: string; photos?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<{ batch: string; count: number }[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchesError, setBatchesError] = useState<string | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<string | null>(null);

  const loadBatches = async () => {
    setBatchesLoading(true); setBatchesError(null);
    try {
      const res = await fetch('/api/admin/import-first-bank', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.batches)) throw new Error('No se pudieron cargar los lotes.');
      setBatches(data.batches);
    } catch {
      setBatchesError('No se pudieron cargar los lotes.');
    } finally {
      setBatchesLoading(false);
    }
  };

  useEffect(() => { void loadBatches(); }, []);

  const deleteBatch = async (batch: string) => {
    if (!confirm(`¿Eliminar todo el lote ${batch}? Se borrarán todos los vehículos de ese lote y sus fotos.`)) return;
    setDeletingBatch(batch);
    try {
      const res = await fetch('/api/admin/delete-batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo borrar el lote.');
      alert(`${data.deleted} vehículos eliminados del lote ${batch}.`);
      await loadBatches();
    } catch (err: any) {
      alert('Error: ' + (err.message || 'No se pudo borrar el lote.'));
    } finally {
      setDeletingBatch(null);
    }
  };

  const valid = (vehicles || []).filter(v => v.status !== 'error');
  const withErrors = (vehicles || []).filter(v => v.status === 'error');
  const withPhotos = (vehicles || []).filter(v => v.images.length > 0).length;

  const handleCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const t = await f.text();
    const p = parseFirstBankCSV(t);
    if (p.length === 0) { alert('CSV sin vehículos. Debe tener las columnas Lote, Marca, Modelo, Año, VIN, Tablilla, Color, Millaje, Puertas. Primera línea: ' + t.split('\n')[0].slice(0, 120)); return; }
    setBatchId(createBatchId());
    setVehicles(p);
    setUnmatchedPhotos([]);
    setAmbiguousPhotos([]);
    setTotalPhotos(0);
    setResult(null);
    setError(null);
  };

  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    if (!vehicles) { alert('Primero sube el listado CSV, para poder casar las fotos por VIN.'); e.target.value = ''; return; }
    // El nombre de la foto puede traer el VIN completo o solo sus últimos 6 a 8 caracteres.
    // Se prueban todos los pedazos del nombre (del más largo al más corto): si el pedazo
    // es el final exacto del VIN de un solo vehículo, la foto va para ese vehículo.
    const findMatch = (fileName: string): { vehicle?: FBVehicle; fragment?: string; ambiguous?: FBVehicle[] } => {
      const base = fileName.replace(/\.[^.]+$/, '');
      const tokens = base.split(/[^A-Za-z0-9]+/).filter(Boolean).map(normalizeVin).sort((a, b) => b.length - a.length);
      for (const token of tokens) {
        if (token.length < 6) continue;
        const matches = (vehicles || []).filter(v => v.vin.endsWith(token));
        if (matches.length === 1) return { vehicle: matches[0], fragment: token };
        if (matches.length > 1) return { fragment: token, ambiguous: matches };
      }
      return {};
    };
    const byVin = new Map<string, { name: string; file: File }[]>();
    const unmatched: string[] = [];
    const ambiguous: { name: string; fragment: string; matches: string[] }[] = [];
    for (const file of files) {
      const { vehicle, fragment, ambiguous: amb } = findMatch(file.name);
      if (vehicle) {
        if (!byVin.has(vehicle.vin)) byVin.set(vehicle.vin, []);
        byVin.get(vehicle.vin)!.push({ name: file.name, file });
      } else if (amb && fragment) {
        ambiguous.push({ name: file.name, fragment, matches: amb.map(v => `${v.brand} ${v.model} ${v.year} (${v.vin})`) });
      } else unmatched.push(file.name);
    }
    const updated = (vehicles || []).map(v => {
      const imgs = byVin.get(v.vin);
      if (!imgs) return v;
      const sorted = [...imgs].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      return { ...v, images: sorted };
    });
    setVehicles(updated);
    setUnmatchedPhotos(unmatched);
    setAmbiguousPhotos(ambiguous);
    setTotalPhotos(files.length - unmatched.length - ambiguous.length);
    setResult(null);
  };

  const handleImport = async () => {
    if (!vehicles || valid.length === 0) return;
    setImporting(true); setProgress('Subiendo fotos…'); setError(null); setResult(null);
    try {
      const supabase = createClient();
      const payload: any[] = [];
      let uploadedPhotos = 0;
      let done = 0;
      for (const v of valid) {
        const urls: string[] = [];
        for (const img of v.images) {
          const ext = img.file.name.split('.').pop() || 'jpg';
          const path = `first-bank/${batchId}/${v.vin}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabase.storage.from('vehicle_media').upload(path, img.file);
          if (upErr) throw new Error(`Foto ${img.name}: ${upErr.message}`);
          const { data } = supabase.storage.from('vehicle_media').getPublicUrl(path);
          urls.push(data.publicUrl);
          uploadedPhotos++;
        }
        payload.push({ ...v, images: urls });
        done++;
        setProgress(`Subiendo fotos… ${done} de ${valid.length} vehículos`);
      }
      setProgress('Importando vehículos…');
      const res = await fetch('/api/admin/import-first-bank', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicles: payload, batchId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo importar el listado.');
      setResult({ ...data, photos: uploadedPhotos });
      void loadBatches();
    } catch (err: any) {
      setError(err.message || 'Error al importar.');
    } finally {
      setImporting(false); setProgress(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Importación First Bank</h1>
        <p className="text-gray-400 mt-1">Sube el listado de la subasta First Bank (CSV) y las fotos por VIN. Los vehículos quedan marcados como First Bank Subasta 1068 y se pueden borrar por lote.</p>
        {account && <p className="text-xs text-gray-500 mt-1">Sesión: {account.email} · Rol: {account.role || 'sin rol'}</p>}
        <p className="text-xs text-gray-500 mt-1">Lote de importación: <span className="font-mono">{batchId}</span></p>
      </div>

      {/* Instrucciones de uso */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-bold text-lg">Cómo usar esta página</h2>
        <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-gray-300">
          <li><b className="text-white">Sube el listado CSV</b> de la subasta (sección 1). Debe tener las columnas Lote, Marca, Modelo, Año, VIN, Tablilla, Color, Millaje, Puertas y Observaciones.</li>
          <li><b className="text-white">Revisa la tabla:</b> los vehículos con VIN malo (letras I, O, Q o un largo distinto de 17) quedan en rojo y no se importan. Los de “Revisar” (sin millaje o puertas raras) sí se importan.</li>
          <li><b className="text-white">Sube las fotos</b> (sección 2), todas a la vez. Nombra cada foto con el VIN completo o con sus últimos 6 a 8 caracteres (ej. <span className="font-mono">067864_1.jpg</span>). La primera foto de cada vehículo queda como principal.</li>
          <li><b className="text-white">Importa en Borrador.</b> Los vehículos quedan guardados pero ningún comprador los ve.</li>
          <li><b className="text-white">Después de la subasta,</b> publica solo los vehículos que compraste, desde Vehículos. Los que no compraste, bórralos por lote en la sección de abajo.</li>
          <li><b className="text-white">Para borrar un lote de First Bank,</b> usa la sección “Lotes de First Bank” de esta misma página. No hace falta ir a Subir Múltiples Vehículos.</li>
        </ol>
      </section>

      {/* Sección 1: listado */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-bold text-lg flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" /> 1. Subir el listado</h2>
        <p className="text-sm text-gray-400 mt-1">Archivo CSV con las columnas: Lote, Marca, Modelo, Año, VIN, Tablilla, Color, Millaje, Puertas, Observaciones. Sin precio: los vehículos se importan sin precio inicial.</p>
        <label className={`mt-4 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer ${vehicles ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-red-500/50'}`}>
          <Upload className="h-8 w-8 mb-2" />
          <span className="font-bold">{vehicles ? `${vehicles.length} vehículos en el listado` : 'Seleccionar archivo CSV'}</span>
          <input type="file" disabled={importing} accept=".csv" onChange={handleCsv} className="hidden" />
          {vehicles && <span className="mt-2 text-green-400 text-xs font-bold">✓ Cargado</span>}
        </label>
        {vehicles && (
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/5">Total: {vehicles.length}</span>
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400">Válidos: {valid.length}</span>
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400">Con error: {withErrors.length}</span>
            <span className="px-3 py-1 rounded-full bg-white/5">Con fotos: {withPhotos}</span>
          </div>
        )}
      </section>

      {/* Sección 2: fotos */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-bold text-lg flex items-center gap-2"><ImageIcon className="h-5 w-5" /> 2. Subir las fotos en masa</h2>
        <p className="text-sm text-gray-400 mt-1">Selecciona todas las fotos a la vez. Nombra cada archivo con el VIN completo o con sus últimos 6 a 8 caracteres: <span className="font-mono text-gray-300">JTDM4MCE0MJ067864_1.jpg</span> o <span className="font-mono text-gray-300">067864_1.jpg</span>. El sistema reconoce el pedazo y lo casa con el único vehículo del listado que termina en esos caracteres. La primera foto queda como principal.</p>
        <label className={`mt-4 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer ${totalPhotos > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-red-500/50'}`}>
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="font-bold">{totalPhotos > 0 ? `${totalPhotos} fotos listas` : 'Seleccionar fotos'}</span>
          <span className="text-xs text-gray-400">Puedes seleccionar muchas a la vez</span>
          <input type="file" disabled={importing || !vehicles} accept="image/*" multiple onChange={handlePhotos} className="hidden" />
          {totalPhotos > 0 && <span className="mt-2 text-green-400 text-xs font-bold">✓ Cargadas</span>}
        </label>
        {!vehicles && <p className="text-xs text-amber-400 mt-2">Primero sube el listado CSV.</p>}
        {unmatchedPhotos.length > 0 && (
          <div className="mt-4 text-sm text-amber-300">
            <p className="font-bold">Fotos sin vehículo en el listado ({unmatchedPhotos.length}):</p>
            <ul className="list-disc ml-5 mt-1 max-h-32 overflow-auto">{unmatchedPhotos.map(n => <li key={n} className="font-mono text-xs">{n}</li>)}</ul>
          </div>
        )}
        {ambiguousPhotos.length > 0 && (
          <div className="mt-4 text-sm text-amber-300">
            <p className="font-bold">Fotos con más de un posible vehículo ({ambiguousPhotos.length}): no se asignaron, revísalas a mano.</p>
            <ul className="list-disc ml-5 mt-1 max-h-32 overflow-auto">{ambiguousPhotos.map(a => <li key={a.name} className="text-xs"><span className="font-mono">{a.name}</span> · pedazo “{a.fragment}” coincide con: {a.matches.join(' ; ')}</li>)}</ul>
          </div>
        )}
      </section>

      {/* Vista previa */}
      {vehicles && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="font-bold text-lg mb-3">Vista previa del listado</h2>
          <div className="max-h-96 overflow-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#111]">
                <tr className="text-left text-gray-400">
                  <th className="p-2">Lote</th><th className="p-2">Marca</th><th className="p-2">Modelo</th><th className="p-2">Año</th><th className="p-2">VIN</th><th className="p-2">Millaje</th><th className="p-2">Fotos</th><th className="p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.lote + v.vin} className={`border-t border-white/5 ${v.status === 'error' ? 'bg-red-500/5' : v.status === 'advertencia' ? 'bg-amber-500/5' : ''}`}>
                    <td className="p-2">{v.lote}</td>
                    <td className="p-2">{v.brand}</td>
                    <td className="p-2">{v.model}</td>
                    <td className="p-2">{v.year || '—'}</td>
                    <td className="p-2 font-mono text-xs">{v.vin || '—'}</td>
                    <td className="p-2">{v.mileage === null ? '—' : v.mileage.toLocaleString()}</td>
                    <td className="p-2">{v.images.length || '—'}</td>
                    <td className="p-2">
                      {v.status === 'ok' && <span className="text-green-400 text-xs font-bold">✓ Listo</span>}
                      {v.status === 'advertencia' && <span className="text-amber-400 text-xs font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Revisar</span>}
                      {v.status === 'error' && <span className="text-red-400 text-xs font-bold flex items-center gap-1"><XCircle className="h-3 w-3" /> Error</span>}
                      {v.issues.length > 0 && <span className="block text-xs text-gray-400">{v.issues.join(' · ')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">Los vehículos con error no se importan. Corrige el VIN con First Bank y vuelve a subir el listado.</p>
        </section>
      )}

      {/* Importar */}
      {vehicles && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-bold">Estado al importar</label>
            <select value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')} disabled={importing} className="mt-1 w-full md:w-72 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <option value="draft">Borrador (no visible a compradores)</option>
              <option value="published">Publicado (visible en el inventario)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Recomendado: Borrador hasta después de la subasta. Publica solo los vehículos que compres, desde Vehículos.</p>
          </div>
          <button onClick={handleImport} disabled={importing || valid.length === 0} className="rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 px-6 py-3 font-bold flex items-center justify-center gap-2">
            {importing ? <><Loader2 className="h-5 w-5 animate-spin" /> {progress || 'Importando…'}</> : `Importar ${valid.length} vehículos First Bank`}
          </button>
          {error && <p className="text-red-400 text-sm font-bold">{error}</p>}
          {result && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-sm">
              <p className="font-bold text-green-400 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Importación completada</p>
              <p className="mt-1">Vehículos importados: {result.ok} · Fallidos: {result.fail} · Fotos subidas: {result.photos ?? 0} · Lote: <span className="font-mono">{result.batchId}</span></p>
              {result.errs?.length > 0 && <ul className="list-disc ml-5 mt-2 text-red-300">{result.errs.map((e, i) => <li key={i}>{e}</li>)}</ul>}
              <a href="/admin/vehicles" className="text-red-400 font-bold underline mt-2 inline-block">Ver vehículos →</a>
            </div>
          )}
        </section>
      )}

      {/* Lotes de First Bank: borrado */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-bold text-lg">Lotes de First Bank</h2>
        <p className="text-sm text-gray-400 mt-1">Cada importación genera un lote. Para borrar los vehículos de un lote (por ejemplo, los de una prueba o los que no se compraron en la subasta), elimínalo aquí. No hace falta ir a Subir Múltiples Vehículos.</p>
        {batchesLoading && <p className="text-sm text-gray-400 mt-3">Cargando lotes…</p>}
        {batchesError && <p className="text-sm text-red-400 mt-3">{batchesError} <button type="button" onClick={() => void loadBatches()} className="underline">Reintentar</button></p>}
        {!batchesLoading && !batchesError && batches.length === 0 && <p className="text-sm text-gray-400 mt-3">No hay lotes de First Bank todavía. Aparecerán aquí al terminar una importación.</p>}
        <div className="space-y-2 mt-3">
          {batches.map(b => (
            <div key={b.batch} className="flex flex-wrap justify-between items-center gap-2 bg-white/5 p-3 rounded-xl">
              <span className="font-mono text-sm break-all">{b.batch} <span className="text-gray-400">· {b.count} vehículos</span></span>
              <button type="button" onClick={() => void deleteBatch(b.batch)} disabled={deletingBatch !== null} className="bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                <Trash2 className="h-3 w-3" /> {deletingBatch === b.batch ? 'Borrando… no cierres la página' : 'Eliminar lote'}
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Borrar un lote puede tardar unos minutos. Espera el mensaje de confirmación y no pulses dos veces.</p>
      </section>
    </div>
  );
}
