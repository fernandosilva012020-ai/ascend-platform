import { createFileRoute } from "@tanstack/react-router";
import WhatsappAutomation from "@/pages/WhatsappAutomation";

export const Route = createFileRoute("/whatsapp-automation")({
  component: WhatsappAutomation,
});
