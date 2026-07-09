'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function placeBid(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Debes iniciar sesión para ofertar')
  }

  const vehicle_id = formData.get('vehicle_id') as string
  const amount = parseFloat(formData.get('amount') as string)

  const { error } = await supabase
    .from('bids')
    .insert([
      {
        user_id: user.id,
        vehicle_id,
        amount,
        status: 'submitted'
      }
    ])

  if (error) {
    console.error('Error al enviar oferta:', error)
    throw new Error('Hubo un error al enviar tu oferta')
  }

  revalidatePath('/dashboard/bids')
  revalidatePath(`/dashboard/vehicles/${vehicle_id}`)
}
