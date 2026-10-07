'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { isAdminUser } from '@/lib/admin-access'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: String(formData.get('email') || '').trim().toLowerCase(),
    password: formData.get('password') as string,
  }

  const { data: auth, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=true')
  }

  revalidatePath('/', 'layout')
  redirect(isAdminUser(auth.user) ? '/admin' : '/dashboard')
}
