"use client";

// Agentlarning haqiqiy faoliyati — serverdagi o'z xotira fayllaridan o'qiladi.
// Maqsad: agent nima ish qilgani ko'rinib tursin, fayl ichida qolib ketmasin.
import { useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";
import { Card } from "@/components/ui";
import type { AgentActivity as AgentActivityRow } from "@/app/api/agents/route";

function sinceLabel(iso: string | null) {
  if (!iso) return "faoliyat yozilmagan";
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.round(hours / 24)} kun oldin`;
}

// 24 soat ichida yozgan bo'lsa — bugun ishlagan.
function isFresh(iso: string | null) {
  return !!iso && Date.now() - Date.parse(iso) < 24 * 3600_000;
}

export function AgentActivity() {
  const [rows, setRows] = useState<AgentActivityRow[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/agents")
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.ok) setRows(j.agents as AgentActivityRow[]);
        else if (alive) setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  if (failed) return null;

  const withWork = (rows ?? []).filter((r) => r.entries.length > 0);
  const freshCount = (rows ?? []).filter((r) => isFresh(r.lastActiveAt)).length;

  return (
    <Card
      title="Agentlar bugun nima qildi"
      subtitle={
        rows
          ? `${freshCount} ta agent oxirgi 24 soatda ishladi — quyida ularning o'z xulosalari`
          : "Yuklanmoqda..."
      }
    >
      {!rows ? (
        <div className="h-24 animate-pulse rounded-xl bg-surface-alt" />
      ) : withWork.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted">
          Agentlar hali xulosa yozmagan — avtonom kuzatuv sikli ish kunida har 2 soatda ishlaydi.
        </p>
      ) : (
        <ul className="space-y-3">
          {withWork.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-surface p-3.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      isFresh(r.lastActiveAt) ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50" : "bg-surface-alt text-muted"
                    }`}
                  >
                    <Activity size={12} />
                  </span>
                  <p className="text-sm font-semibold text-foreground">{r.name}</p>
                </div>
                <span className="flex flex-shrink-0 items-center gap-1 text-[11px] text-muted">
                  <Clock size={11} />
                  {sinceLabel(r.lastActiveAt)}
                </span>
              </div>
              <ul className="space-y-1.5">
                {r.entries.map((e, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-foreground">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-brand" />
                    <span className="min-w-0">{e}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
