import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Eye, Edit } from 'lucide-react';
import DeleteVehicleButton from '@/components/admin/DeleteVehicleButton';

export default async function AdminVehiclesPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(url, is_primary)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Vehículos</h1>
          <p className="text-gray-400">Administra todos los vehículos en la plataforma.</p>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Añadir Vehículo
        </Link>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-gray-400">Vehículo</th>
              <th className="p-4 font-medium text-gray-400">VIN</th>
              <th className="p-4 font-medium text-gray-400">Tipo</th>
              <th className="p-4 font-medium text-gray-400">Precio</th>
              <th className="p-4 font-medium text-gray-400">Estado</th>
              <th className="p-4 font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {vehicles?.map((vehicle) => {
              const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary)?.url || vehicle.vehicle_images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2940&auto=format&fit=crop';
              return (
                <tr key={vehicle.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <div className="h-12 w-16 rounded overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={primaryImage} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold">{vehicle.year} {vehicle.brand} {vehicle.model}</p>
                      <p className="text-xs text-gray-500">{vehicle.location}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-400">
                    {vehicle.vin}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${vehicle.sale_type === 'direct_sale' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {vehicle.sale_type === 'direct_sale' ? 'Directa' : 'Subasta'}
                    </span>
                  </td>
                  <td className="p-4 font-bold">
                    ${(vehicle.direct_sale_price || vehicle.starting_price)?.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      vehicle.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/vehicles/${vehicle.id}`} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors" title="Ver">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link href={`/admin/vehicles/${vehicle.id}/edit`} className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteVehicleButton vehicleId={vehicle.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {vehicles?.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No hay vehículos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
