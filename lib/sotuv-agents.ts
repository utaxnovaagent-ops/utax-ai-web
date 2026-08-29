// Sotuv bo'limining bitta rahbari, bitta sintezator AI va oltita ixtisoslashgan
// agenti — /structure (OrgChart), /sotuv (Revenue Command Center) va /campus
// (3D Sales Hub) shu bitta ro'yxatdan o'qiydi, shunda sahifalar orasida
// status/son ziddiyati bo'lmaydi (TZI "3D Campus 2.0" AC-09).
export type SotuvAgentStatus = "live" | "partial" | "planned";

export interface SotuvAgentDef {
  id: string;
  name: string;
  role: string;
  does: string;
  source: string;
  decision: string;
  status: SotuvAgentStatus;
}

export const SOTUV_OWNER = { name: "Bobur Nazarov", role: "Sotuv bo'limi boshlig'i" };

export const SOTUV_SYNTHESIZER = {
  id: "botir-ai",
  name: "Botir AI",
  role: "Bosh strateg · sintez va ustuvorlik",
  tagline: "signal → ustuvorlik → taklif",
};

export const SOTUV_AGENTS: SotuvAgentDef[] = [
  {
    id: "maslahatchi",
    name: "UTAX Maslahatchi AI",
    role: "mijoz bilan birinchi aloqa",
    does: "Telegramda mijoz bilan o'zi gaplashib ehtiyojni aniqlaydi, to'rt xizmatdan biriga yo'naltiradi, 0–100 ball qo'yadi va Bitrixga lead yozib, isitilgan mijozni tayyor karta bilan sotuvchiga uzatadi. Narx va yakuniy soliq xulosasini aytmaydi.",
    source: "Telegram bot (@utax_maslahatchi_bot), Bitrix24 CRM",
    decision: "Mijoz qaysi xizmatga yo'naltiriladi va qachon insonga topshiriladi",
    status: "live",
  },
  {
    id: "uchrashuv-brifing",
    name: "Uchrashuv-brifing agenti",
    role: "taqdimotchi",
    does: "Mijoz tarixi, oldingi audit va joriy qarzdorlik asosida har bir uchrashuv uchun qisqa brifing tayyorlaydi.",
    source: "CRM, audit tarixi, moliyaviy holat",
    decision: "Uchrashuvda nimaga birinchi urg'u berish kerak",
    status: "live",
  },
  {
    id: "follow-up",
    name: "Follow-up agenti",
    role: "eslatuvchi",
    does: "Muddat va mijoz ahamiyatiga qarab, bugun kimga qo'ng'iroq yoki xat ketishi kerakligini tartiblaydi.",
    source: "CRM follow-up ro'yxati",
    decision: "Bugun kimga birinchi murojaat qilinadi",
    status: "partial",
  },
  {
    id: "pipeline-analitik",
    name: "Pipeline-analitik agenti",
    role: "voronka kuzatuvchisi",
    does: "Har bosqichdagi bitimlar sonini va qiymatini kuzatib, qayerda tiqilib qolganini ko'rsatadi.",
    source: "CRM voronka (pipeline)",
    decision: "Qaysi bosqichga bugun e'tibor kerak",
    status: "partial",
  },
  {
    id: "lid-skoring",
    name: "Lid-skoring agenti",
    role: "birlamchi baholovchi",
    does: "Yangi murojaatlarni manba, shoshilinchlik va byudjetga qarab ball beradi.",
    source: "Sayt forma, Telegram, qo'ng'iroq markazi",
    decision: "Kimga birinchi bo'lib qo'ng'iroq qilinadi",
    status: "planned",
  },
  {
    id: "shartnoma-generator",
    name: "Shartnoma-generator agenti",
    role: "hujjat tayyorlovchi",
    does: "Yopilgan bitim uchun shartnoma loyihasini shablon asosida avtomatik tayyorlaydi.",
    source: "CRM, shartnoma shablonlari",
    decision: "Shartnoma qachon mijozga yuboriladi",
    status: "planned",
  },
];
