import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getProfile = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const metadata = user.user_metadata || {};
    const fullName = metadata['full_name'] || user.email?.split('@')[0] || "Usuário";
    
    return {
      id: user.id,
      email: user.email,
      name: fullName,
      initials: (fullName || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      plan: metadata['plan'] || "Plano Gratuito",
    };
  });
