"use client";

// Sotuv bo'limi tuzilmasi — faqat haqiqatda ishlab turgan agentlar.
// Ustunlar mijoz yo'lining bosqichlari (lid kiradi → bitim ustida ishlanadi →
// sotuvdan keyin xizmat), tepasida qaror qabul qiluvchi bo'lim boshlig'i.
// Har agent yonidagi holat /api/agents'dan — o'ylab topilmagan, fayl vaqti.
import { useEffect, useState } from "react";
import { Bot, Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui";
import { SOTUV_OWNER, SOTUV_AGENTS, SOTUV_STAGES, type SotuvStage } from "@/lib/sotuv-agents";

// Bosqich rangi — mijoz yo'li bo'ylab sovuqdan issiqqa.
const ACCENT: Record<SotuvStage, { text: string; dot: string; ring: string; soft: string }> = {
  kirish: {
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    ring: "ring-sky-200 dark:ring-sky-900/60",
    soft: "bg-sky-50/70 dark:bg-sky-950/30",
  },
  jarayon: {
    text: "text-brand",
    dot: "bg-brand",
    ring: "ring-brand/25",
    soft: "bg-brand-light/50",
  },
  keyin: {
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200 dark:ring-emerald-900/60",
    soft: "bg-emerald-50/70 dark:bg-emerald-950/30",
  },
};

function since(iso: string | null) {
  if (!iso) return null;
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 60) return `${mins} daq oldin`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.round(h / 24)} kun oldin`;
}

export function SotuvStructure() {
  const [activity, setActivity] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let alive = true;
    fetch("/api/agents")
      .then((r) => r.json())
      .then((j) => {
        if (!alive || !j?.ok) return;
        const map: Record<string, string | null> = {};
        for (const a of j.agents as { id: string; lastActiveAt: string | null }[]) map[a.id] = a.lastActiveAt;
        setActivity(map);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const live = SOTUV_AGENTS.filter((a) => a.status === "live").length;

  return (
    <Card
      title="Sotuv bo'limi tuzilmasi"
      subtitle={`${SOTUV_AGENTS.length} ta agent · ${live} tasi ishlab turibdi · har biri serverda alohida xizmat`}
    >
      <div className="flex flex-col items-center pt-1">
        {/* Bo'lim boshlig'i — qaror shu yerda tugaydi */}
        <div className="rounded-2xl p-[1.5px] brand-gradient shadow-brand">
          <div className="rounded-[15px] bg-surface px-6 py-3 text-center">
            <p className="text-sm font-bold text-foreground">{SOTUV_OWNER.name}</p>
            <p className="text-[11px] text-muted">{SOTUV_OWNER.role}</p>
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">
              <Check size={10} /> yakuniy qaror
            </p>
          </div>
        </div>

        {/* Ulagich: boshliqdan pastga, so'ng uch bosqichga shoxlanadi */}
        <div className="h-5 w-px bg-border" />
        <span className="rounded-full border border-border bg-surface-alt px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          signal va tavsiya
        </span>
        <div className="h-5 w-px bg-border" />
        <div className="hidden w-full grid-cols-3 md:grid">
          {SOTUV_STAGES.map((s, i) => (
            <div key={s.id} className="relative h-5">
              <div
                className={`absolute top-0 h-px bg-border ${
                  i === 0 ? "left-1/2 right-0" : i === SOTUV_STAGES.length - 1 ? "left-0 right-1/2" : "left-0 right-0"
                }`}
              />
              <div className="absolute left-1/2 top-0 h-5 w-px bg-border" />
            </div>
          ))}
        </div>

        {/* Bosqichlar */}
        <div className="grid w-full gap-3 md:grid-cols-3">
          {SOTUV_STAGES.map((stage, idx) => {
            const accent = ACCENT[stage.id];
            const agents = SOTUV_AGENTS.filter((a) => a.stage === stage.id);
            return (
              <div key={stage.id} className={`rounded-2xl p-3 ring-1 ${accent.ring} ${accent.soft}`}>
                <div className="mb-2.5 flex items-center gap-2">
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${accent.dot}`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${accent.text}`}>{stage.label}</p>
                    <p className="truncate text-[10px] text-muted">{stage.hint}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {agents.map((a) => {
                    const last = activity[a.id] ?? null;
                    const fresh = !!last && Date.now() - Date.parse(last) < 24 * 3600_000;
                    return (
                      <div
                        key={a.id}
                        className="group rounded-xl border border-border bg-surface px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-brand motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg ${accent.soft} ${accent.text}`}>
                            <Bot size={12} />
                          </span>
                          <p className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">{a.name}</p>
                          {/* Jonli holat — bugun ishlagan bo'lsa pulsatsiya qiladi */}
                          <span className="relative flex h-2 w-2 flex-shrink-0" title={fresh ? "bugun ishladi" : "faoliyat eski"}>
                            {fresh && (
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                            )}
                            <span
                              className={`relative inline-flex h-2 w-2 rounded-full ${fresh ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}
                            />
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2 pl-8">
                          <p className="min-w-0 truncate text-[10px] text-muted">{a.role}</p>
                          {last && <p className="flex-shrink-0 text-[10px] text-muted">{since(last)}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Yo'nalish — mijoz chapdan o'ngga harakatlanadi */}
        <div className="mt-3 hidden items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-muted md:flex">
          <span>mijoz yo&apos;li</span>
          <ArrowRight size={12} />
        </div>

        <p className="mt-2 max-w-xl text-center text-[11px] leading-relaxed text-muted">
          Agentlar mijoz bilan ishlaydi va fakt yig&apos;adi; qaysi bitimga va qaysi mijozga e&apos;tibor berish
          kerakligini {SOTUV_OWNER.name} hal qiladi.
        </p>
      </div>
    </Card>
  );
}
