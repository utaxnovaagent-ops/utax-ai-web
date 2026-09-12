"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutGrid,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAppState } from "@/lib/app-context";
import { ROLES, RoleId } from "@/lib/roles";
import { Lang, LANG_LABEL, t } from "@/lib/i18n";
import { VISIBLE_MODULES } from "@/lib/launch-config";
import { UMark } from "@/components/UMark";

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
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [hintOpen, setHintOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const params = useSearchParams();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      // Parol serverda tekshiriladi; javobda sessiya cookie'si o'rnatiladi.
      // remember=false bo'lsa cookie brauzer yopilishi bilan o'chadi.
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, remember }),
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

  // Maydonlar bir xil o'lchamda: telefonda 44px (barmoq nishoni), 16px shrift
  // — iOS Safari 16px dan kichik maydonga fokuslanganda sahifani kattalashtiradi.
  const field =
    "h-11 w-full rounded-control border border-border bg-surface px-3 text-[16px] text-foreground " +
    "placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 sm:h-10 sm:text-sm";

  const features = [
    { icon: LayoutGrid, key: "login_feature_1" },
    { icon: Bot, key: "login_feature_2" },
    { icon: Users, key: "login_feature_3" },
  ];

  return (
    <div className="flex min-h-[100svh] w-full items-start justify-center bg-background px-4 pb-8 pt-[4vh] sm:items-center sm:bg-[radial-gradient(70%_55%_at_50%_-10%,var(--color-brand-light),transparent_70%)] sm:pt-4">
      <div className="w-full max-w-[400px] overflow-hidden rounded-card border border-border bg-surface shadow-brand lg:grid lg:max-w-[920px] lg:grid-cols-[1fr_400px]">
        {/* Telefonda brend paneli o'rniga — ingichka gradient chiziq */}
        <div className="brand-gradient h-[3px] lg:hidden" />

        {/* Chap brend paneli — faqat kengroq ekranda */}
        <div className="brand-gradient relative hidden flex-col justify-between overflow-hidden p-9 text-white lg:flex">
          {/* Bezak: yumshoq halqalar — hech qanday ma'lumot tashimaydi */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/15" />
          <div aria-hidden className="pointer-events-none absolute -right-4 top-24 h-72 w-72 rounded-full border border-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
              <UMark size={26} />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">{t("app_name", lang)}</span>
              <span className="block text-[11px] text-white/70">United Tax Advisors</span>
            </span>
          </div>

          <div className="relative mt-10">
            <h1 className="text-[26px] font-semibold leading-[1.25]">{t("login_tagline", lang)}</h1>
            <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-white/75">
              {t("login_tagline_sub", lang)}
            </p>
          </div>

          <div className="relative mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {features.map(({ icon: Icon, key }) => (
              <span key={key} className="flex items-center gap-2 text-[11px] font-medium text-white/85">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  <Icon size={13} />
                </span>
                {t(key, lang)}
              </span>
            ))}
          </div>
        </div>

        {/* O'ng — forma paneli */}
        <div className="px-5 py-4 sm:p-7 lg:p-9">
          {/* Bitta til tanlagichi: telefonda brend qatorida, desktopda o'ngda */}
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light lg:hidden">
              <UMark size={22} />
            </span>
            <span className="lg:hidden">
              <span className="block text-[13px] font-semibold leading-none text-foreground">
                {t("app_name", lang)}
              </span>
              <span className="mt-1 block text-[11px] text-muted">United Tax Advisors</span>
            </span>
            <div className="relative ml-auto">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                aria-label={t("login_language", lang)}
                className="h-9 appearance-none rounded-lg border border-border bg-surface pl-2.5 pr-7 text-[12px] font-medium text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
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

          <p className="text-[10px] font-semibold tracking-[0.16em] text-brand">{t("login_eyebrow", lang)}</p>
          <h2 className="mt-1.5 text-[20px] font-semibold leading-tight text-foreground sm:text-[22px] lg:text-[26px]">
            {t("login_welcome", lang)}
          </h2>
          <p className="mt-1 hidden text-[13px] text-muted sm:block">{t("login_welcome_sub", lang)}</p>

          <form onSubmit={handleLogin} className="mt-4 space-y-3 sm:space-y-3.5">
            <div>
              <label htmlFor="login-password" className="mb-1 block text-[11px] font-medium text-muted">
                {t("login_password", lang)}
              </label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                {/* Ilgari placeholder "••••••••" edi — maydon to'ldirilgandek
                    ko'rinib, foydalanuvchi hech narsa yozmay "Kirish" bosardi. */}
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    e.target.setCustomValidity("");
                  }}
                  onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity("Parolni kiriting")}
                  placeholder={t("login_password", lang)}
                  className={`${field} pl-9 pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={t(showPassword ? "login_hide_password" : "login_show_password", lang)}
                  className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="login-role" className="mb-1 block text-[11px] font-medium text-muted">
                {t("login_demo_role", lang)}
              </label>
              <div className="relative">
                <select
                  id="login-role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as RoleId)}
                  className={`${field} appearance-none pr-9`}
                >
                  {/* Faqat rol nomi — tavsif pastda alohida qatorda, aks holda
                      telefonda native select matnni yarmidan kesadi. */}
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {t(`role_label_${r.id}`, lang)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted">
                {t(`role_desc_${selectedRole}`, lang)}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-foreground">
                <input
                  type="checkbox"
                  aria-label={t("login_remember", lang)}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                />
                {t("login_remember", lang)}
              </label>
              <button
                type="button"
                onClick={() => setHintOpen((v) => !v)}
                className="text-[12px] font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
              >
                {t("login_forgot_link", lang)}
              </button>
            </div>

            {hintOpen && (
              <p className="rounded-control bg-brand-light px-3 py-2 text-[11px] leading-snug text-brand">
                {t("login_forgot", lang)}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-control border border-danger/30 bg-danger-bg px-3 py-2 text-[12px] font-medium text-danger"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className="brand-gradient flex h-12 w-full items-center justify-center gap-2 rounded-control text-sm font-semibold text-brand-contrast transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:opacity-60 sm:h-11"
            >
              {busy ? t("login_checking", lang) : t("login_submit", lang)}
              {!busy && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-snug text-muted">
            <ShieldCheck size={13} className="mt-px flex-shrink-0" />
            {t("login_2fa", lang)}
          </p>

          <p className="mt-3 border-t border-border pt-2.5 text-[11px] text-muted">
            {t("login_help", lang)} — {t("login_help_link", lang)}
          </p>
        </div>
      </div>
    </div>
  );
}
