"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ShieldCheck, Lock, ChevronDown } from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { ROLES, RoleId } from "@/lib/roles";
import { Lang, LANG_LABEL, t } from "@/lib/i18n";
import { VISIBLE_MODULES } from "@/lib/launch-config";

export default function LoginPage() {
  // useSearchParams Suspense chegarasini talab qiladi (Next.js build sharti)
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const { setRoleId, lang, setLang } = useAppState();
  const [selectedRole, setSelectedRole] = useState<RoleId>("ceo");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const params = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Parol serverda tekshiriladi; javobda sessiya cookie'si o'rnatiladi.
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.message || "Kirish amalga oshmadi");
        return;
      }
      setRoleId(selectedRole);
      const role = ROLES.find((r) => r.id === selectedRole);
      const firstVisible = role?.modules.find((m) => VISIBLE_MODULES.includes(m));
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : firstVisible ? `/${firstVisible}` : "/");
      router.refresh();
    } catch {
      setError("Tarmoq xatosi — qayta urinib ko'ring");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f1fc,_#f5f6fa_60%)] p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl md:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden flex-col justify-between bg-brand p-8 text-brand-contrast md:flex">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">UT</div>
              <div>
                <p className="text-sm font-semibold">{t("app_name", lang)}</p>
                <p className="text-[11px] text-white/70">United Tax Advisors</p>
              </div>
            </div>
            <h1 className="mt-10 text-2xl font-semibold leading-snug">{t("login_hero_title", lang)}</h1>
            <p className="mt-3 text-sm text-white/75">{t("login_hero_body", lang)}</p>
          </div>
          <div className="space-y-2 text-xs text-white/60">
            <p>Versiya v1.0 · Maksimal 45 ish kuni</p>
            <p>O&apos;zbek · Русский · English</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="p-8">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("login_title", lang)}</h2>
              <p className="mt-1 text-sm text-muted">{t("login_subtitle", lang)}</p>
            </div>
            <div className="relative flex-shrink-0">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                aria-label={t("role", lang)}
                className="appearance-none rounded-lg border border-border bg-surface py-1.5 pl-3 pr-7 text-xs font-medium text-foreground focus:border-brand focus:outline-none"
              >
                {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
                  <option key={l} value={l}>
                    {LANG_LABEL[l]}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("login_password", lang)}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                {/* Ilgari placeholder "••••••••" edi — maydon to'ldirilgandek
                    ko'rinib, foydalanuvchi hech narsa yozmay "Kirish" bosardi. */}
                <input
                  type="password"
                  required
                  autoFocus
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    e.target.setCustomValidity("");
                  }}
                  onInvalid={(e) =>
                    (e.target as HTMLInputElement).setCustomValidity("Parolni kiriting")
                  }
                  placeholder="Parolni kiriting"
                  className="w-full rounded-lg border border-border py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t("login_demo_role", lang)}</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as RoleId)}
                className="w-full rounded-lg border border-border bg-surface py-2.5 px-3 text-sm focus:border-brand focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {t(`role_label_${r.id}`, lang)} — {t(`role_desc_${r.id}`, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-brand-light px-3 py-2 text-xs text-brand">
              <ShieldCheck size={14} />
              {t("login_2fa", lang)}
            </div>

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-xs font-medium text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-90"
            >
              {busy ? "Tekshirilmoqda..." : t("login_submit", lang)}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted">{t("login_forgot", lang)}</p>
        </div>
      </div>
    </div>
  );
}
