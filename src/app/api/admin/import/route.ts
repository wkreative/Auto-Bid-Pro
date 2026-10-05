import { createBatchId, isBatchId } from '@/lib/import-batches';
import { createClient } from '@/utils/supabase/server';
import { publicationText } from '@/lib/publication';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Inicia sesión' }, { status: 401 });
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError) return NextResponse.json({ error: 'No se pudieron verificar tus permisos. Inténtalo nuevamente.' }, { status: 503 });
    if (profile?.role !== 'admin') return NextResponse.json({ error: `La sesión de ${user.email || 'esta cuenta'} no tiene permisos de administrador para importar vehículos.` }, { status: 403 });
    const { vehicles, batchId: requestedBatchId } = await req.json();
    if (requestedBatchId !== undefined && !isBatchId(requestedBatchId)) return NextResponse.json({ error: 'Número de lote inválido' }, { status: 400 });
    if (!vehicles || !Array.isArray(vehicles)) return NextResponse.json({ error: 'vehicles required' }, { status: 400 });
    let ok = 0, fail = 0;
    const errs: string[] = [];
    const batchId = requestedBatchId ?? createBatchId();
    for (const v of vehicles) {
      try {
        const descBase = v.description ? `${v.description} | ` : '';
        const fullDesc = `${descBase}Importado Subasta PR [${batchId}] - ${v.year} ${v.brand} ${v.model} ${v.trim||''}`.trim();
        const { data: ins, error } = await supabase.from('vehicles').insert([{
          brand: v.brand, model: v.model, year: v.year, vin: v.vin, mileage: v.mileage,
          location: 'Puerto Rico', sale_type: 'auction',
          starting_price: v.starting_price, direct_sale_price: null, status: 'published', risk_level: 'low',
          exterior_color: v.exterior_color, internal_notes: `BATCH:${batchId} | Puerto Rico | subasta`,
          description: publicationText(fullDesc)
        }]).select().single();
        if (error) throw error;
        ok++;
        for (let i = 0; i < (v.images || []).length; i++) {
          const url = v.images[i];
          let finalUrl = url;
          try {
            const r = await fetch(url);
            if (!r.ok) throw new Error('No se pudo descargar la foto');
            {
              const buf = Buffer.from(await r.arrayBuffer());
              const path = `${ins.id}/images/${Math.random().toString(36).slice(2)}.jpg`;
              const { error: upErr } = await supabase.storage.from('vehicle_media').upload(path, buf, { contentType: 'image/jpeg' });
              if (upErr) throw upErr;
              {
                const { data } = supabase.storage.from('vehicle_media').getPublicUrl(path);
                finalUrl = data.publicUrl;
              }
            }
            const { error: imageError } = await supabase.from('vehicle_images').insert([{ vehicle_id: ins.id, url: finalUrl, is_primary: i === 0 }]);
            if (imageError) throw imageError;
          } catch { errs.push(`${v.vin}: No se pudo subir la foto ${i + 1}. Puedes añadirla desde Editar vehículo.`); }
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
