'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, Loader2, Check, Copy, Trash2 } from 'lucide-react';
import Link from 'next/link';

type ParsedVehicle = { brand: string; model: string; year: number; vin: string; mileage: number; location: string; starting_price?: number; images: string[]; trim?: string; exterior_color?: string; };

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
  const iYear = idx('year'), iMake = idx('make') !== -1 ? idx('make') : idx('brand'), iModel = idx('model'), iVin = idx('vin'), iOdo = idx('odo') !== -1 ? idx('odo') : idx('mile'), iLoc = headers.findIndex(h => h.includes('pickup location')) !== -1 ? headers.findIndex(h => h.includes('pickup location')) : idx('location'), iPrice = idx('mmr') !== -1 ? idx('mmr') : idx('price'), iTrim = idx('trim'), iColor = headers.findIndex(h => h.includes('exterior color'));
  return lines.slice(1).map(l => { const c = parseCSVLine(l, delim); const vin = (c[iVin] || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 17); return { brand: c[iMake] || 'N/A', model: c[iModel] || 'N/A', year: parseInt(c[iYear]) || 2020, vin, mileage: parseInt((c[iOdo] || '0').replace(/[^0-9]/g, '')) || 0, location: c[iLoc] || 'Puerto Rico - Manheim Caribbean', starting_price: parseFloat((c[iPrice] || '1000').replace(/[^0-9.]/g, '')) || 1000, images: [], trim: c[iTrim], exterior_color: c[iColor] }; }).filter(v => v.vin.length >= 5);
}

const SCRIPT = `(async()=>{let last=0;for(let i=0;i<15;i++){window.scrollTo(0,document.body.scrollHeight);await new Promise(r=>setTimeout(r,1200));if(document.body.scrollHeight===last) break;last=document.body.scrollHeight;}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,800));const cards=[...document.querySelectorAll('#one_search img')].map(i=>i.src).filter(s=>s.includes('http')&&s.includes('images.cdn.manheim.com')).slice(0,900);const html=document.documentElement.innerHTML;const vins=[...html.matchAll(/\\b[A-HJ-NPR-Z0-9]{17}\\b/g)].map(m=>m[0]);const seen=new Set();const uniq=vins.filter(v=>{if(seen.has(v))return false;seen.add(v);return true;});const out=[];uniq.forEach((v,idx)=>{for(let k=0;k<3;k++){const img=cards[idx*3+k];if(img) out.push({vin:v,image:img});}});const b=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='manheim-con-fotos.json';a.click();alert('✅ '+out.length+' fotos capturadas ('+uniq.length+' VINs)')})()`;

export default function ImportPage() {
  const [csvVehicles, setCsvVehicles] = useState<ParsedVehicle[] | null>(null);
  const [imagesMap, setImagesMap] = useState<Map<string, string[]> | null>(null);
  const [merged, setMerged] = useState<ParsedVehicle[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number; errs: string[]; batchId?: string } | null>(null);
  const [batchId, setBatchId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [batches, setBatches] = useState<{ batch: string; count: number }[]>([]);
  const supabase = createClient();

  useEffect(() => { setBatchId(`MAN-PR-${new Date().toISOString().slice(0,10)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`); loadBatches(); }, []);
  const loadBatches = async () => {
    const { data } = await supabase.from('vehicles').select('internal_notes').not('internal_notes','is',null);
    const map = new Map<string, number>();
    (data||[]).forEach((r:any)=>{ const m=r.internal_notes?.match(/BATCH:([^\s|]+)/); if(m) map.set(m[1], (map.get(m[1])||0)+1); });
    setBatches([...map.entries()].map(([batch,count])=>({batch,count})).sort((a,b)=>b.batch.localeCompare(a.batch)).slice(0,10));
  };

  const handleCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; const t = await f.text(); const p = parseCSV(t); if (p.length === 0) alert('CSV sin vehículos detectados. Asegúrate de subir Export.csv de Manheim (debe tener columnas Vin, Year, Make). Primer línea: ' + t.split('\n')[0].slice(0, 120)); setCsvVehicles(p); if (imagesMap) merge(p, imagesMap); else setMerged(p); setResult(null);
  };
  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; const t = await f.text();
    try {
      const arr: { vin: string; image: string }[] = JSON.parse(t);
      const map = new Map<string, string[]>();
      for (const { vin, image } of arr) {
        if (!image.includes('images.cdn.manheim.com')) continue;
        if (!map.has(vin)) map.set(vin, []);
        if (!map.get(vin)!.includes(image)) map.get(vin)!.push(image);
      }
      setImagesMap(map);
      if (csvVehicles) merge(csvVehicles, map);
      else setMerged([]); 
      setResult(null);
    } catch { alert('JSON de fotos inválido'); }
  };
  const merge = (csv: ParsedVehicle[], map: Map<string, string[]>) => {
    const m = csv.map(v => ({ ...v, images: (map.get(v.vin) || []).slice(0, 8) }));
    setMerged(m);
  };
  const vehicles = csvVehicles ? merged : [];

  const copyScript = async () => { await navigator.clipboard.writeText(SCRIPT); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const deleteBatch = async (batch: string) => {
    if(!confirm(`¿Eliminar todo el lote ${batch}? Se borrarán todos los vehículos de ese grupo.`)) return;
    const { data: toDel } = await supabase.from('vehicles').select('id').ilike('internal_notes', `%BATCH:${batch}%`);
    if(!toDel?.length) return alert('No se encontraron vehículos');
    const ids = toDel.map((r:any)=>r.id);
    await supabase.from('vehicle_images').delete().in('vehicle_id', ids);
    await supabase.from('vehicles').delete().in('id', ids);
    alert(`${ids.length} vehículos eliminados`); loadBatches();
  };

  const handleImport = async () => {
    setImporting(true); setResult(null);
    try {
      const res = await fetch('/api/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicles: vehicles.map(v=>({brand:v.brand, model: v.model + (v.trim?' '+v.trim:''), year:v.year, vin:v.vin, mileage:v.mileage, location:v.location, starting_price:v.starting_price, exterior_color:v.exterior_color, images:v.images})) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en importación');
      setResult({ ok: data.ok, fail: data.fail, errs: data.errs, batchId: data.batchId });
      loadBatches();
      if(data.ok>0) setBatchId(`MAN-PR-${new Date().toISOString().slice(0,10)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`);
    } catch (e:any){ setResult({ ok:0, fail: vehicles.length, errs:[e.message], batchId}); }
    setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Importar Manheim → Auto Bid Pro</h1>
      <p className="text-gray-400 mb-6">Solo para inventario Puerto Rico. 2 archivos = con fotos. Lote actual: <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-xs">{batchId}</span></p>

      <div className="glass p-6 rounded-2xl border border-white/5 mb-6">
        <h2 className="font-bold mb-2">📋 Instrucciones para empleados (2 minutos):</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
          <li><b>Loguéate en Manheim</b> con tu usuario + código SMS → abre <span className="bg-white/10 px-2 py-0.5 rounded text-xs">search.manheim.com → tu búsqueda 0044d011... → verifica filtro Puerto Rico</span></li>
          <li><b>Descarga el CSV:</b> en Manheim arriba a la derecha → <b>Export → Export to CSV</b> → guarda <b>Export.csv</b></li>
          <li><b>Descarga las fotos:</b> haz scroll para cargar todos los vehículos → presiona <b>F12</b> → pestaña <b>Consola</b> → si sale aviso escribe <b className="text-white">allow pasting</b> y Enter → pega el script y Enter → se descarga <b>manheim-con-fotos.json</b></li>
          <li><b>Súbelos aquí:</b> arrastra primero el <b>Export.csv</b> y luego el <b>manheim-con-fotos.json</b> → Verás preview → <b>Importar</b></li>
        </ol>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={copyScript} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Copy className="h-4 w-4" /> {copied ? '¡Copiado!' : 'Copiar script para consola'}</button>
          <span className="text-xs text-gray-400">Pega en la consola de Manheim (paso 3)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer ${csvVehicles ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/[0.02] hover:border-primary/50'}`}>
          <Upload className="h-8 w-8 mb-2" /><span className="font-bold">1. Export.csv</span><span className="text-xs text-gray-400">{csvVehicles ? `${csvVehicles.length} vehículos` : 'Click para seleccionar'}</span><input type="file" accept=".csv" onChange={handleCsv} className="hidden" />{csvVehicles && <span className="mt-2 text-green-400 text-xs font-bold">✓ Cargado</span>}
        </label>
        <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center cursor-pointer ${imagesMap ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/[0.02] hover:border-primary/50'}`}>
          <Upload className="h-8 w-8 mb-2" /><span className="font-bold">2. manheim-con-fotos.json</span><span className="text-xs text-gray-400">{imagesMap ? `${[...imagesMap.values()].flat().length} fotos` : 'Opcional pero recomendado'}</span><input type="file" accept=".json" onChange={handleImages} className="hidden" />{imagesMap && <span className="mt-2 text-green-400 text-xs font-bold">✓ Cargado</span>}
        </label>
      </div>

      {vehicles.length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden mb-6">
          <div className="p-4 flex justify-between items-center border-b border-white/5">
            <span className="font-bold">{vehicles.length} vehículos listos {imagesMap ? `· ${vehicles.filter(v=>v.images.length>0).length} con fotos` : '· sin fotos'}{!imagesMap && <span className="text-yellow-400 font-normal text-xs ml-2">Sube el JSON de fotos para incluir imágenes</span>}</span>
            <button onClick={handleImport} disabled={importing} className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">{importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importando...</> : <>Importar {vehicles.length}</>}</button>
          </div>
          <div className="max-h-80 overflow-auto"><table className="w-full text-sm"><thead className="bg-white/5 sticky top-0"><tr><th className="p-3 text-left">Vehículo</th><th className="p-3">VIN</th><th className="p-3">Fotos</th></tr></thead><tbody className="divide-y divide-white/5">{vehicles.slice(0, 30).map((v,i)=><tr key={i}><td className="p-3">{v.year} {v.brand} {v.model}</td><td className="p-3 font-mono text-xs">{v.vin}</td><td className="p-3">{v.images.length || '-'}</td></tr>)}</tbody></table>{vehicles.length>30 && <p className="text-center text-xs text-gray-500 p-2">y {vehicles.length-30} más...</p>}</div>
        </div>
      )}

      {result && <div className={`p-4 rounded-xl border ${result.fail===0?'bg-green-500/10 border-green-500/20 text-green-400':'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}><p className="font-bold flex items-center gap-2"><Check className="h-4 w-4" /> {result.ok} importados {result.batchId && <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">Lote {result.batchId}</span>} {result.fail>0 && `· ${result.fail} duplicados/error`}</p>{result.errs.slice(0,5).map((e,i)=><p key={i} className="text-xs mt-1">{e}</p>)}<Link href="/admin/vehicles" className="inline-block mt-3 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold">Ver inventario →</Link></div>}

      {batches.length>0 && <div className="glass p-6 rounded-2xl border border-white/5 mt-6"><h3 className="font-bold mb-3">Lotes importados (borrado masivo)</h3><p className="text-xs text-gray-400 mb-3">Cada importación genera un número de control. Puedes eliminar todo un lote de una vez.</p><div className="space-y-2">{batches.map(b=><div key={b.batch} className="flex justify-between items-center bg-white/5 p-3 rounded-xl"><span className="font-mono text-sm">{b.batch} <span className="text-gray-400">· {b.count} vehículos</span></span><button onClick={()=>deleteBatch(b.batch)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1"><Trash2 className="h-3 w-3" /> Eliminar lote</button></div>)}</div></div>}
    </div>
  );
}
