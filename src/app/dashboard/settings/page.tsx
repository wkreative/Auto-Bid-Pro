import { User } from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  const { data: profile, error: profileError } = await supabase.from('profiles')
    .select('first_name,last_name,phone').eq('id', user.id).single();
  if (profileError) throw new Error('No se pudo cargar tu perfil. Intenta nuevamente.');
  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Configuración</h1>
      <p className="text-gray-400 mb-8">Consulta los detalles de tu cuenta.</p>
      <div className="glass p-8 rounded-2xl border border-white/5 max-w-xl">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Perfil</h2>
        <dl className="space-y-4">
          <div><dt className="text-sm text-gray-400 mb-1">Nombre</dt><dd className="break-words">{name || 'Sin nombre'}</dd></div>
          <div><dt className="text-sm text-gray-400 mb-1">Correo electrónico</dt><dd className="break-words">{user.email}</dd></div>
          <div><dt className="text-sm text-gray-400 mb-1">Teléfono</dt><dd>{profile?.phone || 'Sin teléfono'}</dd></div>
        </dl>
      </div>
    </div>
  );
}
