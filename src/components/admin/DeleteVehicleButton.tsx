'use client';

import { Trash2 } from 'lucide-react';
import { deleteVehicle } from '@/app/admin/actions';

export default function DeleteVehicleButton({ vehicleId }: { vehicleId: string }) {
  const handleDelete = async () => {
    if (confirm('¿Eliminar este vehículo? Esta acción no se puede deshacer.')) {
      try {
        await deleteVehicle(vehicleId);
      } catch (e: any) {
        alert('Error al eliminar: ' + e.message);
      }
    }
  };

  return (
    <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Eliminar">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
