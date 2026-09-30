import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: "Términos de Servicio | Auto Broker PR",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-10">Términos de Servicio</h1>
        <div className="space-y-6">
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Uso de la plataforma</h2>
            <p className="text-gray-400 leading-relaxed">Auto Broker PR ofrece acceso a información de vehículos y servicios de intermediación para compras de subasta y alternativas de financiamiento. Al utilizar la plataforma, aceptas estos términos y te comprometes a usar sus herramientas de forma responsable.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Cuenta y acceso</h2>
            <p className="text-gray-400 leading-relaxed">Debes proporcionar información correcta, mantener la confidencialidad de tus credenciales y comunicar cualquier uso no autorizado de tu cuenta. No está permitido utilizar la plataforma para actividades fraudulentas o interferir con su funcionamiento.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Vehículos y ofertas</h2>
            <p className="text-gray-400 leading-relaxed">La disponibilidad, condición y precio de cada vehículo deben confirmarse antes de formalizar una compra. Las imágenes, descripciones y estimaciones son informativas. Presentar una oferta no garantiza su aceptación ni la adjudicación del vehículo.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Costos y pagos</h2>
            <p className="text-gray-400 leading-relaxed">Consulta los costos de servicio publicados en la página principal. Antes de confirmar una operación, verifica el precio del vehículo, la gestoría y cualquier cargo aplicable de subasta, transporte, impuestos o documentación. Las condiciones de pago se coordinarán para cada transacción.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Financiamiento</h2>
            <p className="text-gray-400 leading-relaxed">Las alternativas de financiamiento están sujetas a evaluación y aprobación de la entidad correspondiente. Las tasas, plazos y requisitos se confirmarán antes de contratar.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Cancelaciones y consultas</h2>
            <p className="text-gray-400 leading-relaxed">Las condiciones de cancelación y de cualquier reembolso se informarán según el servicio u operación antes de su confirmación. Para consultas, comunícate al 787-209-2995 o al 787-970-5012.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Actualizaciones</h2>
            <p className="text-gray-400 leading-relaxed">Estos términos pueden actualizarse para reflejar cambios en los servicios. Consulta esta página antes de realizar nuevas operaciones. Estos términos generales complementan las condiciones particulares acordadas para cada compra y no limitan los derechos que te correspondan por ley.</p>
          </section>
        </div>
      </article>
      <Footer />
    </main>
  );
}
