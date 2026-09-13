// Parolni o'zgartirish. Yo'l proxy.ts orqali himoyalangan — sessiyasiz so'rov
// bu yerga yetib kelmaydi (401). Joriy parol baribir qayta so'raladi: ochiq
// qolgan brauzerdan kimdir parolni almashtirib qo'ymasin.
import { NextResponse } from "next/server";
import {
  PASSWORD_MIN,
  SESSION_COOKIE,
  SESSION_DAYS,
  checkPassword,
  createSession,
  passwordSetBy,
  setPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

/** Banner uchun: parol hali boshlang'ich (.env) holatidami. */
export async function GET() {
  return NextResponse.json({ ok: true, setBy: passwordSetBy(), min: PASSWORD_MIN });
}

export async function POST(request: Request) {
  let current = "";
  let next = "";
  try {
    const body = await request.json();
    current = typeof body?.current === "string" ? body.current : "";
    next = typeof body?.next === "string" ? body.next : "";
  } catch {
    return NextResponse.json({ ok: false, message: "So'rov noto'g'ri" }, { status: 400 });
  }

  if (!checkPassword(current)) {
    // 403, 401 emas: klient 401 ni "sessiya tugadi" deb tushunadi
    return NextResponse.json({ ok: false, code: "wrong_current", message: "Joriy parol noto'g'ri" }, { status: 403 });
  }
  if (next.length < PASSWORD_MIN) {
    return NextResponse.json(
      { ok: false, code: "too_short", message: `Yangi parol kamida ${PASSWORD_MIN} belgi bo'lsin` },
      { status: 400 }
    );
  }
  if (next === current) {
    return NextResponse.json({ ok: false, code: "same", message: "Yangi parol joriy paroldan farq qilsin" }, { status: 400 });
  }

  try {
    setPassword(next);
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? `Saqlab bo'lmadi: ${e.message}` : "Saqlab bo'lmadi" },
      { status: 500 }
    );
  }

  // Parol almashgani bilan imzo kaliti ham almashdi — boshqa qurilmalardagi
  // sessiyalar bekor bo'ldi. Shu qurilma uchun yangi cookie beramiz.
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSession(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return res;
}
