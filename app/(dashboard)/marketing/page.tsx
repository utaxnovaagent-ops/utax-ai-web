"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Languages } from "lucide-react";
import { PageHeader, Card, Badge, toneForLevel } from "@/components/ui";
import { marketingData } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const COLORS = ["#0B4FB0", "#1677FF", "#7FB2F7", "#BCD6FA"];

export default function MarketingPage() {
  const { lang } = useAppState();

  return (
    <div>
      <PageHeader title={t("marketing_title", lang)} subtitle={t("marketing_subtitle", lang)} />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card title={t("marketing_campaigns_title", lang)} subtitle={t("marketing_campaigns_subtitle", lang)} className="lg:col-span-2">
          <div className="space-y-3">
            {marketingData.campaigns.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted">{c.channel}</p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="text-xs text-muted">
                    <p>Qamrov: {c.reach}</p>
                    <p>CTR: {c.ctr}</p>
                  </div>
                  <Badge tone={toneForLevel(c.status)}>{c.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("marketing_segments_title", lang)} subtitle={t("marketing_segments_subtitle", lang)}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={marketingData.segments} dataKey="share" nameKey="segment" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {marketingData.segments.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {marketingData.segments.map((s, i) => (
              <li key={s.segment} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.segment} — {s.share}%
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t("marketing_calendar_title", lang)} subtitle={t("marketing_calendar_subtitle", lang)}>
          <div className="space-y-3">
            {marketingData.contentCalendar.map((c) => (
              <div key={c.title} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted">{c.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="brand">{c.lang}</Badge>
                  <Badge tone={toneForLevel(c.stage)}>{c.stage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("marketing_brand_title", lang)} subtitle={t("marketing_brand_subtitle", lang)}>
          <div className="flex items-start gap-3 rounded-lg bg-brand-light p-3 text-sm text-foreground">
            <Languages size={16} className="mt-0.5 shrink-0 text-brand" />
            <p>{marketingData.brandVoice}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
