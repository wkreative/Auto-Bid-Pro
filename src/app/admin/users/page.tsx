import { requireAdmin } from '@/utils/supabase/require-admin';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminUser, isSuperAdmin } from '@/lib/admin-access';
import UsersTable from '@/components/admin/UsersTable';

export default async function AdminUsersPage() {
  const { user } = await requireAdmin();
  const admin = createAdminClient();
  // Paginate Auth and profiles separately; never send authentication metadata to the browser.
  const accounts = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error('No se pudieron cargar los usuarios. Intenta nuevamente.');
    accounts.push(...data.users);
    if (data.users.length < 200) break;
  }
  const profiles = [];
  for (let start = 0; ; start += 200) {
    const { data, error } = await admin.from('profiles').select('id,first_name,last_name,phone,created_at').order('id').range(start, start + 199);
    if (error) throw new Error('No se pudieron cargar los datos de contacto. Intenta nuevamente.');
    profiles.push(...data);
    if (data.length < 200) break;
  }
  const byId = new Map(profiles.map(profile => [profile.id, profile]));
  const rows = accounts.map(account => {
    const profile = byId.get(account.id);
    return {
      id: account.id, email: account.email || '',
      first_name: profile?.first_name || String(account.user_metadata?.first_name || ''),
      last_name: profile?.last_name || String(account.user_metadata?.last_name || ''),
      phone: profile?.phone || account.phone || String(account.user_metadata?.phone || ''),
      role: isSuperAdmin(account) ? 'super_admin' : isAdminUser(account) ? 'admin' : 'user',
      created_at: account.created_at,
    };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  return <UsersTable profiles={rows} canManageAdmins={isSuperAdmin(user)} currentUserId={user.id} />;
}
