import { Settings, User, CreditCard } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-gray-400 mb-8">Administra los detalles de tu cuenta y suscripción.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre</label>
              <input type="text" disabled value="Usuario Actual" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input type="email" disabled value="usuario@email.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-400" />
            </div>
            <button className="mt-4 bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-xl font-bold transition-colors w-full">
              Actualizar Perfil (Próximamente)
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Suscripción</h2>
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-primary font-medium">
              Plan Premium Activo
            </div>
            <p className="text-sm text-gray-400">Próximo cobro: 15 de Noviembre, 2024</p>
            <button className="mt-4 border border-red-500/50 hover:bg-red-500/10 text-red-500 px-6 py-2 rounded-xl font-bold transition-colors w-full">
              Cancelar Suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
