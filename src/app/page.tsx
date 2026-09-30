import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, Target, Search, ChevronRight, CreditCard, ShoppingCart } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-10" />
          <img
            src="/hero-bg.png"
            alt="Auto Broker PR Vehicle"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              <span className="text-sm font-medium">Plataforma Exclusiva de Subastas</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Adquiere vehículos <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">premium</span> a precio de subasta.
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
              Accede a nuestro inventario privado, analiza el estado de cada vehículo, calcula tus márgenes y coloca tu oferta máxima. Nosotros nos encargamos del resto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-medium transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                Crear Cuenta <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#pricing" className="glass hover:bg-white/5 text-white px-8 py-4 rounded-full font-medium transition-all duration-200 text-center">
                Ver Planes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Un proceso simple, transparente y diseñado para maximizar tu rentabilidad en cada compra.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Paso 1. Broker de subasta</h3>
              <p className="text-gray-400 leading-relaxed">Somos pioneros en ofrecer el servicio de broker de subasta en Puerto Rico, brindando a nuestros clientes la oportunidad de adquirir vehículos de subasta con grandes ahorros en comparación con el mercado.</p>
              <p className="text-gray-400 leading-relaxed mt-4">Si buscas una unidad en específico, te ayudamos a establecer un presupuesto y encontramos opciones adaptadas a tus necesidades. Además, si deseas invertir en unidades para reventa, ofrecemos el mismo servicio, gestionado directamente con los encargados de los “Resellers”.</p>
            </div>
            <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Paso 2. Financiamiento</h3>
              <p className="text-gray-400 leading-relaxed">¡Conoce las alternativas que tenemos disponibles en nuestro concesionario! Contamos con una gran variedad de unidades disponibles para financiamiento, brindándoles a nuestros clientes los precios más competitivos del mercado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ventajas Competitivas</h2>
              <p className="text-gray-400 mb-8 text-lg">
                No somos solo un directorio de vehículos. Somos tu equipo de adquisición de activos automotrices con tecnología de punta.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Estimaciones de Rentabilidad</h4>
                    <p className="text-gray-400">Consulta los costos estimados y calcula la rentabilidad esperada de cada vehículo.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Alertas en Tiempo Real</h4>
                    <p className="text-gray-400">Recibe notificaciones instantáneas cuando un vehículo que coincide con tus preferencias entra al inventario.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Calculadora de Márgenes</h4>
                    <p className="text-gray-400">Conoce el costo estimado de transporte, reparaciones y el precio de reventa estimado antes de ofertar.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[600px] w-full rounded-2xl overflow-hidden glass p-2">
               <img
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2940&auto=format&fit=crop"
                alt="BMW Dashboard Preview"
                className="w-full h-full object-cover rounded-xl opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050505]/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-xl border border-white/10 backdrop-blur-xl">
                 <div className="flex justify-between items-center mb-4">
                   <div>
                     <p className="text-sm text-primary font-bold">GANANCIA ESTIMADA</p>
                     <p className="text-2xl font-bold text-white">$4,250.00</p>
                   </div>

                 </div>
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div className="bg-primary h-full w-[75%]"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services: Direct Purchase & Financing */}
      <section className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Más Formas de Adquirir</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">No solo subastas. Ofrecemos opciones flexibles para cada tipo de comprador.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-3xl border border-green-500/20 relative overflow-hidden group hover:border-green-500/40 transition-all">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">Nuevo</span>
              </div>
              <div className="h-14 w-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingCart className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Compra Directa</h3>
              <p className="text-gray-400 mb-6">Adquiere vehículos de forma inmediata a un precio fijo. Sin subastas, sin esperas. Ideal si ya encontraste el vehículo perfecto.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Precio fijo transparente — sin pujas',
                  'Compra en pocos clics',
                  'Inspección física disponible antes de comprar',
                  'Proceso guiado por agentes expertos'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard?sale_type=direct_sale" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-bold transition-colors">
                Ver Vehículos en Venta Directa <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShoppingCart className="h-40 w-40" />
              </div>
            </div>

            <div className="glass p-8 rounded-3xl border border-primary/20 relative overflow-hidden group hover:border-primary/40 transition-all">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">Nuevo</span>
              </div>
              <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Financiamiento</h3>
              <p className="text-gray-400 mb-6">Haz realidad la compra de tu vehículo con planes de financiamiento flexibles. Aprobación rápida y tasas competitivas.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Tasas desde 8.9% anual',
                  'Plazos de 12 a 60 meses',
                  'Aprobación en 24-48 horas',
                  'Sin penalización por pago anticipado'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="#pricing" className="inline-flex items-center gap-2 text-primary hover:text-blue-300 font-bold transition-colors">
                Solicitar Financiamiento <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard className="h-40 w-40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purchase Costs */}
      <section id="costs" aria-labelledby="costs-heading" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="costs-heading" className="text-3xl md:text-4xl font-bold mb-4">Costos Auto Broker PR</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Conoce el costo de nuestro servicio según el monto de tu compra.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { cost: '$350', range: 'Hasta $999' },
              { cost: '$750', range: 'Desde $1,000 hasta $4,999' },
              { cost: '$999', range: 'Desde $5,000 hasta $14,999' },
              { cost: '8%', range: 'Desde $15,000' },
            ].map(({ cost, range }) => (
              <div key={cost} className="glass p-8 rounded-2xl hover:border-primary/50 transition-colors duration-300">
                <p className="text-sm font-medium text-primary mb-4">Costo del servicio</p>
                <p className="text-5xl font-bold tracking-tight mb-6">{cost}</p>
                <h3 className="text-sm text-gray-400 mb-2">Para compras</h3>
                <p className="text-lg font-medium">{range}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
            <h3 className="text-lg font-bold mb-2">Importante</h3>
            <p className="text-gray-300">El costo por servicio de gestoría será de <span className="font-bold text-white">$350</span>.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Suscripción Premium</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Un único plan con acceso total a todas las herramientas de la plataforma.</p>
          </div>

          <div className="max-w-lg mx-auto glass rounded-3xl p-8 border border-primary/30 relative">
            <div className="absolute top-0 right-8 transform -translate-y-1/2">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Más Popular</span>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">Pro Access</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">$99</span>
                <span className="text-gray-400">/ mes</span>
              </div>
              <p className="text-gray-400 mt-4">Acceso ilimitado al inventario privado de vehículos y herramientas de análisis.</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                'Acceso a todo el inventario de vehículos',
                'Reportes de condición y daños detallados',
                'Calculadora de margen de ganancia',
                'Realizar ofertas ilimitadas',
                'Alertas de vehículos personalizados',
                'Soporte prioritario 24/7'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/register?plan=pro" className="block w-full bg-white text-black hover:bg-gray-200 text-center py-4 rounded-xl font-bold transition-colors">
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Por qué necesito una suscripción para ver los vehículos?",
                a: "Mantenemos un inventario cerrado para proteger los precios reales de subasta y garantizar que las oportunidades sean exclusivas para nuestra comunidad de compradores serios e inversores."
              },
              {
                q: "¿Cómo se calculan los costos estimados de reparación?",
                a: "Nuestros expertos analizan las imágenes y descripciones de los daños. Utilizamos una base de datos propia basada en miles de reparaciones previas para estimar el costo de piezas y mano de obra."
              },
              {
                q: "¿Qué pasa después de que mi oferta es aprobada?",
                a: "Nos comunicaremos contigo para coordinar el pago del vehículo. Una vez recibido, gestionaremos la documentación y, si lo deseas, coordinaremos el transporte hasta tu ubicación."
              },
              {
                q: "¿Puedo cancelar mi suscripción en cualquier momento?",
                a: "Sí, puedes cancelar tu suscripción mensual en cualquier momento desde tu panel de usuario sin penalizaciones."
              }
            ].map((faq, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl cursor-pointer group hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{faq.q}</h4>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-gray-400 mt-4 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
