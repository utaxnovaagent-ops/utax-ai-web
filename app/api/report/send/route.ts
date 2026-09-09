// Hisobot rasmini Telegram orqali sotuv rahbariga yuboradi.
// Bot tokeni faqat serverda qoladi — brauzerga hech qachon chiqmaydi.
// Kirish proxy.ts orqali himoyalangan: sessiyasiz so'rov 401 oladi.
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TOKEN_FILE = process.env.SOTUV_BOT_TOKEN_FILE ?? "/home/claude/secrets/telegram-sotuv.env";
const CHAT_ID = process.env.SOTUV_HEAD_CHAT_ID ?? "";
const MAX_BYTES = 8 * 1024 * 1024; // Telegram rasm chegarasidan pastda

async function botToken() {
  if (process.env.SOTUV_BOT_TOKEN) return process.env.SOTUV_BOT_TOKEN;
  try {
    const raw = await readFile(TOKEN_FILE, "utf8");
    const m = raw.match(/^\s*(?:TELEGRAM_)?BOT_TOKEN\s*=\s*(.+)$/m);
    return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const token = await botToken();
  if (!token || !CHAT_ID) {
    return NextResponse.json(
      { ok: false, message: "Telegram yuborish sozlanmagan (token yoki chat ID yo'q)" },
      { status: 503 }
    );
  }

  let photo: File | null = null;
  let caption = "";
  try {
    const form = await request.formData();
    const f = form.get("photo");
    photo = f instanceof File ? f : null;
    caption = String(form.get("caption") ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "So'rov noto'g'ri" }, { status: 400 });
  }

  if (!photo) return NextResponse.json({ ok: false, message: "Rasm yuborilmadi" }, { status: 400 });
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, message: "Rasm hajmi juda katta" }, { status: 413 });
  }

  const tg = new FormData();
  tg.append("chat_id", CHAT_ID);
  tg.append("caption", caption.slice(0, 1000));
  tg.append("photo", photo, "hisobot.png");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: "POST",
      body: tg,
    });
    const body = await res.json();
    if (!body?.ok) {
      return NextResponse.json(
        { ok: false, message: body?.description ?? "Telegram xatosi" },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "Tarmoq xatosi" },
      { status: 502 }
    );
  }
}
