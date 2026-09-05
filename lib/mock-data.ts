// Namunaviy (mock) ma'lumotlar — UTAX AI prototipi uchun. Real backend/integratsiyalarga ulanmagan.

import { SOTUV_AGENTS } from "./sotuv-agents";

// AI qamrovi — bo'lim bo'yicha HAQIQATDA qurilgan ulush (xodim soniga aloqasi yo'q).
// Sotuvda: Botir AI (sintezator, ishlaydi) + 6 ta agent; live = 1, partial = 0.5,
// planned = 0. Qolgan bo'limlarda hozircha faqat interfeys maketi bor — real agent,
// integratsiya va mantiq yozilmagan, shuning uchun halol ko'rsatkich 0%.
const sotuvAiUnits = [
  1, // Botir AI — sintezator, ishlab turibdi
  ...SOTUV_AGENTS.map((a) => (a.status === "live" ? 1 : a.status === "partial" ? 0.5 : 0)),
];
const SOTUV_AI_PERCENT = Math.round((sotuvAiUnits.reduce((s, n) => s + n, 0) / sotuvAiUnits.length) * 100);

export const ceoData = {
  weeklySummary:
    "Bu hafta 118 ta mijoz murojaati qayta ishlandi, tushum rejadan 4% yuqori. IT bo'limida 2 ta kritik tiket ochiq. Marketing kontent taqvimi 92% bajarilgan.",
  kpis: [
    { label: "Oylik tushum", value: "412M so'm", delta: "+6.4%", trend: "up" },
    { label: "Faol mijozlar", value: "184", delta: "+3", trend: "up" },
    { label: "SLA bajarilishi", value: "96.2%", delta: "-1.1%", trend: "down" },
    { label: "Ochiq risklar", value: "3", delta: "+1", trend: "down" },
  ],
  risks: [
    { title: "Yirik mijoz shartnomasi muddati tugamoqda", level: "Yuqori", owner: "Sotuv", due: "3 kun" },
    { title: "1C integratsiya sinxronizatsiya kechikishi", level: "O'rta", owner: "IT", due: "5 kun" },
    { title: "Ikki xodim yuklamasi me'yordan yuqori", level: "Past", owner: "HR", due: "Rejalashtirilmagan" },
  ],
  decisions: [
    {
      title: "Namangan filiali uchun qo'shimcha 2 auditor yollash",
      rationale: "Q3 mijoz oqimi 18% o'sdi, joriy jamoa yuklamasi 132%.",
      impact: "Xarajat +14M so'm/oy, SLA riski -40%",
      status: "Tasdiq kutilmoqda",
    },
    {
      title: "Ekspress audit narxini 8% oshirish",
      rationale: "Bozor tahlili va xarajat inflyatsiyasi asosida.",
      impact: "Tushum +9M so'm/oy taxminiy",
      status: "Tasdiq kutilmoqda",
    },
  ],
  revenueTrend: [
    { month: "Mar", revenue: 340, plan: 330 },
    { month: "Apr", revenue: 356, plan: 345 },
    { month: "May", revenue: 361, plan: 355 },
    { month: "Iyun", revenue: 372, plan: 365 },
    { month: "Iyul", revenue: 395, plan: 380 },
    { month: "Avg", revenue: 412, plan: 396 },
  ],
  departmentScore: [
    { dept: "Moliya", score: 91 },
    { dept: "IT", score: 78 },
    { dept: "Marketing", score: 88 },
    { dept: "Sotuv", score: 95 },
    { dept: "HR", score: 84 },
  ],
};

export const moliyaData = {
  cashflow: [
    { month: "Mar", kirim: 340, chiqim: 245 },
    { month: "Apr", kirim: 356, chiqim: 251 },
    { month: "May", kirim: 361, chiqim: 268 },
    { month: "Iyun", kirim: 372, chiqim: 260 },
    { month: "Iyul", kirim: 395, chiqim: 279 },
    { month: "Avg", kirim: 412, chiqim: 284 },
  ],
  receivables: [
    { client: "Grand Textile MChJ", amount: "24.5M so'm", days: 12, risk: "Past" },
    { client: "Vodiy Agro Holding", amount: "61.2M so'm", days: 48, risk: "Yuqori" },
    { client: "Namangan Bino Servis", amount: "9.8M so'm", days: 5, risk: "Past" },
    { client: "Farg'ona YaTT Nazarov", amount: "3.1M so'm", days: 33, risk: "O'rta" },
  ],
  anomalies: [
    { title: "Iyul oyida marketing xarajati 22% oshgan", severity: "O'rta" },
    { title: "Kreditor qarzdorlik 30 kundan oshgan 2 ta yozuv", severity: "Yuqori" },
  ],
  planFact: [
    { category: "Xizmat tushumi", plan: 380, fact: 395 },
    { category: "Operatsion xarajat", plan: 270, fact: 284 },
    { category: "Marketing", plan: 22, fact: 27 },
    { category: "Ish haqi fondi", plan: 145, fact: 145 },
  ],
};

export const itData = {
  uptime: 99.62,
  tickets: [
    { id: "IT-2041", title: "1C sinxronizatsiya xatosi (kod 502)", priority: "Kritik", status: "Jarayonda", sla: "1s 40d qoldi" },
    { id: "IT-2039", title: "CRM eksport formatida xato ustun", priority: "O'rta", status: "Navbatda", sla: "6s qoldi" },
    { id: "IT-2036", title: "Telegram bot javob bermayapti (guruh #14)", priority: "Yuqori", status: "Jarayonda", sla: "2s qoldi" },
    { id: "IT-2031", title: "Yangi xodim uchun VPN kirishi", priority: "Past", status: "Yopilgan", sla: "Bajarildi" },
  ],
  services: [
    { name: "1C integratsiya", status: "Ogohlantirish", latency: "812ms" },
    { name: "CRM API", status: "Sog'lom", latency: "142ms" },
    { name: "Telegram Bot", status: "Sog'lom", latency: "98ms" },
    { name: "AI Orchestration", status: "Sog'lom", latency: "1.4s" },
    { name: "Backup xizmati", status: "Sog'lom", latency: "—" },
  ],
  knowledgeBase: { articles: 246, coverage: 88 },
};

export const marketingData = {
  campaigns: [
    { name: "Ekspress audit — avgust aksiyasi", channel: "Telegram + sayt", status: "Faol", reach: "12 400", ctr: "4.1%" },
    { name: "Xalqaro soliqqa tortish vebinar", channel: "LinkedIn", status: "Rejalashtirilgan", reach: "—", ctr: "—" },
    { name: "Namangan biznes forumi", channel: "Offline + Instagram", status: "Yakunlangan", reach: "8 900", ctr: "3.3%" },
  ],
  contentCalendar: [
    { date: "18-avg", title: "Soliq nazorati: 5 ta xato", lang: "UZ/RU", stage: "Tayyor" },
    { date: "20-avg", title: "Kейс: eksport kompaniyasi audit", lang: "RU", stage: "Tasdiqda" },
    { date: "22-avg", title: "Tax advisory FAQ", lang: "EN", stage: "Qoralama" },
  ],
  brandVoice: "Professional, ishonchli, ortiqcha yuridik jargonsiz — asosiy auditoriya MChJ moliya rahbarlari.",
  segments: [
    { segment: "MChJ moliya rahbari", share: 46 },
    { segment: "Yirik korxona bosh buxgalteri", share: 28 },
    { segment: "YaTT / jismoniy shaxs", share: 16 },
    { segment: "Xalqaro kompaniya vakili", share: 10 },
  ],
};

// Sotuv "Revenue Command Center" — bitim darajasidagi namunaviy (DEMO) ma'lumot.
// Barcha KPI, funnel va missiya kartalari shu deals ro'yxatidan hisoblanadi —
// alohida-alohida "chiroyli raqamlar" qo'lda yozilmaydi.
export const SALES_STAGES = ["Yangi lead", "Malakalashtirilgan", "Taklif yuborilgan", "Muzokara", "Yopilgan (g'olib)"] as const;

export const sotuvDeals = [
  {
    id: "D-101",
    client: "Qumariq Group",
    service: "Ekspress audit",
    stage: "Yangi lead",
    value: 15,
    probability: 10,
    daysInStage: 2,
    lastContactDaysAgo: 1,
    owner: "Bobur Nazarov",
    risk: "past" as const,
    nextAction: "Birlamchi qo'ng'iroq",
  },
  {
    id: "D-102",
    client: "Chust Agro Servis",
    service: "Doimiy soliq hamrohligi",
    stage: "Yangi lead",
    value: 9,
    probability: 10,
    daysInStage: 1,
    lastContactDaysAgo: 0,
    owner: "Bobur Nazarov",
    risk: "past" as const,
    nextAction: "Ehtiyoj tahlili",
  },
  {
    id: "D-103",
    client: "Grand Textile MChJ",
    service: "Doimiy soliq hamrohligi",
    stage: "Malakalashtirilgan",
    value: 31,
    probability: 25,
    daysInStage: 6,
    lastContactDaysAgo: 5,
    owner: "Bobur Nazarov",
    risk: "o'rta" as const,
    nextAction: "Ehtiyojni tasdiqlash uchrashuvi",
  },
  {
    id: "D-104",
    client: "Farg'ona YaTT Nazarov",
    service: "Konsultatsiya",
    stage: "Malakalashtirilgan",
    value: 12,
    probability: 20,
    daysInStage: 11,
    lastContactDaysAgo: 9,
    owner: "Bobur Nazarov",
    risk: "yuqori" as const,
    nextAction: "Aloqani tiklash — 9 kundan beri javob yo'q",
  },
  {
    id: "D-105",
    client: "Dr. Kamolov klinikasi",
    service: "Ekspress audit",
    stage: "Taklif yuborilgan",
    value: 18,
    probability: 40,
    daysInStage: 5,
    lastContactDaysAgo: 2,
    owner: "Bobur Nazarov",
    risk: "past" as const,
    nextAction: "Ekspress audit narxini kelishish",
  },
  {
    id: "D-106",
    client: "Namangan Tekstil Eksport",
    service: "Xalqaro soliqqa tortish",
    stage: "Taklif yuborilgan",
    value: 22,
    probability: 35,
    daysInStage: 3,
    lastContactDaysAgo: 3,
    owner: "Bobur Nazarov",
    risk: "past" as const,
    nextAction: "Uchrashuvdan keyingi brief yuborish",
  },
  {
    id: "D-107",
    client: "Silk Road Logistics",
    service: "Xalqaro soliqqa tortish",
    stage: "Muzokara",
    value: 28,
    probability: 55,
    daysInStage: 9,
    lastContactDaysAgo: 1,
    owner: "Bobur Nazarov",
    risk: "o'rta" as const,
    nextAction: "Tijorat taklifini eslatish",
  },
  {
    id: "D-108",
    client: "Vodiy Agro Holding",
    service: "Doimiy soliq hamrohligi",
    stage: "Muzokara",
    value: 34,
    probability: 60,
    daysInStage: 14,
    lastContactDaysAgo: 6,
    owner: "Bobur Nazarov",
    risk: "yuqori" as const,
    nextAction: "Chegirma taklifini rahbariyatga tasdiqlatish",
  },
  {
    id: "D-109",
    client: "Toshkent Bino Servis",
    service: "Ekspress audit",
    stage: "Yopilgan (g'olib)",
    value: 14,
    probability: 100,
    daysInStage: 0,
    lastContactDaysAgo: 0,
    owner: "Bobur Nazarov",
    risk: "past" as const,
    nextAction: "Shartnoma imzolandi",
  },
  {
    id: "D-110",
    client: "Andijon Farm Co",
    service: "Doimiy soliq hamrohligi",
    stage: "Yopilgan (g'olib)",
    value: 19,
    probability: 100,
    daysInStage: 0,
    lastContactDaysAgo: 0,
    owner: "Bobur Nazarov",
    risk: "past" as const,
    nextAction: "Onboarding boshlandi",
  },
];

export const sotuvData = {
  revenue: { planThisMonth: 500, factThisMonth: 412, currency: "M so'm" },
  winRate: { percent: 34, trendPp: 2, sparkline: [29, 31, 30, 33, 34] },
  velocity: { medianDays: 21, trendDays: -3 },
  salespeople: ["Bobur Nazarov"],
  followUps: [
    { client: "Silk Road Logistics", action: "Tijorat taklifini eslatish", due: "Bugun" },
    { client: "Namangan Tekstil Eksport", action: "Uchrashuvdan keyingi brief yuborish", due: "Ertaga" },
    { client: "Dr. Kamolov klinikasi", action: "Ekspress audit narxini kelishish", due: "2 kun" },
  ],
  meetingBrief: {
    client: "Vodiy Agro Holding",
    prepared: "AI tomonidan tayyorlangan",
    points: [
      "Oldingi audit: 3 ta kamomad aniqlangan, 2 tasi bartaraf etilgan.",
      "Joriy qarzdorlik 61.2M so'm, 48 kun.",
      "Taklif: yillik soliq hamrohligi paketiga o'tish, 12% chegirma bilan.",
    ],
  },
};

export const telegramData = {
  groups: [
    { name: "UTAX — Moliya bo'limi", unread: 4, sla: "96%" },
    { name: "UTAX — IT qo'llab-quvvatlash", unread: 9, sla: "88%" },
    { name: "Mijozlar — Vodiy Agro", unread: 1, sla: "100%" },
    { name: "Mijozlar — Silk Road Logistics", unread: 2, sla: "94%" },
  ],
  inbox: [
    { from: "Vodiy Agro Holding", preview: "Ekspress audit hisobotini qachon olamiz?", status: "Javob loyihasi tayyor", time: "10:41" },
    { from: "IT bo'limi", preview: "1C xatosi hali davom etmoqda", status: "Xodim tasdig'i kerak", time: "10:12" },
    { from: "Silk Road Logistics", preview: "Shartnoma muddatini uzaytirish mumkinmi?", status: "Eskalatsiya: Sotuv", time: "09:55" },
  ],
};

export const hrData = {
  vacancies: [
    { title: "Soliq auditori (katta)", department: "Audit", stage: "Suhbat bosqichi", candidates: 6 },
    { title: "Backend dasturchi (NestJS)", department: "IT", stage: "Screening", candidates: 14 },
    { title: "Mijozlar bilan ishlash mutaxassisi", department: "Sotuv", stage: "E'lon qilingan", candidates: 3 },
  ],
  onboarding: [
    { name: "Madina Yusupova", role: "Auditor", progress: 75 },
    { name: "Jasur Toshpulatov", role: "Backend dasturchi", progress: 40 },
  ],
  training: [
    { title: "Yangi soliq kodeksi o'zgarishlari", completion: 82 },
    { title: "AI vositalari bilan ishlash", completion: 61 },
  ],
};

export const calendarData = {
  stats: { total: 34, overdue: 2, dueToday: 3, dueThisWeek: 9 },
  overdue: [
    { client: "Vodiy Agro Holding", taxType: "QQS deklaratsiyasi", dueDate: "12-avg", daysLate: 3 },
    { client: "Farg'ona YaTT Nazarov", taxType: "Ijtimoiy soliq hisoboti", dueDate: "10-avg", daysLate: 5 },
  ],
  today: [
    { client: "Grand Textile MChJ", taxType: "Foyda solig'i (oraliq to'lov)", dueDate: "15-avg" },
    { client: "Namangan Bino Servis", taxType: "Mulk solig'i", dueDate: "15-avg" },
    { client: "Silk Road Logistics", taxType: "QQS deklaratsiyasi", dueDate: "15-avg" },
  ],
  thisWeek: [
    { client: "Dr. Kamolov klinikasi", taxType: "Ijtimoiy soliq hisoboti", dueDate: "18-avg" },
    { client: "Vodiy Agro Holding", taxType: "Aksiz solig'i hisoboti", dueDate: "19-avg" },
    { client: "Grand Textile MChJ", taxType: "Statistik hisobot", dueDate: "21-avg" },
  ],
  upcoming: [
    { client: "Silk Road Logistics", taxType: "Foyda solig'i (yillik)", dueDate: "05-sen" },
    { client: "Namangan Bino Servis", taxType: "QQS deklaratsiyasi", dueDate: "12-sen" },
  ],
};

export const clientsData = {
  stats: { total: 184, highRisk: 7, activeContracts: 142 },
  list: [
    { name: "Grand Textile MChJ", segment: "MChJ", risk: "Past", services: "Soliq hamrohligi, Audit", nextDeadline: "15-avg", status: "Faol" },
    { name: "Vodiy Agro Holding", segment: "Yirik korxona", risk: "Yuqori", services: "Ekspress audit, Optimallashtirish", nextDeadline: "12-avg (kechikkan)", status: "Faol" },
    { name: "Silk Road Logistics", segment: "MChJ", risk: "O'rta", services: "Xalqaro soliqqa tortish, Hamrohlik", nextDeadline: "15-avg", status: "Faol" },
    { name: "Namangan Bino Servis", segment: "MChJ", risk: "Past", services: "Soliq hamrohligi", nextDeadline: "15-avg", status: "Faol" },
    { name: "Farg'ona YaTT Nazarov", segment: "YaTT", risk: "O'rta", services: "Hisobot, Konsultatsiya", nextDeadline: "10-avg (kechikkan)", status: "Faol" },
    { name: "Dr. Kamolov klinikasi", segment: "Jismoniy shaxs", risk: "Past", services: "Ekspress audit", nextDeadline: "18-avg", status: "Kutilmoqda" },
  ],
};

export const auditData = {
  stats: { active: 6, completedThisMonth: 4, avgDuration: "9 kun" },
  stageSummary: [
    { key: "started", label: "Boshlandi", count: 1 },
    { key: "fieldwork", label: "Dala ishi", count: 2 },
    { key: "findings", label: "Topilmalar", count: 1 },
    { key: "report", label: "Hisobot", count: 1 },
    { key: "signoff", label: "Mijoz tasdig'i", count: 1 },
  ],
  engagements: [
    { client: "Vodiy Agro Holding", stage: "findings", progress: 65, auditor: "Malika Rustamova", dueDate: "22-avg", findings: 3 },
    { client: "Grand Textile MChJ", stage: "fieldwork", progress: 40, auditor: "Sherzod Yo'ldoshev", dueDate: "28-avg", findings: 0 },
    { client: "Silk Road Logistics", stage: "report", progress: 85, auditor: "Malika Rustamova", dueDate: "19-avg", findings: 2 },
    { client: "Namangan Bino Servis", stage: "signoff", progress: 95, auditor: "Aziz Rahimov", dueDate: "16-avg", findings: 1 },
    { client: "Farg'ona YaTT Nazarov", stage: "fieldwork", progress: 30, auditor: "Gulnora Aliyeva", dueDate: "30-avg", findings: 0 },
    { client: "Dr. Kamolov klinikasi", stage: "started", progress: 10, auditor: "Malika Rustamova", dueDate: "05-sen", findings: 0 },
  ],
};

export const internationalData = {
  stats: { activeCases: 4, countriesCovered: 7, treatiesApplied: 3 },
  cases: [
    { client: "Silk Road Logistics", countries: "O'zbekiston – Qozog'iston", treaty: "Ikki tomonlama soliq shartnomasi", status: "Tahlil bosqichida", risk: "O'rta" },
    { client: "Vodiy Agro Holding", countries: "O'zbekiston – BAA", treaty: "Transfer narxlash tekshiruvi", status: "Hujjat yig'ilmoqda", risk: "Yuqori" },
    { client: "Grand Textile MChJ", countries: "O'zbekiston – Turkiya", treaty: "Doimiy vakolatxona tahlili", status: "Yakunlangan", risk: "Past" },
    { client: "Farg'ona YaTT Nazarov", countries: "O'zbekiston – Rossiya", treaty: "Ikki tomonlama soliq shartnomasi", status: "Mijoz tasdig'ini kutmoqda", risk: "Past" },
  ],
  countryExposure: [
    { country: "Rossiya", clients: 5 },
    { country: "Qozog'iston", clients: 3 },
    { country: "BAA", clients: 2 },
    { country: "Turkiya", clients: 2 },
    { country: "Xitoy", clients: 1 },
  ],
};

export const orgStructure = {
  ceo: { name: "Aziz Rahimov", title: "CEO" },
  director: { name: "Dilnoza Karimova", title: "Direktor" },
  departments: [
    { key: "moliya", label: "Moliya", head: "Gulnora Aliyeva", employees: 9, color: "#16a34a", aiPercent: 0 },
    { key: "audit", label: "Audit", head: "Malika Rustamova", employees: 8, color: "#0d9488", isExtra: true, aiPercent: 0 },
    { key: "it", label: "IT", head: "Sherzod Yo'ldoshev", employees: 6, color: "#2563eb", aiPercent: 0 },
    { key: "marketing", label: "Marketing", head: "Kamola Zokirova", employees: 5, color: "#db2777", aiPercent: 0 },
    { key: "sotuv", label: "Sotuv", head: "Bobur Nazarov", employees: 11, color: "#ea580c", aiPercent: SOTUV_AI_PERCENT },
    { key: "international", label: "Xalqaro soliq", head: "Javlon Sultonov", employees: 3, color: "#4338ca", isExtra: true, aiPercent: 0 },
    { key: "telegram", label: "Ishchi bo'lim", head: "Nodira Egamova", employees: 7, color: "#0891b2", aiPercent: 0 },
    { key: "hr", label: "HR", head: "Shahnoza Tursunova", employees: 4, color: "#9333ea", aiPercent: 0 },
  ],
  support: [
    { key: "admin", label: "Administrator", desc: "Konfiguratsiya va monitoring" },
    { key: "auditor", label: "Auditor", desc: "Audit va hisobot — faqat o'qish" },
  ],
  client: { key: "client", label: "Mijoz", desc: "Tashqi rol — faqat mijoz chatidan, o'z ma'lumotiga kirish" },
  vacancies: 3,
};

export const adminData = {
  users: [
    { name: "Aziz Rahimov", role: "CEO", status: "Faol", lastLogin: "Bugun, 09:12" },
    { name: "Dilnoza Karimova", role: "Direktor", status: "Faol", lastLogin: "Bugun, 08:47" },
    { name: "Sherzod Yo'ldoshev", role: "Bo'lim boshlig'i (IT)", status: "Faol", lastLogin: "Kecha, 18:03" },
    { name: "Malika Rustamova", role: "Auditor", status: "Bloklangan", lastLogin: "3 kun oldin" },
  ],
  integrations: [
    { name: "1C", status: "Ogohlantirish", lastSync: "42 daqiqa oldin" },
    { name: "CRM", status: "Sog'lom", lastSync: "3 daqiqa oldin" },
    { name: "Telegram Bot API", status: "Sog'lom", lastSync: "1 daqiqa oldin" },
    { name: "IP telefoniya", status: "Ulanmagan", lastSync: "—" },
  ],
  auditLog: [
    { actor: "Aziz Rahimov", action: "Vazifani tasdiqladi", object: "TASK-1042", time: "10:38" },
    { actor: "AI Agent (Moliya)", action: "Hisobot yaratdi", object: "REPORT-Iyul-Cashflow", time: "10:20" },
    { actor: "Sherzod Yo'ldoshev", action: "Integratsiya sozlamasini o'zgartirdi", object: "1C API", time: "09:55" },
    { actor: "Sistema", action: "Backup bajarildi", object: "prod-db-2026-08-15", time: "03:00" },
  ],
  aiCost: { monthTokens: "18.4M", monthCost: "$142", avgLatency: "1.6s" },
};
