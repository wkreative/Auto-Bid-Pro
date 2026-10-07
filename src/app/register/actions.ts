'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const first_name = String(formData.get('first_name') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
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
      data: { first_name, last_name, phone },
    },
  })
  if (error) {
    // Log only diagnostic fields; never log submitted credentials or sessions.
    console.error('Signup failed', { code: error.code, status: error.status })
    const supportedCodes = ['email_exists', 'user_already_exists', 'weak_password',
      'email_address_invalid', 'email_address_not_authorized', 'signup_disabled',
      'email_provider_disabled', 'over_request_rate_limit', 'over_email_send_rate_limit',
      'unexpected_failure', 'request_timeout']
    const code = error.code && supportedCodes.includes(error.code) ? error.code
      : error.name === 'AuthRetryableFetchError' ? 'connection' : 'true'
    redirect(`/register?error=${code}`)
  }
  if (!data.session) redirect('/register?confirmation=true')
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
