"use client";

import { Sparkles, Clock } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/ui";
import { AgentOrgStructure } from "@/components/AgentOrgStructure";
import { sotuvData, orgStructure } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const maxCount = Math.max(...sotuvData.pipeline.map((p) => p.count));

const sotuvHead = orgStructure.departments.find((d) => d.key === "sotuv")?.head ?? "Bobur Nazarov";

const negotiationStage = sotuvData.pipeline.find((p) => p.stage === "Muzokara");

const sotuvAgentStructure = {
  eyebrow: "SOTUV · AI AGENTLAR STRUKTURASI",
  title: "Sotuv agentlari strukturasi",
  intro:
    "Botir AI — sintezator: u o'zi mijoz bilan gaplashmaydi, signallarni yig'ib ustuvorlik taklif qiladi. Uning ostida har biri bitta ishni egallagan beshta agent turadi; ularning ostida — real manbalar.",
  owner: { name: sotuvHead, role: "Sotuv bo'limi boshlig'i" },
  synthesizer: { name: "Botir AI", role: "Bosh strateg · sintez va ustuvorlik", tagline: "signal → ustuvorlik → taklif" },
  agents: [
    {
      name: "Uchrashuv-brifing agenti",
      role: "taqdimotchi",
      does: "Mijoz tarixi, oldingi audit va joriy qarzdorlik asosida har bir uchrashuv uchun qisqa brifing tayyorlaydi.",
      source: "CRM, audit tarixi, moliyaviy holat",
      decision: "Uchrashuvda nimaga birinchi urg'u berish kerak",
      status: "live" as const,
    },
    {
      name: "Follow-up agenti",
      role: "eslatuvchi",
      does: "Muddat va mijoz ahamiyatiga qarab, bugun kimga qo'ng'iroq yoki xat ketishi kerakligini tartiblaydi.",
      source: "CRM follow-up ro'yxati",
      decision: "Bugun kimga birinchi murojaat qilinadi",
      status: "partial" as const,
    },
    {
      name: "Pipeline-analitik agenti",
      role: "voronka kuzatuvchisi",
      does: "Har bosqichdagi bitimlar sonini va qiymatini kuzatib, qayerda tiqilib qolganini ko'rsatadi.",
      source: "CRM voronka (pipeline)",
      decision: "Qaysi bosqichga bugun e'tibor kerak",
      status: "partial" as const,
    },
    {
      name: "Lid-skoring agenti",
      role: "birlamchi baholovchi",
      does: "Yangi murojaatlarni manba, shoshilinchlik va byudjetga qarab ball beradi.",
      source: "Sayt forma, Telegram, qo'ng'iroq markazi",
      decision: "Kimga birinchi bo'lib qo'ng'iroq qilinadi",
      status: "planned" as const,
    },
    {
      name: "Shartnoma-generator agenti",
      role: "hujjat tayyorlovchi",
      does: "Yopilgan bitim uchun shartnoma loyihasini shablon asosida avtomatik tayyorlaydi.",
      source: "CRM, shartnoma shablonlari",
      decision: "Shartnoma qachon mijozga yuboriladi",
      status: "planned" as const,
    },
  ],
  sources: [
    { label: "CRM", ok: true },
    { label: "Telegram", ok: true },
    { label: "Sayt forma", ok: true },
    { label: "Qo'ng'iroq markazi", ok: false },
    { label: "Qo'lda kiritish", ok: false },
  ],
  loopNote:
    "Ma'lumot pastdan yuqoriga ko'tariladi, qaror yuqoridan pastga qaytadi. Bo'lim boshlig'ining tasdig'i va undan chiqqan qoida yana agentlarga tushadi — takrorlangan muammo shu halqada qoidaga aylanadi.",
  rules: [
    {
      title: "Vazifalar ajratilgan",
      body: "Lid kirituvchi ≠ baholovchi ≠ shartnoma tayyorlovchi. Bitta agent hammasini qilsa — nazorat yo'q.",
    },
    {
      title: "Bitta agent — bitta ish",
      body: "Natija yomon bo'lsa, avval agentni emas, uning oldiga kelayotgan ma'lumotni tekshiramiz.",
    },
    { title: "Xato jurnalga tushadi", body: "Har agent muammoni yozadi. Uch marta takrorlansa — qoidaga, keyin kodga aylanadi." },
    {
      title: "Ishonchlilik tarixi",
      body: "Har agentning \"aytgani to'g'ri chiqdimi\" tarixi yuritiladi; Botir AI taklifni shu tarixga qarab vaznlaydi.",
    },
    { title: "Sintez — bitta joyda", body: "Agentlar faktni beradi, Botir AI ustuvorlikni taklif qiladi, tasdiqni bo'lim boshlig'i bosadi." },
    {
      title: "Agent yaratish sharti",
      body: "Manbasi bor, qandaydir qarorni o'zgartiradi va uni o'qiydigan odam bor. Uchtasidan biri yo'q bo'lsa — yaratilmaydi.",
    },
  ],
  startingPoints: [
    {
      title: "Follow-up agenti",
      body: "Ma'lumot allaqachon bor (CRM follow-up ro'yxati), natijasi darhol tushunarli: bugungi ustuvor mijozlar aniqlashadi.",
    },
    {
      title: "Pipeline-analitik agenti",
      body: negotiationStage
        ? `Hozirgi eng katta risk shu tomonda — "Muzokara" bosqichida ${negotiationStage.count} ta bitim, ${negotiationStage.value} to'xtab qolgan.`
        : "Voronkaning qaysi bosqichida bitimlar to'xtab qolayotganini hali hech kim tizimli kuzatmayapti.",
    },
    {
      title: "Lid-skoring agenti",
      body: "Yangi lidlar orasidan qaysi biriga birinchi qo'ng'iroq qilish kerakligini hali hech kim tartib bilan aytmayapti.",
    },
  ],
};

export default function SotuvPage() {
  const { lang } = useAppState();

  return (
    <div>
      <PageHeader title={t("sotuv_title", lang)} subtitle={t("sotuv_subtitle", lang)} />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card title={t("sotuv_pipeline_title", lang)} subtitle={t("sotuv_pipeline_subtitle", lang)} className="lg:col-span-2">
          <div className="space-y-3">
            {sotuvData.pipeline.map((p) => (
              <div key={p.stage}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{p.stage}</span>
                  <span className="text-muted">
                    {p.count} · {p.value}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-alt">
                  <div
                    className="h-2.5 rounded-full bg-brand"
                    style={{ width: `${(p.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("sotuv_followup_title", lang)} subtitle={t("sotuv_followup_subtitle", lang)}>
          <ul className="space-y-3">
            {sotuvData.followUps.map((f) => (
              <li key={f.client} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">{f.client}</p>
                <p className="mt-0.5 text-xs text-muted">{f.action}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-brand">
                  <Clock size={12} />
                  {f.due}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={t("sotuv_brief_title", lang)} subtitle={t("sotuv_brief_prepared", lang)}>
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-sm font-semibold text-foreground">{sotuvData.meetingBrief.client}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-foreground">
              {sotuvData.meetingBrief.points.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
            <div className="mt-3">
              <Badge tone="brand">{t("sotuv_voice_ai_badge", lang)}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <AgentOrgStructure {...sotuvAgentStructure} />
      </div>
    </div>
  );
}
