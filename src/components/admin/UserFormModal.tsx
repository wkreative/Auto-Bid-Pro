'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { createUser, updateUserProfile } from '@/app/admin/users/actions'

type User = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  role: string
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  user?: User | null
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const form = e.currentTarget
      const data = new FormData(form)
      if (user) {
        data.append('user_id', user.id)
        await updateUserProfile(data)
      } else {
        await createUser(data)
      }
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass p-6 rounded-2xl border border-white/10 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{user ? 'Editar Usuario' : 'Crear Usuario'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
              <input type="text" name="first_name" defaultValue={user?.first_name || ''} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Apellido</label>
              <input type="text" name="last_name" defaultValue={user?.last_name || ''} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>

          {!user && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input type="email" name="email" required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
                <input type="password" name="password" required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
              <input type="text" name="phone" defaultValue={user?.phone || ''} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
              <select name="role" defaultValue={user?.role || 'user'} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary">
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : user ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </form>
      </div>
    </div>
  )
}
