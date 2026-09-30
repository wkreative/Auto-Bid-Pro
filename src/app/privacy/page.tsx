import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: "Política de Privacidad | Auto Broker PR",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold mb-10">Política de Privacidad</h1>
        <div className="space-y-6">
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Información que proporcionas</h2>
            <p className="text-gray-400 leading-relaxed">Al crear una cuenta o solicitar nuestros servicios, proporcionas datos como tu nombre, correo electrónico e información relacionada con tus ofertas o solicitudes. Proporciona únicamente los datos necesarios para gestionar tu cuenta y la operación que deseas realizar.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Uso de la información</h2>
            <p className="text-gray-400 leading-relaxed">La información se utiliza para administrar tu cuenta, atender consultas, procesar ofertas y solicitudes, coordinar servicios y proteger el funcionamiento de la plataforma.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Proveedores y operaciones</h2>
            <p className="text-gray-400 leading-relaxed">Para operar la plataforma y gestionar los servicios solicitados, la información necesaria puede ser procesada por proveedores de autenticación, alojamiento y pagos, así como por las entidades que participen en una compra o solicitud de financiamiento. Los servicios externos pueden tener sus propias políticas de privacidad.</p>
          </section>
          <section id="cookies" className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Cookies</h2>
            <p className="text-gray-400 leading-relaxed">La plataforma utiliza cookies de sesión para mantener el acceso a tu cuenta y permitir funciones de autenticación. Puedes administrar las cookies desde tu navegador; bloquearlas puede afectar el inicio de sesión y otras funciones.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Conservación y seguridad</h2>
            <p className="text-gray-400 leading-relaxed">La información se conserva según las necesidades de prestación del servicio y las obligaciones aplicables. Protege tus credenciales y evita compartir información sensible por canales públicos. Ningún sistema de transmisión o almacenamiento garantiza seguridad absoluta.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Consultas sobre tus datos</h2>
            <p className="text-gray-400 leading-relaxed">Para solicitar acceso, corrección o eliminación de tus datos, o consultar sobre el uso de tu información, comunícate al 787-209-2995 o al 787-970-5012. Podemos solicitar información para verificar tu identidad antes de atender una solicitud.</p>
          </section>
          <section className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-3">Cambios en esta política</h2>
            <p className="text-gray-400 leading-relaxed">Esta política puede actualizarse cuando cambien los servicios o el tratamiento de la información. Las actualizaciones se publicarán en esta página.</p>
          </section>
        </div>
      </article>
      <Footer />
    </main>
  );
}
