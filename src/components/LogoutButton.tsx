'use client';

import { useFormStatus } from 'react-dom';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/logout/actions';

function Button() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex items-center gap-2 px-3 py-3 w-full text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50">
      <LogOut className="h-5 w-5" aria-hidden="true" />
      <span>{pending ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
    </button>
  );
}

export default function LogoutButton() {
  return <form action={logout}><Button /></form>;
}
