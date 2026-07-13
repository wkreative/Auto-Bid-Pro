import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import VehicleForm from '@/components/admin/VehicleForm';

type Props = { params: Promise<{ id: string }> };

export default async function EditVehiclePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(*), vehicle_videos(*)')
    .eq('id', id)
    .single();

  if (!vehicle) notFound();

  return <VehicleForm vehicle={vehicle} />;
}
