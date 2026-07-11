import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft, CreditCard, Building, Briefcase, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { submitFinancing } from './actions';

export default async function FinancingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();

  if (!vehicle || vehicle.sale_type !== 'direct_sale') notFound();

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-6">
        <Link href={`/dashboard/vehicles/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Volver al vehículo
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-primary" /> Solicitar Financiamiento
      </h1>
      <p className="text-gray-400 mb-8">
        Para {vehicle.brand} {vehicle.model} ({vehicle.year}) — ${vehicle.direct_sale_price?.toLocaleString()}
      </p>

      <div className="glass p-8 rounded-3xl border border-white/5">
        <form action={submitFinancing} className="space-y-8">
          <input type="hidden" name="vehicle_id" value={vehicle.id} />

          <fieldset>
            <legend className="text-lg font-bold mb-4 flex items-center gap-2"><Building className="h-5 w-5 text-primary" /> Información Personal</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre Completo</label>
                <input type="text" name="full_name" required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input type="email" name="email" required defaultValue={user?.email || ''} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
                <input type="tel" name="phone" required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fecha de Nacimiento</label>
                <input type="date" name="dob" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
                <input type="text" name="address" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Información Financiera</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ingreso Anual</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" name="annual_income" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Situación Laboral</label>
                <select name="employment_status" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors">
                  <option value="">Seleccionar...</option>
                  <option value="employed">Empleado</option>
                  <option value="self_employed">Autónomo</option>
                  <option value="business">Empresario</option>
                  <option value="unemployed">Desempleado</option>
                  <option value="retired">Jubilado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Puntaje de Crédito</label>
                <select name="credit_score" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors">
                  <option value="">Seleccionar...</option>
                  <option value="excellent">Excelente (750+)</option>
                  <option value="good">Bueno (700-749)</option>
                  <option value="fair">Regular (650-699)</option>
                  <option value="poor">Bajo (&lt;650)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Monto del Préstamo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" name="loan_amount" defaultValue={vehicle.direct_sale_price} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
            </div>
          </fieldset>

          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <DollarSign className="h-5 w-5" /> Enviar Solicitud
          </button>

          <p className="text-xs text-center text-gray-500">Un asesor financiero revisará tu solicitud y te contactará en 24-48 horas hábiles.</p>
        </form>
      </div>
    </div>
  );
}
