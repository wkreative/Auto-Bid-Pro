'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, FileJson, Loader2, Check, Filter } from 'lucide-react';
import Link from 'next/link';

type ParsedVehicle = {
  brand: string; model: string; year: number; vin: string; mileage: number; location: string; starting_price?: number; images: string[];
};

function parseManheimJson(raw: any): ParsedVehicle[] {
  let list: any[] = [];
  if (Array.isArray(raw)) list = raw;
  else if (raw.vehicles) list = raw.vehicles;
  else if (raw.data) list = Array.isArray(raw.data) ? raw.data : [raw.data];
  else if (raw.results) list = raw.results;
  else if (raw.listings) list = raw.listings;
  else if (raw.inventory) list = raw.inventory;
  else list = [raw];
  if (list.length === 1 && typeof list[0] === 'object' && !list[0].vin && !list[0].make) {
    const vals = Object.values(list[0]);
    for (const v of vals as any[]) if (Array.isArray(v) && v.length && typeof v[0] === 'object') { list = v; break; }
  }
  return list.map((v: any) => {
    const get = (...keys: string[]) => { for (const k of keys) { const p = k.split('.'); let c: any = v; for (const x of p) c = c?.[x]; if (c != null && c !== '') return c; } return null; };
    const brand = get('make', 'brand', 'Make') || 'N/A';
    const model = get('model', 'Model') || 'N/A';
    const year = parseInt(get('year', 'Year') || '0');
    const vin = get('vin', 'VIN', 'vinNumber') || `NOVIN-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const mileage = parseInt(String(get('odometer', 'mileage', 'miles') || '0').replace(/[^0-9]/g, '') || '0');
    const location = get('saleLocation', 'location', 'Location') || 'Puerto Rico';
    const price = parseFloat(String(get('mmr', 'price', 'currentBid') || '').replace(/[^0-9.]/g, '')) || 1000;
    const images: string[] = get('images', 'imageUrls', 'photos') || (get('image') ? [get('image')] : []);
    return { brand: String(brand).trim(), model: String(model).trim(), year: year || 2020, vin: String(vin).trim().toUpperCase().slice(0, 17), mileage, location: String(location), starting_price: price, images: images.flat().filter(Boolean).map(String).slice(0, 10) };
  }).filter(v => v.vin && v.brand !== 'N/A');
}

function parseCSV(text: string): ParsedVehicle[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(/,|;|\t/).map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const idx = (name: string) => headers.findIndex(h => h.includes(name));
  const iYear = idx('year'), iMake = idx('make') !== -1 ? idx('make') : idx('brand'), iModel = idx('model'), iVin = idx('vin'), iOdo = idx('odo') !== -1 ? idx('odo') : idx('mile'), iLoc = idx('location'), iPrice = idx('price') !== -1 ? idx('price') : idx('mmr');
  return lines.slice(1).map(l => {
    const cols = l.split(/,|;|\t/).map(c => c.replace(/^"|"$/g, '').trim());
    return { brand: cols[iMake] || 'N/A', model: cols[iModel] || 'N/A', year: parseInt(cols[iYear]) || 2020, vin: (cols[iVin] || '').toUpperCase().slice(0, 17) || `NOVIN-${Math.random().toString(36).slice(2, 6)}`, mileage: parseInt((cols[iOdo] || '0').replace(/[^0-9]/g, '')) || 0, location: cols[iLoc] || 'Puerto Rico', starting_price: parseFloat((cols[iPrice] || '1000').replace(/[^0-9.]/g, '')) || 1000, images: [] };
  }).filter(v => v.vin.length >= 5);
}

function parseHTML(html: string): ParsedVehicle[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const cards = [...doc.querySelectorAll('*')].filter(el => el.textContent?.match(/\b[A-HJ-NPR-Z0-9]{17}\b/)).slice(0, 50);
  const vins = [...html.matchAll(/\b[A-HJ-NPR-Z0-9]{17}\b/g)].map(m => m[0]);
  const uniq = [...new Set(vins)].slice(0, 50);
  return uniq.map(vin => {
    const snippet = html.substring(html.indexOf(vin) - 800, html.indexOf(vin) + 800);
    const year = snippet.match(/\b(19|20)\d{2}\b/)?.[0] || '2020';
    const make = snippet.match(/(Toyota|Ford|Honda|Chevrolet|Nissan|BMW|Mercedes|Jeep|Lexus|Hyundai|Kia|Mazda|Subaru|Audi|Volkswagen|Dodge|Ram|GMC|Cadillac|Acura|Infiniti|Buick|Chrysler|Lincoln|Tesla)/i)?.[0] || 'N/A';
    const imgs = [...snippet.matchAll(/https:\/\/[^"']+\.(jpg|png|webp)/gi)].map(m => m[0]).slice(0, 5);
    return { brand: make, model: 'N/A', year: parseInt(year), vin, mileage: 0, location: 'Puerto Rico', starting_price: 1000, images: imgs };
  }).filter(v => v.brand !== 'N/A');
}

export default function ImportPage() {
  const [vehicles, setVehicles] = useState<ParsedVehicle[]>([]);
  const [filterPR, setFilterPR] = useState(true);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number; errs: string[] } | null>(null);
  const supabase = createClient();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();
    let parsed: ParsedVehicle[] = [];
    if (ext === 'csv' || text.startsWith('Year') || text.includes(',') && text.split('\n')[0].includes('VIN')) parsed = parseCSV(text);
    else if (ext === 'html' || text.includes('<html')) parsed = parseHTML(text);
    else try { parsed = parseManheimJson(JSON.parse(text)); } catch { alert('Archivo no reconocido. Usa .json, .csv o .html guardado de Manheim'); return; }
    setVehicles(parsed); setResult(null);
  };

  const filtered = filterPR ? vehicles : vehicles;

  const handleImport = async () => {
    setImporting(true); setResult(null); let ok = 0, fail = 0; const errs: string[] = [];
    for (const v of filtered) {
      try {
        const { data: inserted, error } = await supabase.from('vehicles').insert([{
          brand: v.brand, model: v.model, year: v.year, vin: v.vin, mileage: v.mileage,
          location: v.location.includes('Puerto') ? v.location : 'Puerto Rico', sale_type: 'auction', starting_price: v.starting_price, status: 'published', risk_level: 'low', description: `Importado Manheim - ${v.year} ${v.brand} ${v.model}`,
        }]).select().single();
        if (error) throw error; ok++;
        for (let i = 0; i < v.images.length; i++) {
          let finalUrl = v.images[i];
          try { const r = await fetch(v.images[i]); if (r.ok) { const b = await r.blob(); const path = `${inserted.id}/images/${Math.random().toString(36).slice(2)}.jpg`; const { error: upErr } = await supabase.storage.from('vehicle_media').upload(path, b); if (!upErr) { const { data } = supabase.storage.from('vehicle_media').getPublicUrl(path); finalUrl = data.publicUrl; } } } catch {}
          await supabase.from('vehicle_images').insert([{ vehicle_id: inserted.id, url: finalUrl, is_primary: i === 0 }]);
        }
      } catch (e: any) { fail++; errs.push(`${v.vin}: ${e.message?.includes('vehicles_vin_key') ? 'VIN duplicado' : e.message}`); }
    }
    setResult({ ok, fail, errs }); setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Importar Manheim → Auto Bid Pro</h1>
      <p className="text-gray-400 mb-6">La forma más fácil (sin código). Solo 3 pasos.</p>

      <div className="glass p-8 rounded-2xl border border-white/5 mb-6">
        <h2 className="font-bold text-lg mb-4">✅ Pasos súper fáciles:</h2>
        <div className="space-y-4">
          <div className="flex gap-4"><span className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span><div><p className="font-bold">Entra a Manheim con tu código SMS</p><p className="text-sm text-gray-400">Abre tu búsqueda: <span className="bg-white/10 px-2 py-0.5 rounded text-xs">search.manheim.com → tu búsqueda 0044d011... → filtra Puerto Rico</span></p></div></div>
          <div className="flex gap-4"><span className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span><div><p className="font-bold">Guarda la página</p><p className="text-sm text-gray-400">Presiona <b className="text-white">Ctrl + S</b> (o Cmd+S en Mac) → Guarda como <b className="text-white">Página completa .html</b> <br /> <span className="text-xs">O si ves botón <b>Export / Export to Excel</b> en Manheim, descarga el <b>.csv</b> — aún más fácil</span></p></div></div>
          <div className="flex gap-4"><span className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span><div><p className="font-bold">Súbelo aquí abajo</p><p className="text-sm text-gray-400">Arrastra el archivo .html o .csv y dale a Importar. ¡Listo! Fotos y datos se suben solos a tu inventario.</p></div></div>
        </div>
      </div>

      <label className="glass border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center cursor-pointer hover:border-primary/50 bg-white/[0.02] mb-6">
        <Upload className="h-12 w-12 text-primary mb-3" />
        <span className="font-bold text-lg">Arrastra tu archivo aquí o haz click</span>
        <span className="text-sm text-gray-400">Acepta .html (Ctrl+S), .csv (Export), .json</span>
        <input type="file" accept=".html,.htm,.csv,.json" onChange={handleFile} className="hidden" />
        <span className="mt-4 bg-primary text-white px-6 py-2 rounded-xl font-bold">Seleccionar archivo</span>
      </label>

      {vehicles.length > 0 && (
        <div className="glass rounded-2xl border border-white/5 overflow-hidden mb-6">
          <div className="p-4 flex justify-between items-center border-b border-white/5">
            <span className="font-bold">{filtered.length} vehículos detectados {vehicles[0]?.brand === 'N/A' ? '(revisa archivo)' : ''}</span>
            <button onClick={handleImport} disabled={importing} className="bg-primary hover:bg-primary-hover px-6 py-2 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
              {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importando...</> : <>Importar {filtered.length} a Auto Bid Pro</>}
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm"><thead className="bg-white/5 sticky top-0"><tr><th className="p-3 text-left">Vehículo</th><th className="p-3">VIN</th><th className="p-3">Fotos</th></tr></thead>
              <tbody className="divide-y divide-white/5">{filtered.slice(0, 50).map((v, i) => <tr key={i}><td className="p-3">{v.year} {v.brand} {v.model}</td><td className="p-3 font-mono text-xs">{v.vin}</td><td className="p-3">{v.images.length}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {result && <div className={`p-4 rounded-xl border ${result.fail === 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}><p className="font-bold flex items-center gap-2"><Check className="h-4 w-4" /> {result.ok} importados {result.fail > 0 && `• ${result.fail} fallidos`}</p>{result.errs.slice(0, 5).map((e, i) => <p key={i} className="text-xs mt-1">{e}</p>)}<Link href="/admin/vehicles" className="inline-block mt-3 bg-white text-black px-4 py-2 rounded-xl text-sm font-bold">Ver inventario →</Link></div>}

      <p className="text-center text-xs text-gray-500 mt-6">¿Ya tienes tu web online? Ve a <span className="text-white font-mono">tu-dominio.com/admin/vehicles/import</span> — no necesitas `npm run dev` si ya está publicada.</p>
    </div>
  );
}
