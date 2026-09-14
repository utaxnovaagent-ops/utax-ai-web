"use client";

import { useEffect, useState } from "react";
import { Info, ArrowRight, Pencil } from "lucide-react";
import { Card } from "@/components/ui";
import { weightedForecast, negotiationValue, needsActionToday, missions, atRiskValue } from "@/lib/sales-metrics";
import { useDeals, useDealsSource } from "@/lib/deals-context";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

/** Oy davomida yig'ilma: reja chizig'i (0 → reja), fakt maydoni, forecast belgisi. */
function CumulativeChart({ plan, daily, forecast }: { plan: number; daily: number[] | null; forecast: number }) {
  const W = 760, H = 150, L = 40, R = 20, T = 14, B = 22;
  const now = new Date();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const series = daily && daily.length ? daily : new Array(today).fill(0);
  const fact = series[series.length - 1] ?? 0;
  const top = Math.max(plan, fact + forecast, 1);
  const x = (day: number) => L + ((day - 1) / (days - 1)) * (W - L - R);
  const y = (v: number) => H - B - (v / top) * (H - T - B);
  const pts = series.map((v, i) => `${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`);
  const line = `M${pts.join(" L")}`;
  const area = `${line} L${x(series.length).toFixed(1)} ${y(0)} L${x(1)} ${y(0)} Z`;
  const ticks = [0, 0.5, 1].map((f) => Math.round(top * f));
  const label = (d: number) => `${d} ${["yan","fev","mar","apr","may","iyun","iyul","avg","sen","okt","noy","dek"][now.getMonth()]}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-[150px] w-full" role="img" aria-label="Oy davomida yig'ilma: reja va fakt">
      <defs>
        <linearGradient id="rvFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand)" stopOpacity=".22" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--border)" />
          <text x={L - 6} y={y(v) + 3.5} fontSize="10" fill="var(--muted)" textAnchor="end">{v}</text>
        </g>
      ))}
      <line x1={x(1)} y1={y(0)} x2={x(days)} y2={y(plan)} stroke="var(--silver)" strokeWidth="1.5" strokeDasharray="5 5" />
      <text x={W - R} y={y(plan) - 5} fontSize="10" fill="var(--muted)" textAnchor="end">reja chizig&apos;i</text>
      <path d={area} fill="url(#rvFill)" />
      <path d={line} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(series.length)} cy={y(fact)} r="4" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2" />
      {forecast > 0 && (
        <g>
          <line x1={x(series.length)} y1={y(fact)} x2={x(series.length)} y2={y(fact + forecast)} stroke="var(--brand-700)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx={x(series.length)} cy={y(fact + forecast)} r="3" fill="var(--brand-700)" />
          <text x={x(series.length) - 6} y={y(fact + forecast) - 6} fontSize="10" fontWeight="600" fill="var(--brand-700)" textAnchor="end">forecast {fmt(Math.round(fact + forecast))}M</text>
        </g>
      )}
      {[1, Math.round(days / 2), days].map((d) => (
        <text key={d} x={x(d)} y={H - 6} fontSize="10" fill="var(--muted)" textAnchor={d === 1 ? "start" : d === days ? "end" : "middle"}>{label(d)}</text>
      ))}
    </svg>
  );
}

export function RevenueHero() {
  const [showWhy, setShowWhy] = useState(false);
  const deals = useDeals();
  const { isReal, fetchedAt, count, wonThisMonthM, wonThisMonthDaily } = useDealsSource();

  // Reja — biznes maqsadi, CRMda yo'q: serverdagi sozlamadan (/api/settings).
  const [plan, setPlan] = useState<{ value: number; setBy: "default" | "user" } | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [agents, setAgents] = useState<{ active: number; total: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j?.ok) setPlan({ value: j.planThisMonth, setBy: j.planSetBy }); })
      .catch(() => {});
    fetch("/api/agents", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j?.ok) setAgents({ active: j.activeCount, total: j.agents.length }); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  async function savePlan() {
    const v = Number(draft);
    if (!Number.isFinite(v) || v <= 0) return;
    setSaving(true);
    try {
      const r = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planThisMonth: v }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) { setPlan({ value: j.planThisMonth, setBy: "user" }); setEditing(false); }
    } finally {
      setSaving(false);
    }
  }

  const planThisMonth = plan?.value ?? 500;
  const factThisMonth = wonThisMonthM ?? 0;
  const forecast = weightedForecast(deals);
  const gap = Math.max(0, planThisMonth - factThisMonth);
  const factPct = Math.min(100, Math.round((factThisMonth / planThisMonth) * 100));
  const pendingApprovals = missions(deals).filter((m) => m.requiresApproval).length;
  const actionNeeded = needsActionToday(deals).length;
  const atRisk = atRiskValue(deals);
  const now = new Date();
  const daysLeft = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();

  return (
    <Card className="mb-5">
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bu oy — reja vs fakt</p>
            <span className="text-[11px] tabular-nums text-muted">{daysLeft} kun qoldi</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 tabular-nums">
            <span className="text-4xl font-extrabold text-foreground">{fmt(factThisMonth)}</span>
            <span className="text-lg font-medium text-muted">/ {fmt(planThisMonth)} M so&apos;m</span>
            {editing ? (
              <span className="ml-1 inline-flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") savePlan(); if (e.key === "Escape") setEditing(false); }}
                  autoFocus
                  className="h-8 w-24 rounded-lg border border-border bg-surface px-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  aria-label="Oylik reja, mln so'm"
                />
                <button onClick={savePlan} disabled={saving} className="h-8 rounded-lg bg-brand-700 px-2.5 text-xs font-semibold text-white disabled:opacity-60">Saqlash</button>
                <button onClick={() => setEditing(false)} className="h-8 rounded-lg border border-border px-2 text-xs text-muted">Bekor</button>
              </span>
            ) : (
              <button
                onClick={() => { setDraft(String(planThisMonth)); setEditing(true); }}
                className="ml-1 inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:underline"
                title={plan?.setBy === "user" ? "Rejani o'zgartirish" : "Reja hali kiritilmagan — boshlang'ich qiymat"}
              >
                <Pencil size={11} /> {plan?.setBy === "user" ? "rejani o'zgartirish" : "rejani kiriting"}
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-muted">
            Fakt {factPct}% · Forecast <b className="text-brand-700">{fmt(Math.round(factThisMonth + forecast))} M</b> (bitim × ehtimollik)
            {plan?.setBy !== "user" && <span className="ml-2 rounded-full bg-warning-bg px-2 py-0.5 text-[10px] font-semibold text-warning">reja boshlang&apos;ich qiymat</span>}
          </p>

          <CumulativeChart plan={planThisMonth} daily={wonThisMonthDaily} forecast={forecast} />

          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-full border border-warning/40 bg-warning-bg px-3 py-1.5 text-xs font-semibold text-warning" onClick={() => setShowWhy(true)}>
              {pendingApprovals} qaror kutilmoqda
            </button>
            <button className="rounded-full border border-danger/30 bg-danger-bg px-3 py-1.5 text-xs font-semibold text-danger-700" onClick={() => setShowWhy(true)}>
              {actionNeeded} bitim e&apos;tibor talab qiladi
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-[linear-gradient(180deg,var(--brand-light),var(--surface)_70%)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">AI xulosa</p>
            {fetchedAt && <span className="text-[11px] text-muted">{new Date(fetchedAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
            Rejaga yetish uchun <strong>{fmt(gap)} M so&apos;m</strong> kerak. Muzokara bosqichida <strong>{fmt(negotiationValue(deals))} M</strong> turibdi — bu oyning kaliti shu bitimlar.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-muted">Bugun</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{actionNeeded}</p>
              <p className="text-[10.5px] text-muted">harakat kerak</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-muted">Xavf ostida</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-danger-700">{fmt(atRisk)} M</p>
              <p className="text-[10.5px] text-muted">kechikkan bitimlar</p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
              <p className="text-[9.5px] font-semibold uppercase tracking-wide text-muted">Agentlar</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-success">{agents ? `${agents.active}/${agents.total}` : "…"}</p>
              <p className="text-[10.5px] text-muted">bugun faol</p>
            </div>
          </div>
          <button onClick={() => setShowWhy((v) => !v)} className="mt-2.5 flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
            <Info size={12} /> {showWhy ? "Yopish" : "Nega?"}
          </button>
          {showWhy && (
            <div className="mt-2 space-y-1 border-t border-border pt-2 text-[11px] text-muted">
              <p>Manba: {isReal ? `Bitrix24 — ${count} ta bitim (real)` : "namunaviy ma'lumot (Bitrix ulanmagan)"}</p>
              <p>Hisoblash: Bo&apos;shliq = Reja − Fakt; Forecast = Σ(bitim qiymati × bosqich ehtimolligi); Fakt = shu oyda yopilgan g&apos;olib bitimlar</p>
              <p>Reja: {plan?.setBy === "user" ? "rahbar kiritgan" : "boshlang'ich qiymat, hali kiritilmagan"}</p>
              <p>Yangilangan: {fetchedAt ? new Date(fetchedAt).toLocaleString("uz-UZ") : "—"}</p>
            </div>
          )}
          <a href="#missions" className="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-brand-700">
            Bugungi missiyalarni ko&apos;rish <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </Card>
  );
}
