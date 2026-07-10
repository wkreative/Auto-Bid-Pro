'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient()

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('id', vehicleId)
    .single()

  if (!vehicle) throw new Error('Vehículo no encontrado')

  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)

  if (error) throw new Error('Error al eliminar: ' + error.message)

  revalidatePath('/admin/vehicles')
  revalidatePath('/admin')
}

export async function updateBidStatus(bidId: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bids')
    .update({ status })
    .eq('id', bidId)

  if (error) throw new Error('Error al actualizar: ' + error.message)

  revalidatePath('/admin/bids')
  revalidatePath('/admin')
}
