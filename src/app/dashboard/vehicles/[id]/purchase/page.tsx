import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, ShoppingCart, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { confirmPurchase } from './actions';

export default async function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*, vehicle_images(url, is_primary)')
    .eq('id', id)
    .single();

  if (!vehicle || vehicle.sale_type !== 'direct_sale') notFound();
  if (vehicle.status !== 'published') redirect(`/dashboard/vehicles/${id}`);

  const primaryImage = vehicle.vehicle_images?.find((img: any) => img.is_primary)?.url || vehicle.vehicle_images?.[0]?.url;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <Link href={`/dashboard/vehicles/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Volver al vehículo
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-green-400" /> Confirmar Compra
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-xl font-bold">Resumen del Vehículo</h2>
          {primaryImage && (
            <div className="h-48 rounded-2xl overflow-hidden">
              <img src={primaryImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h3>
            <p className="text-gray-400">{vehicle.year} • {vehicle.vin}</p>
          </div>
          <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
            <span className="text-gray-400">Precio de Venta</span>
            <span className="text-3xl font-bold text-green-400">${vehicle.direct_sale_price?.toLocaleString()}</span>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Términos de Compra</h2>
          <form action={confirmPurchase} className="space-y-6">
            <input type="hidden" name="vehicle_id" value={vehicle.id} />

            <div className="space-y-3">
              {[
                'El vehículo se vende en el estado en que se encuentra ("as-is").',
                'Se requiere un depósito del 10% para reservar el vehículo.',
                'El pago completo debe realizarse en un plazo de 7 días hábiles.',
                'Puedes agendar una inspección física antes del pago final.',
                'El vehículo se entrega en la ubicación especificada.'
              ].map((term, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{term}</span>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="accept_terms" required className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary" />
              <span className="text-sm text-gray-400">Acepto los términos y condiciones de compra</span>
            </label>

            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <ShoppingCart className="h-5 w-5" /> Confirmar Compra
            </button>

            <p className="text-xs text-center text-gray-500">Un agente se comunicará contigo para coordinar los siguientes pasos.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
