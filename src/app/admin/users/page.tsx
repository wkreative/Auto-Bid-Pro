import { createClient } from '@/utils/supabase/server';
import { Users as UsersIcon, Shield, CheckCircle } from 'lucide-react';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-400">Visualiza y administra los usuarios registrados en la plataforma.</p>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-gray-400">Usuario</th>
              <th className="p-4 font-medium text-gray-400">ID / UUID</th>
              <th className="p-4 font-medium text-gray-400">Rol</th>
              <th className="p-4 font-medium text-gray-400">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profiles?.map((profile) => (
              <tr key={profile.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs text-gray-500">{profile.phone || 'Sin teléfono'}</p>
                  </div>
                </td>
                <td className="p-4 text-xs text-gray-400 font-mono">
                  {profile.id.substring(0, 12)}...
                </td>
                <td className="p-4">
                  {profile.role === 'admin' ? (
                    <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                      <Shield className="h-3 w-3" /> Administrador
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-max">
                      <UsersIcon className="h-3 w-3" /> Usuario
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
