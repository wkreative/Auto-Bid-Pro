'use client'

import { useState } from 'react'
import { Users as UsersIcon, Shield, Edit, Plus } from 'lucide-react'
import DeleteUserButton from './DeleteUserButton'
import UserFormModal from './UserFormModal'

type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: string
  created_at: string
}

export default function UsersTable({ profiles }: { profiles: Profile[] }) {
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-400">Visualiza y administra los usuarios registrados en la plataforma.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Crear Usuario
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 font-medium text-gray-400">Usuario</th>
              <th className="p-4 font-medium text-gray-400">ID / UUID</th>
              <th className="p-4 font-medium text-gray-400">Rol</th>
              <th className="p-4 font-medium text-gray-400">Fecha de Registro</th>
              <th className="p-4 font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No hay usuarios registrados.</td>
              </tr>
            ) : (
              profiles.map((profile) => (
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
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditUser(profile)}
                        className="p-2 hover:bg-yellow-500/20 text-yellow-400 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <DeleteUserButton userId={profile.id} userName={`${profile.first_name} ${profile.last_name}`} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <UserFormModal isOpen={!!editUser} onClose={() => setEditUser(null)} user={editUser} />
    </>
  )
}
