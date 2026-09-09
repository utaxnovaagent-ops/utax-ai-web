// Sotuv hisobotining mazmuni — bir joyda yig'iladi, so'ng PDF / Word / rasm /
// CSV shakllarida chiqariladi. Raqamlar sahifadagi bilan bir xil manbadan
// olinadi, shuning uchun hisobot va ekran hech qachon farq qilmaydi.
import { pipelineValue, weightedForecast, atRiskValue, funnelStages, openDeals, type Deal } from "./sales-metrics";

export interface ReportInput {
  deals: Deal[];
  isReal: boolean;
  fetchedAt: string | null;
  periodLabel: string;
  winRate: number | null;
  won90: number | null;
  lost90: number | null;
  openWithoutAmount: number | null;
}

export interface ReportModel {
  title: string;
  date: string;
  periodLabel: string;
  sourceLine: string;
  isReal: boolean;
  kpis: { label: string; value: string; hint: string }[];
  funnel: { stage: string; count: number; value: number; conversion: number }[];
  atRisk: { client: string; value: number; days: number; owner: string }[];
  notes: string[];
}

export function buildReport(i: ReportInput): ReportModel {
  const open = openDeals(i.deals);
  const closed = (i.won90 ?? 0) + (i.lost90 ?? 0);

  const notes: string[] = [];
  if (!i.isReal) {
    notes.push("Diqqat: Bitrix24 ulanmagan — bu hisobotdagi raqamlar namunaviy, haqiqiy emas.");
  }
  if (i.openWithoutAmount) {
    notes.push(
      `${i.openWithoutAmount} ta ochiq bitimda summa kiritilmagan — daromad ko'rsatkichlari to'liq emas.`
    );
  }
  if (closed >= 10 && (i.lost90 ?? 0) / closed < 0.1) {
    notes.push(
      `90 kunda atigi ${i.lost90} ta bitim "yo'qotilgan" deb yopilgan — win rate haqiqiydan yuqori ko'rinadi.`
    );
  }

  return {
    title: "UTAX — Sotuv hisoboti",
    date: new Date().toLocaleDateString("uz-UZ", { day: "2-digit", month: "long", year: "numeric" }),
    periodLabel: i.periodLabel,
    isReal: i.isReal,
    sourceLine: i.isReal
      ? `Manba: Bitrix24 · ${i.deals.length} ta bitim${i.fetchedAt ? ` · yangilangan ${new Date(i.fetchedAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}` : ""}`
      : "Manba: namunaviy (demo) ma'lumot — Bitrix ulanmagan",
    kpis: [
      { label: "Pipeline qiymati", value: `${pipelineValue(i.deals)}M`, hint: "ochiq bitimlar summasi" },
      { label: "Weighted forecast", value: `${weightedForecast(i.deals)}M`, hint: "bitim × ehtimollik" },
      {
        label: "Win rate",
        value: i.winRate !== null ? `${i.winRate}%` : "—",
        hint: i.winRate !== null ? `${i.won90} yutilgan / ${closed} yopilgan` : "ma'lumot yetarli emas",
      },
      { label: "At-risk", value: `${atRiskValue(i.deals)}M`, hint: "kechikkan / signal past" },
      {
        label: "Ochiq bitimlar",
        value: String(open.length),
        hint: i.openWithoutAmount ? `${i.openWithoutAmount} tasida summa yo'q` : "summalar to'liq",
      },
    ],
    funnel: funnelStages(i.deals).map((s) => ({
      stage: s.stage,
      count: s.count,
      value: s.value,
      conversion: s.conversionIntoStage,
    })),
    atRisk: [...open]
      .filter((d) => d.value > 0)
      .sort((a, b) => b.lastContactDaysAgo - a.lastContactDaysAgo)
      .slice(0, 5)
      .map((d) => ({ client: d.client, value: d.value, days: d.lastContactDaysAgo, owner: d.owner })),
    notes,
  };
}
