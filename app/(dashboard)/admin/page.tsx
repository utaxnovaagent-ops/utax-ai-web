"use client";

import { Users2, Plug, ScrollText, Cpu } from "lucide-react";
import { PageHeader, Card, StatCard, Badge, toneForLevel } from "@/components/ui";
import { OrgChart } from "@/components/OrgChart";
import { adminData } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { useLocalActions } from "@/lib/local-actions";
import { t } from "@/lib/i18n";

export default function AdminPage() {
  const { lang } = useAppState();
  // Foydalanuvchi qo'shish: backend hali yo'q — ro'yxat shu brauzerda saqlanadi
  const extraUsers = useLocalActions("utax_admin_users");

  function addUser() {
    const name = window.prompt("Xodimning ism-familiyasi:")?.trim();
    if (!name) return;
    const role = window.prompt("Roli (masalan: Auditor, Bo'lim boshlig'i):")?.trim() || "Xodim";
    extraUsers.set(name, role);
  }

  return (
    <div>
      <PageHeader title={t("admin_title", lang)} subtitle={t("admin_subtitle", lang)} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t("admin_ai_tokens", lang)} value={adminData.aiCost.monthTokens} delta="~90% kvota" trend="flat" />
        <StatCard label={t("admin_ai_cost", lang)} value={adminData.aiCost.monthCost} delta="+$18" trend="down" />
        <StatCard label={t("admin_ai_latency", lang)} value={adminData.aiCost.avgLatency} delta="-0.3s" trend="up" />
      </div>

      <Card className="mb-6" title={t("admin_orgchart_title", lang)} subtitle={t("admin_orgchart_subtitle", lang)}>
        <OrgChart />
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card
          title={t("admin_users_title", lang)}
          subtitle={t("admin_users_subtitle", lang)}
          action={
            <button
              onClick={addUser}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-contrast hover:opacity-90"
            >
              <Users2 size={13} /> {t("admin_new_user", lang)}
            </button>
          }
        >
          <div className="space-y-2.5">
            {adminData.users.map((u) => (
              <div key={u.name} className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted">
                    {u.role} · {u.lastLogin}
                  </p>
                </div>
                <Badge tone={toneForLevel(u.status)}>{u.status}</Badge>
              </div>
            ))}
            {Object.entries(extraUsers.state).map(([name, role]) => (
              <div key={name} className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <p className="text-xs text-muted">{role} · qo&apos;shildi (shu brauzerda)</p>
                </div>
                <button
                  onClick={() => extraUsers.set(name, null)}
                  className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-foreground hover:bg-surface-alt"
                >
                  O&apos;chirish
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("admin_integrations_title", lang)} subtitle={t("admin_integrations_subtitle", lang)}>
          <div className="space-y-2.5">
            {adminData.integrations.map((i) => (
              <div key={i.name} className="flex items-center justify-between gap-3 border-b border-border pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Plug size={14} className="text-muted" />
                  <span className="text-sm text-foreground">{i.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{i.lastSync}</span>
                  <Badge tone={toneForLevel(i.status)}>{i.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title={t("admin_audit_title", lang)}
        subtitle={t("admin_audit_subtitle", lang)}
        action={<ScrollText size={16} className="text-muted" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="pb-2 font-medium">{t("col_time", lang)}</th>
                <th className="pb-2 font-medium">{t("col_actor", lang)}</th>
                <th className="pb-2 font-medium">{t("col_action", lang)}</th>
                <th className="pb-2 font-medium">{t("col_object", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {adminData.auditLog.map((a, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-mono text-xs text-muted">{a.time}</td>
                  <td className="py-2.5 text-foreground">{a.actor}</td>
                  <td className="py-2.5 text-muted">{a.action}</td>
                  <td className="py-2.5 font-mono text-xs text-muted">{a.object}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <Cpu size={13} />
          {t("admin_audit_footnote", lang)}
        </div>
      </Card>
    </div>
  );
}
