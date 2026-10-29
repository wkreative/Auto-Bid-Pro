'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
  const password = String(formData.get('password') || '')
  if (password.length < 8 || password !== formData.get('confirm_password')) {
    redirect('/reset-password?error=validation')
  }
  const supabase = await createClient()
  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !user) redirect('/forgot-password?error=expired')
  let failed = false
  try {
    const { error } = await supabase.auth.updateUser({ password })
    failed = !!error
  } catch {
    failed = true
  }
  if (failed) redirect('/reset-password?error=update')
  revalidatePath('/', 'layout')
  redirect('/reset-password?success=true')
}
