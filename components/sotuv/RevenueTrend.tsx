"use client";

// Tushum trendi — Bitrixda yopilgan (g'olib) bitimlar summasi, oy bo'yicha.
// Bitrix ulanmagan bo'lsa grafik chizilmaydi: namunaviy egri chiziq real
// o'sish kabi ko'rinib, noto'g'ri xulosaga olib keladi.
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui";
import { useDealsSource } from "@/lib/deals-context";

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: { revenue: number; deals: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 text-xs shadow-brand">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted">{p.revenue}M so&apos;m</p>
      <p className="text-muted">{p.deals} ta bitim yopilgan</p>
    </div>
  );
}

export function RevenueTrend() {
  const { isReal, monthlyWon, quality } = useDealsSource();
  const data = monthlyWon ?? [];
  const total = data.reduce((s, m) => s + m.revenue, 0);
  const dealCount = data.reduce((s, m) => s + m.deals, 0);
  // Summasi kiritilmagan bitimlar ko'p bo'lsa, egri chiziq pastroq chiqadi.
  const amountsMissing = (quality?.openWithoutAmount ?? 0) > 0;

  if (!isReal || data.length === 0) {
    return (
      <Card title="Tushum trendi" subtitle="Yopilgan bitimlar — oxirgi 6 oy" className="h-full">
        <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
          <TriangleAlert size={20} className="text-muted" />
          <p className="max-w-xs text-xs text-muted">
            Bitrix24 ulanmagan — trend ko&apos;rsatilmaydi. Namunaviy egri chiziq real o&apos;sish kabi
            chalg&apos;itmasligi uchun ataylab chizilmadi.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Tushum trendi"
      subtitle={`Yopilgan bitimlar — 6 oyda ${total}M so'm, ${dealCount} ta bitim`}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted)" }} stroke="var(--line)" tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            stroke="var(--line)"
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => `${v}M`}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--line)" }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--brand)"
            strokeWidth={2.5}
            fill="url(#revenueFill)"
            name="Tushum"
            dot={{ r: 3, fill: "var(--brand)" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {amountsMissing && (
        <p className="mt-1 text-[11px] text-muted">
          Eslatma: summasi kiritilmagan bitimlar 0 deb hisoblanadi — haqiqiy tushum bundan yuqori bo&apos;lishi mumkin.
        </p>
      )}
    </Card>
  );
}
