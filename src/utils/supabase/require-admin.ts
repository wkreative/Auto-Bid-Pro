import { createClient } from './server';
import { isAdminUser } from '@/lib/admin-access';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email_confirmed_at || !isAdminUser(user)) {
    throw new Error('Acceso permitido únicamente a la cuenta administradora.');
  }
  const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profileError || profile?.role !== 'admin') throw new Error('No se pudieron verificar los permisos de administrador.');
  return { supabase, user };
}
