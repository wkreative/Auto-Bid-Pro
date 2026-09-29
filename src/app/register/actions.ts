'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const first_name = String(formData.get('first_name') || '').trim()
  const last_name = String(formData.get('last_name') || '').trim()
  if (!first_name || !last_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    redirect('/register?error=validation')
  }
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: {
      ...(origin ? { emailRedirectTo: `${origin}/auth/callback` } : {}),
      data: { first_name, last_name },
    },
  })
  if (error) redirect('/register?error=true')
  if (!data.session) redirect('/register?confirmation=true')
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
