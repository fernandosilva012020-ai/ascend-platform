import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listXforgeLicensesTool from "./tools/list-xforge-licenses";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "projeto-x",
  title: "Projeto X",
  version: "0.1.0",
  instructions:
    "Ferramentas do Projeto X. Use `whoami` para confirmar a conta conectada e `list_xforge_licenses` para consultar as licenças da extensão XForge Pro do administrador autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listXforgeLicensesTool],
});
