"use client";

// UTAX Executive Intelligence — kirish ekrani (Dizayn TZI §6.2).
// Sotuv Desk bilan bitta ko'rinish: qora fon, CEO AI vizuali, mualliflik matni.
// Ko'rinadigan "o'tkazib yuborish" tugmasi yo'q; Esc — ko'rinmaydigan zaxira chiqish.

import { useEffect, useState } from "react";

// Qisqa: kutish login sahifasida bo'ladi, bu yerda faqat brend "chaqnashi" (1.6 s)
const SPLASH_MS = 1600;

export function Splash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  // Davomiylik lazy hisoblanadi (effekt ichida setState yo'q); SSR da SPLASH_MS.
  const [ms] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 600 : SPLASH_MS
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = ms;

    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      setLeaving(true);
      setTimeout(() => setVisible(false), reduce ? 280 : 400);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const timer = setTimeout(close, total);
    document.addEventListener("keydown", onEsc);
    return () => { clearTimeout(timer); document.removeEventListener("keydown", onEsc); };
  }, [ms]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{ ["--splash-ms" as string]: `${ms}ms` }}
      className={`utax-splash ${leaving ? "is-leaving" : ""}`}
    >
      <div className="utax-splash-art">
        <span className="utax-splash-glow" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/ceo-ai.png" alt="" className="utax-splash-img" />
      </div>
      <div className="utax-splash-cap">
        <div className="utax-splash-t">UTAX AI ishga tushmoqda</div>
        <div className="utax-splash-bar"><i /></div>
        <div className="utax-splash-cred">
          <b>UTAX uchun maxsus ishlab chiqilgan · CEO AI Automind</b>
          <br />© UTAX. Barcha huquqlar himoyalangan.
          <br />
          <span className="utax-splash-note">
            Rasm va brend mualliflik huquqi bilan himoyalangan. Foydalanish uchun:{" "}
            <a href="https://t.me/tbehruz7">t.me/tbehruz7</a>
          </span>
        </div>
      </div>
    </div>
  );
}
