// /api/sotuv — Bitrix24'dan real bitimlar. Faqat server tomonida ishlaydi,
// webhook manzili brauzerga hech qachon chiqmaydi.
import { NextResponse } from "next/server";
import { fetchSotuvSnapshot, bitrixConfigured } from "@/lib/bitrix";

// Bitrix sekin javob beradi (~1-3 s), shuning uchun natija 10 daqiqa keshlanadi.
export const revalidate = 600;

export async function GET() {
  if (!bitrixConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "not_configured", message: "BITRIX_WEBHOOK_URL sozlanmagan" },
      { status: 200 },
    );
  }
  try {
    const snapshot = await fetchSotuvSnapshot();
    return NextResponse.json(
      { ok: true, ...snapshot },
      { headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=1800" } },
    );
  } catch (e) {
    // Sahifa ishlashda davom etsin — mijozga namunaviy ma'lumot ko'rsatiladi.
    return NextResponse.json(
      { ok: false, reason: "fetch_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 200 },
    );
  }
}
