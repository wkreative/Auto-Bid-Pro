'use server'

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get('user_id') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  const { error } = await supabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, phone, role })
    .eq('id', userId);

  if (error) throw new Error('Error al actualizar: ' + error.message);
  revalidatePath('/admin/users');
}

export async function deleteUserProfile(userId: string) {
  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) throw new Error('Error al eliminar auth: ' + authError.message);

  revalidatePath('/admin/users');
}

export async function createUser(formData: FormData) {
  const admin = createAdminClient();
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('first_name') as string;
  const lastName = formData.get('last_name') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) throw new Error(authError.message);

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: role || 'user',
    });

  if (profileError) throw new Error('Error al crear perfil: ' + profileError.message);
  revalidatePath('/admin/users');
}
