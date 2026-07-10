'use client';
import { useState } from 'react';
import { Upload, Save, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewVehiclePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
      setUploadErrors([]);
      setUploadSuccess(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideoFiles(Array.from(e.target.files));
      setUploadErrors([]);
      setUploadSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadErrors([]);
    setUploadSuccess(false);

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
      const errors: string[] = [];
      if (vehicle) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${vehicle.id}/images/${Math.random().toString(36).slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('vehicle_media')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('vehicle_media')
              .getPublicUrl(fileName);

            await supabase.from('vehicle_images').insert([
              {
                vehicle_id: vehicle.id,
                url: publicUrlData.publicUrl,
                is_primary: i === 0,
              }
            ]);
          } else {
            errors.push(`Imagen ${file.name}: ${uploadError.message}`);
          }
        }

        // 3. Upload videos
        for (const file of videoFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${vehicle.id}/videos/${Math.random().toString(36).slice(2)}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('vehicle_media')
            .upload(fileName, file);

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('vehicle_media')
              .getPublicUrl(fileName);

            await supabase.from('vehicle_videos').insert([
              {
                vehicle_id: vehicle.id,
                url: publicUrlData.publicUrl,
              }
            ]);
          } else {
            errors.push(`Video ${file.name}: ${uploadError.message}`);
          }
        }
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      } else {
        setUploadSuccess(true);
      }

      if (errors.length < imageFiles.length + videoFiles.length) {
        setTimeout(() => router.push('/admin'), 1500);
      }

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('vehicles_vin_key')) {
        alert('Error: Ya existe un vehículo con ese VIN. Usa un VIN diferente.');
      } else {
        alert('Hubo un error al guardar: ' + error.message);
      }
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
          <h2 className="text-xl font-bold mb-6">Imágenes y Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-white/5 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Imágenes</p>
              <p className="text-sm text-gray-500 mt-2">{imageFiles.length} archivos seleccionados</p>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-white/5 relative">
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={handleVideoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Videos</p>
              <p className="text-sm text-gray-500 mt-2">{videoFiles.length} archivos seleccionados</p>
            </div>
          </div>
          {uploadErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-bold mb-1">{uploadErrors.length} archivo(s) no pudieron subirse</p>
              <ul className="text-sm text-red-300 space-y-1">
                {uploadErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
              <p className="text-xs text-gray-500 mt-2">El vehículo se guardó sin esos archivos.</p>
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 font-bold">Vehículo publicado exitosamente. Redirigiendo...</p>
            </div>
          )}
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
