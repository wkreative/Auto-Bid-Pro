'use client';
import { useState, useEffect, useCallback } from 'react';
import { createBatchId } from '@/lib/import-batches';
import { Upload, Loader2, Copy, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

type ParsedVehicle = { brand: string; model: string; year: number; vin: string; mileage: number; location: string; starting_price?: number; images: string[]; trim?: string; exterior_color?: string; description?: string };

function parseCSVLine(line: string, delim: string): string[] {
  const cols: string[] = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; } else if (c === delim && !inQ) { cols.push(cur.trim()); cur = ''; } else cur += c; }
  cols.push(cur.trim()); return cols.map(c => c.replace(/^"|"$/g, '').trim());
}
function parseCSV(text: string): ParsedVehicle[] {
  text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split(/\n/).filter(l => l.trim()); if (lines.length < 2) return [];
  const delim = (lines[0].split(';').length > lines[0].split(',').length) ? ';' : ',';
  const headers = parseCSVLine(lines[0], delim).map(h => h.toLowerCase().trim());
  const idx = (n: string) => headers.findIndex(h => h.includes(n));
  const iYear = idx('year'), iMake = idx('make') !== -1 ? idx('make') : idx('brand'), iModel = idx('model'), iVin = idx('vin'), iOdo = idx('odo') !== -1 ? idx('odo') : idx('mile'), iPrice = idx('mmr') !== -1 ? idx('mmr') : idx('price'), iTrim = idx('trim'), iColor = headers.findIndex(h => h.includes('exterior color')), iSellerComments = headers.findIndex(h => h.includes('seller comments')), iNotes = idx('notes'), iGrade = headers.findIndex(h => h.includes('condition report grade')), iSeller = headers.findIndex(h => h.includes('seller name')), iAuction = headers.findIndex(h => h.includes('auction house'));
  return lines.slice(1).map(l => { const c = parseCSVLine(l, delim); const vin = (c[iVin] || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 17); const grade = c[iGrade]||''; const seller = c[iSeller]||''; const auction = c[iAuction]||''; const comments = c[iSellerComments]||''; const notes = c[iNotes]||''; const descParts = []; if(grade) descParts.push(`Condición: ${grade}/5`); if(seller) descParts.push(`Vendedor: ${seller}`); if(auction) descParts.push(`Casa: ${auction}`); if(comments) descParts.push(`Comentarios: ${comments}`); if(notes) descParts.push(`Notas: ${notes}`); return { brand: c[iMake] || 'N/A', model: c[iModel] || 'N/A', year: parseInt(c[iYear]) || 2020, vin, mileage: parseInt((c[iOdo] || '0').replace(/[^0-9]/g, '')) || 0, location: 'Puerto Rico', starting_price: parseFloat((c[iPrice] || '1000').replace(/[^0-9.]/g, '')) || 1000, images: [], trim: c[iTrim], exterior_color: c[iColor], description: descParts.join(' | ') }; }).filter(v => v.vin.length >= 5);
}

const SCRIPT = `fetch('https://auto-bid-pro-theta.vercel.app/photos-extract.js?t=' + Date.now())
  .then(r => { if (!r.ok) throw new Error('No se pudo cargar el extractor'); return r.text(); })
  .then(code => (0, eval)(code))
  .catch(error => alert('No se pudo iniciar el extractor: ' + error.message));`;

export default function ImportVehicles({ initialBatchId }: { initialBatchId: string }) {
  const [csvVehicles, setCsvVehicles] = useState<ParsedVehicle[] | null>(null);
  const [imagesMap, setImagesMap] = useState<Map<string, string[]> | null>(null);
  const [merged, setMerged] = useState<ParsedVehicle[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number; errs: string[]; batchId?: string } | null>(null);
  const [batchId, setBatchId] = useState<string>(initialBatchId);
  const [copied, setCopied] = useState(false);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const [batches, setBatches] = useState<{ batch: string; count: number }[]>([]);

  const [batchesLoading, setBatchesLoading] = useState(true);
  const [batchesError, setBatchesError] = useState<string | null>(null);

  const loadBatches = useCallback((signal?: AbortSignal) => {
    return fetch('/api/admin/batches', { cache: 'no-store', signal })
      .then(async res => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data.batches)) throw new Error('No se pudieron cargar los lotes.');
        return data.batches;
      })
      .then(data => {
        if (!signal?.aborted) {
          setBatches(data);
          setBatchesError(null);
        }
      })
      .catch(() => {
        if (!signal?.aborted) setBatchesError('No se pudieron cargar los lotes. Intenta de nuevo.');
      })
      .finally(() => {
        if (!signal?.aborted) setBatchesLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadBatches(controller.signal);
    return () => controller.abort();
  }, [loadBatches]);

  const handleCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; const t = await f.text(); const p = parseCSV(t); if (p.length === 0) alert('CSV sin vehículos detectados. Asegúrate de subir un archivo CSV válido (debe tener columnas Vin, Year, Make). Primer línea: ' + t.split('\n')[0].slice(0, 120)); setBatchId(createBatchId()); setCsvVehicles(p); if (imagesMap) merge(p, imagesMap); else setMerged(p); setResult(null);
  };
  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; const t = await f.text();
    try {
      const arr: { vin: string; image: string }[] = JSON.parse(t);
      const map = new Map<string, string[]>();
      for (const { vin, image } of arr) {
        if (!map.has(vin)) map.set(vin, []);
        if (!map.get(vin)!.includes(image)) map.get(vin)!.push(image);
      }
      setImagesMap(map);
      if (csvVehicles) merge(csvVehicles, map);
      else setMerged([]); 
      setResult(null);

      const totalPhotos = [...map.values()].flat().length;
      setPhotoNotice(`Archivo leído. Fotos listas para importar: ${totalPhotos} fotos para ${map.size} vehículos.`);
    } catch { alert('JSON de fotos inválido'); }
  };
  const merge = (csv: ParsedVehicle[], map: Map<string, string[]>) => {
    const m = csv.map(v => ({ ...v, images: (map.get(v.vin) || []).slice(0, 8) }));
    setMerged(m);
  };
  const vehicles = csvVehicles ? merged : [];

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('No se pudo copiar automáticamente. Selecciona y copia el código que aparece debajo del botón.');
    }
  };
  const deleteBatch = async (batch: string) => {
    if(!confirm(`¿Eliminar todo el lote ${batch}? Se borrarán todos los vehículos de ese grupo.`)) return;
    const res = await fetch('/api/admin/delete-batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch }) });
    const data = await res.json();
    if (!res.ok) return alert('Error: ' + data.error);
    alert(`${data.deleted} vehículos eliminados`); loadBatches();
  };

  const handleImport = async () => {
    const currentBatchId = result?.ok ? createBatchId() : batchId;
    setBatchId(currentBatchId);
    setImporting(true); setResult(null); setPhotoNotice(null);
    try {
      const res = await fetch('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batchId: currentBatchId, vehicles: vehicles.map(v=>({brand:v.brand, model: v.model + (v.trim?' '+v.trim:''), year:v.year, vin:v.vin, mileage:v.mileage, location:'Puerto Rico', starting_price:v.starting_price, exterior_color:v.exterior_color, description: v.description, images:v.images})) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en importación');
      setResult({ ok: data.ok, fail: data.fail, errs: data.errs, batchId: data.batchId });
      setBatchId(data.batchId);
      await loadBatches();
    } catch (e){ setResult({ ok:0, fail: vehicles.length, errs:[(e as Error).message], batchId: currentBatchId}); }
    setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Importar Vehículos e Imágenes</h1>
      <p className="text-gray-400 mb-6">Inventario Puerto Rico. Lote actual: <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-xs">{batchId}</span></p>

      {/* Photo completion notification */}
      {photoNotice && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 font-medium flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-400 flex-shrink-0" />
            <span>{photoNotice}</span>
          </div>
          <button onClick={() => setPhotoNotice(null)} className="text-xs text-green-400/80 hover:text-green-300 ml-4 underline">Cerrar</button>
        </div>
      )}

      <div className="glass p-6 rounded-2xl border border-white/5 mb-6">
        <h2 className="font-bold mb-2">📋 Instrucciones detalladas para importar desde Manheim</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
          <li><b>Entra a Manheim:</b> inicia sesión con tu usuario y código SMS en <b>search.manheim.com</b>. Abre tu búsqueda de vehículos y verifica el filtro de <b>Puerto Rico</b>.</li>
          <li><b>Exporta los vehículos:</b> en la búsqueda selecciona <b>Export → Export to CSV</b> y guarda <b>Export.csv</b>. Usa la misma búsqueda para capturar las fotos.</li>
          <li><b>Prepara la captura:</b> vuelve a la primera página de resultados y desplázate hacia abajo para cargar los vehículos y sus fotos. Haz clic en <b>Copiar script para consola</b> aquí.</li>
          <li><b>Abre la consola en la pestaña de Manheim:</b> presiona <b>F12</b> (o <b>Ctrl + Shift + J</b>) y selecciona <b>Console / Consola</b>. Pega el código y presiona <b>Enter</b>. Si el navegador bloquea el pegado y te pide confirmarlo, revisa el código de abajo y escribe <b>allow pasting</b> solo si reconoces este extractor; luego pega el código.</li>
          <li><b>Captura todas las páginas:</b> espera a que el extractor termine. Aparecerá el panel <b>Auto Bid Pro - Extractor de Fotos</b> con el número de VINs y fotos. Intenta avanzar automáticamente hasta 20 páginas. Si no avanza o quedan resultados, pasa manualmente a la siguiente página y pulsa <b>Capturar esta página</b>; espera antes de repetir. Mantén la misma pestaña sin recargar para conservar las fotos capturadas.</li>
          <li><b>Guarda las fotos:</b> al terminar pulsa <b>Descargar JSON</b> en el panel. Se guardará <b>fotos.json</b>; si ya se descargó automáticamente, usa la descarga más reciente después de capturar todas las páginas. Si marca 0 fotos, confirma que los resultados y sus imágenes estén cargados y vuelve a capturar.</li>
          <li><b>Sube ambos archivos aquí:</b> selecciona <b>Export.csv</b> en <b>1. Archivo CSV</b> y <b>fotos.json</b> en <b>2. Fotos JSON</b>. Revisa la vista previa y el número de fotos por vehículo. Se vinculan por VIN y se importan hasta 8 fotos por vehículo.</li>
          <li><b>Importa y verifica:</b> pulsa <b>Importar</b> y espera el resultado sin cerrar la página. Revisa cualquier error y pulsa <b>Ver inventario publicado</b>. Guarda el número de lote para identificar esta carga.</li>
        </ol>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={copyScript} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Copy className="h-4 w-4" /> {copied ? '¡Copiado!' : 'Copiar script para consola'}</button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Pega este código en la consola de Manheim. También puedes seleccionarlo y copiarlo manualmente.</p>
        <pre className="mt-2 p-4 bg-black/40 rounded-xl text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap break-all"><code>{SCRIPT}</code></pre>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer ${csvVehicles ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/[0.02] hover:border-primary/50'}`}>
          <Upload className="h-8 w-8 mb-2" /><span className="font-bold">1. Archivo CSV</span><span className="text-xs text-gray-400">{csvVehicles ? `${csvVehicles.length} vehículos` : 'Click para seleccionar'}</span><input type="file" disabled={importing} accept=".csv" onChange={handleCsv} className="hidden" />{csvVehicles && <span className="mt-2 text-green-400 text-xs font-bold">✓ Cargado</span>}
        </label>
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer ${imagesMap ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/[0.02] hover:border-primary/50'}`}>
          <ImageIcon className="h-8 w-8 mb-2" /><span className="font-bold">2. Fotos JSON</span><span className="text-xs text-gray-400">{imagesMap ? `${[...imagesMap.values()].flat().length} fotos cargadas` : 'Opcional'}</span><input type="file" disabled={importing} accept=".json" onChange={handleImages} className="hidden" />{imagesMap && <span className="mt-2 text-green-400 text-xs font-bold">✓ Fotos listas</span>}
        </label>
      </div>

      {vehicles.length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden mb-6">
          <div className="p-4 flex justify-between items-center border-b border-white/5">
            <span className="font-bold">{vehicles.length} vehículos listos {imagesMap ? `· ${vehicles.filter(v=>v.images.length>0).length} con fotos` : '· sin fotos'}{!imagesMap && <span className="text-yellow-400 font-normal text-xs ml-2">Sube el JSON de fotos para incluir imágenes</span>}</span>
            <button onClick={handleImport} disabled={importing} className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">{importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo vehículos y fotos...</> : <>Importar {vehicles.length}</>}</button>
          </div>
          <div className="max-h-80 overflow-auto"><table className="w-full text-sm"><thead className="bg-white/5 sticky top-0"><tr><th className="p-3 text-left">Vehículo</th><th className="p-3">VIN</th><th className="p-3">Fotos</th></tr></thead><tbody className="divide-y divide-white/5">{vehicles.slice(0, 30).map((v,i)=><tr key={i}><td className="p-3">{v.year} {v.brand} {v.model}</td><td className="p-3 font-mono text-xs">{v.vin}</td><td className="p-3">{v.images.length || '-'}</td></tr>)}</tbody></table>{vehicles.length>30 && <p className="text-center text-xs text-gray-500 p-2">y {vehicles.length-30} más...</p>}</div>
        </div>
      )}

      {result && (
        <div role="status" aria-live="polite" className={`p-6 rounded-2xl border mb-6 shadow-xl ${result.fail===0 && result.errs.length===0?'bg-green-500/10 border-green-500/30 text-green-400':'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <h3 className="font-bold text-lg">{result.fail === 0 && result.errs.length === 0 ? '¡Terminó de subir las fotos y los vehículos!' : 'Importación finalizada con errores; revisa los detalles.'}</h3>
          </div>
          <p className="text-sm font-medium">
            {result.ok} vehículos e imágenes procesados con éxito. {result.batchId && <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">Lote {result.batchId}</span>} {result.fail>0 && `· ${result.fail} duplicados/error`}
          </p>
          {result.errs.slice(0,5).map((e,i)=><p key={i} className="text-xs mt-1 text-red-400">{e}</p>)}
          <Link href="/admin/vehicles" className="inline-block mt-4 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-gray-100 transition-colors">Ver inventario publicado →</Link>
        </div>
      )}

      <div className="glass p-6 rounded-2xl border border-white/5 mt-6"><h3 className="font-bold mb-3">Lotes importados (borrado masivo)</h3><p className="text-xs text-gray-400 mb-3">Cada importación genera un número de control. Puedes eliminar todo un lote de una vez.</p>{batchesLoading && <p role="status" className="text-sm text-gray-400">Cargando lotes...</p>}
        {batchesError && <div role="alert" className="text-sm text-red-400 mb-3">{batchesError} <button type="button" onClick={() => void loadBatches()} className="underline">Reintentar</button></div>}
        {!batchesLoading && !batchesError && batches.length === 0 && <p className="text-sm text-gray-400">No hay lotes importados todavía. Aparecerán aquí al terminar la carga.</p>}
        <div className="space-y-2">{batches.map(b=><div key={b.batch} className="flex justify-between items-center bg-white/5 p-3 rounded-xl"><span className="font-mono text-sm">{b.batch} <span className="text-gray-400">· {b.count} vehículos</span></span><button onClick={()=>deleteBatch(b.batch)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Trash2 className="h-3 w-3" /> Eliminar lote</button></div>)}</div></div>
    </div>
  );
}
