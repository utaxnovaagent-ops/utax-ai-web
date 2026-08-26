// Sotuv "Revenue Command Center" uchun hisoblash funksiyalari.
// Har bir KPI/funnel/missiya shu yerdagi formulalar orqali sotuvDeals'dan
// chiqariladi — sahifada qo'lda yozilgan yakuniy raqam yo'q (TZI v2.0 §3.2, §8).
import { sotuvDeals, SALES_STAGES } from "./mock-data";

export type Deal = (typeof sotuvDeals)[number];

const WON_STAGE = "Yopilgan (g'olib)";
const RISK_WEIGHT: Record<Deal["risk"], number> = { yuqori: 30, "o'rta": 18, past: 6 };

// Bosqichlar bo'yicha "oldingi davrga nisbatan" — real tarixiy ma'lumot hali
// yo'q, shu sababli aniq belgilangan namunaviy (DEMO) trend sifatida saqlanadi.
const PREV_PERIOD_DELTA_PCT: Record<string, number> = {
  "Yangi lead": 12,
  Malakalashtirilgan: -4,
  "Taklif yuborilgan": 6,
  Muzokara: -8,
  "Yopilgan (g'olib)": 15,
};

export function openDeals(deals: Deal[] = sotuvDeals) {
  return deals.filter((d) => d.stage !== WON_STAGE);
}

export function pipelineValue(deals: Deal[] = sotuvDeals) {
  return openDeals(deals).reduce((sum, d) => sum + d.value, 0);
}

export function weightedForecast(deals: Deal[] = sotuvDeals) {
  return Math.round(openDeals(deals).reduce((sum, d) => sum + (d.value * d.probability) / 100, 0));
}

export function atRiskDeals(deals: Deal[] = sotuvDeals) {
  return openDeals(deals).filter((d) => d.risk === "yuqori");
}

export function atRiskValue(deals: Deal[] = sotuvDeals) {
  return atRiskDeals(deals).reduce((sum, d) => sum + d.value, 0);
}

export function negotiationValue(deals: Deal[] = sotuvDeals) {
  return deals.filter((d) => d.stage === "Muzokara").reduce((sum, d) => sum + d.value, 0);
}

export function needsActionToday(deals: Deal[] = sotuvDeals) {
  return openDeals(deals).filter((d) => d.risk === "yuqori" || d.lastContactDaysAgo >= 5);
}

export interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  avgDays: number;
  conversionIntoStage: number;
  prevPeriodDeltaPct: number;
}

export function funnelStages(deals: Deal[] = sotuvDeals): FunnelStage[] {
  const byStage = SALES_STAGES.map((stage) => deals.filter((d) => d.stage === stage));
  // "kamida shu bosqichga yetgan" bitimlar soni — oxiridan boshlab yig'indi
  const atLeastCounts: number[] = [];
  let running = 0;
  for (let i = byStage.length - 1; i >= 0; i--) {
    running += byStage[i].length;
    atLeastCounts[i] = running;
  }

  return SALES_STAGES.map((stage, i) => {
    const inStage = byStage[i];
    const conversionIntoStage = i === 0 ? 100 : atLeastCounts[i - 1] === 0 ? 0 : Math.round((atLeastCounts[i] / atLeastCounts[i - 1]) * 100);
    return {
      stage,
      count: inStage.length,
      value: inStage.reduce((s, d) => s + d.value, 0),
      avgDays: inStage.length ? Math.round(inStage.reduce((s, d) => s + d.daysInStage, 0) / inStage.length) : 0,
      conversionIntoStage,
      prevPeriodDeltaPct: PREV_PERIOD_DELTA_PCT[stage] ?? 0,
    };
  });
}

export interface Mission {
  deal: Deal;
  priorityScore: number;
  aiReason: string;
  requiresApproval: boolean;
}

function ctaRequiresApproval(nextAction: string) {
  return /chegirma|shartnoma|tasdiqlatish|yuborish/i.test(nextAction);
}

export function missions(deals: Deal[] = sotuvDeals, limit = 4): Mission[] {
  const maxValue = Math.max(...openDeals(deals).map((d) => d.value), 1);
  return openDeals(deals)
    .map((deal) => {
      const priorityScore = Math.round((deal.value / maxValue) * 40 + (deal.probability / 100) * 30 + RISK_WEIGHT[deal.risk]);
      const staleness =
        deal.lastContactDaysAgo >= 5
          ? `Oxirgi aloqadan ${deal.lastContactDaysAgo} kun o'tgan.`
          : `${deal.daysInStage} kundir "${deal.stage}" bosqichida.`;
      const aiReason = `${deal.value}M so'm, ehtimollik ${deal.probability}%. ${staleness}`;
      return { deal, priorityScore, aiReason, requiresApproval: ctaRequiresApproval(deal.nextAction) };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, limit);
}
