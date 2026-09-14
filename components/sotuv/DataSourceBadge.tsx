"use client";

// Sahifadagi raqamlar qayerdan kelayotganini ochiq ko'rsatadi.
// "Namunaviy" holatida foydalanuvchi raqamlarni real deb o'ylab qolmasligi kerak.
import { Database, TriangleAlert, Loader2 } from "lucide-react";
import { useDealsSource } from "@/lib/deals-context";

export function DataSourceBadge() {
  const { isReal, loading, fetchedAt, note, count } = useDealsSource();

  if (loading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs text-muted">
        <Loader2 size={13} className="animate-spin" />
        Bitrix24&apos;dan ma&apos;lumot olinmoqda...
      </div>
    );
  }

  if (isReal) {
    const time = fetchedAt
      ? new Date(fetchedAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
      : "";
    // Bitimlarning summasi Bitrixda ko'pincha bo'sh qoladi. Buni yashirsak,
    // sahifa "0 so'm daromad" deb chalg'itadi — shuning uchun ochiq aytamiz.
    
    // Win rate haqiqatan ham yuqori bo'lishi mumkin, lekin yo'qotilgan bitimlar
    // CRMda deyarli belgilanmasa, foiz sun'iy ravishda ko'tarilib ketadi —
    // buni ko'rsatkich yonida ochiq aytamiz, aks holda noto'g'ri xulosa chiqadi.
    
    return (
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-300">
        <Database size={13} />
        <span className="font-semibold">Real ma&apos;lumot — Bitrix24</span>
        <span className="opacity-75">
          {count} ta bitim{time ? ` · yangilangan ${time}` : ""} · har daqiqa yangilanadi
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-300">
      <TriangleAlert size={13} />
      <span className="font-semibold">Namunaviy (demo) ma&apos;lumot</span>
      <span className="opacity-75">
        Bitrix24 ulanmagan{note ? ` — ${note}` : ""}. Bu sahifadagi raqamlar haqiqiy emas.
      </span>
    </div>
  );
}
