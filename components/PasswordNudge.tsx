"use client";

// Tavsiya banneri: tizim hali boshlang'ich (.env) parol bilan ochilgan bo'lsa,
// foydalanuvchiga o'z parolini o'rnatishni eslatadi. "Keyinroq" — 3 kunga yopadi;
// parol o'zgartirilgach umuman chiqmaydi (server setBy="user" qaytaradi).
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const KEY = "utax_pw_nudge_until";
const LATER_MS = 3 * 86_400_000;

export function PasswordNudge({ version, onChange }: { version: number; onChange: () => void }) {
  const { lang } = useAppState();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let alive = true;
    try {
      const until = Number(localStorage.getItem(KEY) || 0);
      if (until > Date.now()) return;
    } catch {}
    fetch("/api/password", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b) => { if (alive) setShow(b?.setBy === "env"); })
      .catch(() => {});
    return () => { alive = false; };
  }, [version]);

  if (!show) return null;

  return (
    <div role="status" className="mb-4 flex flex-col gap-3 rounded-card border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ShieldAlert size={18} className="mt-0.5 flex-shrink-0 text-amber-700 dark:text-amber-300" />
        <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-300">{t("pw_nudge_title", lang)}</p>
        <p className="text-[12px] leading-snug text-amber-800 dark:text-amber-300">{t("pw_nudge_body", lang)}</p>
        </div>
      </div>
      <div className="flex gap-2 sm:flex-shrink-0">
        <button
          onClick={() => { try { localStorage.setItem(KEY, String(Date.now() + LATER_MS)); } catch {} setShow(false); }}
          className="h-9 flex-1 rounded-control border border-amber-300 dark:border-amber-700 px-3 sm:flex-none text-[12px] font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:bg-amber-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
        >
          {t("pw_nudge_later", lang)}
        </button>
        <button
          onClick={onChange}
          className="h-9 flex-1 rounded-control bg-amber-700 px-3 sm:flex-none text-[12px] font-semibold text-white hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
        >
          {t("pw_change", lang)}
        </button>
      </div>
    </div>
  );
}
