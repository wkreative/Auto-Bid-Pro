'use server'

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw new Error('No se pudo cerrar la sesión. Intenta nuevamente.');
  revalidatePath('/', 'layout');
  redirect('/login');
}
