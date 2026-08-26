"use client";

import { useState } from "react";
import { Sparkles, Plus, FileText, Wallet, Target, Trophy, Gauge, AlertTriangle } from "lucide-react";
import { Card, Badge, StatCard } from "@/components/ui";
import { AgentOrgStructure } from "@/components/AgentOrgStructure";
import { RevenueHero } from "@/components/sotuv/RevenueHero";
import { FunnelVelocity } from "@/components/sotuv/FunnelVelocity";
import { MissionQueue } from "@/components/sotuv/MissionQueue";
import { DealRiskRadar } from "@/components/sotuv/DealRiskRadar";
import { RevenueTrend } from "@/components/sotuv/RevenueTrend";
import { sotuvData, orgStructure } from "@/lib/mock-data";
import { pipelineValue, weightedForecast, atRiskValue, funnelStages } from "@/lib/sales-metrics";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const sotuvHead = orgStructure.departments.find((d) => d.key === "sotuv")?.head ?? "Bobur Nazarov";
const negotiationStage = funnelStages().find((s) => s.stage === "Muzokara");

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
        ? `Hozirgi eng katta risk shu tomonda — "Muzokara" bosqichida ${negotiationStage.count} ta bitim, ${negotiationStage.value}M so'm to'xtab qolgan.`
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
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Sotuv Command Center</h1>
            <span className="rounded-full border border-border bg-surface-alt px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              DEMO
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground">
              <option>Bu oy</option>
              <option>O'tgan oy</option>
              <option>Bu kvartal</option>
            </select>
            <select className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground">
              {sotuvData.salespeople.map((s) => (
                <option key={s}>{s}</option>
              ))}
              <option>Barcha sotuvchilar</option>
            </select>
            <button className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface-alt">
              <FileText size={13} /> Hisobot
            </button>
            <button className="flex h-9 items-center gap-1.5 rounded-lg brand-gradient px-3 text-xs font-semibold text-white shadow-brand">
              <Plus size={13} /> Yangi lead
            </button>
          </div>
        </div>
      </div>

      <RevenueHero />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Pipeline qiymati" value={`${pipelineValue()}M`} hint="Ochiq bitimlar summasi" icon={<Wallet size={17} />} />
        <StatCard label="Weighted forecast" value={`${weightedForecast()}M`} hint="Σ bitim × ehtimollik" icon={<Target size={17} />} />
        <StatCard
          label="Win rate"
          value={`${sotuvData.winRate.percent}%`}
          delta={`${sotuvData.winRate.trendPp >= 0 ? "+" : ""}${sotuvData.winRate.trendPp}pp`}
          trend={sotuvData.winRate.trendPp >= 0 ? "up" : "down"}
          hint="Yutilgan / yopilgan"
          icon={<Trophy size={17} />}
        />
        <StatCard
          label="Sales velocity"
          value={`${sotuvData.velocity.medianDays} kun`}
          delta={`${sotuvData.velocity.trendDays >= 0 ? "+" : ""}${sotuvData.velocity.trendDays} kun`}
          trend={sotuvData.velocity.trendDays <= 0 ? "up" : "down"}
          hint="Lead → win median"
          icon={<Gauge size={17} />}
        />
        <StatCard
          label="At-risk revenue"
          value={`${atRiskValue()}M`}
          hint="Kechikkan / signal past"
          icon={<AlertTriangle size={17} />}
          tone="warning"
        />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <FunnelVelocity selected={stageFilter} onSelect={setStageFilter} />
        <MissionQueue stageFilter={stageFilter} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <DealRiskRadar />
        <RevenueTrend />
      </div>

      <Card title={t("sotuv_brief_title", lang)} subtitle={t("sotuv_brief_prepared", lang)} className="mb-5">
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
