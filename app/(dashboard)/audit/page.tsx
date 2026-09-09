"use client";

import { UserCircle2 } from "lucide-react";
import { PageHeader, Card, StatCard, Badge, BadgeTone } from "@/components/ui";
import { auditData } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const stageLabelKey: Record<string, string> = {
  started: "audit_stage_started",
  fieldwork: "audit_stage_fieldwork",
  findings: "audit_stage_findings",
  report: "audit_stage_report",
  signoff: "audit_stage_signoff",
};

const stageTone: Record<string, BadgeTone> = {
  started: "neutral",
  fieldwork: "info",
  findings: "warning",
  report: "brand",
  signoff: "success",
};

export default function AuditPage() {
  const { lang } = useAppState();

  return (
    <div>
      <PageHeader title={t("audit_title", lang)} subtitle={t("audit_subtitle", lang)} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t("audit_stat_active", lang)} value={String(auditData.stats.active)} />
        <StatCard label={t("audit_stat_completed", lang)} value={String(auditData.stats.completedThisMonth)} />
        <StatCard label={t("audit_stat_duration", lang)} value={auditData.stats.avgDuration} />
      </div>

      <Card className="mb-6" title={t("audit_stage_title", lang)}>
        <div className="flex flex-wrap gap-2">
          {auditData.stageSummary.map((s) => (
            <div key={s.key} className="flex flex-1 min-w-[120px] flex-col items-center gap-1 rounded-lg border border-border p-3">
              <span className="text-lg font-semibold text-foreground">{s.count}</span>
              <span className="text-center text-xs text-muted">{t(stageLabelKey[s.key], lang)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title={t("audit_engagements_title", lang)} subtitle={t("audit_engagements_subtitle", lang)}>
        <div className="space-y-3">
          {auditData.engagements.map((e) => (
            <div key={e.client} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{e.client}</p>
                <Badge tone={stageTone[e.stage]}>{t(stageLabelKey[e.stage], lang)}</Badge>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-surface-alt">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${e.progress}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <UserCircle2 size={13} /> {e.auditor ?? "mas'ul biriktirilmagan"}
                </span>
                <span>
                  {e.dueDate} · {e.findings} {t("audit_col_findings", lang)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
