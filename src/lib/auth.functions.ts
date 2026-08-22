import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getProfile = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // In a real app, you might fetch from a 'profiles' table.
    // For now, we return basic info from auth.users
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário",
      initials: (user.user_metadata?.full_name || user.email || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      plan: user.user_metadata?.plan || "Plano Gratuito",
    };
  });
