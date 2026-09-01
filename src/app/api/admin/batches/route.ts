import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase.from('vehicles').select('internal_notes').not('internal_notes', 'is', null);
  const map = new Map<string, number>();
  (data || []).forEach((r: any) => {
    const m = r.internal_notes?.match(/BATCH:([^\s|]+)/);
    if (m) map.set(m[1], (map.get(m[1]) || 0) + 1);
  });
  const batches = [...map.entries()].map(([batch, count]) => ({ batch, count })).sort((a, b) => b.batch.localeCompare(a.batch)).slice(0, 20);
  return NextResponse.json({ batches });
}
