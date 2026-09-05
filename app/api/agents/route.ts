// /api/agents — agentlarning HAQIQIY faoliyati.
// Web ilova agentlar bilan bitta serverda ishlaydi, shuning uchun ularning
// xotira fayllarini to'g'ridan-to'g'ri o'qiydi. Hech narsa o'ylab topilmaydi:
// faoliyat bo'lmasa, "faoliyat yo'q" deb qaytadi.
import { readFile, stat } from "node:fs/promises";
import { NextResponse } from "next/server";
import { SOTUV_AGENTS } from "@/lib/sotuv-agents";

export const revalidate = 120;

const AGENTS_DIR = process.env.AGENTS_DIR ?? "/home/claude/agents";
// Maslahatchi — Claude Code agenti emas, alohida Telegram boti: uning
// faolligi suhbat bazasining o'zgarish vaqtidan bilinadi.
const BOT_DB = process.env.MASLAHATCHI_DB ?? "/home/claude/utax-maslahatchi/sessions.db";

export type AgentActivity = {
  id: string;
  name: string;
  /** Oxirgi faoliyat vaqti (ISO) — fayl o'zgargan payt. */
  lastActiveAt: string | null;
  /** Agentning o'z xulosalari — eng yangisi birinchi. */
  entries: string[];
};

// Digest qatorlari "- 2026-09-05 09:00: matn" ko'rinishida yoziladi.
function parseDigest(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- ") && l.length > 12)
    .map((l) => l.slice(2).trim())
    .reverse();
}

async function readAgent(id: string, name: string): Promise<AgentActivity> {
  const file = `${AGENTS_DIR}/${id}/memory/loop-digest.md`;
  try {
    const [raw, info] = await Promise.all([readFile(file, "utf8"), stat(file)]);
    return { id, name, lastActiveAt: info.mtime.toISOString(), entries: parseDigest(raw).slice(0, 3) };
  } catch {
    // Digest yo'q — bu agentda avtonom kuzatuv sikli yo'q yoki hali yozmagan.
    if (id === "maslahatchi") {
      try {
        const info = await stat(BOT_DB);
        return { id, name, lastActiveAt: info.mtime.toISOString(), entries: [] };
      } catch {
        /* bot bazasi ham yo'q */
      }
    }
    return { id, name, lastActiveAt: null, entries: [] };
  }
}

export async function GET() {
  const agents = await Promise.all(SOTUV_AGENTS.map((a) => readAgent(a.id, a.name)));
  const active = agents.filter((a) => a.lastActiveAt).length;
  return NextResponse.json({
    ok: true,
    fetchedAt: new Date().toISOString(),
    activeCount: active,
    agents,
  });
}
