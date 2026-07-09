import { Car, Users, FileText, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { name: 'Vehículos Activos', value: '124', icon: <Car className="h-6 w-6 text-blue-400" /> },
    { name: 'Ofertas Pendientes', value: '38', icon: <FileText className="h-6 w-6 text-yellow-400" /> },
    { name: 'Usuarios Premium', value: '892', icon: <Users className="h-6 w-6 text-green-400" /> },
    { name: 'Ingresos Mensuales', value: '$88,308', icon: <DollarSign className="h-6 w-6 text-purple-400" /> },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{stat.name}</h3>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-4">Últimas Ofertas</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-bold">BMW M4 Competition</p>
                  <p className="text-sm text-gray-400">Usuario: john.doe@email.com</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">$68,500</p>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">En Revisión</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-4">Vehículos Recientes</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-800 rounded-lg"></div>
                  <div>
                    <p className="font-bold">Porsche 911 Carrera</p>
                    <p className="text-sm text-gray-400">Añadido hace 2 horas</p>
                  </div>
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Publicado</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
