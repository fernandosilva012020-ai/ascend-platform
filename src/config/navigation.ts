import {
  LayoutDashboard,
  Bot,
  Sparkles,
  Users,
  Globe,
  Megaphone,
  Link2,
  ShoppingCart,
  GraduationCap,
  Library,
  TrendingUp,
  Wallet,
  Network,
  LayoutGrid,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
};

export type NavGroup = {
  label: string | null;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
        description: "Visão geral do seu negócio.",
      },
    ],
  },
  {
    label: "Inteligência",
    items: [
      {
        title: "Funcionário IA",
        url: "/funcionario-ia",
        icon: Bot,
        description: "Seu assistente inteligente para vendas e marketing.",
      },
      {
        title: "Prompt X Studio",
        url: "/prompt-studio",
        icon: Sparkles,
        description: "Crie, salve e reutilize prompts profissionais.",
      },
    ],
  },
  {
    label: "Vendas",
    items: [
      {
        title: "CRM",
        url: "/crm",
        icon: Users,
        description: "Gerencie leads, contatos e oportunidades.",
      },
      {
        title: "Landing Pages",
        url: "/landing-pages",
        icon: Globe,
        description: "Publique páginas de captura em minutos.",
      },
      {
        title: "Central de Marketing",
        url: "/marketing",
        icon: Megaphone,
        description: "Campanhas, disparos e automações.",
      },
      {
        title: "Links Inteligentes",
        url: "/links-inteligentes",
        icon: Link2,
        description: "Links rastreáveis com métricas de conversão.",
      },
      {
        title: "Loja",
        url: "/loja",
        icon: ShoppingCart,
        description: "Produtos, ofertas e checkout.",
      },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      {
        title: "Academy",
        url: "/academy",
        icon: GraduationCap,
        description: "Trilhas de treinamento para sua equipe.",
      },
      {
        title: "Biblioteca",
        url: "/biblioteca",
        icon: Library,
        description: "Materiais, criativos e documentos.",
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Relatórios",
        url: "/relatorios",
        icon: TrendingUp,
        description: "Indicadores e desempenho detalhado.",
      },
    ],
  },
  {
    label: "Parceiros",
    items: [
      {
        title: "Parceiros",
        url: "/parceiros",
        icon: Wallet,
        description: "Programa de indicações e comissões.",
      },
      {
        title: "Minha Rede",
        url: "/minha-rede",
        icon: Network,
        description: "Estrutura da sua rede de parceiros.",
      },
      {
        title: "Tabuleiro",
        url: "/tabuleiro",
        icon: LayoutGrid,
        description: "Acompanhe sua evolução no plano de carreira.",
      },
    ],
  },
  {
    label: "Conta",
    items: [
      {
        title: "Assinatura",
        url: "/assinatura",
        icon: CreditCard,
        description: "Plano atual, faturas e upgrades.",
      },
      {
        title: "Configurações",
        url: "/configuracoes",
        icon: Settings,
        description: "Preferências da conta e do workspace.",
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);

export function getNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find((item) => item.url === pathname);
}
