import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env['VITE_SUPABASE_URL'] ||
  "https://jddgebxqwmxngfitcftb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env['VITE_SUPABASE_ANON_KEY'] ||
  import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ||
  "sb_publishable_Cjh1IP0PWmozDUm8gH7jMQ_bpQ1u6tu";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});