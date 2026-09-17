import { createClient } from "@supabase/supabase-js";

// Estas dos variables se rellenan en .env.local con los datos
// reales de tu proyecto de Supabase (Project Settings > API).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Forma de la fila de la tabla "suscripciones" que crearemos en Supabase.
// La usaremos en el panel de usuario y, más adelante, la rellenará
// el webhook de Stripe.
export type Suscripcion = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: string | null;
  estado: "activa" | "pausada" | "cancelada" | null;
  capitulo_actual: number | null;
};
