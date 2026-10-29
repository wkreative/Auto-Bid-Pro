'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function confirmRecovery(formData: FormData) {
  const tokenHash = String(formData.get('token_hash') || '')
  if (!/^[a-f0-9]{32,128}$/i.test(tokenHash)) redirect('/forgot-password?error=expired')
  const supabase = await createClient()
  let verified = false
  try {
    // Consume the one-time token only after an explicit form submission.
    // Email scanners and link previews can safely GET the confirmation page.
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })
    verified = !error && !!data.session && !!data.user
  } catch {
    verified = false
  }
  if (!verified) redirect('/forgot-password?error=expired')
  redirect('/reset-password')
}
