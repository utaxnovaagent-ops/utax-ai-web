"use client";

// UTAX Executive Intelligence — kirish ekrani (Dizayn TZI §6.2).
// Sotuv Desk bilan bitta ko'rinish: qora fon, CEO AI vizuali, mualliflik matni.
// Ko'rinadigan "o'tkazib yuborish" tugmasi yo'q; Esc — ko'rinmaydigan zaxira chiqish.

import { useEffect, useState } from "react";

const SPLASH_MS = 4500;

export function Splash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [ms, setMs] = useState(SPLASH_MS);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? 900 : SPLASH_MS;
    setMs(total);

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
  }, []);

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
