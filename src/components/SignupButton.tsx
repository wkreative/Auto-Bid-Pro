'use client';
import { useFormStatus } from 'react-dom';
export default function SignupButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="w-full py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50">{pending ? 'Creando cuenta...' : 'Crear Cuenta'}</button>;
}
