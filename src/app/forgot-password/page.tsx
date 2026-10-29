import Link from 'next/link'
import { requestPasswordReset } from './actions'

export default async function ForgotPasswordPage({ searchParams }: {
  searchParams: Promise<{ error?: string; sent?: string }>
}) {
  const params = await searchParams
  const message = params.error === 'expired'
    ? 'El enlace es inválido o ha vencido. Solicita uno nuevo y ábrelo en el mismo navegador donde lo solicitaste.'
    : params.error === 'validation' ? 'Escribe un correo electrónico válido.'
    : params.error ? 'No se pudo enviar el enlace. Intenta nuevamente en unos minutos.' : null
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="glass p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-white">Restablecer contraseña</h1>
        <p className="text-gray-300">Te enviaremos un enlace para elegir una contraseña nueva.</p>
        {message && <p role="alert" className="text-red-400">{message}</p>}
        {params.sent === 'true' && <p role="status" className="text-green-400">Si existe una cuenta con ese correo, recibirás un enlace. Revisa también la carpeta de spam y ábrelo en este navegador.</p>}
        <form action={requestPasswordReset} className="space-y-4">
          <label htmlFor="email" className="block text-gray-300">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white" />
          <button className="w-full bg-primary hover:bg-primary-hover rounded-xl p-3 font-bold text-white">Enviar enlace</button>
        </form>
        <Link href="/login" className="block text-primary">Volver a iniciar sesión</Link>
      </div>
    </main>
  )
}
