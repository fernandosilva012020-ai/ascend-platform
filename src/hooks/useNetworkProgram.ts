import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  loadNetworkBranch,
  loadNetworkDashboard,
  type NetworkBranch,
  type NetworkDashboard,
} from "@/lib/network";

export function useNetworkProgram() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<NetworkDashboard | null>(null);
  const [branch, setBranch] = useState<NetworkBranch | null>(null);
  const [loading, setLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      setDashboard(null);
      setBranch(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [dashboardData, branchData] = await Promise.all([
        loadNetworkDashboard(),
        loadNetworkBranch(),
      ]);
      setDashboard(dashboardData);
      setBranch(branchData);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível carregar sua rede.",
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openBranch = useCallback(async (rootUserId: string) => {
    setBranchLoading(true);
    setError(null);

    try {
      const data = await loadNetworkBranch(rootUserId);
      setBranch(data);
      return data;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível abrir a ramificação.";
      setError(message);
      throw new Error(message);
    } finally {
      setBranchLoading(false);
    }
  }, []);

  return {
    dashboard,
    branch,
    loading: authLoading || loading,
    branchLoading,
    error,
    refresh,
    openBranch,
  };
}
