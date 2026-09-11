import { externalSupabase } from "@/integrations/supabase/external-client";

export type NetworkStatus =
  | "pending_payment"
  | "active"
  | "past_due"
  | "inactive"
  | "suspended";

export type NetworkLevel = {
  depth: number;
  name: string;
  newPositions: number;
  cumulativePositions: number;
  commissionPerMember: number;
  advancementBonus: number;
};

export type NetworkMemberSummary = {
  userId: string;
  displayName: string;
  status: NetworkStatus;
  rank: string;
  depth: number;
  teamSize: number;
  sponsorName: string;
  joinedAt: string;
};

export type NetworkCommission = {
  id: string;
  type: "direct" | "level" | "advancement";
  amount: number;
  status: "pending" | "available" | "paid" | "reversed";
  description: string;
  createdAt: string;
};

export type NetworkDashboard = {
  member: {
    userId: string;
    displayName: string;
    referralCode: string;
    status: NetworkStatus;
    currentDepth: number;
    currentRank: string;
    joinedAt: string;
  };
  settings: {
    subscriptionPrice: number;
    directBonus: number;
    renewalNetworkShare: number;
    renewalCompanyGross: number;
    requiredDirectReferrals: number;
    maxDepth: number;
  };
  levels: NetworkLevel[];
  directReferrals: number;
  networkSize: number;
  pendingMembers: number;
  monthlyCommission: number;
  availableBalance: number;
  subscriptionStatus: "pending" | "active" | "past_due" | "canceled";
  members: NetworkMemberSummary[];
  recentCommissions: NetworkCommission[];
};

export type NetworkBranchPerson = {
  userId: string;
  displayName: string;
  status: NetworkStatus;
  rank: string;
  joinedAt: string;
  sponsorName: string;
};

export type NetworkBranch = {
  root: NetworkBranchPerson;
  children: NetworkBranchPerson[];
};

export type PublicReferrer = {
  valid: boolean;
  displayName: string;
  referralCode: string;
};

function asNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDashboard(value: unknown): NetworkDashboard {
  const data = value as NetworkDashboard;

  return {
    ...data,
    directReferrals: asNumber(data.directReferrals),
    networkSize: asNumber(data.networkSize),
    pendingMembers: asNumber(data.pendingMembers),
    monthlyCommission: asNumber(data.monthlyCommission),
    availableBalance: asNumber(data.availableBalance),
    settings: {
      ...data.settings,
      subscriptionPrice: asNumber(data.settings.subscriptionPrice),
      directBonus: asNumber(data.settings.directBonus),
      renewalNetworkShare: asNumber(data.settings.renewalNetworkShare),
      renewalCompanyGross: asNumber(data.settings.renewalCompanyGross),
      requiredDirectReferrals: asNumber(data.settings.requiredDirectReferrals),
      maxDepth: asNumber(data.settings.maxDepth),
    },
    levels: (data.levels ?? []).map((level) => ({
      ...level,
      depth: asNumber(level.depth),
      newPositions: asNumber(level.newPositions),
      cumulativePositions: asNumber(level.cumulativePositions),
      commissionPerMember: asNumber(level.commissionPerMember),
      advancementBonus: asNumber(level.advancementBonus),
    })),
    members: (data.members ?? []).map((member) => ({
      ...member,
      depth: asNumber(member.depth),
      teamSize: asNumber(member.teamSize),
    })),
    recentCommissions: (data.recentCommissions ?? []).map((commission) => ({
      ...commission,
      amount: asNumber(commission.amount),
    })),
  };
}

export async function loadNetworkDashboard(): Promise<NetworkDashboard> {
  const { data, error } = await externalSupabase.rpc("get_my_network_dashboard");

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Os dados da rede não foram encontrados.");

  return normalizeDashboard(data);
}

export async function loadNetworkBranch(
  rootUserId?: string,
): Promise<NetworkBranch> {
  const { data, error } = await externalSupabase.rpc("get_my_network_branch", {
    p_root_user_id: rootUserId ?? null,
  });

  if (error) throw new Error(error.message);
  if (!data) throw new Error("A ramificação não foi encontrada.");

  return data as NetworkBranch;
}

export async function loadPublicReferrer(
  referralCode: string,
): Promise<PublicReferrer | null> {
  const { data, error } = await externalSupabase.rpc("get_public_referrer", {
    p_referral_code: referralCode,
  });

  if (error) throw new Error(error.message);
  return data ? (data as PublicReferrer) : null;
}

export function formatNetworkCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getNetworkStatusLabel(status: NetworkStatus): string {
  const labels: Record<NetworkStatus, string> = {
    pending_payment: "Aguardando pagamento",
    active: "Ativo",
    past_due: "Pagamento pendente",
    inactive: "Inativo",
    suspended: "Suspenso",
  };

  return labels[status];
}
