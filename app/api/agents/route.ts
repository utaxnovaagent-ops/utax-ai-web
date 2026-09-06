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
// Maslahatchi har kuni hisobot yozadi — tiriklik belgisi shu, mijoz suhbati emas.
// Ikkisini aralashtirsak, murojaat kelmagan kuni sog'lom bot "o'lik" ko'rinadi.
const BOT_HEARTBEAT = process.env.MASLAHATCHI_LOG ?? "/home/claude/logs/maslahatchi/report.log";

export type AgentActivity = {
  id: string;
  name: string;
  /** Oxirgi faoliyat vaqti (ISO) — fayl o'zgargan payt. */
  lastActiveAt: string | null;
  /** Agentning o'z xulosalari — eng yangisi birinchi. */
  entries: string[];
  /** Qo'shimcha izoh — masalan "ishlayapti, lekin murojaat yo'q". */
  note?: string;
};

async function mtime(path: string) {
  try {
    return (await stat(path)).mtime;
  } catch {
    return null;
  }
}

// Maslahatchi — Claude Code agenti emas: kunlik hisobotdan tirikligi,
// sessions.db'dan esa oxirgi mijoz suhbati bilinadi.
async function readMaslahatchi(id: string, name: string): Promise<AgentActivity> {
  const [beat, lastChat] = await Promise.all([mtime(BOT_HEARTBEAT), mtime(BOT_DB)]);
  const quietDays = lastChat ? Math.floor((Date.now() - lastChat.getTime()) / 86_400_000) : null;
  const note =
    quietDays === null
      ? "hali birorta mijoz suhbati bo'lmagan"
      : quietDays >= 1
        ? `mijoz murojaati yo'q — oxirgisi ${quietDays} kun oldin`
        : undefined;
  return { id, name, lastActiveAt: (beat ?? lastChat)?.toISOString() ?? null, entries: [], note };
}

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
  if (id === "maslahatchi") return readMaslahatchi(id, name);
  try {
    const [raw, info] = await Promise.all([readFile(file, "utf8"), stat(file)]);
    return { id, name, lastActiveAt: info.mtime.toISOString(), entries: parseDigest(raw).slice(0, 3) };
  } catch {
    // Digest yo'q — bu agentda avtonom kuzatuv sikli yo'q yoki hali yozmagan.
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
