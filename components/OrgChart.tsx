"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Crown,
  UserCog,
  Users,
  Layers3,
  Briefcase,
  ShieldCheck,
  Eye,
  User,
  X,
  ArrowRight,
  LayoutGrid,
  List as ListIcon,
  Wallet,
  ClipboardCheck,
  Wrench,
  Megaphone,
  TrendingUp,
  Globe2,
  Send,
  Bot,
} from "lucide-react";
import { orgStructure, moliyaData, auditData, itData, marketingData, sotuvData, internationalData, telegramData, hrData } from "@/lib/mock-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { StatCard, Badge } from "@/components/ui";

const deptEmployeeSum = orgStructure.departments.reduce((sum, d) => sum + d.employees, 0);
const TOTAL_STAFF = deptEmployeeSum + 2; // + CEO + Direktor
const LEADERS = orgStructure.departments.length + 2; // dept heads + CEO + Direktor
const AVG_SPAN = Math.round((deptEmployeeSum / orgStructure.departments.length) * 10) / 10;
const MAX_DEPT_SIZE = Math.max(...orgStructure.departments.map((d) => d.employees));
const VIEW_STORAGE_KEY = "utax_orgchart_view";

const DEPT_ICON: Record<string, typeof Wallet> = {
  moliya: Wallet,
  audit: ClipboardCheck,
  it: Wrench,
  marketing: Megaphone,
  sotuv: TrendingUp,
  international: Globe2,
  telegram: Send,
  hr: Users,
};

// Har bo'lim uchun so'nggi AI-agent vazifasi — mavjud modul mock-data'laridan
// olingan haqiqiy namuna (bu yerda o'ylab topilmagan).
const LAST_TASK_BY_DEPT: Record<string, string> = {
  moliya: moliyaData.anomalies[0]?.title ?? "",
  audit: `${auditData.engagements[0]?.client} — ${auditData.engagements[0]?.stage} bosqichi`,
  it: itData.tickets[0]?.title ?? "",
  marketing: marketingData.campaigns[0]?.name ?? "",
  sotuv: `${sotuvData.followUps[0]?.client}: ${sotuvData.followUps[0]?.action}`,
  international: internationalData.cases[0]?.treaty ?? "",
  telegram: telegramData.inbox[0]?.preview ?? "",
  hr: hrData.vacancies[0]?.title ?? "",
};

type Dept = (typeof orgStructure.departments)[number];

interface Geom {
  w: number;
  h: number;
  trunk: string;
  branches: { key: string; d: string }[];
  dot: { x: number; y: number }[];
}

function useOrgConnectors(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  ceoRef: React.RefObject<HTMLDivElement | null>,
  directorRef: React.RefObject<HTMLDivElement | null>,
  deptRefs: React.RefObject<(HTMLButtonElement | null)[]>,
  active: boolean,
  deps: unknown[]
) {
  const [geom, setGeom] = useState<Geom | null>(null);

  const recalc = useCallback(() => {
    const wrap = wrapRef.current;
    const ceoEl = ceoRef.current;
    const dirEl = directorRef.current;
    if (!wrap || !ceoEl || !dirEl) return;
    const wrapRect = wrap.getBoundingClientRect();
    if (wrapRect.width === 0 || wrapRect.height === 0) return;

    const rel = (r: DOMRect) => ({
      x: r.left - wrapRect.left + r.width / 2,
      top: r.top - wrapRect.top,
      bottom: r.top - wrapRect.top + r.height,
    });

    const ceo = rel(ceoEl.getBoundingClientRect());
    const dir = rel(dirEl.getBoundingClientRect());

    const depts = orgStructure.departments
      .map((d, i) => {
        const el = deptRefs.current[i];
        if (!el) return null;
        const r = rel(el.getBoundingClientRect());
        return { key: d.key, ...r };
      })
      .filter((d): d is { key: string; x: number; top: number; bottom: number } => !!d);

    if (depts.length === 0) return;

    const firstDeptTop = Math.min(...depts.map((d) => d.top));
    const barY = dir.bottom + Math.max(16, (firstDeptTop - dir.bottom) / 2);

    const trunk = `M ${ceo.x} ${ceo.bottom} L ${ceo.x} ${(ceo.bottom + dir.top) / 2} L ${dir.x} ${(ceo.bottom + dir.top) / 2} L ${dir.x} ${dir.top} M ${dir.x} ${dir.bottom} L ${dir.x} ${barY}`;

    const branches = depts.map((d) => ({
      key: d.key,
      d: `M ${dir.x} ${barY} L ${d.x} ${barY} L ${d.x} ${d.top}`,
    }));

    const dot = [
      { x: ceo.x, y: ceo.bottom },
      { x: dir.x, y: dir.top },
      { x: dir.x, y: dir.bottom },
      ...depts.map((d) => ({ x: d.x, y: d.top })),
    ];

    setGeom({ w: wrapRect.width, h: wrapRect.height, trunk, branches, dot });
  }, [wrapRef, ceoRef, directorRef, deptRefs]);

  useLayoutEffect(() => {
    if (!active) return;
    // Konteyner o'lchami birinchi renderda hali barqaror bo'lmasligi mumkin
    // (font yuklanishi, hydration) — bir necha kadr davomida qayta hisoblaymiz.
    let frame = 0;
    let raf = 0;
    const tick = () => {
      recalc();
      frame += 1;
      if (frame < 6) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const wrap = wrapRef.current;
    const ro = wrap ? new ResizeObserver(() => recalc()) : null;
    if (wrap && ro) ro.observe(wrap);
    window.addEventListener("resize", recalc);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", recalc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, recalc, ...deps]);

  return geom;
}

function HeroCard({
  icon,
  eyebrow,
  name,
  meta,
  gradient,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  name: string;
  meta: string;
  gradient?: boolean;
}) {
  return (
    <div
      className={gradient ? "rounded-2xl p-[1.5px] brand-gradient shadow-brand" : "rounded-2xl border border-brand/40 bg-surface shadow-brand"}
    >
      <div
        className={
          gradient
            ? "flex items-center gap-3 rounded-[15px] bg-surface px-5 py-3.5"
            : "flex items-center gap-3 px-5 py-3"
        }
      >
        <span
          className={
            gradient
              ? "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full brand-gradient text-white"
              : "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-light text-brand"
          }
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{name}</p>
          <p className="text-[11px] font-medium text-muted">{eyebrow}</p>
        </div>
        <span className="ml-auto flex-shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-semibold text-brand">
          {meta}
        </span>
      </div>
    </div>
  );
}

function DeptCard({
  dept,
  label,
  selected,
  onSelect,
  lang,
  cardRef,
  onHover,
}: {
  dept: Dept;
  label: string;
  selected: boolean;
  onSelect: () => void;
  lang: Parameters<typeof t>[1];
  cardRef: (el: HTMLButtonElement | null) => void;
  onHover: (hovering: boolean) => void;
}) {
  const Icon = DEPT_ICON[dept.key] ?? Users;
  const load = Math.round((dept.employees / MAX_DEPT_SIZE) * 100);
  const isExtra = "isExtra" in dept && dept.isExtra;

  return (
    <button
      ref={cardRef}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-pressed={selected}
      className={`group relative flex w-full flex-col gap-2.5 rounded-2xl border bg-surface p-4 text-left transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        selected
          ? "border-brand bg-brand-light shadow-brand-hover"
          : "border-border shadow-brand hover:-translate-y-0.5 hover:shadow-brand-hover"
      }`}
    >
      {isExtra && (
        <div className="flex justify-end">
          <Badge tone="warning">{t("orgchart_extra_badge", lang)}</Badge>
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: dept.color }}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{label}</p>
          <p className="truncate text-[11px] text-muted">{dept.head}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        <Users size={12} />
        {dept.employees} {t("orgchart_employees", lang)}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-muted">
          <span>{t("orgchart_workload", lang)}</span>
          <span>{load}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-alt">
          <div className="h-full rounded-full" style={{ width: `${load}%`, background: dept.color }} />
        </div>
      </div>

      <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-brand">
        {t("orgchart_view_details", lang)} <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function DepartmentDrawer({ deptKey, lang, onClose }: { deptKey: string; lang: Parameters<typeof t>[1]; onClose: () => void }) {
  const [entered, setEntered] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dept = orgStructure.departments.find((d) => d.key === deptKey);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!dept) return null;
  const label = t(`nav_${dept.key}`, lang);
  const Icon = DEPT_ICON[dept.key] ?? Users;
  const isExtra = "isExtra" in dept && dept.isExtra;
  const load = Math.round((dept.employees / MAX_DEPT_SIZE) * 100);
  const lastTask = LAST_TASK_BY_DEPT[dept.key];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={label}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-brand-900/30 backdrop-blur-[1px] transition-opacity duration-200 motion-reduce:transition-none ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "rgba(17,11,32,0.35)" }}
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-full flex-col overflow-y-auto bg-surface shadow-2xl transition-transform duration-200 ease-out motion-reduce:transition-none sm:max-w-[440px] ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ background: dept.color }}>
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">{label}</p>
              <p className="text-xs text-muted">
                {t("orgchart_detail_head", lang)}: {dept.head}
              </p>
              <span className="mt-1 inline-block">
                {isExtra ? (
                  <Badge tone="warning">{t("orgchart_extra_badge", lang)}</Badge>
                ) : (
                  <Badge tone="success">{t("orgchart_ai_agent_status_active", lang)}</Badge>
                )}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={t("close", lang)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-alt hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-border bg-surface-alt p-3 text-center">
              <p className="text-lg font-bold text-foreground">{dept.employees}</p>
              <p className="text-[10px] text-muted">{t("orgchart_col_employees", lang)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-alt p-3 text-center">
              <p className="text-lg font-bold text-foreground">{load}%</p>
              <p className="text-[10px] text-muted">{t("orgchart_workload", lang)}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface-alt p-3 text-center">
              <p className="text-lg font-bold text-foreground">{isExtra ? "1" : "0"}</p>
              <p className="text-[10px] text-muted">
                {isExtra ? t("orgchart_drawer_vacancy_yes", lang) : t("orgchart_drawer_vacancy_no", lang)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-brand-light p-4">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-brand">
              <Bot size={14} />
              {t("orgchart_ai_agent", lang)}: {label}
            </div>
            <p className="text-xs font-medium text-foreground">{t("orgchart_ai_agent_task", lang)}</p>
            <p className="mt-0.5 text-sm text-foreground">{lastTask}</p>
          </div>

          {isExtra && <p className="text-xs text-warning">{t("orgchart_extra_note", lang)}</p>}

          <Link
            href={`/${dept.key}`}
            className="flex items-center justify-center gap-1.5 rounded-xl brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform hover:-translate-y-0.5 motion-reduce:transition-none"
          >
            {t("orgchart_drawer_open_page", lang)} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function OrgChart() {
  const { lang } = useAppState();
  const [view, setView] = useState<"diagram" | "list">("diagram");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const ceoRef = useRef<HTMLDivElement>(null);
  const directorRef = useRef<HTMLDivElement>(null);
  const deptRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Server har doim "diagram"ni render qiladi (localStorage yo'q) — saqlangan
    // qiymatni faqat mount'dan keyin o'qiymiz, aks holda hydration mismatch bo'ladi.
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "diagram" || saved === "list") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const geom = useOrgConnectors(wrapRef, ceoRef, directorRef, deptRefs, view === "diagram", [lang, view, orgStructure.departments.length]);

  function toggleSelect(key: string) {
    setSelectedKey((prev) => (prev === key ? null : key));
  }

  const diagram = (
    <div ref={wrapRef} className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-8 py-2">
      {geom && (
        <svg
          className="pointer-events-none absolute left-0 top-0"
          width={geom.w}
          height={geom.h}
          viewBox={`0 0 ${geom.w} ${geom.h}`}
          aria-hidden="true"
        >
          <path
            d={geom.trunk}
            fill="none"
            stroke={hoveredKey ? "var(--connector-active)" : "var(--connector)"}
            strokeWidth={1.5}
            className="transition-[stroke] duration-150 motion-reduce:transition-none"
          />
          {geom.branches.map((b) => (
            <path
              key={b.key}
              d={b.d}
              fill="none"
              stroke={hoveredKey === b.key ? "var(--connector-active)" : "var(--connector)"}
              strokeWidth={1.5}
              className="transition-[stroke] duration-150 motion-reduce:transition-none"
            />
          ))}
          {geom.dot.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={2.5} fill="var(--connector)" />
          ))}
        </svg>
      )}

      <div ref={ceoRef} className="relative z-10 w-full max-w-xs">
        <HeroCard
          icon={<Crown size={17} />}
          name={orgStructure.ceo.name}
          eyebrow={t("role_label_ceo", lang)}
          meta={`${TOTAL_STAFF} ${t("orgchart_ceo_meta", lang)}`}
          gradient
        />
      </div>

      <div ref={directorRef} className="relative z-10 w-full max-w-xs">
        <HeroCard
          icon={<UserCog size={15} />}
          name={orgStructure.director.name}
          eyebrow={t("role_label_director", lang)}
          meta={`${orgStructure.departments.length} ${t("orgchart_director_meta", lang)}`}
        />
      </div>

      <div className="relative z-10 grid w-full grid-cols-1 gap-3.5 pt-2 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
        {orgStructure.departments.map((d, i) => (
          <DeptCard
            key={d.key}
            dept={d}
            label={t(`nav_${d.key}`, lang)}
            selected={selectedKey === d.key}
            onSelect={() => toggleSelect(d.key)}
            lang={lang}
            cardRef={(el) => {
              deptRefs.current[i] = el;
            }}
            onHover={(hovering) => setHoveredKey((prev) => (hovering ? d.key : prev === d.key ? null : prev))}
          />
        ))}
      </div>
    </div>
  );

  const list = (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="pb-2 font-medium">{t("orgchart_col_department", lang)}</th>
            <th className="pb-2 font-medium">{t("orgchart_col_head", lang)}</th>
            <th className="pb-2 font-medium">{t("orgchart_col_employees", lang)}</th>
            <th className="pb-2 font-medium">{t("orgchart_col_action", lang)}</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border">
            <td className="py-2.5 font-medium text-foreground">{orgStructure.ceo.name}</td>
            <td className="py-2.5 text-muted">{t("role_label_ceo", lang)}</td>
            <td className="py-2.5 text-muted">{TOTAL_STAFF}</td>
            <td className="py-2.5 text-muted">—</td>
          </tr>
          <tr className="border-b border-border">
            <td className="py-2.5 font-medium text-foreground">{orgStructure.director.name}</td>
            <td className="py-2.5 text-muted">{t("role_label_director", lang)}</td>
            <td className="py-2.5 text-muted">
              {orgStructure.departments.length} {t("orgchart_director_meta", lang)}
            </td>
            <td className="py-2.5 text-muted">—</td>
          </tr>
          {orgStructure.departments.map((d) => (
            <tr key={d.key} className="border-b border-border last:border-0">
              <td className="max-w-[140px] py-2.5 sm:max-w-none">
                <span className="flex items-center gap-2 whitespace-nowrap font-medium text-foreground">
                  <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: d.color }} />
                  {t(`nav_${d.key}`, lang)}
                </span>
                {"isExtra" in d && d.isExtra && (
                  <span className="mt-1 block w-fit">
                    <Badge tone="warning">{t("orgchart_extra_badge", lang)}</Badge>
                  </span>
                )}
              </td>
              <td className="py-2.5 text-muted">{d.head}</td>
              <td className="py-2.5 text-muted">{d.employees}</td>
              <td className="py-2.5">
                <button onClick={() => toggleSelect(d.key)} className="text-xs font-medium text-brand hover:underline">
                  {t("orgchart_view_details", lang)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:flex-1 lg:grid-cols-4">
          <StatCard
            label={t("orgchart_stat_total", lang)}
            value={String(TOTAL_STAFF)}
            hint={t("orgchart_stat_total_hint", lang)}
            icon={<Users size={18} />}
          />
          <StatCard
            label={t("orgchart_stat_leaders", lang)}
            value={String(LEADERS)}
            hint={t("orgchart_stat_leaders_hint", lang)}
            icon={<UserCog size={18} />}
          />
          <StatCard
            label={t("orgchart_stat_span", lang)}
            value={String(AVG_SPAN)}
            hint={t("orgchart_stat_span_hint", lang)}
            icon={<Layers3 size={18} />}
          />
          <StatCard
            label={t("orgchart_stat_vacancies", lang)}
            value={String(orgStructure.vacancies)}
            hint={t("orgchart_stat_vacancies_hint", lang)}
            icon={<Briefcase size={18} />}
            tone="warning"
          />
        </div>
        <div className="hidden flex-shrink-0 items-center gap-1 self-start rounded-lg border border-border p-1 md:flex">
          <button
            onClick={() => setView("diagram")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none ${
              view === "diagram" ? "brand-gradient text-brand-contrast" : "text-foreground hover:bg-surface-alt"
            }`}
          >
            <LayoutGrid size={13} /> {t("orgchart_view_diagram", lang)}
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors motion-reduce:transition-none ${
              view === "list" ? "brand-gradient text-brand-contrast" : "text-foreground hover:bg-surface-alt"
            }`}
          >
            <ListIcon size={13} /> {t("orgchart_view_list", lang)}
          </button>
        </div>
      </div>

      {view === "diagram" ? (
        <>
          <p className="mb-3 hidden text-center text-[11px] text-muted md:block">{t("orgchart_hover_hint", lang)}</p>
          <div className="hidden overflow-x-auto py-2 md:block">{diagram}</div>
          <div className="md:hidden">{list}</div>
        </>
      ) : (
        list
      )}

      {selectedKey && <DepartmentDrawer deptKey={selectedKey} lang={lang} onClose={() => setSelectedKey(null)} />}

      {/* Support & external roles */}
      <div className="mt-8 w-full rounded-2xl border border-border bg-brand-light/40 p-5">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">
          {t("orgchart_platform_roles_title", lang)}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {orgStructure.support.map((s) => (
            <div key={s.key} className="flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-surface px-3.5 py-3">
              {s.key === "admin" ? <ShieldCheck size={16} className="flex-shrink-0 text-muted" /> : <Eye size={16} className="flex-shrink-0 text-muted" />}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{t(`role_label_${s.key}`, lang)}</p>
                <p className="truncate text-[10px] text-muted">{t(`role_desc_${s.key}`, lang)}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-surface px-3.5 py-3">
            <User size={16} className="flex-shrink-0 text-muted" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">{t("role_label_client", lang)}</p>
              <p className="truncate text-[10px] text-muted">{t("role_desc_client", lang)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
