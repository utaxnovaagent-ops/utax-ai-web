"use client";

// 6 AI agentning bugungi holati — missiyalar kartasi ostida ixcham qator.
// Manba: /api/agents (serverdagi loop-digest fayllari). Nomlar haqiqiy.
import { useEffect, useState } from "react";
import { SOTUV_AGENTS } from "@/lib/sotuv-agents";

interface AgentRow { id: string; lastActiveAt: string | null; entries: string[]; note?: string; fresh: boolean }

function shortName(name: string) {
  return name.replace(/^UTAX\s+/, "").replace(/\s+AI$/, "");
}

export function AgentsStrip() {
  const [rows, setRows] = useState<AgentRow[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/agents", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j?.ok) return;
        // "faol" — oxirgi 24 soatda yozuv bor; render paytida Date.now() chaqirmaymiz
        const now = Date.now();
        setRows((j.agents as Omit<AgentRow, "fresh">[]).map((r) => ({
          ...r,
          fresh: !!r.lastActiveAt && now - Date.parse(r.lastActiveAt) < 86_400_000,
        })));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const byId = new Map((rows ?? []).map((r) => [r.id, r]));
  const active = (rows ?? []).filter((r) => r.fresh).length;

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-muted">AI agentlar — bugun</p>
        <span className="text-[11px] text-muted">{rows ? `${active}/${SOTUV_AGENTS.length} faol` : "…"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SOTUV_AGENTS.map((a) => {
          const r = byId.get(a.id);
          const fresh = !!r?.fresh;
          const hint = r?.entries?.[0] ?? r?.note ?? (rows ? "bugun yozuv yo'q" : "…");
          return (
            <div key={a.id} className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-2">
              <span className={`h-2 w-2 flex-shrink-0 rounded-full ${fresh ? "bg-success" : "bg-silver"}`} />
              <span className="min-w-0">
                <span className="block truncate text-[11.5px] font-semibold text-foreground">{shortName(a.name)}</span>
                <span className="block truncate text-[10.5px] text-muted" title={hint}>{hint}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
