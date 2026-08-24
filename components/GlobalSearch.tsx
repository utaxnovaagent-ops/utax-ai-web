"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Users,
  Wrench,
  ClipboardCheck,
  CalendarClock,
  Bot,
  Briefcase,
  Megaphone,
  TrendingUp,
  Globe2,
  UserCog,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { searchItems, SearchItem, SearchType } from "@/lib/search-index";

const TYPE_ICON: Record<SearchType, typeof Users> = {
  client: Users,
  ticket: Wrench,
  audit: ClipboardCheck,
  deadline: CalendarClock,
  agent: Bot,
  vacancy: Briefcase,
  campaign: Megaphone,
  lead: TrendingUp,
  international: Globe2,
  user: UserCog,
};

export function GlobalSearch() {
  const { lang } = useAppState();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchItems(query), [query]);
  const grouped = useMemo(() => {
    const groups = new Map<SearchType, SearchItem[]>();
    for (const item of results) {
      const list = groups.get(item.type) ?? [];
      list.push(item);
      groups.set(item.type, list);
    }
    return Array.from(groups.entries());
  }, [results]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goTo(item: SearchItem) {
    router.push(item.href);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={wrapRef} className="relative hidden max-w-lg flex-1 md:block">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          if (e.key === "Enter" && results[0]) goTo(results[0]);
        }}
        placeholder={t("search_placeholder", lang)}
        className="h-10 w-full rounded-lg border border-border bg-surface-alt py-2 pl-9 pr-14 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted lg:flex">
        &#8984;K
      </kbd>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-surface py-2 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">{t("search_no_results", lang)}</p>
          ) : (
            grouped.map(([type, items]) => {
              const Icon = TYPE_ICON[type];
              return (
                <div key={type} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {t(`search_type_${type}`, lang)}
                  </p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => goTo(item)}
                      className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left hover:bg-surface-alt"
                    >
                      <Icon size={14} className="shrink-0 text-brand" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">{item.title}</span>
                        <span className="block truncate text-xs text-muted">{item.subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
