import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { MapPin, Gauge, Zap, Info, ChevronLeft, Calendar, FileText, CreditCard, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import MediaCarousel from '@/components/MediaCarousel';
import FavoriteButton from '@/components/FavoriteButton';
import ResaleCalculator from '@/components/ResaleCalculator';
import { publicationText } from '@/lib/publication';

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

          <div className="flex flex-wrap gap-2 items-center">
            <FavoriteButton vehicleId={vehicle.id} />
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
                <p className="font-bold text-xl">Puerto Rico</p>
              </div>
            </div>

            {vehicle.description && (
              <div className="mt-8 pt-8 border-t border-white/5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="h-5 w-5" /> Descripción del Vehículo</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{publicationText(vehicle.description)}</div>
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
                </div>

                <ResaleCalculator
                  startingPrice={vehicle.starting_price || 0}
                  estimatedResaleValue={vehicle.estimated_resale_value}
                />

                <div className="border-t border-white/10 pt-6">
                  <a href={`https://wa.me/17872092995?text=${encodeURIComponent(`Hola, me interesa el vehículo ${vehicle.year} ${vehicle.brand} ${vehicle.model}, VIN: ${vehicle.vin}.`)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#1da851] text-white py-4 px-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.47 0 .12 5.35.12 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.94 11.94 0 0 0 5.77 1.47h.01C18.63 23.83 24 18.48 24 11.9c0-3.18-1.24-6.17-3.48-8.42ZM12.05 21.8a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.9-9.9a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.46-4.45 9.9-9.91 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.59-.49-.51-.67-.52h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35Z" /></svg>
                    Contactar por WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
