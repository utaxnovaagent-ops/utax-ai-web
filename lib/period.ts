// Sotuv sahifasidagi davr filtri. Bitim sanasi faqat Bitrixdan kelgan
// ma'lumotda bor — namunaviy rejimda filtr qo'llanmaydi va buni sahifa
// ochiq aytadi (jimgina "0 bitim" ko'rsatib chalg'itmaslik uchun).
import type { Deal } from "./sales-metrics";

export type PeriodId = "all" | "month" | "prev_month" | "quarter";

export const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "all", label: "Barcha davr" },
  { id: "month", label: "Bu oy" },
  { id: "prev_month", label: "O'tgan oy" },
  { id: "quarter", label: "Bu kvartal" },
];

/** Davr chegaralari (mahalliy vaqt bo'yicha). */
function range(period: PeriodId, now = new Date()): { from: Date; to: Date } | null {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (period === "month") return { from: new Date(y, m, 1), to: new Date(y, m + 1, 1) };
  if (period === "prev_month") return { from: new Date(y, m - 1, 1), to: new Date(y, m, 1) };
  if (period === "quarter") {
    const q = Math.floor(m / 3) * 3;
    return { from: new Date(y, q, 1), to: new Date(y, q + 3, 1) };
  }
  return null; // "all"
}

export function filterByPeriod(deals: Deal[], period: PeriodId): Deal[] {
  const r = range(period);
  if (!r) return deals;
  return deals.filter((d) => {
    if (!d.createdAt) return false;
    const t = Date.parse(d.createdAt);
    return !Number.isNaN(t) && t >= r.from.getTime() && t < r.to.getTime();
  });
}

/** Filtr umuman qo'llanadimi — bitimlarda sana bormi. */
export function periodSupported(deals: Deal[]): boolean {
  return deals.some((d) => !!d.createdAt);
}
