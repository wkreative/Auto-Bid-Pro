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

1. **Instalar dependencias:**
   ```bash
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
