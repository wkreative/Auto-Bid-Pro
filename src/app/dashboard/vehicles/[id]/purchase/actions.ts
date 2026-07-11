'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function confirmPurchase(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión para comprar');

  const vehicleId = formData.get('vehicle_id') as string;
  const acceptTerms = formData.get('accept_terms') === 'on';

  if (!acceptTerms) throw new Error('Debes aceptar los términos y condiciones');

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('sale_type, status')
    .eq('id', vehicleId)
    .single();

  if (!vehicle) throw new Error('Vehículo no encontrado');
  if (vehicle.sale_type !== 'direct_sale') throw new Error('Este vehículo no está disponible para compra directa');
  if (vehicle.status !== 'published') throw new Error('Este vehículo ya no está disponible');

  const { error } = await supabase.from('purchases').insert({
    user_id: user.id,
    vehicle_id: vehicleId,
    status: 'pending',
  });

  if (error) {
    console.error('Error al procesar compra:', error);
    throw new Error('Hubo un error al procesar tu compra');
  }

  await supabase.from('vehicles').update({ status: 'reserved' }).eq('id', vehicleId);

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  revalidatePath('/dashboard/purchases');
}
