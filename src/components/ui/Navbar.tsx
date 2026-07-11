'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Car } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <img src="/logo.png" alt="Auto Bid Pro Logo" className="h-10 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">Cómo Funciona</Link>
            <Link href="#benefits" className="text-gray-300 hover:text-white transition-colors">Beneficios</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Planes</Link>
            <div className="h-6 w-px bg-gray-700"></div>
            <Link href="/login" className="text-gray-300 hover:text-white font-medium">Ingresar</Link>
            <Link href="/register" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-medium transition-all duration-200 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              Crear Cuenta
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-white/5">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link href="#how-it-works" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Cómo Funciona</Link>
            <Link href="#benefits" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Beneficios</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Planes</Link>
            <Link href="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md">Ingresar</Link>
            <Link href="/register" className="text-primary hover:text-primary-hover block px-3 py-2 rounded-md font-bold">Crear Cuenta</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
