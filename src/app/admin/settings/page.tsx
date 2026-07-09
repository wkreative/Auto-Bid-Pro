import { Settings, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configuración del Sistema</h1>
      <p className="text-gray-400 mb-8">Parámetros generales de Auto Bid Pro.</p>

      <div className="text-center py-24 glass rounded-3xl">
        <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Panel en Construcción</h3>
        <p className="text-gray-400">Las configuraciones del sistema (Stripe, Email API) se administrarán aquí pronto.</p>
      </div>
    </div>
  );
}
