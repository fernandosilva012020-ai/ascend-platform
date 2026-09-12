import { createClient } from "@supabase/supabase-js";

const EXTERNAL_SUPABASE_URL =
  "https://jddgebxqwmxngfitcftb.supabase.co";

const EXTERNAL_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Cjh1IP0PWmozDUm8gH7jMQ_bpQ1u6tu";

export const externalSupabase = createClient(
  EXTERNAL_SUPABASE_URL,
  EXTERNAL_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
