import { createClient } from '@/utils/supabase/server';
import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { updateBidStatus } from '../actions';

export default async function AdminBidsPage() {
  const supabase = await createClient();

  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      profiles(first_name, last_name, email),
      vehicles(id, brand, model, vin)
    `)
    .order('created_at', { ascending: false });

  const statusColors: Record<string, string> = {
    submitted: 'bg-blue-500/20 text-blue-400',
    under_review: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    won: 'bg-green-500/20 text-green-400',
    lost: 'bg-red-500/20 text-red-400',
    negotiating: 'bg-purple-500/20 text-purple-400',
  };

  const statusLabels: Record<string, string> = {
    submitted: 'Enviada',
    under_review: 'En Revisión',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    won: 'Ganada',
    lost: 'Perdida',
    negotiating: 'Negociando',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Ofertas</h1>
          <p className="text-gray-400">Revisa y responde a las ofertas de los usuarios.</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-gray-400">Vehículo</th>
              <th className="p-4 font-medium text-gray-400">Usuario</th>
              <th className="p-4 font-medium text-gray-400">Oferta</th>
              <th className="p-4 font-medium text-gray-400">Estado</th>
              <th className="p-4 font-medium text-gray-400">Fecha</th>
              <th className="p-4 font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bids?.map((bid) => {
              const vehicle: any = Array.isArray(bid.vehicles) ? bid.vehicles[0] : bid.vehicles;
              const profile: any = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
              const isPending = bid.status === 'submitted' || bid.status === 'under_review' || bid.status === 'negotiating';
              return (
              <tr key={bid.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <p className="font-bold">{vehicle?.brand} {vehicle?.model}</p>
                  <p className="text-xs text-gray-500">{vehicle?.vin}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold">{profile?.first_name} {profile?.last_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </td>
                <td className="p-4 font-bold text-green-400">
                  ${bid.amount?.toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColors[bid.status] || 'bg-gray-500/20 text-gray-400'}`}>
                    {statusLabels[bid.status] || bid.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(bid.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {vehicle?.id && (
                      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Ver vehículo">
                        <Eye className="h-5 w-5" />
                      </Link>
                    )}
                    {isPending && (
                      <>
                        <form action={updateBidStatus.bind(null, bid.id, 'under_review')}>
                          <button type="submit" className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" title="Marcar en revisión">
                            <FileText className="h-5 w-5" />
                          </button>
                        </form>
                        <form action={updateBidStatus.bind(null, bid.id, 'approved')}>
                          <button type="submit" className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors" title="Aprobar">
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        </form>
                        <form action={updateBidStatus.bind(null, bid.id, 'rejected')}>
                          <button type="submit" className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Rechazar">
                            <XCircle className="h-5 w-5" />
                          </button>
                        </form>
                      </>
                    )}
                    {!isPending && (
                      <span className="text-xs text-gray-500 px-2 py-2">Resuelta</span>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
            {bids?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay ofertas registradas en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
