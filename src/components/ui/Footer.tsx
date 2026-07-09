import Link from 'next/link';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Car className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-white">Auction Auto Hub</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Plataforma premium para la adquisición de vehículos de subasta con acceso exclusivo a inventario a nivel nacional.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6">Plataforma</h3>
            <ul className="space-y-4">
              <li><Link href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">Cómo funciona</Link></li>
              <li><Link href="#benefits" className="text-gray-400 hover:text-white text-sm transition-colors">Beneficios</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Planes y Precios</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">Preguntas Frecuentes</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-primary" />
                soporte@auctionautohub.com
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-primary" />
                +1 (800) 123-4567
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-primary" />
                Miami, Florida, USA
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Auction Auto Hub. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
