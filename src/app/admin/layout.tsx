'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, Users, PlusCircle, Settings, LogOut, FileText } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Vehículos', href: '/admin/vehicles', icon: <Car className="h-5 w-5" /> },
    { name: 'Ofertas', href: '/admin/bids', icon: <FileText className="h-5 w-5" /> },
    { name: 'Usuarios', href: '/admin/users', icon: <Users className="h-5 w-5" /> },
    { name: 'Añadir Vehículo', href: '/admin/vehicles/new', icon: <PlusCircle className="h-5 w-5" /> },
    { name: 'Configuración', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <aside className="w-64 glass border-r border-white/5 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/admin">
            <img src="/logo.png" alt="Auto Bid Pro" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-red-500/10 text-red-500 font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 px-3 py-3 w-full text-left text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
            <img src="/logo.png" alt="Auto Bid Pro" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          
          <div className="hidden md:flex flex-1">
            <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm font-bold border border-red-500/20">
              Modo Administrador
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-800 flex items-center justify-center font-bold">
              AD
            </div>
          </div>
        </header>
        
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
