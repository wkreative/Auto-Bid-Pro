'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteUserProfile } from '@/app/admin/users/actions'

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUserProfile(userId)
      if ((result as any)?.error) {
        alert('Error: ' + (result as any).error)
        return
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
        title="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass p-6 rounded-2xl border border-white/10 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Eliminar Usuario</h3>
            <p className="text-gray-400 text-sm mb-6">
              ¿Estás seguro de eliminar a <strong>{userName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
