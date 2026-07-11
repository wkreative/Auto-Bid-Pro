'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitFinancing(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Debes iniciar sesión');

  const payload = {
    user_id: user.id,
    vehicle_id: formData.get('vehicle_id') as string,
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    dob: formData.get('dob') as string || null,
    address: formData.get('address') as string || null,
    annual_income: formData.get('annual_income') ? parseFloat(formData.get('annual_income') as string) : null,
    employment_status: formData.get('employment_status') as string || null,
    credit_score: formData.get('credit_score') as string || null,
    loan_amount: formData.get('loan_amount') ? parseFloat(formData.get('loan_amount') as string) : null,
  };

  const { error } = await supabase.from('financing_applications').insert(payload);

  if (error) {
    console.error('Error al enviar solicitud de financiamiento:', error);
    throw new Error('Hubo un error al enviar tu solicitud');
  }

  revalidatePath(`/dashboard/vehicles/${payload.vehicle_id}`);
}
