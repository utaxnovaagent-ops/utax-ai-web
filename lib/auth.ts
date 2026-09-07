// Sayt kirish sessiyasi — imzolangan cookie.
// Ilgari HTTP Basic Auth ishlatilgan edi: u har yangi qurilmada brauzerning
// o'z oynasini chiqarardi, "meni eslab qol" imkoni yo'q edi va chiqish ham
// qilib bo'lmasdi. Endi oddiy login sahifasi + 30 kunlik cookie.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "utax_session";
export const SESSION_DAYS = 30;

function secret() {
  // Alohida SESSION_SECRET bo'lmasa — parolning o'zidan kalit hosil qilamiz,
  // shunda sozlash bitta o'zgaruvchida qoladi.
  return process.env.SESSION_SECRET || process.env.SITE_AUTH_PASSWORD || "";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Cookie qiymati: "<muddat>.<imzo>" */
export function createSession(now = Date.now()) {
  const exp = String(now + SESSION_DAYS * 86_400_000);
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

/** Parolni tekshirish — vaqt bo'yicha sizib chiqmaydigan solishtirish. */
export function checkPassword(input: string) {
  const expected = process.env.SITE_AUTH_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function authConfigured() {
  return !!process.env.SITE_AUTH_PASSWORD;
}
