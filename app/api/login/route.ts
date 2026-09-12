// Kirish va chiqish. Parol serverda tekshiriladi, brauzerga faqat
// imzolangan sessiya cookie'si qaytadi (parolning o'zi hech qachon emas).
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  SESSION_DAYS_SHORT,
  authConfigured,
  checkPassword,
  createSession,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ ok: false, message: "Sayt himoyasi sozlanmagan" }, { status: 503 });
  }

  let password = "";
  let remember = false;
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
    remember = body?.remember === true;
  } catch {
    return NextResponse.json({ ok: false, message: "So'rov noto'g'ri" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, message: "Parol noto'g'ri" }, { status: 401 });
  }

  // "Meni eslab qolish" belgilansa — 30 kun saqlanadi; aks holda cookie
  // brauzer yopilishi bilan o'chadi (maxAge berilmaydi) va token ham 1 kunlik.
  const days = remember ? SESSION_DAYS : SESSION_DAYS_SHORT;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSession(Date.now(), days), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    ...(remember ? { maxAge: SESSION_DAYS * 86_400 } : {}),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
