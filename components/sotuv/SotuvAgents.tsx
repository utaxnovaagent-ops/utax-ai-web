"use client";

// Sotuv bo'limida haqiqatda ishlab turgan AI agentlar.
// Ro'yxat lib/sotuv-agents.ts'dan — har biri VPS'dagi alohida systemd xizmati.
import { Bot, ExternalLink, UserCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { SOTUV_OWNER, SOTUV_AGENTS, type SotuvAgentStatus } from "@/lib/sotuv-agents";

const STATUS: Record<SotuvAgentStatus, { label: string; dot: string; chip: string }> = {
  live: {
    label: "ishlayapti",
    dot: "bg-emerald-500",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  partial: {
    label: "sozlanmagan",
    dot: "bg-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  },
  planned: {
    label: "rejada",
    dot: "bg-slate-400",
    chip: "border-border bg-surface-alt text-muted",
  },
};

export function SotuvAgents({ sotuvWebUrl }: { sotuvWebUrl: string }) {
  const liveCount = SOTUV_AGENTS.filter((a) => a.status === "live").length;

  return (
    <Card
      title="Ishlayotgan AI agentlar"
      subtitle={`${liveCount} ta agent serverda ishlab turibdi · qarorni ${SOTUV_OWNER.name} tasdiqlaydi`}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SOTUV_AGENTS.map((a) => {
          const s = STATUS[a.status];
          return (
            <div
              key={a.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-brand"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                    <Bot size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{a.name}</p>
                    <p className="truncate text-[11px] text-muted">{a.role}</p>
                  </div>
                </div>
                <span
                  className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.chip}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              </div>

              <p className="text-[13px] leading-relaxed text-foreground">{a.does}</p>

              <dl className="mt-auto space-y-1 border-t border-border pt-2 text-[11px]">
                <div className="flex gap-2">
                  <dt className="w-16 flex-shrink-0 text-muted">Manba</dt>
                  <dd className="min-w-0 text-foreground">{a.source}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 flex-shrink-0 text-muted">Qarori</dt>
                  <dd className="min-w-0 text-foreground">{a.decision}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-muted">
          <UserCheck size={14} className="flex-shrink-0 text-brand" />
          Agentlar faktni beradi — yakuniy qarorni {SOTUV_OWNER.name} ({SOTUV_OWNER.role}) tasdiqlaydi.
        </p>
        <a
          href={sotuvWebUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-alt"
        >
          <ExternalLink size={13} /> Batafsil — Sotuv web
        </a>
      </div>
    </Card>
  );
}
