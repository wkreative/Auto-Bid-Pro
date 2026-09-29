import type { SupabaseClient } from '@supabase/supabase-js';

export function createBatchId(): string {
  return `LOT-PR-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function isBatchId(value: unknown): value is string {
  return typeof value === 'string' && /^LOT-PR-\d{4}-\d{2}-\d{2}-[A-Z0-9]{4,8}$/.test(value);
}

export async function listImportBatches(supabase: SupabaseClient) {
  const counts = new Map<string, number>();
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase.from('vehicles')
      .select('internal_notes, created_at')
      .not('internal_notes', 'is', null)
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
  // Insertion order follows the newest vehicle, including older batch prefixes.
  return [...counts].slice(0, 20).map(([batch, count]) => ({ batch, count }));
}
