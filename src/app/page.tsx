import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Zap, Target, Search, MousePointerClick, Car, HelpCircle, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1600712242805-5f78671b24da?q=80&w=2940&auto=format&fit=crop" 
            alt="Luxury Cars" 
            className="w-full h-full object-cover opacity-30"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Explora el Inventario</h3>
              <p className="text-gray-400">Accede a vehículos exclusivos con reportes detallados, fotos en alta resolución, daños visibles y costos estimados de reparación.</p>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search className="h-40 w-40" />
              </div>
            </div>
            
            <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <MousePointerClick className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Coloca tu Oferta</h3>
              <p className="text-gray-400">Establece el precio máximo que estás dispuesto a pagar. Nuestro sistema calculará márgenes y niveles de riesgo automáticamente.</p>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <MousePointerClick className="h-40 w-40" />
              </div>
            </div>
            
            <div className="glass p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors duration-300">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Gana y Recibe</h3>
              <p className="text-gray-400">Nuestros expertos negocian por ti. Si tu oferta es aprobada, gestionamos el pago y preparamos el vehículo para su entrega.</p>
              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Car className="h-40 w-40" />
              </div>
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
                    <h4 className="font-bold text-lg">Análisis de Riesgo Inteligente</h4>
                    <p className="text-gray-400">Cada vehículo es evaluado para determinar su nivel de riesgo (Bajo, Medio, Alto) y la rentabilidad esperada.</p>
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
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?q=80&w=2940&auto=format&fit=crop" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover rounded-xl opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#050505]/80 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-xl border border-white/10 backdrop-blur-xl">
                 <div className="flex justify-between items-center mb-4">
                   <div>
                     <p className="text-sm text-primary font-bold">GANANCIA ESTIMADA</p>
                     <p className="text-2xl font-bold text-white">$4,250.00</p>
                   </div>
                   <div className="text-right">
                     <p className="text-sm text-gray-400">Nivel de Riesgo</p>
                     <p className="text-green-400 font-bold">BAJO</p>
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
      <section className="py-24">
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
