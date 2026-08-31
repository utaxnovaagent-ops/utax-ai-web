"use client";

// Sotuv sahifasidagi barcha komponentlar bitta manbadan bitim ro'yxatini oladi.
// Bitrix ulanmagan yoki uzilgan bo'lsa — namunaviy ma'lumotga qaytadi va buni
// sahifada ochiq aytadi (yarim-real ko'rsatkich chalg'itmasligi uchun).
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { sotuvDeals } from "./mock-data";
import type { Deal } from "./sales-metrics";

type DealsState = {
  deals: Deal[];
  isReal: boolean;
  loading: boolean;
  fetchedAt: string | null;
  note: string | null;
  wonThisMonthM: number | null;
  quality: { wonThisMonthCount: number; openWithoutAmount: number } | null;
};

const DealsContext = createContext<DealsState>({
  deals: sotuvDeals as Deal[],
  isReal: false,
  loading: true,
  fetchedAt: null,
  note: null,
  wonThisMonthM: null,
  quality: null,
});

export function DealsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DealsState>({
    deals: sotuvDeals as Deal[],
    isReal: false,
    loading: true,
    fetchedAt: null,
    note: null,
    wonThisMonthM: null,
    quality: null,
  });

  useEffect(() => {
    let alive = true;
    fetch("/api/sotuv")
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.ok && Array.isArray(j.deals) && j.deals.length > 0) {
          setState({
            deals: j.deals as Deal[],
            isReal: true,
            loading: false,
            fetchedAt: j.meta?.fetchedAt ?? null,
            note: null,
            wonThisMonthM: typeof j.meta?.wonThisMonthM === "number" ? j.meta.wonThisMonthM : null,
            quality: {
              wonThisMonthCount: j.meta?.wonThisMonthCount ?? 0,
              openWithoutAmount: j.meta?.openWithoutAmount ?? 0,
            },
          });
        } else {
          setState((s) => ({
            ...s,
            loading: false,
            note: j?.message ?? "Bitrix ulanmagan",
          }));
        }
      })
      .catch((e) => {
        if (!alive) return;
        setState((s) => ({ ...s, loading: false, note: String(e) }));
      });
    return () => {
      alive = false;
    };
  }, []);

  return <DealsContext.Provider value={state}>{children}</DealsContext.Provider>;
}

/** Metrik funksiyalarga uzatish uchun bitim ro'yxati. */
export function useDeals(): Deal[] {
  return useContext(DealsContext).deals;
}

/** Manba holati — sahifadagi belgi uchun. */
export function useDealsSource() {
  const { isReal, loading, fetchedAt, note, deals, wonThisMonthM, quality } = useContext(DealsContext);
  return { isReal, loading, fetchedAt, note, count: deals.length, wonThisMonthM, quality };
}
