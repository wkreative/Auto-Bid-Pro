'use client';
import { useState } from 'react';
import { Upload, Save, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const vehicleData = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        vin: formData.get('vin'),
        mileage: parseInt(formData.get('mileage') as string),
        location: formData.get('location'),
        starting_price: parseFloat(formData.get('starting_price') as string),
        estimated_resale_value: parseFloat(formData.get('estimated_retail') as string) || null,
        estimated_repair_cost: parseFloat(formData.get('estimated_repair') as string) || null,
        description: formData.get('description'),
        risk_level: formData.get('risk_level'),
        status: formData.get('status'),
      };

      // 1. Insert vehicle
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // 2. Upload images
      if (files.length > 0 && vehicle) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${vehicle.id}/${Math.random()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('vehlcle_media')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('vehlcle_media')
              .getPublicUrl(fileName);

            await supabase.from('vehicle_images').insert([
              {
                vehicle_id: vehicle.id,
                url: publicUrlData.publicUrl,
              }
            ]);
          }
        }
      }

      alert('Vehículo publicado exitosamente.');
      router.push('/admin');

    } catch (error: any) {
      console.error(error);
      alert('Hubo un error al guardar: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Marca *</label>
              <input name="brand" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. BMW" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Modelo *</label>
              <input name="model" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. M4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Año *</label>
              <input name="year" required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="2023" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">VIN *</label>
              <input name="vin" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="17 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Millaje *</label>
              <input name="mileage" required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. 15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ubicación *</label>
              <input name="location" required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. Miami, FL" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-400 mb-2">Descripción (Opcional)</label>
              <textarea name="description" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ingresa una descripción del vehículo, condiciones, historial, etc."></textarea>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Finanzas y Riesgo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Precio Inicial (Subasta) *</label>
              <input name="starting_price" required type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Valor Estimado de Reventa</label>
              <input name="estimated_retail" type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Costo Est. Reparación</label>
              <input name="estimated_repair" type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nivel de Riesgo *</label>
              <select name="risk_level" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
              <select name="status" className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Imágenes</h2>
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-white/5 relative">
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 font-medium">Haz clic o arrastra imágenes aquí</p>
            <p className="text-sm text-gray-500 mt-2">{files.length} archivos seleccionados</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <><Loader2 className="animate-spin h-5 w-5" /> Guardando...</> : <><Save className="h-5 w-5" /> Guardar Vehículo</>}
          </button>
        </div>
      </form>
    </div>
  );
}
