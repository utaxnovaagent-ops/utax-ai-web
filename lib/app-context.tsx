"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, ReactNode } from "react";
import { RoleId, roleById } from "./roles";
import { Lang } from "./i18n";

interface AppState {
  roleId: RoleId;
  setRoleId: (r: RoleId) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export type Theme = "light" | "dark";
const THEME_KEY = "utax_theme";
const themeListeners = new Set<() => void>();
const readTheme = (): Theme =>
  (typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
const subscribeTheme = (cb: () => void) => { themeListeners.add(cb); return () => { themeListeners.delete(cb); }; };
/** Tema <html data-theme> da yashaydi (layout.tsx skripti chizishdan oldin o'rnatadi); bu yerda faqat o'qiladi/yoziladi. */
function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch {}
  themeListeners.forEach((cb) => cb());
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [roleId, setRoleId] = useState<RoleId>("ceo");
  const [lang, setLang] = useState<Lang>("uz");
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "light" as Theme);

  const value = useMemo(
    () => ({ roleId, setRoleId, lang, setLang, theme, setTheme: applyTheme }),
    [roleId, lang, theme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useCurrentRole() {
  const { roleId } = useAppState();
  return roleById(roleId);
}
