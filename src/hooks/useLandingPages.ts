import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  loadLandingPages,
  removeLandingPage,
  saveLandingPage,
} from "@/lib/landing-pages";
import type { LandingPageData } from "@/types/landing-pages";

export function useLandingPages() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [pages, setPages] = useState<
    LandingPageData[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const refresh = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setPages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data =
        await loadLandingPages(user.id);

      setPages(data);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsertPage = useCallback(
    async (
      page: LandingPageData,
    ): Promise<LandingPageData> => {
      if (!user) {
        throw new Error(
          "Usuário não autenticado.",
        );
      }

      const savedPage =
        await saveLandingPage(
          user.id,
          page,
        );

      setPages((current) => {
        const exists = current.some(
          (item) =>
            item.id === savedPage.id,
        );

        if (!exists) {
          return [
            savedPage,
            ...current,
          ];
        }

        return current.map((item) =>
          item.id === savedPage.id
            ? savedPage
            : item,
        );
      });

      return savedPage;
    },
    [user],
  );

  const deletePage = useCallback(
    async (pageId: string) => {
      if (!user) {
        throw new Error(
          "Usuário não autenticado.",
        );
      }

      await removeLandingPage(pageId);

      setPages((current) =>
        current.filter(
          (page) => page.id !== pageId,
        ),
      );
    },
    [user],
  );

    return {
    pages,
    setPages,
    loading:
      authLoading || loading,
    user,
    refresh,
    upsertPage,
    deletePage,
  };
}