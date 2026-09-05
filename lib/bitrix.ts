// Bitrix24 bilan ishlash — FAQAT server tomonida.
// Webhook manzili BITRIX_WEBHOOK_URL env'da saqlanadi va hech qachon brauzerga
// yuborilmaydi (NEXT_PUBLIC_ prefiksi YO'Q — bu ataylab shunday).
import "server-only";

import { SALES_STAGES, type sotuvDeals } from "./mock-data";

export type Deal = (typeof sotuvDeals)[number];
type SalesStage = (typeof SALES_STAGES)[number];

const BASE = process.env.BITRIX_WEBHOOK_URL?.replace(/\/?$/, "/") ?? "";

export function bitrixConfigured() {
  return BASE.length > 0;
}

async function call<T = unknown>(method: string, params: Record<string, string> = {}) {
  if (!BASE) throw new Error("BITRIX_WEBHOOK_URL sozlanmagan");
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}${method}.json${qs ? `?${qs}` : ""}`, {
    // Bitrix sekin javob beradi; sahifa har ochilganda so'rov ketmasligi uchun
    // Next kesh qatlamiga tayanamiz (revalidate route darajasida beriladi).
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Bitrix ${method}: HTTP ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: string; error_description?: string; next?: number; total?: number };
  if (json.error) throw new Error(`Bitrix ${method}: ${json.error} — ${json.error_description ?? ""}`);
  return json;
}

/** Sahifalab yig'ish. Katta bazani cheklash uchun maxPages bor. */
async function listAll<T>(method: string, params: Record<string, string>, maxPages = 6): Promise<T[]> {
  const out: T[] = [];
  let start = 0;
  for (let page = 0; page < maxPages; page++) {
    const json = await call<T[]>(method, { ...params, start: String(start) });
    const rows = (json.result ?? []) as T[];
    out.push(...rows);
    if (json.next === undefined || json.next === null) break;
    start = json.next;
  }
  return out;
}

// --- Bosqichlarni sahifadagi 5 ta bosqichga moslash -------------------------

type StageRow = { STATUS_ID: string; NAME: string; SORT: string; SEMANTICS: string | null };

/** Bitrix bosqichini sahifadagi bosqichga aylantiradi.
 *  Har pipeline'da bosqichlar boshqacha, shuning uchun tartib (SORT) bo'yicha
 *  nisbiy o'ringa qarab guruhlaymiz — nom bo'yicha emas (nomlar har xil). */
function buildStageMapper(stages: StageRow[]) {
  const open = stages
    .filter((s) => s.SEMANTICS === null)
    .sort((a, b) => Number(a.SORT) - Number(b.SORT));
  const order = new Map<string, number>();
  open.forEach((s, i) => order.set(s.STATUS_ID, i));
  const openCount = Math.max(open.length, 1);

  return (statusId: string, semantics: string | null): SalesStage | null => {
    if (semantics === "S") return "Yopilgan (g'olib)";
    if (semantics === "F") return null; // yo'qotilgan — voronkada ko'rsatilmaydi
    const i = order.get(statusId);
    if (i === undefined) return "Yangi lead";
    const ratio = i / openCount;
    if (ratio < 0.25) return "Yangi lead";
    if (ratio < 0.5) return "Malakalashtirilgan";
    if (ratio < 0.75) return "Taklif yuborilgan";
    return "Muzokara";
  };
}

const STAGE_PROBABILITY: Record<SalesStage, number> = {
  "Yangi lead": 10,
  Malakalashtirilgan: 25,
  "Taklif yuborilgan": 40,
  Muzokara: 55,
  "Yopilgan (g'olib)": 100,
};

const STAGE_NEXT_ACTION: Record<SalesStage, string> = {
  "Yangi lead": "Birlamchi qo'ng'iroq",
  Malakalashtirilgan: "Ehtiyojni tasdiqlash",
  "Taklif yuborilgan": "Taklif bo'yicha javob olish",
  Muzokara: "Shartlarni yakunlash",
  "Yopilgan (g'olib)": "Onboarding",
};

function daysSince(iso?: string | null) {
  if (!iso) return 0;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.round((Date.now() - t) / 86_400_000));
}

/** Risk — aloqasizlik muddati va bitim qiymatiga qarab. */
function riskOf(lastContactDaysAgo: number, valueM: number): Deal["risk"] {
  if (lastContactDaysAgo >= 14 || (lastContactDaysAgo >= 7 && valueM >= 20)) return "yuqori";
  if (lastContactDaysAgo >= 5) return "o'rta";
  return "past";
}

// --- Asosiy funksiya --------------------------------------------------------

type RawDeal = {
  ID: string; TITLE: string; CATEGORY_ID: string; STAGE_ID: string;
  STAGE_SEMANTIC_ID: string | null; OPPORTUNITY: string;
  DATE_CREATE: string; DATE_MODIFY: string; ASSIGNED_BY_ID: string;
};

export type SotuvSnapshot = {
  deals: Deal[];
  meta: {
    fetchedAt: string;
    openTotal: number;
    wonLast90: number;
    lostLast90: number;
    /** Shu oyda yopilgan (g'olib) bitimlar summasi, mln so'm. */
    wonThisMonthM: number;
    /** Shu oyda yopilgan bitimlar soni (summa kiritilmagan bo'lsa ham). */
    wonThisMonthCount: number;
    /** Summasi kiritilmagan ochiq bitimlar soni — ma'lumot sifati signali. */
    openWithoutAmount: number;
    /** Oxirgi 6 oy: yopilgan g'olib bitimlar summasi (mln so'm) va soni. */
    monthlyWon: { month: string; revenue: number; deals: number }[];
    source: "bitrix";
  };
};

export async function fetchSotuvSnapshot(): Promise<SotuvSnapshot> {
  const since90 = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 19);

  const [stagesJson, categoriesJson, users] = await Promise.all([
    call<StageRow[]>("crm.status.list", { "filter[ENTITY_ID]": "DEAL_STAGE" }),
    call<{ ID: string; NAME: string }[]>("crm.dealcategory.list"),
    listAll<{ ID: string; NAME: string; LAST_NAME: string }>("user.get", {}, 2).catch(() => []),
  ]);

  // Har pipeline'ning bosqichlari alohida ro'yxatda; umumiy ro'yxat kifoya qiladi,
  // chunki STATUS_ID pipeline prefiksi bilan keladi (C4:NEW va h.k.).
  const allStages = stagesJson.result ?? [];
  const perCategoryStages = await Promise.all(
    (categoriesJson.result ?? []).map((c) =>
      call<StageRow[]>("crm.dealcategory.stage.list", { id: c.ID })
        .then((r) => r.result ?? [])
        .catch(() => [] as StageRow[]),
    ),
  );
  const mapStage = buildStageMapper([...allStages, ...perCategoryStages.flat()]);

  const categoryName = new Map((categoriesJson.result ?? []).map((c) => [c.ID, c.NAME]));
  const userName = new Map(
    users.map((u) => [u.ID, [u.NAME, u.LAST_NAME].filter(Boolean).join(" ").trim() || `#${u.ID}`]),
  );

  const select = {
    "select[0]": "ID", "select[1]": "TITLE", "select[2]": "CATEGORY_ID",
    "select[3]": "STAGE_ID", "select[4]": "STAGE_SEMANTIC_ID", "select[5]": "OPPORTUNITY",
    "select[6]": "DATE_CREATE", "select[7]": "DATE_MODIFY", "select[8]": "ASSIGNED_BY_ID",
  };

  const since6m = new Date(Date.now() - 183 * 86_400_000).toISOString().slice(0, 19);

  const [openRaw, closedRaw, won6mRaw] = await Promise.all([
    listAll<RawDeal>("crm.deal.list", {
      ...select, "filter[CLOSED]": "N", "order[DATE_MODIFY]": "DESC",
    }, 6),
    listAll<RawDeal & { CLOSEDATE?: string }>("crm.deal.list", {
      ...select, "select[9]": "CLOSEDATE",
      "filter[>CLOSEDATE]": since90, "order[CLOSEDATE]": "DESC",
    }, 4),
    // Tushum trendi uchun — 6 oylik g'olib bitimlar (faqat sana va summa kerak).
    listAll<{ CLOSEDATE?: string; OPPORTUNITY: string }>("crm.deal.list", {
      "select[0]": "CLOSEDATE", "select[1]": "OPPORTUNITY",
      "filter[STAGE_SEMANTIC_ID]": "S",
      "filter[>CLOSEDATE]": since6m, "order[CLOSEDATE]": "ASC",
    }, 8).catch(() => []),
  ]);

  // Oy bo'yicha guruhlash — grafik oxirgi 6 oyni ko'rsatadi, bo'sh oy ham qoladi
  // (aks holda "o'sish" yolg'on ko'rinadi).
  const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  const bucket = new Map<string, { revenue: number; deals: number }>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    bucket.set(`${d.getFullYear()}-${d.getMonth()}`, { revenue: 0, deals: 0 });
  }
  for (const d of won6mRaw) {
    if (!d.CLOSEDATE) continue;
    const dt = new Date(d.CLOSEDATE);
    const key = `${dt.getFullYear()}-${dt.getMonth()}`;
    const b = bucket.get(key);
    if (!b) continue;
    b.revenue += Number(d.OPPORTUNITY || 0);
    b.deals += 1;
  }
  const monthlyWon = Array.from(bucket.entries()).map(([key, v]) => {
    const [, m] = key.split("-").map(Number);
    return { month: MONTHS[m], revenue: Math.round(v.revenue / 1_000_000), deals: v.deals };
  });

  // Shu oyda yopilgan g'olib bitimlar summasi (reja vs fakt uchun)
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const wonThisMonth = closedRaw.filter(
    (d) => d.STAGE_SEMANTIC_ID === "S" && d.CLOSEDATE && Date.parse(d.CLOSEDATE) >= monthStart.getTime(),
  );
  const wonThisMonthM = Math.round(
    wonThisMonth.reduce((sum, d) => sum + Number(d.OPPORTUNITY || 0), 0) / 1_000_000,
  );
  const wonThisMonthCount = wonThisMonth.length;

  const toDeal = (d: RawDeal): Deal | null => {
    const stage = mapStage(d.STAGE_ID, d.STAGE_SEMANTIC_ID);
    if (!stage) return null;
    const valueM = Math.round(Number(d.OPPORTUNITY || 0) / 1_000_000);
    const lastContact = daysSince(d.DATE_MODIFY);
    return {
      id: `#${d.ID}`,
      client: (d.TITLE || `Bitim ${d.ID}`).trim(),
      service: categoryName.get(d.CATEGORY_ID) ?? "Boshqa",
      stage,
      value: valueM,
      probability: STAGE_PROBABILITY[stage],
      daysInStage: lastContact,
      lastContactDaysAgo: lastContact,
      owner: userName.get(d.ASSIGNED_BY_ID) ?? "Tayinlanmagan",
      risk: stage === "Yopilgan (g'olib)" ? "past" : riskOf(lastContact, valueM),
      nextAction: STAGE_NEXT_ACTION[stage],
    } as Deal;
  };

  const openDeals = openRaw.map(toDeal).filter((d): d is Deal => d !== null);
  const wonDeals = closedRaw
    .filter((d) => d.STAGE_SEMANTIC_ID === "S")
    .map(toDeal)
    .filter((d): d is Deal => d !== null);

  return {
    deals: [...openDeals, ...wonDeals],
    meta: {
      fetchedAt: new Date().toISOString(),
      openTotal: openDeals.length,
      wonLast90: wonDeals.length,
      lostLast90: closedRaw.filter((d) => d.STAGE_SEMANTIC_ID === "F").length,
      wonThisMonthM,
      wonThisMonthCount,
      openWithoutAmount: openRaw.filter((d) => Number(d.OPPORTUNITY || 0) === 0).length,
      monthlyWon,
      source: "bitrix",
    },
  };
}

// --- Qo'ng'iroqlar tahlili --------------------------------------------------
// MUHIM: webhook'da "telefoniya" ruxsati yo'q (faqat crm + call), shuning uchun
// voximplant.statistic.get ishlamaydi. Qo'ng'iroqlar CRM faoliyat tarixidan
// olinadi — u yerda davomiylik, yo'nalish, mas'ul va audio havolasi bor.

export type CallStats = {
  days: number;
  total: number;
  incoming: number;
  outgoing: number;
  missed: number;
  withRecording: number;
  avgSeconds: number;
  medianSeconds: number;
  underTargetPct: number;   // 25 soniyadan qisqa qo'ng'iroqlar ulushi
  byManager: { id: string; count: number; avgSeconds: number; missed: number }[];
  byDay: { day: string; count: number }[];
  fetchedAt: string;
};

type RawActivity = {
  ID: string; SUBJECT: string; DIRECTION: string;
  START_TIME: string; END_TIME: string; RESPONSIBLE_ID: string;
  FILES?: unknown;
};

const CALL_TARGET_SECONDS = 25;

export async function fetchCallStats(days = 30): Promise<CallStats> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 19);
  const select: Record<string, string> = {};
  ["ID", "SUBJECT", "DIRECTION", "START_TIME", "END_TIME", "RESPONSIBLE_ID", "FILES"]
    .forEach((f, i) => { select[`select[${i}]`] = f; });

  const rows = await listAll<RawActivity>("crm.activity.list", {
    ...select,
    "filter[TYPE_ID]": "2",
    "filter[>CREATED]": since,
    "order[CREATED]": "DESC",
  }, 40);

  const seconds = (a: RawActivity) => {
    const s = Date.parse(a.START_TIME), e = Date.parse(a.END_TIME);
    if (Number.isNaN(s) || Number.isNaN(e)) return null;
    const d = (e - s) / 1000;
    return d > 0 ? d : null;
  };
  const isMissed = (a: RawActivity) => (a.SUBJECT ?? "").includes("ропущен");

  const durations = rows.map(seconds).filter((d): d is number => d !== null).sort((a, b) => a - b);
  const avg = durations.length ? durations.reduce((s, d) => s + d, 0) / durations.length : 0;
  const median = durations.length ? durations[Math.floor(durations.length / 2)] : 0;
  const under = durations.filter((d) => d < CALL_TARGET_SECONDS).length;

  const mgr = new Map<string, { count: number; durs: number[]; missed: number }>();
  const day = new Map<string, number>();
  for (const a of rows) {
    const m = mgr.get(a.RESPONSIBLE_ID) ?? { count: 0, durs: [], missed: 0 };
    m.count++;
    const d = seconds(a);
    if (d) m.durs.push(d);
    if (isMissed(a)) m.missed++;
    mgr.set(a.RESPONSIBLE_ID, m);

    const k = (a.START_TIME ?? "").slice(0, 10);
    if (k) day.set(k, (day.get(k) ?? 0) + 1);
  }

  return {
    days,
    total: rows.length,
    incoming: rows.filter((a) => String(a.DIRECTION) === "1").length,
    outgoing: rows.filter((a) => String(a.DIRECTION) === "2").length,
    missed: rows.filter(isMissed).length,
    withRecording: rows.filter((a) => Boolean(a.FILES)).length,
    avgSeconds: Math.round(avg),
    medianSeconds: Math.round(median),
    underTargetPct: durations.length ? Math.round((under / durations.length) * 100) : 0,
    byManager: [...mgr.entries()]
      .map(([id, v]) => ({
        id,
        count: v.count,
        avgSeconds: v.durs.length ? Math.round(v.durs.reduce((s, d) => s + d, 0) / v.durs.length) : 0,
        missed: v.missed,
      }))
      .sort((a, b) => b.count - a.count),
    byDay: [...day.entries()].map(([d, c]) => ({ day: d, count: c })).sort((a, b) => a.day.localeCompare(b.day)),
    fetchedAt: new Date().toISOString(),
  };
}
