"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Wallet, Target, Trophy, Gauge, AlertTriangle, Box } from "lucide-react";
import { StatCard } from "@/components/ui";
import { AgentOrgStructure } from "@/components/AgentOrgStructure";
import { RevenueHero } from "@/components/sotuv/RevenueHero";
import { FunnelVelocity } from "@/components/sotuv/FunnelVelocity";
import { MissionQueue } from "@/components/sotuv/MissionQueue";
import { DealRiskRadar } from "@/components/sotuv/DealRiskRadar";
import { RevenueTrend } from "@/components/sotuv/RevenueTrend";
import { pipelineValue, weightedForecast, atRiskValue, funnelStages } from "@/lib/sales-metrics";
import { SOTUV_OWNER, SOTUV_SYNTHESIZER, SOTUV_AGENTS } from "@/lib/sotuv-agents";
import { DealsProvider, useDeals, useDealsSource } from "@/lib/deals-context";
import { DataSourceBadge } from "@/components/sotuv/DataSourceBadge";
import { downloadCsv } from "@/lib/csv";
import { CallAnalytics } from "@/components/sotuv/CallAnalytics";


function buildAgentStructure(negotiationStage: { count: number; value: number } | undefined) {
  return {
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
}

export default function SotuvPage() {
  return (
    <DealsProvider>
      <SotuvPageInner />
    </DealsProvider>
  );
}

function SotuvPageInner() {
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const deals = useDeals();
  const negotiationStage = funnelStages(deals).find((s) => s.stage === "Muzokara");
  const sotuvAgentStructure = buildAgentStructure(negotiationStage);
  const { isReal, fetchedAt, count, winRate, won90, lost90, quality } = useDealsSource();

  function exportReport() {
    const today = new Date().toISOString().slice(0, 10);
    const rows: (string | number | null)[][] = [
      ["UTAX — Sotuv hisoboti", today],
      // Hisobot real Bitrix ma'lumotidanmi yoki namunaviydanmi — birinchi qatorda aytiladi.
      [
        "Manba",
        isReal
          ? `Bitrix24 (real) — ${count} ta bitim${fetchedAt ? `, yangilangan ${new Date(fetchedAt).toLocaleString("uz-UZ")}` : ""}`
          : "Namunaviy (demo) ma'lumot — Bitrix ulanmagan, raqamlar haqiqiy emas",
      ],
      [],
      ["KO'RSATKICHLAR"],
      ["Pipeline qiymati (mln)", pipelineValue(deals)],
      ["Weighted forecast (mln)", weightedForecast(deals)],
      ["At-risk (mln)", atRiskValue(deals)],
      ["Win rate (%)", winRate ?? "—"],
      ["Summasi kiritilmagan ochiq bitimlar", quality?.openWithoutAmount ?? "—"],
      [],
      ["VORONKA"],
      ["Bosqich", "Bitimlar", "Qiymat (mln)", "Conversion (%)", "O'rtacha kun"],
      ...funnelStages(deals).map((s) => [s.stage, s.count, s.value, s.conversionIntoStage, s.avgDays]),
      [],
      ["BITIMLAR"],
      ["ID", "Mijoz", "Xizmat", "Bosqich", "Qiymat (mln)", "Ehtimollik (%)", "Bosqichda (kun)", "Oxirgi aloqa (kun)", "Mas'ul", "Risk", "Keyingi qadam"],
      ...deals.map((d) => [
        d.id,
        d.client,
        d.service,
        d.stage,
        d.value,
        d.probability,
        d.daysInStage,
        d.lastContactDaysAgo,
        d.owner,
        d.risk,
        d.nextAction,
      ]),
    ];
    downloadCsv(`utax-sotuv-hisoboti-${today}.csv`, rows);
  }

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">Sotuv Command Center</h1>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              isReal
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "border-border bg-surface-alt text-muted"
            }`}>
              {isReal ? "LIVE" : "DEMO"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-foreground">
              <option>Bu oy</option>
              <option>O'tgan oy</option>
              <option>Bu kvartal</option>
            </select>
            <button
              onClick={exportReport}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface-alt"
            >
              <FileText size={13} /> Hisobot
            </button>
            {/* Sotuv bo'limining alohida ish paneli (Sotuv Desk) — Bitrix24 ustida
                ishlaydigan alohida ilova, shu sabab yangi oynada ochiladi. */}
            <a
              href="https://sotuv.169-58-178-40.sslip.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 items-center gap-1.5 rounded-lg brand-gradient px-3 text-xs font-semibold text-white shadow-brand"
            >
              <ExternalLink size={13} /> Sotuv web
            </a>
          </div>
        </div>
      </div>

      <DataSourceBadge />

      <RevenueHero />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Pipeline qiymati" value={`${pipelineValue(deals)}M`} hint="Ochiq bitimlar summasi" icon={<Wallet size={17} />} />
        <StatCard label="Weighted forecast" value={`${weightedForecast(deals)}M`} hint="Σ bitim × ehtimollik" icon={<Target size={17} />} />
        {/* Win rate — Bitrixdagi so'nggi 90 kun yopilgan bitimlaridan hisoblanadi. */}
        <StatCard
          label="Win rate"
          value={winRate !== null ? `${winRate}%` : "—"}
          hint={winRate !== null ? `${won90} yutilgan / ${(won90 ?? 0) + (lost90 ?? 0)} yopilgan (90 kun)` : "Ma'lumot yetarli emas"}
          icon={<Trophy size={17} />}
        />
        {/* "Sales velocity"ning real manbasi yo'q (Bitrix bosqich tarixini bermaydi),
            shuning uchun o'rniga haqiqiy CRM-sifat ko'rsatkichi turadi. */}
        <StatCard
          label="Summasiz bitimlar"
          value={quality ? String(quality.openWithoutAmount) : "—"}
          hint="Ochiq bitim, summasi kiritilmagan"
          icon={<Gauge size={17} />}
          tone={quality && quality.openWithoutAmount > 0 ? "warning" : undefined}
        />
        <StatCard
          label="At-risk revenue"
          value={`${atRiskValue(deals)}M`}
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

      <div className="mb-5">
        <CallAnalytics days={30} />
      </div>

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
