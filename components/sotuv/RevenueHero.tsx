"use client";

import { useState } from "react";
import { Info, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui";
import { sotuvData } from "@/lib/mock-data";
import { weightedForecast, negotiationValue, needsActionToday, missions } from "@/lib/sales-metrics";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function RevenueHero() {
  const [showWhy, setShowWhy] = useState(false);
  const { planThisMonth, factThisMonth, currency } = sotuvData.revenue;
  const forecast = weightedForecast();
  const gap = Math.max(0, planThisMonth - factThisMonth);
  const factPct = Math.min(100, Math.round((factThisMonth / planThisMonth) * 100));
  const forecastPct = Math.min(100, Math.round(((factThisMonth + forecast) / planThisMonth) * 100));
  const pendingApprovals = missions().filter((m) => m.requiresApproval).length;
  const actionNeeded = needsActionToday().length;

  return (
    <Card className="mb-5">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bu oy — reja vs fakt</p>
          <div className="mt-1.5 flex items-baseline gap-2 tabular-nums">
            <span className="text-4xl font-extrabold text-foreground">{fmt(factThisMonth)}</span>
            <span className="text-lg font-medium text-muted">/ {fmt(planThisMonth)} {currency}</span>
          </div>

          <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-alt">
            <div className="h-full rounded-full brand-gradient" style={{ width: `${factPct}%` }} />
            <div
              className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-ai-blue"
              style={{ left: `${forecastPct}%` }}
              title={`Weighted forecast: ${fmt(factThisMonth + forecast)}M`}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
            <span>Fakt: {factPct}%</span>
            <span className="flex items-center gap-1 text-ai-blue">
              <span className="h-1.5 w-1.5 rounded-full bg-ai-blue" /> Forecast: {fmt(factThisMonth + forecast)}M
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-full border border-warning/40 bg-warning-bg px-3 py-1.5 text-xs font-semibold text-warning"
              onClick={() => setShowWhy(true)}
            >
              {pendingApprovals} qaror kutilmoqda
            </button>
            <button
              className="rounded-full border border-danger/30 bg-danger-bg px-3 py-1.5 text-xs font-semibold text-danger"
              onClick={() => setShowWhy(true)}
            >
              {actionNeeded} bitim e'tibor talab qiladi
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-alt p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">AI xulosa</p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">
            Rejaga yetish uchun <strong>{fmt(gap)}M so'm</strong> kerak. Muzokara bosqichida <strong>{fmt(negotiationValue())}M so'm</strong> turibdi;{" "}
            <strong>{actionNeeded} bitim</strong> bugun harakat talab qiladi.
          </p>
          <button
            onClick={() => setShowWhy((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <Info size={12} /> {showWhy ? "Yopish" : "Nega?"}
          </button>
          {showWhy && (
            <div className="mt-2 space-y-1 border-t border-border pt-2 text-[11px] text-muted">
              <p>Manba: CRM — 10 ochiq/yopilgan bitim (DEMO)</p>
              <p>Hisoblash: Bo'shliq = Reja − Fakt; Forecast = Σ(bitim qiymati × ehtimollik)</p>
              <p>Ishonchlilik: o'rtacha (demo ma'lumot, real CRM ulanmagan)</p>
              <p>Yangilangan: hozir</p>
            </div>
          )}
          <a href="#missions" className="mt-3 flex items-center gap-1 text-xs font-semibold text-brand">
            Bugungi missiyalarni ko'rish <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </Card>
  );
}
