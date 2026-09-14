// Oylik reja va boshqa biznes sozlamalari. proxy.ts orqali himoyalangan.
import { NextResponse } from "next/server";
import { readSettings, writeSettings } from "@/lib/settings";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, ...readSettings() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let plan: number | null = null;
  try {
    const body = await request.json();
    plan = Number(body?.planThisMonth);
  } catch {
    return NextResponse.json({ ok: false, message: "So'rov noto'g'ri" }, { status: 400 });
  }
  if (plan === null || !Number.isFinite(plan) || plan <= 0 || plan > 1_000_000) {
    return NextResponse.json({ ok: false, message: "Reja 1 dan 1 000 000 mln gacha bo'lsin" }, { status: 400 });
  }
  try {
    const next = writeSettings({ planThisMonth: Math.round(plan) });
    return NextResponse.json({ ok: true, ...next });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : "Saqlab bo'lmadi" }, { status: 500 });
  }
}
