import { Bell } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Alertas y Notificaciones</h1>
      <p className="text-gray-400 mb-8">Administra tus notificaciones sobre subastas e inventario.</p>

      <div className="text-center py-24 glass rounded-3xl">
        <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Sin alertas nuevas</h3>
        <p className="text-gray-400">Te avisaremos cuando haya actualizaciones sobre tus ofertas.</p>
      </div>
    </div>
  );
}
