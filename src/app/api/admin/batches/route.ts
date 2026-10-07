import { requireAdmin } from '@/utils/supabase/require-admin';
import { createAdminClient } from '@/utils/supabase/admin';
import { listImportBatches } from '@/lib/import-batches';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requireAdmin();
    const batches = await listImportBatches(createAdminClient());
    return NextResponse.json({ batches }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'No se pudieron cargar los lotes.' }, { status: 500 });
  }
}
