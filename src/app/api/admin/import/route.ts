import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { vehicles } = await req.json();
    if (!vehicles || !Array.isArray(vehicles)) return NextResponse.json({ error: 'vehicles required' }, { status: 400 });
    const supabase = createAdminClient();
    let ok = 0, fail = 0;
    const errs: string[] = [];
    const batchId = `MAN-PR-${new Date().toISOString().slice(0,10)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    for (const v of vehicles) {
      try {
        const descBase = v.description ? `${v.description} | ` : '';
        const fullDesc = `${descBase}Importado Manheim PR [${batchId}] - ${v.year} ${v.brand} ${v.model} ${v.trim||''}`.trim();
        const { data: ins, error } = await supabase.from('vehicles').insert([{
          brand: v.brand, model: v.model, year: v.year, vin: v.vin, mileage: v.mileage,
          location: v.location || 'Puerto Rico - Manheim Caribbean', sale_type: 'auction',
          starting_price: v.starting_price, direct_sale_price: null, status: 'published', risk_level: 'low',
          exterior_color: v.exterior_color, internal_notes: `BATCH:${batchId} | Manheim PR | subasta`,
          description: fullDesc
        }]).select().single();
        if (error) throw error;
        ok++;
        for (let i = 0; i < (v.images || []).length; i++) {
          const url = v.images[i];
          let finalUrl = url;
          try {
            const r = await fetch(url);
            if (r.ok) {
              const buf = Buffer.from(await r.arrayBuffer());
              const path = `${ins.id}/images/${Math.random().toString(36).slice(2)}.jpg`;
              const { error: upErr } = await supabase.storage.from('vehicle_media').upload(path, buf, { contentType: 'image/jpeg' });
              if (!upErr) {
                const { data } = supabase.storage.from('vehicle_media').getPublicUrl(path);
                finalUrl = data.publicUrl;
              }
            }
          } catch {}
          await supabase.from('vehicle_images').insert([{ vehicle_id: ins.id, url: finalUrl, is_primary: i === 0 }]);
        }
      } catch (e: any) {
        fail++;
        errs.push(`${v.vin}: ${e.message?.includes('vehicles_vin_key') ? 'VIN duplicado' : e.message}`);
      }
    }
    return NextResponse.json({ ok, fail, errs, batchId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
