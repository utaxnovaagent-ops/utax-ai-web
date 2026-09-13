// Sayt kirish sessiyasi — imzolangan cookie + o'zgartiriladigan parol.
// Ilgari parol faqat .env dagi SITE_AUTH_PASSWORD edi va uni faqat serverdan
// o'zgartirish mumkin edi. Endi foydalanuvchi o'zi almashtira oladi: yangi parol
// scrypt xeshi bilan data/auth.json ga yoziladi, .env dagi parol esa boshlang'ich
// (zaxira) bo'lib qoladi. Faylni o'chirish = .env paroliga qaytish.
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const SESSION_COOKIE = "utax_session";
export const SESSION_DAYS = 30;
/** "Meni eslab qolish" belgilanmasa — sessiya qisqa bo'ladi (brauzer yopilguncha). */
export const SESSION_DAYS_SHORT = 1;
/** Yangi parol uchun minimal uzunlik (Sotuv Desk CLI bilan bir xil). */
export const PASSWORD_MIN = 12;

const AUTH_FILE = process.env.AUTH_FILE || join(process.cwd(), "data", "auth.json");

interface AuthRecord {
  hash: string;            // "scrypt$<salt hex>$<key hex>"
  setBy: "user";
  changedAt: string;
}

// Proxy har so'rovda secret() ni chaqiradi — faylni har safar o'qimaslik uchun
// mtime bo'yicha kesh. statSync arzon, readFileSync faqat fayl o'zgarganda.
let cache: { mtime: number; rec: AuthRecord | null } | null = null;
function readAuth(): AuthRecord | null {
  try {
    const mtime = statSync(AUTH_FILE).mtimeMs;
    if (cache && cache.mtime === mtime) return cache.rec;
    const rec = JSON.parse(readFileSync(AUTH_FILE, "utf8")) as AuthRecord;
    const ok = typeof rec?.hash === "string" && rec.hash.startsWith("scrypt$");
    cache = { mtime, rec: ok ? rec : null };
    return cache.rec;
  } catch {
    cache = null;
    return null;
  }
}

function hashPassword(plain: string) {
  const salt = randomBytes(16);
  const key = scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

function verifyHash(plain: string, stored: string) {
  const [alg, saltHex, keyHex] = stored.split("$");
  if (alg !== "scrypt" || !saltHex || !keyHex) return false;
  const key = Buffer.from(keyHex, "hex");
  const test = scryptSync(plain, Buffer.from(saltHex, "hex"), key.length);
  return key.length === test.length && timingSafeEqual(key, test);
}

function secret() {
  // Alohida SESSION_SECRET bo'lmasa — joriy parol(xesh)dan kalit hosil qilamiz.
  // Shunda parol almashsa barcha eski sessiyalar o'z-o'zidan bekor bo'ladi.
  const rec = readAuth();
  return process.env.SESSION_SECRET || rec?.hash || process.env.SITE_AUTH_PASSWORD || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Cookie qiymati: "<muddat>.<imzo>" */
export function createSession(now = Date.now(), days = SESSION_DAYS) {
  const exp = String(now + days * 86_400_000);
  return `${exp}.${sign(exp)}`;
}

export function verifySession(value: string | undefined, now = Date.now()) {
  if (!value || !secret()) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return false;
  const exp = value.slice(0, dot);
  const got = Buffer.from(value.slice(dot + 1));
  const want = Buffer.from(sign(exp));
  if (got.length !== want.length || !timingSafeEqual(got, want)) return false;
  const ts = Number(exp);
  return Number.isFinite(ts) && ts > now;
}

/** Parolni tekshirish — avval foydalanuvchi o'rnatgan xesh, bo'lmasa .env paroli. */
export function checkPassword(input: string) {
  const rec = readAuth();
  if (rec) return verifyHash(input, rec.hash);
  const expected = process.env.SITE_AUTH_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(a, a); // vaqt bo'yicha sizib chiqmasin
    return false;
  }
  return timingSafeEqual(a, b);
}

/** Yangi parolni saqlash — atomik yozuv (tmp + rename), papka yo'q bo'lsa yaratiladi. */
export function setPassword(next: string) {
  const rec: AuthRecord = { hash: hashPassword(next), setBy: "user", changedAt: new Date().toISOString() };
  mkdirSync(dirname(AUTH_FILE), { recursive: true, mode: 0o700 });
  const tmp = `${AUTH_FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(rec, null, 2) + "\n", { mode: 0o600 });
  renameSync(tmp, AUTH_FILE);
  cache = null;
}

/** "env" — hali boshlang'ich (.env) parol; "user" — foydalanuvchi o'zi o'rnatgan. */
export function passwordSetBy(): "env" | "user" {
  return readAuth() ? "user" : "env";
}

export function authConfigured() {
  return !!process.env.SITE_AUTH_PASSWORD || (existsSync(AUTH_FILE) && !!readAuth());
}
