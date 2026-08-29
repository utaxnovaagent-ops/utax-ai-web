"use client";

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

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: Deal }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 text-xs shadow-brand">
      <p className="font-semibold text-foreground">{d.client}</p>
      <p className="text-muted">
        {d.value}M so'm · {d.stage}
      </p>
      <p className="text-muted">Oxirgi aloqa: {d.lastContactDaysAgo} kun oldin</p>
      <p className="text-muted">Keyingi qadam: {d.nextAction}</p>
    </div>
  );
}

export function DealRiskRadar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const allDeals = useDeals();
  const deals = openDeals(allDeals);

  return (
    <Card title="Deal Risk Radar" subtitle="Qiymat × yopilish ehtimoli — rang risk darajasi" className="h-full">
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 10, left: 0 }}>
          <XAxis
            type="number"
            dataKey="probability"
            name="Ehtimollik"
            unit="%"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            stroke="var(--line)"
          />
          <YAxis
            type="number"
            dataKey="value"
            name="Qiymat"
            unit="M"
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            stroke="var(--line)"
          />
          <ZAxis range={[80, 80]} />
          <ReferenceLine x={50} stroke="var(--line)" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={deals} onMouseEnter={(d) => setHovered((d as unknown as Deal).id)} onMouseLeave={() => setHovered(null)}>
            {deals.map((d) => (
              <Cell key={d.id} fill={RISK_COLOR[d.risk]} opacity={hovered && hovered !== d.id ? 0.35 : 1} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-muted">
        {(Object.keys(RISK_COLOR) as Deal["risk"][]).map((r) => (
          <span key={r} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: RISK_COLOR[r] }} />
            {r === "yuqori" ? "Yuqori risk" : r === "o'rta" ? "O'rta risk" : "Past risk"}
          </span>
        ))}
      </div>
    </Card>
  );
}
