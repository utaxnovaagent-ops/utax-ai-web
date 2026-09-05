import {
  ceoData,
  moliyaData,
  itData,
  marketingData,
  sotuvData,
  telegramData,
  hrData,
  calendarData,
  clientsData,
  auditData,
  internationalData,
} from "./mock-data";
import { SOTUV_OWNER, SOTUV_AGENTS } from "./sotuv-agents";

export type AgentState = "IDLE" | "WALK" | "SIT" | "WORK" | "MEETING" | "TALK" | "ERROR";
// "live"/"partial"/"planned" — /sotuv bilan bitta manbadan (lib/sotuv-agents.ts)
// olingan haqiqiy holat. "planned" agent hech qachon ishlayotgandek animatsiya
// qilinmaydi (TZI "3D Campus 2.0" AC-05/AC-06).
export type DemoStatus = "live" | "partial" | "planned";

export interface ZoneDef {
  key: string;
  label: string;
  color: string;
  x: number; // corridor position (world X)
}

export interface AgentDef {
  id: string;
  name: string;
  zoneKey: string;
  color: string;
  role: string;
  taskPool: string[];
  // "synthesizer" — Botir AI kabi, bir joyda turib boshqa agentlar signalini
  // birlashtiruvchi rol; "human" — Bobur Nazarov kabi qaror beruvchi rahbar.
  // Ikkalasi ham stol/yig'ilish aylanmasiga qo'shilmaydi, o'z podiumida turadi.
  entityType: "ai" | "human" | "synthesizer";
  demoStatus: DemoStatus;
}

// Zonalar korridor bo'ylab joylashadi (X o'qi). Har birining stol klasteri +Z tomonda.
// Audit — Moliyaga, Xalqaro soliq — Sotuvga yaqin joylashtirilgan (mazmunan bog'liq bo'limlar).
export const ZONES: ZoneDef[] = [
  { key: "ceo", label: "CEO", color: "#f59e0b", x: -24 },
  { key: "moliya", label: "Moliya", color: "#16a34a", x: -18 },
  { key: "audit", label: "Audit", color: "#0d9488", x: -12 },
  { key: "it", label: "IT", color: "#2563eb", x: -6 },
  { key: "marketing", label: "Marketing", color: "#db2777", x: 0 },
  { key: "sotuv", label: "Sotuv", color: "#ea580c", x: 6 },
  { key: "international", label: "Xalqaro", color: "#4338ca", x: 12 },
  { key: "telegram", label: "Ishchi bo'lim", color: "#0891b2", x: 18 },
  { key: "hr", label: "HR", color: "#9333ea", x: 24 },
];

const auditStageLabel: Record<string, string> = {
  started: "boshlandi",
  fieldwork: "dala ishida",
  findings: "topilmalar bosqichida",
  report: "hisobot tayyorlanmoqda",
  signoff: "mijoz tasdig'ini kutmoqda",
};

// Har agentning vazifa matni tegishli mock-data.ts manbasidan hosil qilinadi —
// shu bo'lim sahifasida ko'rsatilgan real yozuvlar bilan mos keladi.
const ceoTaskPool = [
  ...ceoData.decisions.map((d) => d.title),
  ...ceoData.risks.map((r) => r.title),
  `${clientsData.stats.highRisk} ta yuqori risk mijozni nazorat qilmoqda`,
  `${calendarData.stats.overdue} ta kechikkan soliq muddati bo'yicha eskalatsiya`,
];

const moliyaTaskPool = [
  ...moliyaData.anomalies.map((a) => a.title),
  ...moliyaData.receivables.filter((r) => r.risk === "Yuqori").map((r) => `${r.client} qarzdorligini kuzatmoqda (${r.amount})`),
  ...calendarData.overdue.map((d) => `${d.client}: ${d.taxType} — ${d.daysLate} kun kechikdi`),
];

const auditTaskPool = [
  ...auditData.engagements.map((e) => `${e.client} auditi ${auditStageLabel[e.stage]} (${e.progress}%)`),
  ...auditData.engagements.filter((e) => e.findings > 0).map((e) => `${e.client}: ${e.findings} ta topilma aniqlangan`),
];

const itTaskPool = itData.tickets.map((tk) => `${tk.id}: ${tk.title}`);

const marketingTaskPool = [
  ...marketingData.campaigns.map((c) => `${c.name} kampaniyasini kuzatmoqda`),
  ...marketingData.contentCalendar.map((c) => `"${c.title}" kontenti — ${c.stage}`),
];

// Sotuv Hub'i — Bobur Nazarov (inson), Botir AI (sintezator) va 5 ta
// ixtisoslashgan agent — hammasi lib/sotuv-agents.ts'dagi bitta manbadan.
const boburTaskPool = sotuvData.followUps.map((f) => `${f.client} bo'yicha yakuniy qaror kutmoqda`);

const internationalTaskPool = [
  ...internationalData.cases.map((c) => `${c.client}: ${c.treaty} — ${c.status}`),
  ...internationalData.countryExposure.slice(0, 2).map((c) => `${c.country} bo'yicha ${c.clients} faol mijozni kuzatmoqda`),
];

const telegramTaskPool = telegramData.inbox.map((m) => `${m.from}: ${m.status}`);

const hrTaskPool = [
  ...hrData.vacancies.map((v) => `${v.title} — ${v.candidates} nomzod ko'rib chiqilmoqda`),
  ...hrData.onboarding.map((o) => `${o.name} onboarding jarayonida (${o.progress}%)`),
];

const STATUS_COLOR: Record<"live" | "partial" | "planned", string> = {
  live: "#ea580c",
  partial: "#c2410c",
  planned: "#94a3b8",
};

export const AGENTS: AgentDef[] = [
  { id: "agent-ceo", name: "CEO Agent", zoneKey: "ceo", color: "#f59e0b", role: "Strategik xulosa", taskPool: ceoTaskPool, entityType: "ai", demoStatus: "live" },
  { id: "agent-moliya", name: "Moliya Agent", zoneKey: "moliya", color: "#16a34a", role: "Moliya va soliq muddatlari", taskPool: moliyaTaskPool, entityType: "ai", demoStatus: "live" },
  { id: "agent-audit", name: "Audit Agent", zoneKey: "audit", color: "#0d9488", role: "Ekspress audit kuzatuvi", taskPool: auditTaskPool, entityType: "ai", demoStatus: "live" },
  { id: "agent-it", name: "IT Agent", zoneKey: "it", color: "#2563eb", role: "Servis monitoring", taskPool: itTaskPool, entityType: "ai", demoStatus: "live" },
  { id: "agent-marketing", name: "Marketing Agent", zoneKey: "marketing", color: "#db2777", role: "Kontent generatsiya", taskPool: marketingTaskPool, entityType: "ai", demoStatus: "live" },

  // Sotuv Hub — TZI "3D Campus 2.0" §6: 1 inson rahbar + 1 sintezator + 6 agent.
  { id: "bobur-nazarov", name: SOTUV_OWNER.name, zoneKey: "sotuv", color: "#334155", role: SOTUV_OWNER.role, taskPool: boburTaskPool, entityType: "human", demoStatus: "live" },
  ...SOTUV_AGENTS.map((a) => ({
    id: `sotuv-${a.id}`,
    name: a.name,
    zoneKey: "sotuv",
    color: STATUS_COLOR[a.status],
    role: a.role,
    taskPool: [a.decision],
    entityType: "ai" as const,
    demoStatus: a.status,
  })),

  { id: "agent-international", name: "Xalqaro Agent", zoneKey: "international", color: "#4338ca", role: "Xalqaro soliqqa tortish", taskPool: internationalTaskPool, entityType: "ai", demoStatus: "live" },
  { id: "agent-telegram", name: "Ishchi bo'lim Agent", zoneKey: "telegram", color: "#0891b2", role: "Murojaat tasnifi", taskPool: telegramTaskPool, entityType: "ai", demoStatus: "live" },
  { id: "agent-hr", name: "HR Agent", zoneKey: "hr", color: "#9333ea", role: "Onboarding", taskPool: hrTaskPool, entityType: "ai", demoStatus: "live" },
];

export const CORRIDOR_Z = 0;
export const HUB_Z = 3.2;
export const DESK_CLUSTER_Z = 8.5;

// Yig'ilish maydonidagi aylana stol va uning atrofidagi aylana stolchalar.
export const MEETING_TABLE = { x: 0, z: -4, tableRadius: 1.3, seatRadius: 2.05, seatHeight: 0.42 };

export function meetingSeat(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2;
  return {
    x: MEETING_TABLE.x + Math.sin(angle) * MEETING_TABLE.seatRadius,
    z: MEETING_TABLE.z + Math.cos(angle) * MEETING_TABLE.seatRadius,
    angle,
  };
}

export function zoneByKey(key: string): ZoneDef {
  return ZONES.find((z) => z.key === key) ?? ZONES[0];
}

// Har zonada shu yerdagi agentlar sonicha stol — Sotuv (8 ta: rahbar + sintezator
// + 6 agent) boshqa bo'limlardan (4 tadan) ko'proq stol oladi, lekin xuddi shu
// 2-ustunli tarmoqda, shuning uchun boshqalardan haddan tashqari ustun ko'rinmaydi.
export function desksForZone(zone: ZoneDef, count = 4) {
  return Array.from({ length: count }, (_, i) => {
    const col = i % 2 === 0 ? -1.3 : 1.3;
    const row = Math.floor(i / 2);
    return {
      id: `${zone.key}-desk-${i}`,
      x: zone.x + col,
      z: DESK_CLUSTER_Z + row * 2.6,
    };
  });
}
