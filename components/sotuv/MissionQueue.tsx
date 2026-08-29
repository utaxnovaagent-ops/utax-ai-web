"use client";

import { useState } from "react";
import { Phone, Mail, CalendarClock, ShieldCheck, Check } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { missions as computeMissions } from "@/lib/sales-metrics";
import { useDeals } from "@/lib/deals-context";

function ctaIcon(nextAction: string) {
  if (/qo'ng'iroq/i.test(nextAction)) return Phone;
  if (/brief|xat|yubor/i.test(nextAction)) return Mail;
  if (/uchrashuv/i.test(nextAction)) return CalendarClock;
  return ShieldCheck;
}

export function MissionQueue({ stageFilter }: { stageFilter: string | null }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState<string | null>(null);

  const deals = useDeals();
  const list = computeMissions(deals, 8).filter((m) => !stageFilter || m.deal.stage === stageFilter);

  function markDone(id: string) {
    setDone((prev) => new Set(prev).add(id));
    setConfirming(null);
  }

  return (
    <Card id="missions" title="Bugungi missiyalar" subtitle="Priority score — qiymat, ehtimollik va risk asosida" className="h-full">
      <div className="space-y-2.5">
        {list.length === 0 && <p className="text-sm text-muted">Bu bosqichda ustuvor vazifa yo'q.</p>}
        {list.map(({ deal, priorityScore, aiReason, requiresApproval }) => {
          const Icon = ctaIcon(deal.nextAction);
          const isDone = done.has(deal.id);
          return (
            <div key={deal.id} className={`rounded-xl border p-3 ${isDone ? "border-border opacity-50" : "border-border"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-light text-[10px] font-bold text-brand">
                      {priorityScore}
                    </span>
                    <p className="truncate text-sm font-semibold text-foreground">{deal.client}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">{deal.service}</p>
                </div>
                {requiresApproval && <Badge tone="warning">Tasdiq kerak</Badge>}
              </div>

              <p className="mt-2 text-xs leading-relaxed text-foreground">{aiReason}</p>

              {!isDone ? (
                confirming === deal.id ? (
                  <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-warning-bg p-2">
                    <span className="text-[11px] text-warning">Mijozga yuborishdan oldin tasdiqlaysizmi?</span>
                    <button onClick={() => markDone(deal.id)} className="ml-auto rounded-md bg-warning px-2 py-1 text-[11px] font-semibold text-white">
                      Tasdiqlash
                    </button>
                    <button onClick={() => setConfirming(null)} className="rounded-md border border-border px-2 py-1 text-[11px] text-muted">
                      Bekor
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => (requiresApproval ? setConfirming(deal.id) : markDone(deal.id))}
                    className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-brand px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand-light"
                  >
                    <Icon size={13} /> {deal.nextAction}
                  </button>
                )
              ) : (
                <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-success">
                  <Check size={13} /> Bajarildi
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
