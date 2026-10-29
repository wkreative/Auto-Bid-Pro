'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect('/forgot-password?error=validation')

  const origin = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get('origin')
  if (!origin) redirect('/forgot-password?error=unavailable')
  const supabase = await createClient()
  let failed = false
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('/auth/callback?next=/reset-password', origin).toString(),
    })
    failed = !!error
  } catch {
    failed = true
  }
  if (failed) redirect('/forgot-password?error=unavailable')
  redirect('/forgot-password?sent=true')
}
