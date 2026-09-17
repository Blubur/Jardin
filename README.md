# El Jardín de las Herederas — web

Escaparate + registro + panel de usuario para la entrega mensual de
"El Jardín de las Herederas".

## Puesta en marcha

1. Instala dependencias:
   ```
   npm install
   ```
2. Crea un proyecto gratuito en https://supabase.com
3. Copia `.env.local.example` como `.env.local` y rellena
   `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (los encuentras en Project Settings → API de tu proyecto de Supabase).
4. En el editor SQL de Supabase, crea la tabla de suscripciones:
   ```sql
   create table suscripciones (
     user_id uuid primary key references auth.users(id),
     stripe_customer_id text,
     stripe_subscription_id text,
     plan text,
     estado text,
     capitulo_actual integer
   );

   alter table suscripciones enable row level security;

   create policy "Cada usuaria ve solo su fila"
     on suscripciones for select
     using (auth.uid() = user_id);
   ```
5. Arranca en local:
   ```
   npm run dev
   ```
   y abre http://localhost:3000

## Páginas incluidas

- `/` — escaparate del proyecto
- `/registro` — alta e inicio de sesión (Supabase Auth)
- `/panel` — plan, estado y capítulo actual de la usuaria (protegido)

## Pendiente (siguiente fase, con Stripe)

- Página `/#planes` con los precios reales.
- Ruta `/api/stripe/checkout` para iniciar el pago.
- Ruta `/api/stripe/webhook` para que Stripe actualice la tabla
  `suscripciones` automáticamente.
- Ruta `/api/stripe/portal` para el botón "Ver facturas" del panel,
  que redirige al Customer Portal de Stripe.

## Despliegue

Sube el repositorio a GitHub y conéctalo a Vercel (plan gratuito).
Añade las mismas variables de `.env.local` en Vercel → Settings →
Environment Variables.
