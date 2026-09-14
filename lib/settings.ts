// Biznes sozlamalari — CRMda yo'q, lekin panelga kerak qiymatlar (masalan,
// oylik reja). data/settings.json da saqlanadi (auth.json bilan bir papkada).
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface Settings {
  /** Oylik sotuv rejasi, mln so'm */
  planThisMonth: number;
  /** "default" — hali kiritilmagan (boshlang'ich qiymat); "user" — rahbar o'rnatgan */
  planSetBy: "default" | "user";
  updatedAt?: string;
}

const FILE = process.env.SETTINGS_FILE || join(process.cwd(), "data", "settings.json");
// Ilgari kodga yozilgan namunaviy reja 500 M edi — o'sha boshlang'ich qoladi,
// lekin UI uni "kiritilmagan" deb ochiq ko'rsatadi.
const DEFAULTS: Settings = { planThisMonth: 500, planSetBy: "default" };

export function readSettings(): Settings {
  try {
    const raw = JSON.parse(readFileSync(FILE, "utf8")) as Partial<Settings>;
    const plan = Number(raw.planThisMonth);
    if (!Number.isFinite(plan) || plan <= 0) return DEFAULTS;
    return { planThisMonth: Math.round(plan), planSetBy: "user", updatedAt: raw.updatedAt };
  } catch {
    return DEFAULTS;
  }
}

export function writeSettings(patch: Partial<Pick<Settings, "planThisMonth">>) {
  const cur = readSettings();
  const next: Settings = {
    planThisMonth: patch.planThisMonth ?? cur.planThisMonth,
    planSetBy: "user",
    updatedAt: new Date().toISOString(),
  };
  mkdirSync(dirname(FILE), { recursive: true, mode: 0o700 });
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(next, null, 2) + "\n", { mode: 0o600 });
  renameSync(tmp, FILE);
  return next;
}
