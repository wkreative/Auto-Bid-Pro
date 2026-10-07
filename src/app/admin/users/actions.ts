'use server'

import { requireAdmin } from '@/utils/supabase/require-admin';
import { isAdminUser, isSuperAdmin, SUPER_ADMIN_ID } from '@/lib/admin-access';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  try {
    const { user } = await requireAdmin();
    const admin = createAdminClient();
    const userId = String(formData.get('user_id') || '');
    const { data: target, error } = await admin.auth.admin.getUserById(userId);
    if (error || !target.user) return { error: 'Usuario no encontrado.' };
    const currentRole = isAdminUser(target.user) ? 'admin' : 'user';
    const requestedRole = String(formData.get('role') || currentRole);
    if (!['admin', 'user'].includes(requestedRole)) return { error: 'Rol inválido.' };
    if (requestedRole !== currentRole) {
      if (!isSuperAdmin(user)) return { error: 'Solo José puede asignar o modificar roles de administrador.' };
      if (userId === SUPER_ADMIN_ID) return { error: 'No puedes quitar el rol del superadministrador.' };
      const { error: roleError } = await admin.auth.admin.updateUserById(userId, {
        app_metadata: { ...target.user.app_metadata, role: requestedRole },
      });
      if (roleError) return { error: roleError.message };
    }
    const { error: profileError } = await admin.from('profiles').update({
      first_name: String(formData.get('first_name') || ''),
      last_name: String(formData.get('last_name') || ''),
      phone: String(formData.get('phone') || ''), role: requestedRole,
    }).eq('id', userId);
    if (profileError) return { error: 'Error al guardar el perfil: ' + profileError.message };
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'No se pudo actualizar el usuario.' };
  }
}

export async function deleteUserProfile(userId: string) {
  try {
    const { user } = await requireAdmin();
    if (userId === SUPER_ADMIN_ID) return { error: 'No puedes eliminar al superadministrador.' };
    if (userId === user.id) return { error: 'No puedes eliminar tu propia cuenta.' };
    const admin = createAdminClient();
    const { data: target, error } = await admin.auth.admin.getUserById(userId);
    if (error || !target.user) return { error: 'Usuario no encontrado.' };
    if (isAdminUser(target.user) && !isSuperAdmin(user)) return { error: 'Solo José puede eliminar cuentas administradoras.' };
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) return { error: deleteError.message };
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'No se pudo eliminar el usuario.' };
  }
}

export async function createUser(formData: FormData) {
  try {
    const { user } = await requireAdmin();
    const role = String(formData.get('role') || 'user');
    if (!['admin', 'user'].includes(role)) return { error: 'Rol inválido.' };
    if (role === 'admin' && !isSuperAdmin(user)) return { error: 'Solo José puede crear administradores.' };
    const admin = createAdminClient();
    const first_name = String(formData.get('first_name') || '');
    const last_name = String(formData.get('last_name') || '');
    const phone = String(formData.get('phone') || '');
    const { data, error } = await admin.auth.admin.createUser({
      email: String(formData.get('email') || '').trim().toLowerCase(),
      password: String(formData.get('password') || ''), email_confirm: true,
      user_metadata: { first_name, last_name, phone }, app_metadata: { role },
    });
    if (error || !data.user) return { error: error?.message || 'No se pudo crear el usuario.' };
    const { error: profileError } = await admin.from('profiles').upsert({ id: data.user.id, first_name, last_name, phone, role });
    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id);
      return { error: 'Error al crear perfil: ' + profileError.message };
    }
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'No se pudo crear el usuario.' };
  }
}
