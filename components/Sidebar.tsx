"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Wallet,
  Wrench,
  Megaphone,
  TrendingUp,
  Send,
  Users,
  Box,
  ShieldCheck,
  CalendarClock,
  BookUser,
  ClipboardCheck,
  Globe2,
  Network,
} from "lucide-react";
import { useAppState, useCurrentRole } from "@/lib/app-context";
import { ModuleKey } from "@/lib/roles";
import { t } from "@/lib/i18n";
import { VISIBLE_MODULES } from "@/lib/launch-config";
import { UMark } from "@/components/UMark";

const NAV: { key: ModuleKey; href: string; labelKey: string; icon: typeof LayoutDashboard; group: "modules" | "practice" }[] = [
  { key: "ceo", href: "/ceo", labelKey: "nav_ceo", icon: LayoutDashboard, group: "modules" },
  { key: "moliya", href: "/moliya", labelKey: "nav_moliya", icon: Wallet, group: "modules" },
  { key: "it", href: "/it", labelKey: "nav_it", icon: Wrench, group: "modules" },
  { key: "marketing", href: "/marketing", labelKey: "nav_marketing", icon: Megaphone, group: "modules" },
  { key: "sotuv", href: "/sotuv", labelKey: "nav_sotuv", icon: TrendingUp, group: "modules" },
  { key: "telegram", href: "/telegram", labelKey: "nav_telegram", icon: Send, group: "modules" },
  { key: "hr", href: "/hr", labelKey: "nav_hr", icon: Users, group: "modules" },
  { key: "structure", href: "/structure", labelKey: "nav_structure", icon: Network, group: "modules" },
  { key: "campus", href: "/campus", labelKey: "nav_campus", icon: Box, group: "modules" },
  { key: "admin", href: "/admin", labelKey: "nav_admin", icon: ShieldCheck, group: "modules" },
  { key: "calendar", href: "/calendar", labelKey: "nav_calendar", icon: CalendarClock, group: "practice" },
  { key: "clients", href: "/clients", labelKey: "nav_clients", icon: BookUser, group: "practice" },
  { key: "audit", href: "/audit", labelKey: "nav_audit", icon: ClipboardCheck, group: "practice" },
  { key: "international", href: "/international", labelKey: "nav_international", icon: Globe2, group: "practice" },
];

function NavLink({
  item,
  active,
  lang,
  onNavigate,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  lang: Parameters<typeof t>[1];
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none",
        active ? "brand-gradient text-brand-contrast shadow-brand" : "text-foreground hover:bg-surface-alt"
      )}
    >
      <Icon size={20} strokeWidth={2} />
      {t(item.labelKey, lang)}
    </Link>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const role = useCurrentRole();
  const { lang } = useAppState();
  const items = NAV.filter((item) => role.modules.includes(item.key) && VISIBLE_MODULES.includes(item.key));
  const moduleItems = items.filter((i) => i.group === "modules");
  const practiceItems = items.filter((i) => i.group === "practice");

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 z-40 flex h-full w-64 flex-shrink-0 flex-col border-r border-border bg-surface transition-[left] duration-200 md:static",
          open ? "left-0" : "-left-64"
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
            <UMark size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-foreground">{t("app_name", lang)}</p>
            <p className="text-[11px] leading-tight text-muted">{t("app_tagline", lang)}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.length === 0 && (
            <p className="px-2 text-xs text-muted">{t("no_modules_for_role", lang)}</p>
          )}
          {moduleItems.map((item) => (
            <NavLink key={item.key} item={item} active={pathname === item.href} lang={lang} onNavigate={onClose} />
          ))}

          {practiceItems.length > 0 && (
            <>
              <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {t("nav_practice_group", lang)}
              </p>
              {practiceItems.map((item) => (
                <NavLink key={item.key} item={item} active={pathname === item.href} lang={lang} onNavigate={onClose} />
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground">
            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" aria-hidden="true" />
            {t("system_status_online", lang)}
          </p>
          <p className="text-[11px] text-muted">{t("version_footer", lang)}</p>
        </div>
      </aside>
    </>
  );
}
