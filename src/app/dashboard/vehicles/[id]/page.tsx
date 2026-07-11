import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Gauge, Shield, Zap, Info, ChevronLeft, Calendar, FileText, CreditCard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import MediaCarousel from '@/components/MediaCarousel';
import { placeBid } from './actions';

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(url, is_primary), vehicle_videos(url)')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !vehicle) notFound();

  const isDirectSale = vehicle.sale_type === 'direct_sale';
  const mediaItems = [
    ...(vehicle.vehicle_images?.map((img: any) => ({ type: 'image' as const, url: img.url, is_primary: img.is_primary })) || []),
    ...(vehicle.vehicle_videos?.map((vid: any) => ({ type: 'video' as const, url: vid.url })) || []),
  ];

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Volver al inventario
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-3xl overflow-hidden p-2 border border-white/5">
            <MediaCarousel items={mediaItems} />
          </div>

          <div className="flex flex-wrap gap-2">
            {vehicle.risk_level && (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-md ${
                vehicle.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
                vehicle.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Riesgo {vehicle.risk_level === 'low' ? 'Bajo' : vehicle.risk_level === 'medium' ? 'Medio' : 'Alto'}
              </span>
            )}
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider backdrop-blur-md ${
              isDirectSale ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {isDirectSale ? 'Compra Directa' : 'Subasta'}
            </span>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Info className="h-6 w-6 text-primary" /> Especificaciones</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><Calendar className="h-4 w-4" /> Año</p>
                <p className="font-bold text-lg">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><Gauge className="h-4 w-4" /> Millaje</p>
                <p className="font-bold text-lg">{vehicle.mileage?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1 flex items-center gap-1"><FileText className="h-4 w-4" /> VIN</p>
                <p className="font-bold text-lg break-all">{vehicle.vin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1 flex items-center gap-2"><MapPin className="h-4 w-4" /> Ubicación</p>
                <p className="font-bold text-xl">{vehicle.location}</p>
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="h-5 w-5" /> Descripción del Vehículo</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{vehicle.description}</div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-white/5 sticky top-24">
            <h1 className="text-3xl font-bold mb-2">{vehicle.brand} {vehicle.model}</h1>
            <p className="text-gray-400 flex items-center gap-2 text-sm mt-2 break-all">{vehicle.year} • {vehicle.vin}</p>

            {isDirectSale ? (
              <>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                    <span className="text-gray-300">Precio de Venta</span>
                    <span className="text-3xl font-bold text-white">${vehicle.direct_sale_price?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link
                    href={`/dashboard/vehicles/${vehicle.id}/purchase`}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    <ShoppingCart className="h-5 w-5" /> Comprar Ahora
                  </Link>
                  <Link
                    href={`/dashboard/vehicles/${vehicle.id}/financing`}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <CreditCard className="h-5 w-5" /> Solicitar Financiamiento
                  </Link>
                  <p className="text-xs text-center text-gray-500 mt-2">Financiamiento disponible con tasas competitivas. Aprobación rápida.</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                    <span className="text-gray-300">Precio Inicial de Subasta</span>
                    <span className="text-2xl font-bold text-white">${vehicle.starting_price?.toLocaleString()}</span>
                  </div>
                  {vehicle.estimated_resale_value && (
                    <div className="flex justify-between items-center p-4 border border-green-500/20 bg-green-500/5 rounded-2xl">
                      <span className="text-gray-300 flex items-center gap-2"><Zap className="h-4 w-4 text-green-400" /> Valor Est. Reventa</span>
                      <span className="text-xl font-bold text-green-400">${vehicle.estimated_resale_value?.toLocaleString()}</span>
                    </div>
                  )}
                  {vehicle.estimated_repair_cost && (
                    <div className="flex justify-between items-center p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                      <span className="text-gray-300 flex items-center gap-2"><Shield className="h-4 w-4 text-red-400" /> Costo Est. Reparación</span>
                      <span className="text-xl font-bold text-red-400">${vehicle.estimated_repair_cost?.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="font-bold mb-4">Colocar Oferta</h3>
                  <p className="text-sm text-gray-400 mb-4">Ingresa el precio máximo que estás dispuesto a pagar.</p>
                  <form action={placeBid} className="space-y-4">
                    <input type="hidden" name="vehicle_id" value={vehicle.id} />
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input type="number" name="amount" required min={vehicle.starting_price} placeholder="Ej. 15000" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-4 pl-8 pr-4 text-xl font-bold text-white focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                      Enviar Oferta Máxima
                    </button>
                  </form>
                  <p className="text-xs text-center text-gray-500 mt-4">Nuestros agentes negociarán hasta este monto máximo.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
