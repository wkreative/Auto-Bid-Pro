import { connection } from 'next/server';
import FirstBankImport from '@/components/admin/FirstBankImport';
import { createBatchId } from '@/lib/import-batches';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export default async function FirstBankImportPage() {
  await connection();
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  let account: { email: string; role: string | null } | undefined;
  if (user) {
    const { data, error } = await createAdminClient().from('profiles').select('role').eq('id', user.id).maybeSingle();
    account = { email: user.email || 'Sin correo', role: error ? null : data?.role ?? null };
  }
  return <FirstBankImport initialBatchId={createBatchId()} account={account} />;
}
