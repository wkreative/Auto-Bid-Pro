# Auction Auto Hub

Plataforma premium para la adquisición de vehículos de subasta.

## Tecnologías Utilizadas
- **Frontend:** Next.js (App Router), React 19, Tailwind CSS v4.
- **Backend/Base de datos:** Supabase (PostgreSQL), Supabase Auth, Storage.
- **Pagos:** Stripe (Suscripciones).
- **Iconos:** Lucide React.
- **Estilos:** Glassmorphism moderno y minimalista con Tailwind CSS.

## Estructura del Proyecto
- `src/app/page.tsx`: Landing page principal (Área Pública).
- `src/app/dashboard/`: Área Privada para usuarios con suscripción (Dashboard e Inventario).
- `src/components/ui/`: Componentes reutilizables de UI (Navbar, Footer, etc).
- `src/lib/supabase.ts`: Configuración del cliente de Supabase.
- `supabase/schema.sql`: Estructura completa de la base de datos (Tablas, Tipos Enum, Row Level Security, Triggers).
- `.env.local.example`: Ejemplo de las variables de entorno necesarias.

## Pasos para ejecutar localmente

1. **Usar Node.js 22 e instalar dependencias:**
   ```bash
   nvm install
   nvm use
   npm install
   ```

2. **Configurar Supabase:**
   - Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto.
   - Ejecuta el contenido del archivo `supabase/schema.sql` en el SQL Editor de Supabase.
   - Copia la URL y la Anon Key de tu proyecto y renombra `.env.local.example` a `.env.local`, colocando ahí las credenciales.

3. **Configurar Stripe (Opcional por ahora):**
   - Obtén tus llaves de prueba en Stripe y colócalas en `.env.local`.

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Siguientes Pasos
1. Conectar la autenticación en el Navbar (`/login`, `/register`) usando `supabase.auth`.
2. Crear la integración con Stripe Checkout en la página de precios para generar las suscripciones.
3. Crear el panel de administrador (`/admin`) para gestionar vehículos y aprobar ofertas.
4. Conectar el Dashboard a los datos reales de la tabla `vehicles` de Supabase en vez del mock data.

## Registro de cuentas

Supabase requiere WebSocket nativo en el servidor; ejecuta la aplicación con Node.js 22, indicado en `.nvmrc`, `.node-version` y `package.json`. Node.js 20 sin WebSocket puede impedir que se inicialice el cliente de autenticación.

El formulario muestra mensajes según los [códigos de error de Supabase Auth](https://supabase.com/docs/guides/auth/debugging/error-codes). Los registros del servidor incluyen únicamente el código y el estado del error, sin credenciales ni sesiones.

## Acceso y cierre de sesión

José (`josejmzmo@gmail.com`) es el único superadministrador: puede crear administradores, asignar o retirar sus permisos y borrar sus cuentas. Gaby y Autobroker PR LLC siguen como administradores. La identidad de José se valida por ID, correo confirmado y `app_metadata.role`; los permisos se almacenan en metadata protegida por Supabase Auth. No se permite eliminar o degradar al superadministrador. Los administradores pueden editar información de contacto sin modificar roles administrativos.

En `/admin/users` se muestran nombres, correos, teléfonos, roles y fechas de registro. Los correos provienen de Supabase Auth y los teléfonos del perfil, con respaldo en los datos de registro. Solo se envían al navegador los campos de contacto necesarios.

El botón Cerrar Sesión está disponible en ambos paneles para escritorio y móvil. Cierra la sesión del dispositivo actual, elimina sus cookies de autenticación y regresa al inicio de sesión.

La migración `supabase/migrations/202610070001_super_admin_contacts.sql` protege los perfiles contra escritura directa desde clientes autenticados. `is_admin()` consulta metadata actual de Auth, por lo que retirar un rol invalida también el acceso directo a los datos. El registro permite guardar un teléfono opcional.

## Recuperación de contraseña

El enlace «¿Olvidaste tu contraseña?» de `/login` permite solicitar un correo y elegir una contraseña nueva. Los enlaces vencidos permiten solicitar otro correo.

### Configuración en Supabase

1. En Authentication → URL Configuration, configura Site URL como `https://www.prautobroker.com`.
2. Añade a Redirect URLs `https://www.prautobroker.com/auth/callback` y `https://www.prautobroker.com/auth/callback?next=/reset-password`. En desarrollo, usa las URLs equivalentes de localhost.
3. En Authentication → Email Templates → Reset Password, copia el contenido de `supabase/templates/recovery.html` y guarda. El enlace debe usar `{{ .SiteURL }}/auth/recovery?token_hash={{ .TokenHash }}`.
4. Configura el proveedor de correo de Supabase para entregar los mensajes de autenticación. Desactiva el rastreo que reescriba sus enlaces.
5. Solicita un correo nuevo después de guardar: los enlaces anteriores no cambian.

La página `/auth/recovery` muestra un botón y solo verifica el token al enviar el formulario. Las previsualizaciones y los filtros de seguridad pueden abrirla sin consumir el enlace. La validación crea la sesión antes de mostrar `/reset-password`, sin depender del verificador PKCE del navegador original. Si Supabase devuelve `otp_expired`, el enlace ya fue utilizado o caducó: solicita uno nuevo. No compartas enlaces ni tokens.

El callback anterior sigue disponible para los enlaces PKCE; esos enlaces requieren el navegador donde se solicitó la recuperación. `NEXT_PUBLIC_SITE_URL`, si se configura, debe coincidir con el entorno; en su ausencia se usa el origen de la solicitud.

Verifica el flujo completo solicitando un correo, pulsando el botón de confirmación, guardando la contraseña nueva y comprobando que permite iniciar sesión. Los avisos de lotes usan una integración de correo independiente.
