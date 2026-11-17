import { isAdminUser } from '@/lib/admin-access';
import { isBatchId } from '@/lib/import-batches';
import { createClient } from '@/utils/supabase/server';
import { publicationText } from '@/lib/publication';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireAdmin } from '@/utils/supabase/require-admin';
import { NextRequest, NextResponse } from 'next/server';

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const counts = new Map<string, number>();
    const pageSize = 1000;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('vehicles')
        .select('internal_notes, created_at')
        .not('internal_notes', 'is', null)
        .ilike('internal_notes', '%First Bank Subasta 1068%')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      for (const row of data || []) {
        const batch = row.internal_notes?.match(/BATCH:([^\s|]+)/)?.[1];
        if (batch) counts.set(batch, (counts.get(batch) || 0) + 1);
      }
      if (!data || data.length < pageSize) break;
    }
    return NextResponse.json({ batches: [...counts].map(([batch, count]) => ({ batch, count })) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar los lotes.' }, { status: 500 });
  }
}

type FBVehicleInput = {
  lote?: string;
  brand: string;
  model: string;
  year: number;
  vin: string;
  mileage?: number | null;
  exterior_color?: string;
  tablilla?: string;
  puertas?: string;
  observaciones?: string;
  images?: string[];
};

export async function POST(req: NextRequest) {
  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Inicia sesión' }, { status: 401 });
    if (!user.email_confirmed_at || !isAdminUser(user)) return NextResponse.json({ error: 'Acceso restringido al administrador.' }, { status: 403 });
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profileError) return NextResponse.json({ error: 'No se pudieron verificar tus permisos. Inténtalo nuevamente.' }, { status: 503 });
    if (profile?.role !== 'admin') return NextResponse.json({ error: `La sesión de ${user.email || 'esta cuenta'} no tiene permisos de administrador para importar vehículos.` }, { status: 403 });

    const { vehicles, batchId, status } = await req.json();
    if (typeof batchId !== 'string' || !isBatchId(batchId)) return NextResponse.json({ error: 'Número de lote inválido' }, { status: 400 });
    if (!vehicles || !Array.isArray(vehicles)) return NextResponse.json({ error: 'vehicles required' }, { status: 400 });
    if (status !== undefined && status !== 'draft' && status !== 'published') return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    const finalStatus = status === 'published' ? 'published' : 'draft';

    let ok = 0, fail = 0, photos = 0;
    const errs: string[] = [];
    for (const v of vehicles as FBVehicleInput[]) {
      const vin = (v.vin || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      try {
        if (!VIN_RE.test(vin)) throw new Error('VIN inválido');
        if (!v.brand || !v.model) throw new Error('Falta marca o modelo');
        const year = Number(v.year);
        if (!year || year < 1900 || year > 2027) throw new Error('Año inválido');
        const descParts = [`First Bank Subasta 1068`, `Lote ${v.lote || ''}`.trim()];
        if (v.tablilla) descParts.push(`Tablilla: ${v.tablilla}`);
        if (v.puertas) descParts.push(`Puertas: ${v.puertas}`);
        if (v.exterior_color) descParts.push(`Color: ${v.exterior_color}`);
        if (v.observaciones) descParts.push(v.observaciones);
        const { data: ins, error } = await supabase.from('vehicles').insert([{
          brand: v.brand, model: v.model, year, vin,
          mileage: typeof v.mileage === 'number' ? v.mileage : null,
          location: 'Puerto Rico', sale_type: 'auction',
          starting_price: null, direct_sale_price: null, status: finalStatus, risk_level: 'low',
          exterior_color: v.exterior_color || null,
          internal_notes: `BATCH:${batchId} | First Bank Subasta 1068 | Lote ${v.lote || ''}`.trim(),
          description: publicationText(`${descParts.join(' | ')} - ${year} ${v.brand} ${v.model}`),
        }]).select().single();
        if (error) throw error;
        ok++;
        const images = Array.isArray(v.images) ? v.images.slice(0, 8) : [];
        for (let i = 0; i < images.length; i++) {
          const { error: imageError } = await supabase.from('vehicle_images').insert([{ vehicle_id: ins.id, url: images[i], is_primary: i === 0 }]);
          if (imageError) { errs.push(`${vin}: no se pudo vincular la foto ${i + 1}.`); continue; }
          photos++;
        }
      } catch (e: any) {
        fail++;
        errs.push(`${vin || v.lote || 'sin VIN'}: ${e.message?.includes('vehicles_vin_key') ? 'VIN duplicado' : e.message}`);
      }
    }
    return NextResponse.json({ ok, fail, errs, batchId, photos });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
