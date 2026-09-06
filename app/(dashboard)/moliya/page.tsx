"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { AlertOctagon } from "lucide-react";
import { PageHeader, Card, Badge, toneForLevel } from "@/components/ui";
import { moliyaData } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

export default function MoliyaPage() {
  const { lang } = useAppState();

  return (
    <div>
      <PageHeader title={t("moliya_title", lang)} subtitle={t("moliya_subtitle", lang)} />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card title={t("moliya_cashflow_title", lang)} subtitle={t("moliya_cashflow_subtitle", lang)} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={moliyaData.cashflow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="kirim" stroke="#1677FF" fill="#1677FF" fillOpacity={0.15} strokeWidth={2} name={t("income", lang)} />
              <Area type="monotone" dataKey="chiqim" stroke="#b91c1c" fill="#b91c1c" fillOpacity={0.1} strokeWidth={2} name={t("expense", lang)} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t("moliya_anomalies_title", lang)} subtitle={t("moliya_anomalies_subtitle", lang)}>
          <ul className="space-y-3">
            {moliyaData.anomalies.map((a) => (
              <li key={a.title} className="flex items-start gap-2 rounded-lg border border-border p-3">
                <AlertOctagon size={15} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="text-sm text-foreground">{a.title}</p>
                  <Badge tone={toneForLevel(a.severity)}>{a.severity}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t("moliya_planfact_title", lang)} subtitle={t("moliya_planfact_subtitle", lang)}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={moliyaData.planFact}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="#6b7280" interval={0} angle={-10} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="plan" fill="#B8C2CF" name={t("plan", lang)} radius={[4, 4, 0, 0]} />
              <Bar dataKey="fact" fill="#1677FF" name={t("fact", lang)} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t("moliya_receivables_title", lang)} subtitle={t("moliya_receivables_subtitle", lang)}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="pb-2 font-medium">{t("col_client", lang)}</th>
                  <th className="pb-2 font-medium">{t("col_amount", lang)}</th>
                  <th className="pb-2 font-medium">{t("col_days", lang)}</th>
                  <th className="pb-2 font-medium">{t("col_risk", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {moliyaData.receivables.map((r) => (
                  <tr key={r.client} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium text-foreground">{r.client}</td>
                    <td className="py-2.5 text-muted">{r.amount}</td>
                    <td className="py-2.5 text-muted">{r.days}</td>
                    <td className="py-2.5">
                      <Badge tone={toneForLevel(r.risk)}>{r.risk}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
