"use client";

// "Hisobot" tugmasi — bosilganda format tanlanadi: PDF, Word, rasm yoki CSV.
import { useEffect, useRef, useState } from "react";
import { FileText, FileType2, Image as ImageIcon, Table2, ChevronDown } from "lucide-react";
import type { ReportModel } from "@/lib/report";
import { exportImage, exportPdf, exportWord } from "@/lib/report-export";

export function ReportMenu({ build, onCsv }: { build: () => ReportModel; onCsv: () => void }) {
  const [open, setOpen] = useState(false);
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
