import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { publicationText } from '@/lib/publication';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Inicia sesión' }, { status: 401 });
    // Read the verified user's role on the server so profile RLS cannot hide it.
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (profileError) return NextResponse.json({ error: 'No se pudieron verificar tus permisos. Inténtalo nuevamente.' }, { status: 503 });
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo una cuenta administradora puede subir vehículos.' }, { status: 403 });

    const input = await req.json();
    if (!input || Array.isArray(input) ||
      !['brand', 'model', 'vin'].every(key => typeof input[key] === 'string' && input[key].trim()) ||
      !Number.isInteger(input.year) || !Number.isInteger(input.mileage) || input.mileage < 0 ||
      !['auction', 'direct_sale'].includes(input.sale_type) ||
      !['draft', 'published', 'reserved', 'sold', 'archived'].includes(input.status)) {
      return NextResponse.json({ error: 'Datos del vehículo inválidos' }, { status: 400 });
    }
    const prices = ['starting_price', 'direct_sale_price', 'estimated_resale_value', 'estimated_repair_cost'];
    if (prices.some(key => input[key] != null && (typeof input[key] !== 'number' || !Number.isFinite(input[key]) || input[key] < 0))) {
      return NextResponse.json({ error: 'Precio inválido' }, { status: 400 });
    }

    // Only accept fields from the individual form; privileged credentials stay on the server.
    const auction = input.sale_type === 'auction';
    const { data, error } = await admin.from('vehicles').insert([{
      brand: input.brand, model: input.model, vin: input.vin,
      year: input.year, mileage: input.mileage, location: 'Puerto Rico',
      sale_type: input.sale_type, status: input.status,
      description: publicationText(String(input.description || '')),
      starting_price: auction ? input.starting_price ?? null : null,
      direct_sale_price: auction ? null : input.direct_sale_price ?? null,
      estimated_resale_value: auction ? input.estimated_resale_value ?? null : null,
      estimated_repair_cost: auction ? input.estimated_repair_cost ?? null : null,
    }]).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: error.code === '23505' ? 409 : 500 });
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'No se pudo guardar el vehículo. Inténtalo nuevamente.' }, { status: 500 });
  }
}
