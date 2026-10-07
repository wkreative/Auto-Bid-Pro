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
