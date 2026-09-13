// Sessiya bormi? Yo'l proxy.ts orqali himoyalangan: cookie yaroqsiz bo'lsa
// proxy 401 qaytaradi, bu yerga faqat haqiqiy sessiya yetib keladi.
// Login sahifasi shu orqali "parol so'ramay kiraverish" mumkinligini biladi.
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
