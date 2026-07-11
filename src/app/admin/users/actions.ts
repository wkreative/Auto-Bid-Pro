'use server'

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateUserProfile(formData: FormData) {
  try {
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

    if (error) return { error: error.message };

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteUserProfile(userId: string) {
  try {
    const admin = createAdminClient();

    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) return { error: authError.message };

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createUser(formData: FormData) {
  try {
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

    if (authError) return { error: authError.message };

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: role || 'user',
      });

    if (profileError) return { error: 'Error al crear perfil: ' + profileError.message };

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
