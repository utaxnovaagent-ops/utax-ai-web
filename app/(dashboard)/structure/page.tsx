"use client";

import { Download, UserPlus } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";
import { OrgChart } from "@/components/OrgChart";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

export default function StructurePage() {
  const { lang } = useAppState();

  return (
    <div>
      <PageHeader
        title={t("structure_title", lang)}
        subtitle={t("structure_subtitle", lang)}
        breadcrumb={[t("structure_breadcrumb_root", lang), t("structure_title", lang)]}
      >
        <div className="flex items-center gap-2">
          <button className="flex h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-foreground hover:bg-surface-alt">
            <Download size={15} /> {t("structure_export", lang)}
          </button>
          <button className="flex h-10 items-center gap-1.5 rounded-lg brand-gradient px-3.5 text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 motion-reduce:transition-none">
            <UserPlus size={15} /> {t("structure_add_employee", lang)}
          </button>
        </div>
      </PageHeader>
      <Card>
        <OrgChart />
      </Card>
    </div>
  );
}
