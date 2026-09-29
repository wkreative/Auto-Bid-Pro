import Link from 'next/link';
import SignupButton from '@/components/SignupButton';
import { signup } from './actions';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const isError = !!params?.error;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex justify-center">
            <img src="/logo.png" alt="Auto Bid Pro Logo" className="h-24 w-auto object-contain" />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Únete y obtén acceso exclusivo al inventario
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-white/10">
          {params.confirmation === 'true' && <div role="status" className="mb-6 p-4 rounded-xl bg-green-500/10 text-green-400">Revisa tu correo y abre el enlace de confirmación para activar tu cuenta. Si ya tienes una cuenta, inicia sesión. Revisa también la carpeta de spam.</div>}
          {isError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium text-center">
              No se pudo completar el registro. Verifica tus datos y usa una contraseña de al menos 8 caracteres. Si ya tienes cuenta, inicia sesión.
            </div>
          )}
          <form className="space-y-6" action={signup}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300">
                  Nombre
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    name="first_name"
                    autoComplete="given-name"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300">
                  Apellido
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    name="last_name"
                    autoComplete="family-name"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <SignupButton />
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#050505] text-gray-400 rounded-full">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2.5 px-4 border border-white/10 rounded-xl shadow-sm text-sm font-bold text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
