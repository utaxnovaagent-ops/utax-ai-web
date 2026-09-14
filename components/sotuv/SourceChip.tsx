"use client";

// Sarlavha qatoridagi manba holati: yashil puls · Bitrix24 · bitimlar soni ·
// keyingi yangilanishgacha to'ladigan halqa · vaqt. Ma'lumot sifatidagi
// kamchiliklar alohida lentada emas — faqat kamchilik BO'LGANDA chiqadigan
// sariq tugmada, bosilganda ro'yxat ochiladi.
import { useEffect, useRef, useState } from "react";
import { TriangleAlert, ExternalLink, X } from "lucide-react";
import { useDealsSource } from "@/lib/deals-context";

const REFRESH_MS = 60_000; // deals-context bilan bir xil

export function SourceChip({ sotuvWebUrl }: { sotuvWebUrl: string }) {
  const { isReal, loading, fetchedAt, note, count, quality, won90, lost90 } = useDealsSource();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const boxRef = useRef<HTMLDivElement>(null);

  // Halqa uchun soniya sanagich (callback ichida setState — effekt tanasida emas)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (loading) {
    return (
      <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs text-muted">
        <span className="h-2 w-2 rounded-full bg-silver" /> Bitrix24 ulanmoqda…
      </span>
    );
  }

  if (!isReal) {
    return (
      <span
        title={note ?? undefined}
        className="inline-flex h-8 items-center gap-2 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 text-xs font-medium text-amber-900 dark:text-amber-300"
      >
        <TriangleAlert size={13} /> Namunaviy ma&apos;lumot — Bitrix24 ulanmagan
      </span>
    );
  }

  const fetchedMs = fetchedAt ? Date.parse(fetchedAt) : now;
  const progress = Math.min(1, Math.max(0, (now - fetchedMs) / REFRESH_MS));
  const time = new Date(fetchedMs).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

  // Ma'lumot sifati eslatmalari — raqamlar sahifadagi ko'rsatkichlarga bevosita ta'sir qiladi
  const notes: { n: string; title: string; why: string }[] = [];
  const missing = quality?.openWithoutAmount ?? 0;
  if (missing > 0) {
    notes.push({
      n: String(missing),
      title: `bitimda summa kiritilmagan (${count > 0 ? Math.round((missing / count) * 100) : 0}%)`,
      why: "Pipeline va forecast haqiqiydan past ko'rinadi",
    });
  }
  const closed = (won90 ?? 0) + (lost90 ?? 0);
  if (closed >= 10 && (lost90 ?? 0) / closed < 0.1) {
    notes.push({
      n: String(lost90 ?? 0),
      title: "90 kunda «yo'qotilgan» deb yopilgan bitim",
      why: "Win rate haqiqiydan yuqori — yo'qotishlar CRM'da belgilanmayapti",
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs text-foreground shadow-brand">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50 motion-reduce:hidden" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <b className="font-semibold">Bitrix24</b>
        <span className="h-3.5 w-px bg-border" />
        <span className="tabular-nums">{count} bitim</span>
        <span className="h-3.5 w-px bg-border" />
        <span
          aria-label="keyingi yangilanishgacha"
          title="Har 60 soniyada yangilanadi"
          className="h-4 w-4 rounded-full"
          style={{
            background: `conic-gradient(var(--brand) ${progress * 360}deg, var(--border) 0)`,
            WebkitMask: "radial-gradient(circle, transparent 4.2px, #000 4.8px)",
            mask: "radial-gradient(circle, transparent 4.2px, #000 4.8px)",
          }}
        />
        <span className="tabular-nums text-muted">{time}</span>
      </span>

      {notes.length > 0 && (
        <div ref={boxRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 pl-2 pr-3 text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:bg-amber-900/40"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">{notes.length}</span>
            Ma&apos;lumot sifati
          </button>
          {open && (
            <div className="absolute left-0 z-30 mt-2 w-[340px] rounded-card border border-border bg-surface p-3.5 shadow-brand-hover">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-[11.5px] font-semibold text-muted">Bitrix24 ma&apos;lumotidagi kamchiliklar — sahifadagi ko&apos;rsatkichlarga ta&apos;sir qiladi</p>
                <button onClick={() => setOpen(false)} aria-label="Yopish" className="text-muted hover:text-foreground"><X size={14} /></button>
              </div>
              {notes.map((x) => (
                <div key={x.title} className="flex gap-3 border-t border-border py-2.5 text-xs">
                  <span className="w-10 flex-shrink-0 font-bold tabular-nums text-amber-700 dark:text-amber-300">{x.n}</span>
                  <span>
                    <span className="text-foreground">{x.title}</span>
                    <span className="mt-0.5 block text-muted">{x.why}</span>
                  </span>
                </div>
              ))}
              <a href={sotuvWebUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                Sotuv web&apos;da to&apos;g&apos;rilash <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
