import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default async function UserBidsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      vehicles(id, brand, model, year, vehicle_images(url, is_primary))
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Mis Ofertas</h1>
      <p className="text-gray-400 mb-8">Historial de todas tus ofertas y su estado actual.</p>

      <div className="space-y-4">
        {bids?.length === 0 ? (
          <div className="text-center py-24 glass rounded-3xl">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No has realizado ofertas</h3>
            <p className="text-gray-400">Explora el inventario y haz tu primera oferta.</p>
            <Link href="/dashboard" className="mt-4 inline-block bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-bold transition-colors">
              Ir al Inventario
            </Link>
          </div>
        ) : bids?.map((bid) => {
          const vehicle: any = Array.isArray(bid.vehicles) ? bid.vehicles[0] : bid.vehicles;
          const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary)?.url || vehicle.vehicle_images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2940&auto=format&fit=crop';
          
          let statusBadge;
          switch(bid.status) {
            case 'approved':
            case 'won':
              statusBadge = <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Aprobada</span>;
              break;
            case 'rejected':
            case 'lost':
              statusBadge = <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><XCircle className="h-4 w-4"/> Rechazada</span>;
              break;
            case 'under_review':
            case 'negotiating':
              statusBadge = <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><AlertCircle className="h-4 w-4"/> En Revisión</span>;
              break;
            default:
              statusBadge = <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"><Clock className="h-4 w-4"/> Enviada</span>;
          }

          return (
            <div key={bid.id} className="glass p-4 rounded-2xl flex flex-col md:flex-row items-center gap-6 hover:border-white/20 transition-colors">
              <div className="h-24 w-32 rounded-xl overflow-hidden flex-shrink-0">
                <img src={primaryImage} className="w-full h-full object-cover" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-xl">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-gray-400 text-sm">Año: {vehicle.year}</p>
                <p className="text-gray-500 text-xs mt-1">Fecha de oferta: {new Date(bid.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Monto Ofertado</p>
                <p className="font-bold text-2xl">${bid.amount?.toLocaleString()}</p>
              </div>
              
              <div className="flex flex-col gap-2 items-end min-w-[120px]">
                {statusBadge}
                <Link href={`/dashboard/vehicles/${vehicle.id}`} className="text-sm text-primary hover:underline">
                  Ver Vehículo
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
