"use client";

// Qo'ng'iroqlar tahlili — lidlarning ~60%i shu kanaldan keladi, shuning uchun
// sotuv sahifasida alohida blok. Ma'lumot Bitrix CRM faoliyat tarixidan
// (telefoniya ruxsati talab qilinmaydi).
import { useEffect, useState } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Timer, Loader2 } from "lucide-react";
import { Card } from "@/components/ui";

type CallStats = {
  days: number;
  total: number;
  incoming: number;
  outgoing: number;
  missed: number;
  withRecording: number;
  avgSeconds: number;
  medianSeconds: number;
  underTargetPct: number;
  byManager: { id: string; count: number; avgSeconds: number; missed: number }[];
  byDay: { day: string; count: number }[];
};

const TARGET_SECONDS = 25;

function fmtSec(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function Metric({
  icon, label, value, hint, tone = "default",
}: {
  icon: React.ReactNode; label: string; value: string; hint?: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="mb-1 flex items-center gap-1.5 text-muted">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-xl font-bold tabular-nums ${tone === "warn" ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function CallAnalytics({ days = 30 }: { days?: number }) {
  const [data, setData] = useState<CallStats | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "off">("loading");

  useEffect(() => {
    let alive = true;
    fetch(`/api/calls?days=${days}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.ok) { setData(j as CallStats); setState("ok"); }
        else setState("off");
      })
      .catch(() => alive && setState("off"));
    return () => { alive = false; };
  }, [days]);

  if (state === "loading") {
    return (
      <Card title="Qo'ng'iroqlar" subtitle="Bitrix24 faoliyat tarixidan">
        <div className="flex items-center gap-2 py-6 text-sm text-muted">
          <Loader2 size={15} className="animate-spin" /> Yuklanmoqda...
        </div>
      </Card>
    );
  }

  if (state === "off" || !data) {
    return (
      <Card title="Qo'ng'iroqlar" subtitle="Bitrix24 faoliyat tarixidan">
        <p className="py-6 text-sm text-muted">
          Ma&apos;lumot olinmadi — Bitrix ulanmagan yoki so&apos;rov muvaffaqiyatsiz.
        </p>
      </Card>
    );
  }

  const missedPct = data.total ? Math.round((data.missed / data.total) * 100) : 0;
  const maxDay = Math.max(...data.byDay.map((d) => d.count), 1);
  const lastDays = data.byDay.slice(-14);

  return (
    <Card
      title="Qo'ng'iroqlar"
      subtitle={`Oxirgi ${data.days} kun · Bitrix24 faoliyat tarixidan · ${data.total} ta qo'ng'iroq`}
    >
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric icon={<Phone size={13} />} label="Jami" value={String(data.total)}
                hint={`${data.withRecording} tasida audio bor`} />
        <Metric icon={<PhoneOutgoing size={13} />} label="Chiquvchi" value={String(data.outgoing)} />
        <Metric icon={<PhoneIncoming size={13} />} label="Kiruvchi" value={String(data.incoming)} />
        <Metric icon={<PhoneMissed size={13} />} label="O'tkazib yub." value={String(data.missed)}
                hint={`${missedPct}%`} tone={missedPct >= 10 ? "warn" : "default"} />
        <Metric icon={<Timer size={13} />} label="Median" value={fmtSec(data.medianSeconds)}
                hint={`o'rtacha ${fmtSec(data.avgSeconds)}`} />
      </div>

      <div className="mb-4 rounded-xl border border-border bg-surface-alt p-3.5">
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            {TARGET_SECONDS} soniyadan qisqa qo&apos;ng&apos;iroqlar
          </span>
          <span className={`text-lg font-bold tabular-nums ${data.underTargetPct >= 30 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
            {data.underTargetPct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className={`h-full rounded-full ${data.underTargetPct >= 30 ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(100, data.underTargetPct)}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted">
          Juda qisqa qo&apos;ng&apos;iroq odatda ulanmagan yoki mazmunsiz suhbat degani.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">Menejerlar kesimida</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px] text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-1.5 text-left font-medium">Xodim ID</th>
                  <th className="py-1.5 text-right font-medium">Qo&apos;ng&apos;iroq</th>
                  <th className="py-1.5 text-right font-medium">O&apos;rtacha</th>
                  <th className="py-1.5 text-right font-medium">O&apos;tkazib yub.</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {data.byManager.slice(0, 8).map((m) => (
                  <tr key={m.id} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 text-foreground">#{m.id}</td>
                    <td className="py-1.5 text-right text-foreground">{m.count}</td>
                    <td className="py-1.5 text-right text-muted">{fmtSec(m.avgSeconds)}</td>
                    <td className="py-1.5 text-right text-muted">{m.missed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1.5 text-[11px] text-muted">
            Ism o&apos;rniga ID — webhook&apos;da &quot;Foydalanuvchilar&quot; ruxsati yo&apos;q.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-foreground">Kunlar bo&apos;yicha (oxirgi 14 kun)</p>
          <div className="flex h-28 items-end gap-1">
            {lastDays.map((d) => (
              <div key={d.day} className="group flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-brand/70 transition-colors group-hover:bg-brand"
                  style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                  title={`${d.day}: ${d.count} qo'ng'iroq`}
                />
                <span className="text-[9px] text-muted">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
