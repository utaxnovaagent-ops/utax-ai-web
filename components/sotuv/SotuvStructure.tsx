"use client";

// Sotuv bo'limi tuzilmasi — faqat haqiqatda ishlab turgan agentlar.
// Ustunlar mijoz yo'lining bosqichlari: lid kiradi → bitim ustida ishlanadi →
// sotuvdan keyin xizmat ko'rsatiladi. Qaror har doim bo'lim boshlig'ida.
import { Bot, UserCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { SOTUV_OWNER, SOTUV_AGENTS, SOTUV_STAGES, type SotuvAgentStatus } from "@/lib/sotuv-agents";

const DOT: Record<SotuvAgentStatus, string> = {
  live: "bg-emerald-500",
  partial: "bg-amber-500",
  planned: "bg-slate-400",
};

export function SotuvStructure() {
  const live = SOTUV_AGENTS.filter((a) => a.status === "live").length;

  return (
    <Card
      title="Sotuv bo'limi tuzilmasi"
      subtitle={`${SOTUV_AGENTS.length} ta agent — ${live} tasi ishlab turibdi · barchasi serverda alohida xizmat`}
    >
      <div className="flex flex-col items-center">
        {/* Boshliq — qaror shu yerda */}
        <div className="w-full max-w-[260px] rounded-xl border border-brand/40 bg-brand-light px-4 py-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{SOTUV_OWNER.name}</p>
          <p className="text-[11px] text-muted">{SOTUV_OWNER.role}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-medium text-brand">
            <UserCheck size={11} /> yakuniy qaror
          </p>
        </div>

        {/* Ulagich */}
        <div className="h-4 w-px bg-border" />
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted">signal va tavsiya</p>
        <div className="h-4 w-px bg-border" />

        {/* Bosqichlar */}
        <div className="grid w-full gap-3 md:grid-cols-3">
          {SOTUV_STAGES.map((stage) => {
            const agents = SOTUV_AGENTS.filter((a) => a.stage === stage.id);
            return (
              <div key={stage.id} className="rounded-xl border border-border bg-surface-alt/60 p-3">
                <div className="mb-2 text-center">
                  <p className="text-xs font-semibold text-foreground">{stage.label}</p>
                  <p className="text-[10px] text-muted">{stage.hint}</p>
                </div>
                <div className="space-y-2">
                  {agents.map((a) => (
                    <div key={a.id} className="rounded-lg border border-border bg-surface px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Bot size={12} className="flex-shrink-0 text-brand" />
                        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{a.name}</p>
                        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${DOT[a.status]}`} title={a.status} />
                      </div>
                      <p className="mt-0.5 pl-5 text-[10px] leading-snug text-muted">{a.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 max-w-xl text-center text-[11px] leading-relaxed text-muted">
          Agentlar mijoz bilan ishlaydi va fakt yig&apos;adi; qaysi bitim va qaysi mijozga e&apos;tibor
          berish kerakligini {SOTUV_OWNER.name} hal qiladi.
        </p>
      </div>
    </Card>
  );
}
