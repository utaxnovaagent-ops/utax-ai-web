"use client";

// Parolni o'zgartirish oynasi — Sotuv Desk'dagi "Parolni o'zgartirish" bilan
// bir xil mantiq: joriy parol qayta so'raladi, yangisi ikki marta kiritiladi.
import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const MIN = 12;
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700";

export function PasswordDialog({ open, onClose, onChanged }: { open: boolean; onClose: () => void; onChanged: () => void }) {
  const { lang } = useAppState();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  // Maydonlarni tozalash effekti yo'q: layout har ochilishda `key` ni o'zgartiradi,
  // komponent yangidan yaratiladi.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => firstRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(id); document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const tooShort = next.length > 0 && next.length < MIN;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && next.length >= MIN && next === confirm && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.ok) {
        setError(body?.message || "Saqlab bo'lmadi");
        return;
      }
      setDone(true);
      onChanged();
      setTimeout(onClose, 1800);
    } catch {
      setError("Tarmoq xatosi — qayta urinib ko'ring");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "h-10 w-full rounded-control border border-border bg-surface px-3 pr-10 text-sm text-foreground " +
    `placeholder:text-muted focus:border-brand ${FOCUS}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pw-title"
        className="w-full max-w-[400px] rounded-card border border-border bg-surface p-5 shadow-brand-hover"
      >
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand-700">
            <KeyRound size={17} />
          </span>
          <h2 id="pw-title" className="flex-1 text-[15px] font-semibold text-foreground">{t("pw_change", lang)}</h2>
          <button type="button" onClick={onClose} aria-label={t("close", lang)} className={`flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-alt ${FOCUS}`}>
            <X size={16} />
          </button>
        </div>

        {done ? (
          <p className="rounded-control border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2.5 text-[12.5px] font-medium text-emerald-800 dark:text-emerald-300">
            {t("pw_changed", lang)}
          </p>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted">{t("pw_current", lang)}</span>
              <span className="relative block">
                <input ref={firstRef} type={show ? "text" : "password"} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={field} />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={t(show ? "login_hide_password" : "login_show_password", lang)} className={`absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-foreground ${FOCUS}`}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </span>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted">{t("pw_new", lang)}</span>
              <input type={show ? "text" : "password"} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={field} />
              <span className={`mt-1 block text-[11px] ${tooShort ? "text-danger-700" : "text-muted"}`}>{t("pw_min", lang).replace("{n}", String(MIN))}</span>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted">{t("pw_confirm", lang)}</span>
              <input type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
              {mismatch && <span className="mt-1 block text-[11px] text-danger-700">{t("pw_mismatch", lang)}</span>}
            </label>

            {error && (
              <p role="alert" className="rounded-control border border-danger/30 bg-danger-bg px-3 py-2 text-[12px] font-medium text-danger-700">{error}</p>
            )}

            <p className="text-[11px] leading-snug text-muted">{t("pw_note", lang)}</p>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className={`h-10 rounded-control border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-alt ${FOCUS}`}>
                {t("close", lang)}
              </button>
              <button type="submit" disabled={!canSave} aria-busy={busy} className={`h-10 rounded-control bg-[linear-gradient(135deg,#0b4fb0,#0f62d6_55%,#1560d8)] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:bg-none disabled:bg-[#3a5f8f] ${FOCUS}`}>
                {busy ? t("pw_saving", lang) : t("pw_save", lang)}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
