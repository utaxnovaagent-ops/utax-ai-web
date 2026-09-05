"use client";

import { useState } from "react";
import { Download, Plus, X } from "lucide-react";
import { PageHeader, Card } from "@/components/ui";
import { OrgChart } from "@/components/OrgChart";
import { useDepartments } from "@/lib/custom-depts";
import { orgStructure } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

// CSV maydonini xavfsiz o'rash — nom ichida vergul yoki qo'shtirnoq bo'lishi mumkin.
function csvCell(value: string | number) {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function StructurePage() {
  const { lang } = useAppState();
  const { departments, addDepartment } = useDepartments();
  const [formOpen, setFormOpen] = useState(false);

  function exportCsv() {
    const header = ["Bo'lim", "Rahbar", "Xodimlar", "AI qamrovi (%)"];
    const rows = [
      [orgStructure.ceo.name, "CEO", "", ""],
      [orgStructure.director.name, "Direktor", "", ""],
      ...departments.map((d) => [
        d.isCustom ? d.label : t(`nav_${d.key}`, lang),
        d.head,
        d.employees,
        d.aiPercent,
      ]),
    ];
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
    // Excel UTF-8'ni BOM'siz noto'g'ri o'qiydi (o'zbekcha belgilar buziladi).
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utax-tashkiliy-tuzilma-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title={t("structure_title", lang)}
        subtitle={t("structure_subtitle", lang)}
        breadcrumb={[t("structure_breadcrumb_root", lang), t("structure_title", lang)]}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-foreground hover:bg-surface-alt"
          >
            <Download size={15} /> {t("structure_export", lang)}
          </button>
          <button
            onClick={() => setFormOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-lg brand-gradient px-3.5 text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            <Plus size={15} /> {t("structure_add_dept", lang)}
          </button>
        </div>
      </PageHeader>
      <Card>
        <OrgChart />
      </Card>

      {formOpen && (
        <AddDeptDialog
          lang={lang}
          onClose={() => setFormOpen(false)}
          onSubmit={(d) => {
            addDepartment(d);
            setFormOpen(false);
          }}
        />
      )}
    </div>
  );
}

function AddDeptDialog({
  lang,
  onClose,
  onSubmit,
}: {
  lang: Parameters<typeof t>[1];
  onClose: () => void;
  onSubmit: (d: { label: string; head: string; employees: number }) => void;
}) {
  const [label, setLabel] = useState("");
  const [head, setHead] = useState("");
  const [employees, setEmployees] = useState("1");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: "rgba(17,11,32,0.35)" }} onClick={onClose} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!label.trim()) return;
          onSubmit({ label, head, employees: Number(employees) || 0 });
        }}
        className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">{t("structure_add_dept", lang)}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close", lang)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-alt hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t("structure_dept_name", lang)}</label>
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Yuridik bo'lim"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t("orgchart_col_head", lang)}</label>
            <input
              value={head}
              onChange={(e) => setHead(e.target.value)}
              placeholder="Ism Familiya"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">{t("orgchart_col_employees", lang)}</label>
            <input
              type="number"
              min={0}
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-3 rounded-lg bg-surface-alt px-3 py-2 text-[11px] leading-relaxed text-muted">
          {t("structure_dept_local_note", lang)}
        </p>

        <button
          type="submit"
          disabled={!label.trim()}
          className="mt-4 w-full rounded-lg brand-gradient py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t("structure_dept_save", lang)}
        </button>
      </form>
    </div>
  );
}
