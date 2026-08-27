"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Plus, FileText, Wallet, Target, Trophy, Gauge, AlertTriangle, Box } from "lucide-react";
import { Card, Badge, StatCard } from "@/components/ui";
import { AgentOrgStructure } from "@/components/AgentOrgStructure";
import { RevenueHero } from "@/components/sotuv/RevenueHero";
import { FunnelVelocity } from "@/components/sotuv/FunnelVelocity";
import { MissionQueue } from "@/components/sotuv/MissionQueue";
import { DealRiskRadar } from "@/components/sotuv/DealRiskRadar";
import { RevenueTrend } from "@/components/sotuv/RevenueTrend";
import { sotuvData } from "@/lib/mock-data";
import { pipelineValue, weightedForecast, atRiskValue, funnelStages } from "@/lib/sales-metrics";
import { SOTUV_OWNER, SOTUV_SYNTHESIZER, SOTUV_AGENTS } from "@/lib/sotuv-agents";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const negotiationStage = funnelStages().find((s) => s.stage === "Muzokara");

const sotuvAgentStructure = {
  eyebrow: "SOTUV · AI AGENTLAR STRUKTURASI",
  title: "Sotuv agentlari strukturasi",
  intro:
    "Botir AI — sintezator: u o'zi mijoz bilan gaplashmaydi, signallarni yig'ib ustuvorlik taklif qiladi. Uning ostida har biri bitta ishni egallagan beshta agent turadi; ularning ostida — real manbalar.",
  owner: SOTUV_OWNER,
  synthesizer: SOTUV_SYNTHESIZER,
  agents: SOTUV_AGENTS.map(({ name, role, does, source, decision, status }) => ({ name, role, does, source, decision, status })),
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

      <div className="mt-6" id="sales-agents">
        <AgentOrgStructure
          {...sotuvAgentStructure}
          headerAction={
            <Link
              href="/campus?department=sotuv"
              className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface-alt"
            >
              <Box size={13} /> 3D Sales Hubda ko'rish
            </Link>
          }
        />
      </div>
    </div>
  );
}
