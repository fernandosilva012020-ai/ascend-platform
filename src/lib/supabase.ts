import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jddgebxqwmxngfitcftb.supabase.co";
const supabaseAnonKey = "sb_publishable_Cjh1IP0PWmozDUm8gH7jMQ_bpQ1u6tu";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);