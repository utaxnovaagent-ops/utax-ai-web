"use client";

// Deal Risk Radar — ochiq bitimlar: qiymat × yopilish ehtimoli, rangi risk darajasi.
// Grafik yonida risk SABABLARI ham ko'rsatiladi: chiroyli nuqtalar o'zi
// "nima qilish kerak"ni aytmaydi.
import { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { Card } from "@/components/ui";
import { openDeals, type Deal } from "@/lib/sales-metrics";
import { useDeals } from "@/lib/deals-context";

const RISK_COLOR: Record<Deal["risk"], string> = {
  yuqori: "#DC2626",
  "o'rta": "#D97706",
  past: "#16A34A",
};

const STALE_DAYS = 14;

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Deal }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="max-w-[240px] rounded-lg border border-border bg-surface p-2.5 text-xs shadow-brand">
      <p className="font-semibold text-foreground">{d.client}</p>
      <p className="text-muted">
        {d.value}M so&apos;m · {d.stage}
      </p>
      <p className="text-muted">Oxirgi aloqa: {d.lastContactDaysAgo} kun oldin</p>
      <p className="mt-1 text-foreground">{d.nextAction}</p>
    </div>
  );
}

export function DealRiskRadar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const allDeals = useDeals();
  const deals = openDeals(allDeals);

  // Risk sabablari — bittada bir nechtasi bo'lishi mumkin, shuning uchun alohida sanaladi.
  const stale = deals.filter((d) => d.lastContactDaysAgo >= STALE_DAYS);
  const noAmount = deals.filter((d) => d.value === 0);
  const highRisk = deals.filter((d) => d.risk === "yuqori");
  // Eng katta yo'qotish xavfi — qiymati bor, lekin uzoq vaqt tegilmagan bitimlar.
  const topAtRisk = [...deals]
    .filter((d) => d.value > 0 && d.lastContactDaysAgo >= STALE_DAYS)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return (
    <Card
      title="Deal Risk Radar"
      subtitle={`${deals.length} ta ochiq bitim — qiymat × ehtimollik, rang risk darajasi`}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 10, right: 12, bottom: 4, left: -8 }}>
          <XAxis
            type="number"
            dataKey="probability"
            name="Ehtimollik"
            unit="%"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            stroke="var(--line)"
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="value"
            name="Qiymat"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            stroke="var(--line)"
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => `${v}M`}
          />
          <ZAxis range={[70, 70]} />
          <ReferenceLine x={50} stroke="var(--line)" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter
            data={deals}
            onMouseEnter={(d) => setHovered((d as unknown as Deal).id)}
            onMouseLeave={() => setHovered(null)}
          >
            {deals.map((d) => (
              <Cell key={d.id} fill={RISK_COLOR[d.risk]} opacity={hovered && hovered !== d.id ? 0.3 : 0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Sabablar — "nega qizil" degan savolga javob */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-border bg-surface-alt px-2 py-2">
          <p className="text-sm font-bold text-danger">{highRisk.length}</p>
          <p className="text-[10px] leading-tight text-muted">Yuqori risk</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-alt px-2 py-2">
          <p className="text-sm font-bold text-warning">{stale.length}</p>
          <p className="text-[10px] leading-tight text-muted">{STALE_DAYS}+ kun aloqasiz</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-alt px-2 py-2">
          <p className="text-sm font-bold text-foreground">{noAmount.length}</p>
          <p className="text-[10px] leading-tight text-muted">Summasi yo&apos;q</p>
        </div>
      </div>

      {topAtRisk.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Eng katta yo&apos;qotish xavfi</p>
          <ul className="space-y-1">
            {topAtRisk.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-foreground">{d.client}</span>
                <span className="flex-shrink-0 text-muted">
                  {d.value}M · {d.lastContactDaysAgo} kun
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
