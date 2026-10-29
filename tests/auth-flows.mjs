import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import assert from 'node:assert/strict';
const dependency = createRequire(import.meta.url);
function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : dependency(name), loaded, loaded.exports);
  return loaded.exports;
}
const access = load('src/lib/admin-access.ts');
const gaby = { id: 'gaby', email: 'gabytorres0213@gmail.com', email_confirmed_at: '2026-10-05', app_metadata: {role: 'admin'} };
const jose = { ...gaby, id: access.SUPER_ADMIN_ID, email: access.SUPER_ADMIN_EMAIL, app_metadata: {role:'super_admin'} };
let user = null, role = 'admin', error = null;
const client = {
  auth: { getUser: async () => ({ data: { user }, error }) },
  from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role }, error: null }) }) }) }),
};
const { requireAdmin } = load('src/utils/supabase/require-admin.ts', {
  './server': { createClient: async () => client }, '@/lib/admin-access': access,
});
await assert.rejects(requireAdmin());
for (const account of [gaby, jose, {...gaby, email:'new-admin@example.com'}]) {
  user = account;
  assert.equal((await requireAdmin()).user.id, account.id);
}
assert.equal(access.isSuperAdmin({...jose,id:'impostor'}),false);
assert.equal(access.isSuperAdmin({...gaby,email:jose.email}),false);
user = {...gaby, app_metadata:{role:'user'}, user_metadata:{role:'admin'}};
await assert.rejects(requireAdmin());
user = { ...gaby, email_confirmed_at: null };
await assert.rejects(requireAdmin());
user = gaby; role = 'user';
await assert.rejects(requireAdmin());
role = 'admin'; error = { message: 'invalid token' };
await assert.rejects(requireAdmin());
error = null;
assert.equal((await requireAdmin()).user.id, 'gaby');

let allowed = false, actor = gaby, privilegedCalls = 0, target = {...gaby,id:'customer',app_metadata:{role:'user'}}, stored, metadataWrites = 0, deletes = 0;
const users = load('src/app/admin/users/actions.ts', {
  '@/lib/admin-access': access,
  '@/utils/supabase/require-admin': { requireAdmin: async () => {
    if (!allowed) throw new Error('Forbidden');
    return { user: actor };
  } },
  '@/utils/supabase/admin': { createAdminClient: () => {
    privilegedCalls++;
    return {
      auth: { admin: {
        getUserById: async () => ({ data: { user: target } }),
        updateUserById: async (id, data) => { metadataWrites++; target = {...target, ...data}; return {error:null}; },
        createUser: async data => {stored = data; return { data: { user: { id: 'new-user' } } };},
        deleteUser: async () => {deletes++; return { error: null };},
      } },
      from: () => ({
        update: data => ({ eq: async () => { stored = data; return { error: null }; } }),
        upsert: async data => { stored = data; return { error: null }; },
      }),
    };
  } },
  'next/cache': { revalidatePath() {} },
});
const form = new FormData();
for (const [key, value] of Object.entries({ user_id: 'customer', email: 'new@example.com', role: 'admin', first_name: 'Client', password:'test-password' })) form.set(key, value);
for (const action of [() => users.createUser(form), () => users.updateUserProfile(form), () => users.deleteUserProfile('customer')]) {
  assert.equal((await action()).error, 'Forbidden');
}
assert.equal(privilegedCalls, 0);
allowed = true;
assert.ok((await users.createUser(form)).error);
assert.ok((await users.updateUserProfile(form)).error);
assert.equal(metadataWrites,0);
form.set('role','user');
assert.equal((await users.updateUserProfile(form)).success,true);
assert.equal(stored.role,'user');
target = {...gaby,id:'another-admin'};
assert.ok((await users.updateUserProfile(form)).error);
assert.ok((await users.deleteUserProfile(target.id)).error);
assert.equal(deletes,0);
assert.ok((await users.deleteUserProfile(jose.id)).error);
actor = jose;
assert.equal((await users.updateUserProfile(form)).success,true);
assert.equal(target.app_metadata.role,'user');
form.set('role','admin');
assert.equal((await users.updateUserProfile(form)).success,true);
assert.equal(target.app_metadata.role,'admin');
assert.equal((await users.createUser(form)).success,true);
assert.equal(stored.role,'admin');
assert.equal((await users.deleteUserProfile(target.id)).success,true);
assert.equal(deletes,1);
target = jose;form.set('user_id',jose.id);form.set('role','user');
assert.ok((await users.updateUserProfile(form)).error);
assert.ok((await users.deleteUserProfile(jose.id)).error);
actor = gaby;target = {...gaby,id:'another-admin'};form.set('user_id',target.id);form.set('role','admin');
assert.equal((await users.updateUserProfile(form)).success,true);
assert.equal(stored.role,'admin');

let logoutError = null, signOutOptions, invalidations = 0;
const { logout } = load('src/app/logout/actions.ts', {
  '@/utils/supabase/server': { createClient: async () => ({ auth: {
    signOut: async options => { signOutOptions = options; return { error: logoutError }; },
  } }) },
  'next/navigation': { redirect: path => { throw new Error(path); } },
  'next/cache': { revalidatePath: () => { invalidations++; } },
});
await assert.rejects(logout(), { message: '/login' });
assert.deepEqual(signOutOptions, { scope: 'local' });
assert.equal(invalidations, 1);
logoutError = { message: 'Unavailable' };
await assert.rejects(logout(), { message: 'No se pudo cerrar la sesión. Intenta nuevamente.' });
assert.equal(invalidations, 1);
console.log('PASS: only Jose can grant, revoke or delete administrator roles; protected metadata, superadministrator identity and logout verified.');

// Password recovery: validate before sending, preserve the recovery destination,
// and never write a password without a verified session.
let recoveryError = null, recoveryRequest, passwordWrites = 0;
const recoveryMocks = {
  '@/utils/supabase/server': { createClient: async () => ({ auth: {
    resetPasswordForEmail: async (email, options) => { recoveryRequest = { email, options }; return { error: recoveryError }; },
    getUser: async () => ({ data: { user }, error: null }),
    updateUser: async () => { passwordWrites++; return { error: recoveryError }; },
  } }) },
  'next/headers': { headers: async () => new Headers({ origin: 'https://example.com' }) },
  'next/navigation': { redirect: path => { throw new Error(path); } },
  'next/cache': { revalidatePath() {} },
};
const recovery = load('src/app/forgot-password/actions.ts', recoveryMocks);
const reset = load('src/app/reset-password/actions.ts', recoveryMocks);
const recoveryForm = new FormData();
await assert.rejects(recovery.requestPasswordReset(recoveryForm), { message: '/forgot-password?error=validation' });
assert.equal(recoveryRequest, undefined);
recoveryForm.set('email', ' CUSTOMER@Example.com ');
await assert.rejects(recovery.requestPasswordReset(recoveryForm), { message: '/forgot-password?sent=true' });
assert.equal(recoveryRequest.email, 'customer@example.com');
const destination = new URL(recoveryRequest.options.redirectTo);
assert.equal(destination.pathname, '/auth/callback');
assert.equal(destination.searchParams.get('next'), '/reset-password');
recoveryError = { message: 'rate limited' };
await assert.rejects(recovery.requestPasswordReset(recoveryForm), { message: '/forgot-password?error=unavailable' });
recoveryForm.set('password', 'new-password');
recoveryForm.set('confirm_password', 'different-password');
await assert.rejects(reset.resetPassword(recoveryForm), { message: '/reset-password?error=validation' });
recoveryForm.set('confirm_password', 'new-password');
user = null;
await assert.rejects(reset.resetPassword(recoveryForm), { message: '/forgot-password?error=expired' });
assert.equal(passwordWrites, 0);
user = gaby;
await assert.rejects(reset.resetPassword(recoveryForm), { message: '/reset-password?error=update' });
recoveryError = null;
await assert.rejects(reset.resetPassword(recoveryForm), { message: '/reset-password?success=true' });
const callback = load('src/app/auth/callback/route.ts', {
  '@/utils/supabase/server': { createClient: async () => ({ auth: {
    exchangeCodeForSession: async () => ({ error: recoveryError }),
  } }) },
  'next/server': { NextResponse: { redirect: url => url } },
});
assert.equal(await callback.GET(new Request('https://example.com/auth/callback?code=valid&next=/reset-password')), 'https://example.com/reset-password');
recoveryError = { message: 'expired' };
assert.equal(await callback.GET(new Request('https://example.com/auth/callback?code=expired&next=/reset-password')), 'https://example.com/forgot-password?error=expired');
console.log('PASS: password recovery validation, email destination, expired links and authenticated password updates.');

let recoveryVerifications = 0, verificationError = null, verificationSession = true;
const confirmation = load('src/app/auth/recovery/actions.ts', {
  'next/navigation': { redirect: path => { throw new Error(path); } },
  '@/utils/supabase/server': { createClient: async () => ({ auth: {
    verifyOtp: async input => {
      recoveryVerifications++;
      assert.equal(input.type, 'recovery');
      assert.equal(input.token_hash, 'a'.repeat(64));
      if (verificationError instanceof Error) throw verificationError;
      return { data: { session: verificationSession ? {} : null, user: verificationSession ? gaby : null }, error: verificationError };
    },
  } }) },
});
const confirmationForm = new FormData();
confirmationForm.set('token_hash', 'invalid');
await assert.rejects(confirmation.confirmRecovery(confirmationForm), { message: '/forgot-password?error=expired' });
assert.equal(recoveryVerifications, 0);
confirmationForm.set('token_hash', 'a'.repeat(64));
await assert.rejects(confirmation.confirmRecovery(confirmationForm), { message: '/reset-password' });
verificationError = { code: 'otp_expired' };
await assert.rejects(confirmation.confirmRecovery(confirmationForm), { message: '/forgot-password?error=expired' });
verificationError = new Error('connection failed');
await assert.rejects(confirmation.confirmRecovery(confirmationForm), { message: '/forgot-password?error=expired' });
verificationError = null; verificationSession = false;
await assert.rejects(confirmation.confirmRecovery(confirmationForm), { message: '/forgot-password?error=expired' });
console.log('PASS: recovery confirmation requires an explicit POST, a valid recovery token and an authenticated session.');
const recoveryPage = load('src/app/auth/recovery/page.tsx', {
  './actions': { confirmRecovery: () => { throw new Error('GET must never consume the token'); } },
  'next/link': { default: 'a' },
}).default;
const { renderToStaticMarkup } = dependency('react-dom/server');
for (let preview = 0; preview < 2; preview++) {
  const html = renderToStaticMarkup(await recoveryPage({ searchParams: Promise.resolve({ token_hash: 'a'.repeat(64) }) }));
  assert.ok(html.includes('Continuar para cambiar mi contraseña'));
  assert.ok(html.includes('name="token_hash"'));
}
const incompleteHtml = renderToStaticMarkup(await recoveryPage({ searchParams: Promise.resolve({ token_hash: ['one', 'two'] }) }));
assert.ok(incompleteHtml.includes('Este enlace está incompleto'));
assert.ok(!incompleteHtml.includes('<form'));
console.log('PASS: repeated email previews render confirmation without verifying or consuming the token.');
