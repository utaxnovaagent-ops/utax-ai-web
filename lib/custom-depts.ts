"use client";

// Qo'lda qo'shilgan bo'limlar. Backend hali yo'q, shuning uchun ular shu
// brauzerning localStorage'ida saqlanadi — bu interfeysda ochiq aytiladi
// ("faqat shu brauzerda saqlanadi"), foydalanuvchi ma'lumot serverga
// yozilyapti deb o'ylab qolmasligi uchun.
import { useCallback, useEffect, useState } from "react";
import { orgStructure } from "./mock-data";

export type BaseDept = (typeof orgStructure.departments)[number];

export type Dept = BaseDept & { isCustom?: boolean };

export interface NewDept {
  label: string;
  head: string;
  employees: number;
}

const STORAGE_KEY = "utax_custom_departments";

// Yangi bo'limlarga navbat bilan beriladigan ranglar.
const PALETTE = ["#0f766e", "#b45309", "#7c3aed", "#be123c", "#1d4ed8", "#4d7c0f"];

function slugify(label: string) {
  const base = label
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "bolim"}-${Date.now().toString(36)}`;
}

function readStored(): Dept[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Dept[]) : [];
  } catch {
    return [];
  }
}

// Sahifada bir nechta joy (masalan sarlavhadagi tugma va OrgChart) shu hook'ni
// alohida chaqiradi — bittasida o'zgarish bo'lganda qolganlari ham yangilanishi
// uchun umumiy hodisa yuboriladi.
const CHANGE_EVENT = "utax:departments-changed";

export function useDepartments() {
  const [custom, setCustom] = useState<Dept[]>([]);

  useEffect(() => {
    // Server "custom yo'q" holatini render qiladi — saqlangan ro'yxatni faqat
    // mount'dan keyin o'qiymiz, aks holda hydration mos kelmaydi.
    const sync = () => setCustom(readStored());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync); // boshqa tab'da o'zgarsa
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const persist = useCallback((next: Dept[]) => {
    setCustom(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage yopiq bo'lsa (private rejim) — ro'yxat faqat shu sessiyada qoladi.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const addDepartment = useCallback(
    (d: NewDept) => {
      const next: Dept = {
        key: slugify(d.label),
        label: d.label.trim(),
        head: d.head.trim() || "—",
        employees: Math.max(0, Math.round(d.employees)),
        color: PALETTE[custom.length % PALETTE.length],
        aiPercent: 0,
        isCustom: true,
      };
      persist([...custom, next]);
    },
    [custom, persist]
  );

  const removeDepartment = useCallback(
    (key: string) => persist(custom.filter((c) => c.key !== key)),
    [custom, persist]
  );

  return {
    departments: [...(orgStructure.departments as Dept[]), ...custom],
    customCount: custom.length,
    addDepartment,
    removeDepartment,
  };
}
