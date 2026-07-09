import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Heart, Car } from 'lucide-react';

export default async function UserFavoritesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      vehicles(id, brand, model, year, starting_price, risk_level, vehicle_images(url, is_primary))
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Vehículos Favoritos</h1>
      <p className="text-gray-400 mb-8">Los vehículos que has guardado para revisar más tarde.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites?.length === 0 ? (
          <div className="col-span-full text-center py-24 glass rounded-3xl">
            <Heart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No tienes favoritos</h3>
            <p className="text-gray-400">Guarda vehículos que te interesen usando el botón de corazón.</p>
          </div>
        ) : favorites?.map((fav) => {
          const vehicle: any = Array.isArray(fav.vehicles) ? fav.vehicles[0] : fav.vehicles;
          const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary)?.url || vehicle.vehicle_images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2940&auto=format&fit=crop';
          
          return (
            <Link href={`/dashboard/vehicles/${vehicle.id}`} key={fav.id} className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 block">
              <div className="relative h-56 w-full overflow-hidden">
                <img 
                  src={primaryImage} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-red-500 rounded-full p-2">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050505] to-transparent">
                  <h3 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
                  <p className="text-gray-300">{vehicle.year}</p>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center">
                <span className="text-lg font-bold">${vehicle.starting_price?.toLocaleString()}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  vehicle.risk_level === 'low' ? 'text-green-400 bg-green-400/10' : 
                  vehicle.risk_level === 'medium' ? 'text-yellow-400 bg-yellow-400/10' : 
                  'text-red-400 bg-red-400/10'
                }`}>
                  {vehicle.risk_level} Riesgo
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
