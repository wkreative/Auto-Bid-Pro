'use client';

import { useState } from 'react';
import { Upload, Save, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type VehicleFormProps = {
  vehicle?: any;
};

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const isEdit = !!vehicle;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [saleType, setSaleType] = useState(vehicle?.sale_type || 'auction');
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
      const saleTypeValue = formData.get('sale_type') as string;

      const vehicleData: Record<string, any> = {
        brand: formData.get('brand'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        vin: formData.get('vin'),
        mileage: parseInt(formData.get('mileage') as string),
        location: formData.get('location'),
        sale_type: saleTypeValue,
        description: formData.get('description'),
        risk_level: formData.get('risk_level'),
        status: formData.get('status'),
      };

      if (saleTypeValue === 'auction') {
        vehicleData.starting_price = parseFloat(formData.get('starting_price') as string) || null;
        vehicleData.estimated_resale_value = parseFloat(formData.get('estimated_retail') as string) || null;
        vehicleData.estimated_repair_cost = parseFloat(formData.get('estimated_repair') as string) || null;
        vehicleData.direct_sale_price = null;
      } else {
        vehicleData.direct_sale_price = parseFloat(formData.get('direct_sale_price') as string) || null;
        vehicleData.starting_price = null;
        vehicleData.estimated_resale_value = null;
        vehicleData.estimated_repair_cost = null;
      }

      let vehicleId = vehicle?.id;

      if (isEdit) {
        const { error } = await supabase.from('vehicles').update(vehicleData).eq('id', vehicleId);
        if (error) throw error;
      } else {
        const { data: newVehicle, error: vehicleError } = await supabase
          .from('vehicles').insert([vehicleData]).select().single();
        if (vehicleError) throw vehicleError;
        vehicleId = newVehicle.id;
      }

      const errors: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${vehicleId}/images/${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('vehicle_media').upload(fileName, file);
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('vehicle_media').getPublicUrl(fileName);
          await supabase.from('vehicle_images').insert([{ vehicle_id: vehicleId, url: publicUrlData.publicUrl, is_primary: i === 0 }]);
        } else {
          errors.push(`Imagen ${file.name}: ${uploadError.message}`);
        }
      }
      for (const file of videoFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${vehicleId}/videos/${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('vehicle_media').upload(fileName, file);
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('vehicle_media').getPublicUrl(fileName);
          await supabase.from('vehicle_videos').insert([{ vehicle_id: vehicleId, url: publicUrlData.publicUrl }]);
        } else {
          errors.push(`Video ${file.name}: ${uploadError.message}`);
        }
      }
      if (errors.length > 0) setUploadErrors(errors);

      setUploadSuccess(true);
      setTimeout(() => router.push('/admin/vehicles'), 1500);

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('vehicles_vin_key')) {
        alert('Error: Ya existe un vehículo con ese VIN.');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}</h1>
          <p className="text-gray-400">{(isEdit ? 'Actualiza' : 'Ingresa') + ' los detalles del vehículo.'}</p>
        </div>
        <button onClick={() => window.history.back()} className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/5">
          <X className="h-4 w-4" /> Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Marca *</label>
              <input name="brand" required defaultValue={vehicle?.brand || ''} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. BMW" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Modelo *</label>
              <input name="model" required defaultValue={vehicle?.model || ''} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. M4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Año *</label>
              <input name="year" required defaultValue={vehicle?.year || ''} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="2023" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">VIN *</label>
              <input name="vin" required defaultValue={vehicle?.vin || ''} disabled={isEdit} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50" placeholder="17 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Millaje *</label>
              <input name="mileage" required defaultValue={vehicle?.mileage || ''} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. 15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Ubicación *</label>
              <input name="location" required defaultValue={vehicle?.location || ''} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ej. Miami, FL" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-400 mb-2">Descripción (Opcional)</label>
              <textarea name="description" rows={4} defaultValue={vehicle?.description || ''} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="Ingresa una descripción del vehículo, condiciones, historial, etc."></textarea>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Tipo de Venta</h2>
          <div className="flex gap-4 mb-6">
            <button type="button" onClick={() => setSaleType('auction')} className={`flex-1 p-4 rounded-xl border-2 transition-all ${saleType === 'auction' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}>
              <p className="font-bold text-lg">Subasta</p>
              <p className="text-sm text-gray-400">Los usuarios pujan por el vehículo</p>
            </button>
            <button type="button" onClick={() => setSaleType('direct_sale')} className={`flex-1 p-4 rounded-xl border-2 transition-all ${saleType === 'direct_sale' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}>
              <p className="font-bold text-lg">Compra Directa</p>
              <p className="text-sm text-gray-400">Precio fijo, compra inmediata</p>
            </button>
          </div>
          <input type="hidden" name="sale_type" value={saleType} />

          {saleType === 'auction' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Precio Inicial (Subasta) *</label>
                <input name="starting_price" required defaultValue={vehicle?.starting_price || ''} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Valor Est. Reventa</label>
                <input name="estimated_retail" defaultValue={vehicle?.estimated_resale_value || ''} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Costo Est. Reparación</label>
                <input name="estimated_repair" defaultValue={vehicle?.estimated_repair_cost || ''} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Precio de Venta Directa *</label>
                <input name="direct_sale_price" required defaultValue={vehicle?.direct_sale_price || ''} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none" placeholder="$" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nivel de Riesgo</label>
              <select name="risk_level" defaultValue={vehicle?.risk_level || 'low'} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
              <select name="status" defaultValue={vehicle?.status || 'draft'} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none">
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="sold">Vendido</option>
                <option value="reserved">Reservado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5">
          <h2 className="text-xl font-bold mb-6">Imágenes y Videos</h2>
          <p className="text-sm text-gray-400 mb-4">Puedes agregar más imágenes o videos incluso después de crear el vehículo.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-white/5 relative">
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Imágenes</p>
              <p className="text-sm text-gray-500 mt-2">{imageFiles.length} seleccionados</p>
            </div>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors bg-white/5 relative">
              <input type="file" multiple accept="video/*" onChange={handleVideoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Videos</p>
              <p className="text-sm text-gray-500 mt-2">{videoFiles.length} seleccionados</p>
            </div>
          </div>
          {uploadErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 font-bold mb-1">{uploadErrors.length} archivo(s) no pudieron subirse</p>
              <ul className="text-sm text-red-300 space-y-1">{uploadErrors.map((err, i) => <li key={i}>{err}</li>)}</ul>
            </div>
          )}
        </div>

        {uploadSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 font-bold">Vehículo {isEdit ? 'actualizado' : 'publicado'} exitosamente. Redirigiendo...</p>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
            {isSubmitting ? <><Loader2 className="animate-spin h-5 w-5" /> Guardando...</> : <><Save className="h-5 w-5" /> {isEdit ? 'Actualizar' : 'Guardar'} Vehículo</>}
          </button>
        </div>
      </form>
    </div>
  );
}
