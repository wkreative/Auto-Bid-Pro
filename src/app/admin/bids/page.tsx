import { createClient } from '@/utils/supabase/server';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default async function AdminBidsPage() {
  const supabase = await createClient();
  
  const { data: bids } = await supabase
    .from('bids')
    .select(`
      *,
      profiles(first_name, last_name, email),
      vehicles(brand, model, vin)
    `)
    .order('created_at', { ascending: false });

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
            {bids?.map((bid) => (
              <tr key={bid.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <p className="font-bold">{bid.vehicles?.brand} {bid.vehicles?.model}</p>
                  <p className="text-xs text-gray-500">{bid.vehicles?.vin}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold">{bid.profiles?.first_name} {bid.profiles?.last_name}</p>
                  <p className="text-xs text-gray-500">{bid.profiles?.email}</p>
                </td>
                <td className="p-4 font-bold text-green-400">
                  ${bid.amount?.toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                    bid.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    bid.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {bid.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(bid.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors" title="Aprobar">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Rechazar">
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
