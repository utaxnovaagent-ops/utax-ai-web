// Sotuv bo'limining HAQIQATDA ishlab turgan AI agentlari.
// Har biri VPS'da alohida systemd xizmati sifatida ishlaydi (claude-<id>.service),
// nomi va vazifasi shu agentning o'z sozlamasidan olingan — bu yerda o'ylab
// topilgan agent yo'q. /sotuv, /campus va /structure shu bitta ro'yxatdan o'qiydi.
export type SotuvAgentStatus = "live" | "partial" | "planned";

/** Agent mijoz yo'lining qaysi bosqichida ishlaydi — tuzilmadagi ustunlar shu bo'yicha. */
export type SotuvStage = "kirish" | "jarayon" | "keyin";

export const SOTUV_STAGES: { id: SotuvStage; label: string; hint: string }[] = [
  { id: "kirish", label: "Lid kirishi", hint: "mijoz birinchi marta murojaat qilganda" },
  { id: "jarayon", label: "Sotuv jarayoni", hint: "bitim ustida ishlash davrida" },
  { id: "keyin", label: "Sotuvdan keyin", hint: "xizmat ko'rsatish va ushlab qolish" },
];

export interface SotuvAgentDef {
  id: string;
  name: string;
  /** VPS'dagi systemd xizmati — tekshirish uchun: systemctl status <service> */
  service: string;
  role: string;
  does: string;
  source: string;
  decision: string;
  status: SotuvAgentStatus;
  stage: SotuvStage;
}

// Sotuv bo'limi rahbari — serverdagi agentlarning xotirasidan olingan
// (uchta agent mustaqil ravishda shunday yozgan). Ilgari bu yerda demo
// ma'lumotdan kelib chiqqan "Bobur Nazarov" turardi.
export const SOTUV_OWNER = { name: "Muxammadamin aka", role: "Sotuv bo'limi rahbari" };

export const SOTUV_AGENTS: SotuvAgentDef[] = [
  {
    id: "maslahatchi",
    name: "UTAX Maslahatchi AI",
    service: "claude-maslahatchi",
    role: "mijoz bilan birinchi aloqa",
    does: "Telegramda mijoz bilan o'zi gaplashadi: savollar bilan ehtiyojni aniqlaydi, mos xizmatni ko'rsatadi, kontaktni tasdiqlaydi va tayyor mijozni inson sotuvchiga topshiradi. Narx, chegirma va yakuniy soliq xulosasini aytmaydi — bu sotuvchining vakolati.",
    source: "Telegram bot, Bitrix24",
    decision: "Mijoz qaysi xizmatga yo'naltiriladi va qachon insonga topshiriladi",
    status: "live",
    stage: "kirish",
  },
  {
    id: "tezkorlid",
    name: "Tezkor Lid",
    service: "claude-tezkorlid",
    role: "yangi lidga tezkor javob",
    does: "Yangi lid kelganda birinchi javob vaqtini qisqartiradi: lidni sifatlaydi va menejerga uzatadi. Sotuv Sales agenti bilan ma'lumot almashadi.",
    source: "Telegram",
    decision: "Qaysi lid darhol menejerga uzatiladi",
    status: "live",
    stage: "kirish",
  },
  {
    id: "sotuvcoach",
    name: "Sotuv Coach",
    service: "claude-sotuvcoach",
    role: "menejerlarni kuzatuvchi",
    does: "Sotuv menejerlarining ishini kuzatib boradi va yo'naltiradi — coach sifatida maslahat beradi.",
    source: "Sotuv bo'limi yozishmalari",
    decision: "Qaysi menejerga qanday yordam kerak",
    status: "live",
    stage: "jarayon",
  },
  {
    id: "mijozegasi",
    name: "Mijoz Egasi",
    service: "claude-mijozegasi",
    role: "mijozni ushlab qolish",
    does: "Mavjud mijozlar bilan aloqani uzilib qolishidan saqlaydi — retention bo'yicha ishlaydi.",
    source: "Bitrix24, mijoz tarixi",
    decision: "Qaysi mijoz bilan aloqani tiklash kerak",
    status: "live",
    stage: "keyin",
  },
  {
    id: "auditchi",
    name: "Audit Ijrochisi",
    service: "claude-auditchi",
    role: "sotilgan xizmatni bajaruvchi",
    does: "Sotilgan audit va optimizatsiya xizmatlarini bajarishda yordam beradi — sotuvdan keyingi bosqich.",
    source: "Bitrix24, audit hujjatlari",
    decision: "Sotilgan ish qanday va qachon bajariladi",
    status: "live",
    stage: "keyin",
  },
  {
    id: "sotuv",
    name: "Sotuv Sales",
    service: "claude-sotuv",
    role: "bo'lim yordamchisi",
    does: "Sotuv bo'limi uchun shaxsiy yordamchi — kundalik so'rovlar, eslatma va ma'lumot yig'ish.",
    source: "Telegram",
    decision: "Kundalik ish oqimidagi mayda qarorlar",
    status: "live",
    stage: "jarayon",
  },
];
