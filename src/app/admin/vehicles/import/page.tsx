import { connection } from 'next/server';
import ImportVehicles from '@/components/admin/ImportVehicles';
import { createBatchId } from '@/lib/import-batches';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export default async function ImportPage() {
  await connection();
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  let account: { email: string; role: string | null } | undefined;
  if (user) {
    const { data, error } = await createAdminClient().from('profiles').select('role').eq('id', user.id).maybeSingle();
    account = { email: user.email || 'Sin correo', role: error ? null : data?.role ?? null };
  }
  return <ImportVehicles initialBatchId={createBatchId()} account={account} />;
}
