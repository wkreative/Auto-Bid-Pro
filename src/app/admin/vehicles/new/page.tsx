'use client';
import { useState } from 'react';
import { Upload, Save, X } from 'lucide-react';

export default function NewVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, this would use a server action or API route to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Vehículo guardado exitosamente (Simulación)');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Añadir Nuevo Vehículo</h1>
          <p className="text-gray-400">Ingresa los detalles para publicar en el inventario.</p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5"
        >
          <X className="h-4 w-4" /> Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Marca *</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. BMW" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Modelo *</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. M4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Año *</label>
              <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="2023" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">VIN *</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="17 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Millaje *</label>
              <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. 15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ubicación *</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. Miami, FL" />
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Finanzas y Riesgo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Precio Inicial (Subasta) *</label>
              <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Valor Estimado de Reventa</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Costo Est. Reparación</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nivel de Riesgo *</label>
              <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
              <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Imágenes</h2>
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-white/5">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 font-medium">Haz clic o arrastra imágenes aquí</p>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG hasta 5MB</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : <><Save className="h-5 w-5" /> Guardar Vehículo</>}
          </button>
        </div>
      </form>
    </div>
  );
}
