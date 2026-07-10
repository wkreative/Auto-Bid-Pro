import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Car, Users, FileText, DollarSign, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [vehiclesResult, pendingBidsResult, usersResult, recentBidsResult, recentVehiclesResult] = await Promise.all([
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase.from('bids').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'under_review', 'negotiating']),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bids').select('*, profiles(first_name, last_name), vehicles(brand, model)').order('created_at', { ascending: false }).limit(5),
    supabase.from('vehicles').select('*, vehicle_images(url, is_primary)').order('created_at', { ascending: false }).limit(5),
  ]);

  const stats = [
    { name: 'Vehículos Activos', value: vehiclesResult.count?.toString() || '0', icon: <Car className="h-6 w-6 text-blue-400" /> },
    { name: 'Ofertas Pendientes', value: pendingBidsResult.count?.toString() || '0', icon: <FileText className="h-6 w-6 text-yellow-400" /> },
    { name: 'Usuarios Registrados', value: usersResult.count?.toString() || '0', icon: <Users className="h-6 w-6 text-green-400" /> },
    { name: 'Total Ofertas', value: (vehiclesResult.count ?? 0) > 0 ? `$${(vehiclesResult.count! * 50000).toLocaleString()}+` : '$0', icon: <DollarSign className="h-6 w-6 text-purple-400" /> },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.name}</h3>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-4">Últimas Ofertas</h2>
          <div className="space-y-4">
            {(recentBidsResult.data?.length ?? 0) > 0 ? recentBidsResult.data?.map((bid) => {
              const profile: any = Array.isArray(bid.profiles) ? bid.profiles[0] : bid.profiles;
              const vehicle: any = Array.isArray(bid.vehicles) ? bid.vehicles[0] : bid.vehicles;
              return (
                <div key={bid.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-bold">{vehicle?.brand} {vehicle?.model}</p>
                    <p className="text-sm text-gray-400">Usuario: {profile?.first_name} {profile?.last_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">${bid.amount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bid.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      bid.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {bid.status === 'submitted' ? 'Enviada' :
                       bid.status === 'under_review' ? 'En Revisión' :
                       bid.status === 'approved' ? 'Aprobada' :
                       bid.status === 'rejected' ? 'Rechazada' : bid.status}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-center py-4">No hay ofertas aún.</p>
            )}
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-4">Vehículos Recientes</h2>
          <div className="space-y-4">
            {(recentVehiclesResult.data?.length ?? 0) > 0 ? recentVehiclesResult.data?.map((vehicle) => {
              const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary)?.url || vehicle.vehicle_images?.[0]?.url || '';
              return (
                <div key={vehicle.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {primaryImage ? <img src={primaryImage} className="w-full h-full object-cover" /> : <Car className="h-6 w-6 text-gray-600 m-auto" />}
                    </div>
                    <div>
                      <p className="font-bold">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(vehicle.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    vehicle.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {vehicle.status === 'published' ? 'Publicado' : vehicle.status}
                  </span>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-center py-4">No hay vehículos aún.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
