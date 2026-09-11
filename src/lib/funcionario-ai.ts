import { supabase } from "@/integrations/supabase/client";

type RoleId =
  | "vendas"
  | "marketing"
  | "copywriter"
  | "social-media"
  | "suporte"
  | "estrategia";

type TalkInput = {
  data: {
    roleId: RoleId;
    message: string;
    history: Array<{ role: "user" | "assistant"; content: string }>;
  };
};

export async function talkToFuncionarioAI({ data }: TalkInput) {
  const { data: response, error } = await supabase.functions.invoke("chat-ia", {
    body: {
      roleId: data.roleId,
      message: data.message,
      history: data.history,
    },
  });

  if (error) {
    console.error("Erro ao chamar chat-ia:", error);
    throw new Error(error.message || "FUNCIONARIO_AI_FAILED");
  }

  if (response?.error) {
    throw new Error(response.error);
  }

  return {
    message: response?.message ?? "",
  };
}