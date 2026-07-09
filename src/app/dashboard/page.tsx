import Link from 'next/link';
import { Filter, ChevronDown, MapPin, Gauge, DollarSign, Activity } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      *,
      vehicle_images(url, is_primary)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Inventario Disponible</h1>
          <p className="text-gray-400">Descubre oportunidades premium analizadas por nuestros expertos.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
          <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5 transition-colors">
            <span>Ordenar por: Recientes</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['Todos', 'SUVs', 'Deportivos', 'Sedanes', 'Bajo Riesgo', 'Alto Margen'].map((filter, idx) => (
          <button 
            key={idx}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              idx === 0 ? 'bg-primary text-white' : 'glass text-gray-300 hover:text-white hover:border-primary/50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles?.length === 0 ? (
          <div className="col-span-full text-center py-24 glass rounded-3xl">
            <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No hay vehículos disponibles</h3>
            <p className="text-gray-400">El administrador aún no ha publicado vehículos en el inventario.</p>
          </div>
        ) : vehicles?.map((vehicle) => {
          const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary)?.url || vehicle.vehicle_images?.[0]?.url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2940&auto=format&fit=crop';
          
          return (
          <Link href={`/dashboard/vehicles/${vehicle.id}`} key={vehicle.id} className="group glass rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 block">
            <div className="relative h-56 w-full overflow-hidden">
              <img 
                src={primaryImage} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                  vehicle.risk_level === 'low' ? 'bg-green-500/80 text-white' : 
                  vehicle.risk_level === 'medium' ? 'bg-yellow-500/80 text-white' : 
                  'bg-red-500/80 text-white'
                }`}>
                  Riesgo {vehicle.risk_level === 'low' ? 'Bajo' : vehicle.risk_level === 'medium' ? 'Medio' : 'Alto'}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050505] to-transparent">
                <h3 className="text-xl font-bold">{vehicle.brand} {vehicle.model}</h3>
                <p className="text-gray-300">{vehicle.year}</p>
              </div>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{vehicle.location}</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Oferta Inicial</span>
                  <span className="font-bold text-lg">${vehicle.starting_price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-primary">Valor Est. Reventa</span>
                  <span className="font-bold text-green-400">${vehicle.estimated_resale_value?.toLocaleString() || '---'}</span>
                </div>
              </div>
              
              <div className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-center py-3 rounded-xl font-bold transition-colors">
                Ver Detalles y Ofertar
              </div>
            </div>
          </Link>
        )})}
      </div>
    </div>
  );
}
