import { createClient } from '@/utils/supabase/server';
import { updateBidStatus } from '../actions';
import BidsReport from '@/components/admin/BidsReport';

export default async function AdminBidsPage() {
  const supabase = await createClient();

  const { data: bids, error } = await supabase
    .from('bids')
    .select(`
      *,
      profiles(*),
      vehicles(id, brand, model, vin)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error('No se pudo cargar el reporte de ofertas.');

  return (
    <BidsReport initialBids={bids || []} updateBidStatus={updateBidStatus} />
  );
}
