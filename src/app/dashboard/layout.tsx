'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { Car, LayoutDashboard, Search, Heart, Bell, Settings, LogOut } from 'lucide-react';
import DashboardSearch from '@/components/ui/DashboardSearch';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inventario', href: '/dashboard', icon: <Search className="h-5 w-5" /> },
    { name: 'Mis Ofertas', href: '/dashboard/bids', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Favoritos', href: '/dashboard/favorites', icon: <Heart className="h-5 w-5" /> },
    { name: 'Alertas', href: '/dashboard/alerts', icon: <Bell className="h-5 w-5" /> },
    { name: 'Configuración', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/5 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Auto Bid Pro Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg text-white">Auto Bid Pro</span>
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
                    ? 'bg-primary/10 text-primary font-medium' 
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
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="md:hidden flex items-center gap-2">
            <img src="/logo.png" alt="Auto Bid Pro Logo" className="h-8 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
            <span className="font-bold text-lg text-white">Auto Bid Pro</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-xl">
            <Suspense fallback={<div className="h-10 w-full bg-white/5 animate-pulse rounded-full"></div>}>
              <DashboardSearch />
            </Suspense>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center font-bold">
              JD
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
