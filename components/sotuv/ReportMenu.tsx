"use client";

// "Hisobot" tugmasi — bosilganda format tanlanadi: PDF, Word, rasm yoki CSV.
import { useEffect, useRef, useState } from "react";
import { FileText, FileType2, Image as ImageIcon, Table2, ChevronDown, Send, Check, Loader2 } from "lucide-react";
import type { ReportModel } from "@/lib/report";
import { exportImage, exportPdf, exportWord, renderImage } from "@/lib/report-export";

export function ReportMenu({ build, onCsv }: { build: () => ReportModel; onCsv: () => void }) {
  const [open, setOpen] = useState(false);
  // Telegramga yuborish holati — foydalanuvchi natijani ko'rishi kerak
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<"ok" | string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const stamp = new Date().toISOString().slice(0, 10);

  async function sendToTelegram() {
    setSending(true);
    setSent(null);
    try {
      const model = build();
      const blob = await renderImage(model);
      if (!blob) throw new Error("Rasm yasalmadi");
      const form = new FormData();
      form.append("photo", blob, `hisobot-${stamp}.png`);
      form.append(
        "caption",
        `${model.title} — ${model.date}\n${model.periodLabel} · ${model.sourceLine}`
      );
      const res = await fetch("/api/report/send", { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      setSent(res.ok && body?.ok ? "ok" : body?.message || "Yuborilmadi");
    } catch (e) {
      setSent(e instanceof Error ? e.message : "Xato");
    } finally {
      setSending(false);
      setTimeout(() => setSent(null), 5000);
    }
  }

  const items = [
    {
      icon: FileType2,
      label: "PDF",
      hint: "chop etish oynasidan saqlanadi",
      run: () => exportPdf(build()),
    },
    {
      icon: FileText,
      label: "Word",
      hint: ".doc — tahrirlash uchun",
      run: () => exportWord(build(), `utax-sotuv-hisoboti-${stamp}.doc`),
    },
    {
      icon: ImageIcon,
      label: "Rasm",
      hint: "PNG — chatga tashlash uchun",
      run: () => exportImage(build(), `utax-sotuv-hisoboti-${stamp}.png`),
    },
    { icon: Table2, label: "CSV", hint: "Excel uchun jadval", run: onCsv },
    {
      icon: Send,
      label: "Telegramga yuborish",
      hint: "rasm sotuv rahbariga ketadi",
      run: sendToTelegram,
    },
  ];

  return (
    <div ref={boxRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-foreground hover:bg-surface-alt"
      >
        <FileText size={13} /> Hisobot
        <ChevronDown size={12} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>

      {(sending || sent) && (
        <span
          className={`absolute right-0 top-10 z-40 flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-medium shadow-brand ${
            sent === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : sent
                ? "border-danger/30 bg-danger-bg text-danger"
                : "border-border bg-surface text-muted"
          }`}
        >
          {sending ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Yuborilmoqda...
            </>
          ) : sent === "ok" ? (
            <>
              <Check size={12} /> Rahbarga yuborildi
            </>
          ) : (
            sent
          )}
        </span>
      )}

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-brand"
        >
          {items.map(({ icon: Icon, label, hint, run }) => (
            <button
              key={label}
              role="menuitem"
              onClick={() => {
                setOpen(false);
                run();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-alt"
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                <Icon size={14} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-foreground">{label}</span>
                <span className="block truncate text-[10px] text-muted">{hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
