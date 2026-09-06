"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { PageHeader, Card, StatCard, Badge, toneForLevel } from "@/components/ui";
import { ceoData } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { useLocalActions } from "@/lib/local-actions";
import { t } from "@/lib/i18n";

export default function CeoPage() {
  const { lang } = useAppState();
  // Qaror tasdig'i: backend yo'q, shuning uchun shu brauzerda saqlanadi
  const decisions = useLocalActions("utax_ceo_decisions");

  return (
    <div>
      <PageHeader title={t("ceo_title", lang)} subtitle={t("ceo_subtitle", lang)} />

      <Card className="mb-6 border-brand/20 bg-brand-light">
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-brand" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">{t("ceo_ai_summary", lang)}</p>
            <p className="mt-1 text-sm text-foreground">{ceoData.weeklySummary}</p>
          </div>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ceoData.kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} delta={k.delta} trend={k.trend as "up" | "down"} />
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card title={t("ceo_revenue_title", lang)} subtitle={t("ceo_revenue_subtitle", lang)} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ceoData.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#1677FF" strokeWidth={2.5} dot={false} name={t("fact", lang)} />
              <Line type="monotone" dataKey="plan" stroke="#9ca3af" strokeWidth={2} strokeDasharray="4 4" dot={false} name={t("plan", lang)} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t("ceo_dept_score_title", lang)} subtitle={t("ceo_dept_score_subtitle", lang)}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ceoData.departmentScore} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#6b7280" />
              <YAxis type="category" dataKey="dept" tick={{ fontSize: 12 }} width={70} stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="score" fill="#1677FF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t("ceo_risks_title", lang)} subtitle={t("ceo_risks_subtitle", lang)}>
          <ul className="space-y-3">
            {ceoData.risks.map((r) => (
              <li key={r.title} className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.title}</p>
                    <p className="text-xs text-muted">
                      {r.owner} · muddat: {r.due}
                    </p>
                  </div>
                </div>
                <Badge tone={toneForLevel(r.level)}>{r.level}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("ceo_decisions_title", lang)} subtitle={t("ceo_decisions_subtitle", lang)}>
          <ul className="space-y-4">
            {ceoData.decisions.map((d) => {
              const status = decisions.state[d.title];
              const approved = status === "approved";
              const open = status === "open";
              return (
                <li key={d.title} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{d.title}</p>
                    <Badge tone={approved ? "success" : "warning"}>
                      {approved ? "Tasdiqlangan" : d.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">{d.rationale}</p>
                  <p className="mt-1 text-xs text-brand">{d.impact}</p>
                  {open && (
                    <dl className="mt-2 space-y-1 rounded-lg bg-surface-alt p-2.5 text-xs">
                      <div className="flex gap-2">
                        <dt className="w-20 flex-shrink-0 text-muted">Asos</dt>
                        <dd className="text-foreground">{d.rationale}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 flex-shrink-0 text-muted">Ta&apos;sir</dt>
                        <dd className="text-foreground">{d.impact}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 flex-shrink-0 text-muted">Holat</dt>
                        <dd className="text-foreground">{approved ? "Tasdiqlangan" : d.status}</dd>
                      </div>
                    </dl>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {approved ? (
                      <button
                        onClick={() => decisions.set(d.title, null)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-alt"
                      >
                        Tasdiqni bekor qilish
                      </button>
                    ) : (
                      <button
                        onClick={() => decisions.set(d.title, "approved")}
                        className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-contrast hover:opacity-90"
                      >
                        <CheckCircle2 size={13} /> {t("approve", lang)}
                      </button>
                    )}
                    <button
                      onClick={() => decisions.set(d.title, open ? null : "open")}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-alt"
                    >
                      {open ? "Yopish" : t("details", lang)}
                    </button>
                    {approved && (
                      <span className="text-[11px] text-muted">shu brauzerda saqlandi</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
