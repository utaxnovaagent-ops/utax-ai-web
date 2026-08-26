"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

export type AgentStatus = "live" | "partial" | "planned";

export interface AgentNode {
  name: string;
  role: string;
  does: string;
  source: string;
  decision: string;
  status: AgentStatus;
}

export interface AgentOrgStructureProps {
  eyebrow: string;
  title: string;
  intro: string;
  owner: { name: string; role: string };
  synthesizer: { name: string; role: string; tagline: string };
  agents: AgentNode[];
  sources: { label: string; ok: boolean }[];
  loopNote: string;
  rules: { title: string; body: string }[];
  startingPoints: { title: string; body: string }[];
}

const STATUS_DOT: Record<AgentStatus, string> = {
  live: "bg-success",
  partial: "bg-warning",
  planned: "bg-danger",
};

const STATUS_TEXT: Record<AgentStatus, string> = {
  live: "text-success",
  partial: "text-warning",
  planned: "text-danger",
};

function StatusBadge({ status, lang }: { status: AgentStatus; lang: Parameters<typeof t>[1] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${STATUS_TEXT[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {t(`agent_status_${status}`, lang)}
    </span>
  );
}

function FlowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-1.5">
      <div className="h-4 w-px bg-border" />
      <span className="my-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">{children}</span>
      <div className="h-4 w-px bg-border" />
    </div>
  );
}

export function AgentOrgStructure({
  eyebrow,
  title,
  intro,
  owner,
  synthesizer,
  agents,
  sources,
  loopNote,
  rules,
  startingPoints,
}: AgentOrgStructureProps) {
  const { lang } = useAppState();

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">{intro}</p>
      </div>

      <Card>
        <div className="flex flex-col items-center">
          {/* Owner */}
          <div className="w-full max-w-xs rounded-xl border border-border bg-surface-alt px-4 py-3 text-center shadow-sm">
            <p className="text-sm font-bold text-foreground">{owner.name}</p>
            <p className="text-[11px] text-muted">{owner.role}</p>
            <p className="mt-1 text-[10px] font-medium text-brand">{t("agent_structure_owner_note", lang)}</p>
          </div>

          <FlowLabel>{t("agent_structure_proposal", lang)}</FlowLabel>

          {/* Synthesizer */}
          <div className="rounded-2xl p-[1.5px] brand-gradient shadow-brand">
            <div className="w-full max-w-sm rounded-[15px] bg-surface px-5 py-3.5 text-center">
              <p className="text-sm font-bold text-foreground">{synthesizer.name}</p>
              <p className="text-[11px] text-muted">{synthesizer.role}</p>
              <p className="mt-1 text-[10px] font-medium text-brand">{synthesizer.tagline}</p>
            </div>
          </div>

          <FlowLabel>{t("agent_structure_signal", lang)}</FlowLabel>

          {/* Sub-agents */}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {agents.map((a) => (
              <div key={a.name} className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-3.5 shadow-sm">
                <p className="text-xs font-bold text-foreground">{a.name}</p>
                <p className="text-[10px] text-muted">{a.role}</p>
                <p className="text-[11px] leading-snug text-foreground">{a.does}</p>
                <p className="mt-auto text-[10px] text-muted">{a.source}</p>
                <StatusBadge status={a.status} lang={lang} />
              </div>
            ))}
          </div>

          <FlowLabel>{t("agent_structure_data_flow", lang)}</FlowLabel>

          {/* Sources */}
          <div className="w-full rounded-xl border border-border bg-surface-alt p-3.5">
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
              {t("agent_structure_sources_title", lang)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {sources.map((s) => (
                <span
                  key={s.label}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                    s.ok ? "border-success/40 text-success" : "border-dashed border-border text-muted"
                  }`}
                >
                  {s.ok && <Check size={11} />}
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-center text-[11px] leading-relaxed text-muted">{loopNote}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted">
            <StatusBadge status="live" lang={lang} />
            <StatusBadge status="partial" lang={lang} />
            <StatusBadge status="planned" lang={lang} />
          </div>
        </div>
      </Card>

      <Card title={`${agents.length} ${t("agent_structure_col_agent", lang).toLowerCase()}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="pb-2 pr-3 font-medium">{t("agent_structure_col_agent", lang)}</th>
                <th className="pb-2 pr-3 font-medium">{t("agent_structure_col_does", lang)}</th>
                <th className="pb-2 pr-3 font-medium">{t("agent_structure_col_source", lang)}</th>
                <th className="pb-2 pr-3 font-medium">{t("agent_structure_col_decision", lang)}</th>
                <th className="pb-2 font-medium">{t("agent_structure_col_status", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.name} className="border-b border-border align-top last:border-0">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted">{a.role}</p>
                  </td>
                  <td className="max-w-xs py-2.5 pr-3 text-muted">{a.does}</td>
                  <td className="py-2.5 pr-3 text-muted">{a.source}</td>
                  <td className="max-w-xs py-2.5 pr-3 text-muted">{a.decision}</td>
                  <td className="py-2.5">
                    <StatusBadge status={a.status} lang={lang} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <h3 className="mb-3 text-sm font-bold text-foreground">{t("agent_structure_rules_title", lang)}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((r) => (
            <div key={r.title} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">{r.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-foreground">{t("agent_structure_start_title", lang)}</h3>
        <div className="space-y-2.5">
          {startingPoints.map((s, i) => (
            <div key={s.title} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 shadow-sm">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
