// /api/calls — qo'ng'iroqlar tahlili (Bitrix CRM faoliyat tarixidan).
// Faqat server tomonida; webhook manzili brauzerga chiqmaydi.
import { NextResponse } from "next/server";
import { fetchCallStats, bitrixConfigured } from "@/lib/bitrix";

export const revalidate = 600;

export async function GET(req: Request) {
  if (!bitrixConfigured()) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 200 });
  }
  const daysParam = Number(new URL(req.url).searchParams.get("days"));
  const days = Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 90 ? daysParam : 30;
  try {
    const stats = await fetchCallStats(days);
    return NextResponse.json(
      { ok: true, ...stats },
      { headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=1800" } },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: "fetch_failed", message: e instanceof Error ? e.message : String(e) },
      { status: 200 },
    );
  }
}
