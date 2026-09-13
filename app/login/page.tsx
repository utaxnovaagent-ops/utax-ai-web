"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ArrowRight, ChevronDown, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
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

// Osmonda sekin suzuvchi bulutlar — sof dekorativ bezak, kartochka ORTIDA.
// y: 4%..60% — osmon pastga qarab ham ko'k bo'lgani uchun bulutlar
// kartochka ortidan ham o'tadi. d: davomiyliklar o'zaro karrali emas, shuning uchun
// manzara takrorlanmaydi. t: manfiy delay — sahifa ochilishida bulutlar
// siklning turli nuqtalarida turadi, hammasi chap chetdan birga chiqmaydi.
type Cloud = {
  w: string;
  y: string;
  o: string;
  d: string;
  t: string;
  v: "a" | "b" | "c";
  r?: string;
  lite?: boolean;
};

const CLOUDS: Cloud[] = [
  { w: "clamp(180px,31vw,460px)", y: "7%", o: ".72", d: "108s", t: "-12s", v: "a" },
  { w: "clamp(135px,22vw,310px)", y: "19%", o: ".62", d: "134s", t: "-64s", v: "b", lite: true },
  { w: "clamp(200px,34vw,500px)", y: "33%", o: ".70", d: "119s", t: "-88s", v: "b" },
  { w: "clamp(115px,17vw,255px)", y: "4%", o: ".50", d: "150s", t: "-38s", v: "c", r: ".40" },
  { w: "clamp(170px,27vw,395px)", y: "47%", o: ".66", d: "97s", t: "-66s", v: "a" },
  { w: "clamp(145px,23vw,345px)", y: "13%", o: ".56", d: "142s", t: "-112s", v: "c", lite: true },
  { w: "clamp(110px,15vw,225px)", y: "60%", o: ".48", d: "126s", t: "-22s", v: "c", r: ".42", lite: true },
];

// Fokus halqasi to'liq alfada bo'lishi SHART: brand/25 oq kartochkada 1.39:1
// beradi (WCAG SC 1.4.11 talabi 3:1), ya'ni klaviatura bilan ishlaydigan
// foydalanuvchi fokus qayerdaligini ko'rmaydi. #0f62d6 = 5.62:1.
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700";

function LoginPageInner() {
  // Bino fotosuratini oldindan yuklaymiz, aks holda panel bir lahza bo'sh och ko'k
  // bo'lib turadi. media bilan — telefonda panel ko'rinmaydi, 103KB bekor ketmasin.
  ReactDOM.preload("/brand/utax-building.webp", {
    as: "image",
    type: "image/webp",
    media: "(min-width: 1024px)",
  });

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
  const passwordRef = useRef<HTMLInputElement>(null);

  // Faqat sichqoncha/klaviatura qurilmasida avtofokus: telefonda u sahifa
  // ochilishi bilan klaviaturani chiqarib, kartochkani yuqoriga itaradi.
  useEffect(() => {
    if (window.matchMedia?.("(pointer: fine)").matches) passwordRef.current?.focus();
  }, []);

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
    `placeholder:text-muted focus:border-brand ${FOCUS} sm:h-10 sm:text-sm`;

  return (
    // color-scheme:light — sahifada ikkita native <select> va checkbox bor;
    // usiz OS qorong'i rejimida ular oq kartochka ichida qora chiziladi.
    <div className="relative flex min-h-[100svh] w-full items-center justify-center px-4 py-6 [color-scheme:light] sm:py-8">
      {/* Osmon foni alohida fixed qatlam: iOS Safari'da URL paneli yig'ilganda
          100svh ostidan body foni kulrang chok bo'lib chiqmasligi uchun. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-[#bcdff3] bg-[url(/brand/sky.svg)] bg-cover bg-center bg-no-repeat"
      />

      {/* Sekin suzuvchi bulutlar. Faqat transform + opacity animatsiya qilinadi;
          prefers-reduced-motion: reduce da butun qatlam display:none bo'ladi
          (qoidalar globals.css da) — cheksiz animatsiya strobga aylanmasin. */}
      <div aria-hidden className="utax-sky-clouds">
        {CLOUDS.map((c, i) => (
          <span
            key={i}
            className={`utax-cloud utax-cloud--${c.v}${c.lite ? " utax-cloud--lite" : ""}`}
            style={
              {
                "--w": c.w,
                "--y": c.y,
                "--o": c.o,
                "--d": c.d,
                "--t": c.t,
                ...(c.r ? { "--r": c.r } : {}),
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="w-full max-w-[400px] overflow-hidden rounded-card border border-white/70 bg-surface shadow-[0_24px_64px_-20px_rgba(11,79,176,0.45)] ring-1 ring-white/50 sm:ring-8 sm:ring-white/25 lg:grid lg:max-w-[820px] lg:grid-cols-[1fr_372px]">
        {/* Telefonda brend paneli o'rniga — ingichka gradient chiziq */}
        <div className="brand-gradient h-[3px] lg:hidden" />

        {/* Chap panel — UTAX bosh binosi fotosurati (faqat kengroq ekranda).
            Osmon foniga mos bo'lishi uchun och ko'k: tepada va pastda oq-ko'k
            scrim, o'rtada bino to'liq ko'rinadi. Matn to'q navy — scrim alfalari
            rasmni piksel bo'yicha o'lchab tanlangan: eng qorong'i nuqtada ham
            sarlavha 8.9:1, izoh 8.4:1, "United Tax Advisors" 5.2:1. */}
        <div className="relative m-2 hidden flex-col justify-between overflow-hidden rounded-[10px] bg-[#dcefff] p-7 lg:flex">
          <div aria-hidden className="utax-building absolute inset-0" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(236,246,255,0.72)_0%,rgba(236,246,255,0.38)_20%,rgba(236,246,255,0)_42%,rgba(236,246,255,0.35)_64%,rgba(236,246,255,0.86)_78%,rgba(236,246,255,0.92)_100%)]"
          />

          <div className="relative flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
              <UMark size={24} />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight text-[#0b2f6b]">{t("app_name", lang)}</span>
              <span className="block text-[11px] text-[#35557f]">United Tax Advisors</span>
            </span>
          </div>

          <div className="relative">
            <h1 className="text-[22px] font-semibold leading-[1.25] text-[#0b2f6b]">{t("login_tagline", lang)}</h1>
            <p className="mt-2 max-w-[32ch] text-[12px] leading-relaxed text-[#1f4476]">
              {t("login_tagline_sub", lang)}
            </p>
          </div>
        </div>

        {/* O'ng — forma paneli */}
        <div className="px-5 py-4 sm:p-7 lg:p-8">
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
                className={`h-9 appearance-none rounded-lg border border-border bg-surface pl-2.5 pr-7 text-[12px] font-medium text-foreground focus:border-brand ${FOCUS}`}
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

          <p className="text-[10px] font-semibold tracking-[0.16em] text-brand-700">{t("login_eyebrow", lang)}</p>
          <h2 className="mt-1.5 text-[20px] font-semibold leading-tight text-foreground sm:text-[22px] lg:text-[23px]">
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
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  required
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
                  className={`absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-foreground ${FOCUS}`}
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
                  className={`h-4 w-4 rounded border-border accent-[var(--brand-700)] ${FOCUS}`}
                />
                {t("login_remember", lang)}
              </label>
              <button
                type="button"
                onClick={() => setHintOpen((v) => !v)}
                className={`rounded text-[12px] font-medium text-brand-700 hover:underline ${FOCUS}`}
              >
                {t("login_forgot_link", lang)}
              </button>
            </div>

            {hintOpen && (
              <p className="rounded-control bg-brand-light px-3 py-2 text-[11px] leading-snug text-brand-700">
                {t("login_forgot", lang)}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-control border border-danger/30 bg-danger-bg px-3 py-2 text-[12px] font-medium text-danger-700"
              >
                {error}
              </p>
            )}

            {/* disabled holatida opacity ISHLATILMAYDI: u butun tugmani oq
                kartochkaga kompozit qilib, "Tekshirilmoqda..." matnini
                2.3:1 gacha tushirardi — aynan foydalanuvchi o'qiydigan paytda. */}
            <button
              type="submit"
              disabled={busy}
              aria-busy={busy}
              className={`flex h-12 w-full items-center justify-center gap-2 rounded-control bg-[linear-gradient(135deg,#0b4fb0_0%,#0f62d6_55%,#1560d8_100%)] text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:bg-none disabled:bg-[#3a5f8f] disabled:hover:brightness-100 sm:h-11 ${FOCUS}`}
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
