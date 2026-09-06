"use client";

// Namunaviy ma'lumot ustidagi amallar (tasdiqlash, bajarildi belgisi va h.k.).
// Backend hali yo'q, shuning uchun holat shu brauzerda saqlanadi — interfeys
// buni ochiq aytadi. Bo'lim qo'shish (lib/custom-depts.ts) bilan bir xil uslub.
import { useCallback, useEffect, useState } from "react";

const EVENT = "utax:local-actions-changed";

function read(key: string): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Element bo'yicha holat saqlaydi: id -> qiymat ("approved", "done", ...).
 * Server bo'sh holatni render qiladi, saqlangani mount'dan keyin o'qiladi —
 * aks holda hydration mos kelmaydi.
 */
export function useLocalActions(storageKey: string) {
  const [state, setState] = useState<Record<string, string>>({});

  useEffect(() => {
    const sync = () => setState(read(storageKey));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [storageKey]);

  const set = useCallback(
    (id: string, value: string | null) => {
      const next = { ...read(storageKey) };
      if (value === null) delete next[id];
      else next[id] = value;
      setState(next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // localStorage yopiq bo'lsa — holat faqat shu sessiyada qoladi
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [storageKey]
  );

  const clearAll = useCallback(() => {
    setState({});
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* e'tiborsiz */
    }
    window.dispatchEvent(new Event(EVENT));
  }, [storageKey]);

  return { state, set, clearAll };
}
