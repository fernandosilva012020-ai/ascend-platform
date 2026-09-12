# Automação WhatsApp — correção de rota

A navegação já contém o item "Automação WhatsApp" acima de "Funcionário IA".
Também foi criada a rota `src/routes/whatsapp-automation.tsx`, que aponta para
`src/pages/WhatsappAutomation.tsx`.

Importante: `src/routeTree.gen.ts` é gerado automaticamente pelo TanStack Router.
Ao executar `npm run dev` ou `npm run build`, o plugin deve regenerá-lo com a nova rota.
Se a hospedagem usar cache, faça um novo deploy/rebuild após enviar os arquivos ao GitHub.
