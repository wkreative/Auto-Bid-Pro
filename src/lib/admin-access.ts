export const SUPER_ADMIN_EMAIL = 'josejmzmo@gmail.com';
export const SUPER_ADMIN_ID = 'c5f19cb4-25d5-460e-9132-3658b1caecec';

type Account = { id: string; email?: string | null; email_confirmed_at?: string | null; app_metadata?: Record<string, unknown> };

export function isSuperAdmin(user: Account | null | undefined) {
  return !!user?.email_confirmed_at && user.id === SUPER_ADMIN_ID &&
    user.email?.toLowerCase() === SUPER_ADMIN_EMAIL && user.app_metadata?.role === 'super_admin';
}

export function isAdminUser(user: Account | null | undefined) {
  return !!user?.email_confirmed_at && (isSuperAdmin(user) || user.app_metadata?.role === 'admin');
}
