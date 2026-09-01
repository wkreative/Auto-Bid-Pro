import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { batch } = await req.json();
    if (!batch) return NextResponse.json({ error: 'batch required' }, { status: 400 });
    const supabase = createAdminClient();
    const { data: toDel } = await supabase.from('vehicles').select('id').ilike('internal_notes', `%BATCH:${batch}%`);
    if (!toDel?.length) return NextResponse.json({ deleted: 0 });
    const ids = toDel.map((r: any) => r.id);
    await supabase.from('vehicle_images').delete().in('vehicle_id', ids);
    await supabase.from('vehicle_videos').delete().in('vehicle_id', ids);
    const { error } = await supabase.from('vehicles').delete().in('id', ids);
    if (error) throw error;
    return NextResponse.json({ deleted: ids.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
