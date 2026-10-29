import type { Metadata } from 'next'
import Link from 'next/link'
import { confirmRecovery } from './actions'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | Auto Bid Pro',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

export default async function RecoveryPage({ searchParams }: {
  searchParams: Promise<{ token_hash?: string | string[] }>
}) {
  const params = await searchParams
  const tokenHash = typeof params.token_hash === 'string' ? params.token_hash : ''
  const valid = /^[a-f0-9]{32,128}$/i.test(tokenHash)

  // Do not verify the token on GET: mail providers may prefetch this page.
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="glass p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
        {valid ? <>
          <p className="text-gray-300">Pulsa el botón para verificar tu enlace y elegir una contraseña nueva.</p>
          <form action={confirmRecovery}>
            <input type="hidden" name="token_hash" value={tokenHash} />
            <button className="w-full bg-primary hover:bg-primary-hover rounded-xl p-3 font-bold text-white">Continuar para cambiar mi contraseña</button>
          </form>
        </> : <p role="alert" className="text-red-400">Este enlace está incompleto. Solicita un correo de recuperación nuevo.</p>}
        <Link href="/forgot-password" rel="noreferrer" className="block text-primary">Solicitar otro enlace</Link>
      </div>
    </main>
  )
}
