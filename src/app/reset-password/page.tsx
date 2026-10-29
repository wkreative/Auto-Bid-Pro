import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { resetPassword } from './actions'

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/forgot-password?error=expired')
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="glass p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
        {params.success === 'true' ? <>
          <p role="status" className="text-green-400">Tu contraseña se actualizó correctamente.</p>
          <Link href="/dashboard" className="block text-primary">Continuar a mi cuenta</Link>
        </> : <>
          {params.error && <p role="alert" className="text-red-400">{params.error === 'validation' ? 'Las contraseñas deben coincidir y tener al menos 8 caracteres.' : 'No se pudo actualizar la contraseña. Usa una contraseña diferente de al menos 8 caracteres que combine letras, números y símbolos, e intenta nuevamente.'}</p>}
          <form action={resetPassword} className="space-y-4">
            <label htmlFor="password" className="block text-gray-300">Contraseña nueva (mínimo 8 caracteres)</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white" />
            <label htmlFor="confirm_password" className="block text-gray-300">Confirmar contraseña</label>
            <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white" />
            <button className="w-full bg-primary hover:bg-primary-hover rounded-xl p-3 font-bold text-white">Guardar contraseña</button>
          </form>
        </>}
      </div>
    </main>
  )
}
