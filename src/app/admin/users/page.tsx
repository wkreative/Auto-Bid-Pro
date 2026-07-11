import { createClient } from '@/utils/supabase/server';
import UsersTable from '@/components/admin/UsersTable';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return <UsersTable profiles={profiles || []} />;
}
