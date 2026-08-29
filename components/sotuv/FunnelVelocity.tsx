"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui";
import { funnelStages } from "@/lib/sales-metrics";
import { useDeals } from "@/lib/deals-context";

const BOTTLENECK_STAGE = "Muzokara";

export function FunnelVelocity({ selected, onSelect }: { selected: string | null; onSelect: (stage: string | null) => void }) {
  const deals = useDeals();
  const stages = funnelStages(deals);
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Card title="Voronka va tezlik" subtitle="Bosqich bo'yicha conversion, qiymat va o'rtacha kun" className="h-full">
      <div className="space-y-2.5">
        {stages.map((s) => {
          const isBottleneck = s.stage === BOTTLENECK_STAGE;
          const isSelected = selected === s.stage;
          return (
            <button
              key={s.stage}
              onClick={() => onSelect(isSelected ? null : s.stage)}
              aria-pressed={isSelected}
              aria-label={`${s.stage} — ${s.count} bitim, ${s.value}M so'm, conversion ${s.conversionIntoStage}%`}
              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                isSelected ? "border-brand bg-brand-light" : "border-border hover:border-brand/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {s.stage}
                  {isBottleneck && <AlertTriangle size={13} className="text-warning" />}
                </span>
                <span className="tabular-nums text-xs text-muted">
                  {s.count} bitim · {s.value}M so'm
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-alt">
                <div
                  className={`h-full rounded-full ${isBottleneck ? "bg-warning" : "bg-brand"}`}
                  style={{ width: `${(s.count / maxCount) * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted">
                <span>Conversion: {s.conversionIntoStage}%</span>
                <span>O'rtacha {s.avgDays} kun</span>
                <span className={s.prevPeriodDeltaPct >= 0 ? "text-success" : "text-danger"}>
                  {s.prevPeriodDeltaPct >= 0 ? "+" : ""}
                  {s.prevPeriodDeltaPct}% o'tgan davrga nisbatan
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="mt-3 text-[11px] text-muted">
          "{selected}" bosqichi bo'yicha filtrlangan — pastdagi missiyalar va bitimlar ro'yxati shu bosqichga qarab yangilanadi.
        </p>
      )}
    </Card>
  );
}
