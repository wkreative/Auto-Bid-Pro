import Link from 'next/link';
import { Search, MapPin, Gauge, Car } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import FavoriteButton from '@/components/FavoriteButton';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q : '';
  const filter = typeof params.filter === 'string' ? params.filter : 'Todos';

  const supabase = await createClient();
  let query = supabase
    .from('vehicles')
    .select('*, vehicle_images(url, is_primary)')
    .eq('status', 'published');

  // Aplicar Búsqueda
  if (q) {
    query = query.or(`brand.ilike.%${q}%,model.ilike.%${q}%,vin.ilike.%${q}%`);
  }

  // Aplicar Filtros Rápidos
  if (filter !== 'Todos') {
    if (filter === 'Riesgo Bajo') {
      query = query.eq('risk_level', 'low');
    } else if (filter === 'Riesgo Medio') {
      query = query.eq('risk_level', 'medium');
    } else if (filter === 'Riesgo Alto') {
      query = query.eq('risk_level', 'high');
    }
  }

  query = query.order('created_at', { ascending: false });
  
  const { data: vehicles } = await query;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventario Disponible</h1>
        <p className="text-gray-400 mb-6">Descubre oportunidades premium analizadas por nuestros expertos.</p>
        
        {/* Search Bar */}
        <form action="/dashboard" method="GET" className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por marca, modelo o VIN..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
          />
          {filter !== 'Todos' && <input type="hidden" name="filter" value={filter} />}
        </form>
      </div>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['Todos', 'Riesgo Bajo', 'Riesgo Medio', 'Riesgo Alto'].map((f, idx) => {
          const linkParams = new URLSearchParams();
          if (q) linkParams.set('q', q);
          if (f !== 'Todos') linkParams.set('filter', f);
          return (
          <Link 
            href={`/dashboard${linkParams.toString() ? '?' + linkParams.toString() : ''}`}
            key={idx}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary text-white' : 'glass text-gray-300 hover:text-white hover:border-primary/50'
            }`}
          >
            {f}
          </Link>
        )})}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles?.length === 0 ? (
          <div className="col-span-full text-center py-24 glass rounded-3xl">
            <Car className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">No se encontraron vehículos</h3>
            <p className="text-gray-400">Prueba cambiando los filtros o el término de búsqueda.</p>
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
              <div className="absolute top-0 left-0 p-3">
                <FavoriteButton vehicleId={vehicle.id} />
              </div>
              <div className="absolute top-4 right-4">
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
