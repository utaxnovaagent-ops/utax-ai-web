"use client";

// Sotuv sahifasidagi barcha komponentlar bitta manbadan bitim ro'yxatini oladi.
// Bitrix ulanmagan yoki uzilgan bo'lsa — namunaviy ma'lumotga qaytadi va buni
// sahifada ochiq aytadi (yarim-real ko'rsatkich chalg'itmasligi uchun).
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { filterByPeriod, periodSupported, type PeriodId } from "./period";
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
  // Bitrixdagi so'nggi 90 kun natijasi — win rate shu ikkitasidan hisoblanadi.
  won90: number | null;
  lost90: number | null;
  /** Oxirgi 6 oy tushumi — Bitrixdagi g'olib bitimlardan. */
  monthlyWon: { month: string; revenue: number; deals: number }[] | null;
};

const DealsContext = createContext<DealsState>({
  deals: sotuvDeals as Deal[],
  isReal: false,
  loading: true,
  fetchedAt: null,
  note: null,
  wonThisMonthM: null,
  quality: null,
  won90: null,
  lost90: null,
  monthlyWon: null,
});

type PeriodCtx = {
  period: PeriodId;
  setPeriod: (p: PeriodId) => void;
  supported: boolean;
  totalCount: number;
};

const PeriodContext = createContext<PeriodCtx>({
  period: "all",
  setPeriod: () => {},
  supported: false,
  totalCount: 0,
});

export function DealsProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState<PeriodId>("all");
  const [state, setState] = useState<DealsState>({
    deals: sotuvDeals as Deal[],
    isReal: false,
    loading: true,
    fetchedAt: null,
    note: null,
    wonThisMonthM: null,
    quality: null,
    won90: null,
    lost90: null,
    monthlyWon: null,
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
            won90: typeof j.meta?.wonLast90 === "number" ? j.meta.wonLast90 : null,
            lost90: typeof j.meta?.lostLast90 === "number" ? j.meta.lostLast90 : null,
            monthlyWon: Array.isArray(j.meta?.monthlyWon) ? j.meta.monthlyWon : null,
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

  // Davr filtri shu yerda qo'llanadi — sahifadagi hamma blok bir xil ro'yxatdan
  // o'qiydi, aks holda KPI filtrlanib, grafik filtrlanmay qolardi.
  const supported = periodSupported(state.deals);
  const visible = useMemo(
    () => (supported ? filterByPeriod(state.deals, period) : state.deals),
    [state.deals, period, supported]
  );

  return (
    <PeriodContext.Provider
      value={{ period, setPeriod, supported, totalCount: state.deals.length }}
    >
      <DealsContext.Provider value={{ ...state, deals: visible }}>{children}</DealsContext.Provider>
    </PeriodContext.Provider>
  );
}

/** Metrik funksiyalarga uzatish uchun bitim ro'yxati. */
export function useDeals(): Deal[] {
  return useContext(DealsContext).deals;
}

/** Davr filtri — faqat sarlavhadagi tanlagich uchun. */
export function usePeriod() {
  return useContext(PeriodContext);
}

/** Manba holati — sahifadagi belgi uchun. */
export function useDealsSource() {
  const { isReal, loading, fetchedAt, note, deals, wonThisMonthM, quality, won90, lost90, monthlyWon } = useContext(DealsContext);
  // Win rate faqat real yopilgan bitimlar bo'lsa hisoblanadi.
  const closed = (won90 ?? 0) + (lost90 ?? 0);
  const winRate = isReal && closed > 0 ? Math.round(((won90 ?? 0) / closed) * 100) : null;
  return { isReal, loading, fetchedAt, note, count: deals.length, wonThisMonthM, quality, won90, lost90, winRate, monthlyWon };
}
