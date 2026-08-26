"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card } from "@/components/ui";
import { ceoData } from "@/lib/mock-data";

export function RevenueTrend() {
  return (
    <Card title="Tushum trendi" subtitle="Fakt va reja — oxirgi 6 oy" className="h-full">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={ceoData.revenueTrend}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted)" }} stroke="var(--line)" />
          <YAxis tick={{ fontSize: 12, fill: "var(--muted)" }} stroke="var(--line)" />
          <Tooltip />
          <Area type="monotone" dataKey="plan" stroke="var(--muted)" strokeDasharray="4 4" fill="none" name="Reja" />
          <Area type="monotone" dataKey="revenue" stroke="var(--brand)" strokeWidth={2.5} fill="url(#revenueFill)" name="Fakt" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
