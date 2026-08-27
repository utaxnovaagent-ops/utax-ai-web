"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { RotateCcw, Layers, List, Box as BoxIcon, X, Wifi, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PageHeader, Card, Badge, toneForLevel } from "@/components/ui";
import { AGENTS, ZONES, AgentState, zoneByKey } from "@/lib/campus-data";
import { useAppState } from "@/lib/app-context";
import { t } from "@/lib/i18n";

const CampusScene = dynamic(() => import("@/components/campus/CampusScene").then((m) => m.CampusScene), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted">3D sahna yuklanmoqda...</div>
  ),
});

const stateKey: Record<AgentState, string> = {
  IDLE: "campus_state_idle",
  WALK: "campus_state_walk",
  SIT: "campus_state_sit",
  WORK: "campus_state_work",
  MEETING: "campus_state_meeting",
  TALK: "campus_state_talk",
  ERROR: "campus_state_error",
};

// "rejada" agent hech qachon "Ishlamoqda" deb ko'rsatilmasin — simulyatsiya
// holatidan qat'i nazar, demoStatus birinchi navbatda hisobga olinadi
// (TZI "3D Campus 2.0" AC-05/AC-06/AC-20).
function displayStatusKey(agentId: string, simState: AgentState): string {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (agent?.demoStatus === "planned") return "campus_state_planned";
  if (agent?.demoStatus === "partial" && (simState === "WORK" || simState === "SIT")) return "campus_state_partial";
  return stateKey[simState];
}

const AI_AGENT_COUNT = AGENTS.filter((a) => a.entityType !== "human").length;
const WEBGL_TIMEOUT_MS = 8000;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function CampusPage() {
  return (
    <Suspense fallback={null}>
      <CampusPageInner />
    </Suspense>
  );
}

function CampusPageInner() {
  const { lang } = useAppState();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"3d" | "list">("3d");
  const [fallbackReason, setFallbackReason] = useState<"webgl_unsupported" | "timeout" | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, { state: AgentState; task: string }>>(
    Object.fromEntries(
      AGENTS.map((a) => [a.id, { state: (a.demoStatus === "planned" ? "IDLE" : "WORK") as AgentState, task: a.taskPool[0] ?? "" }])
    )
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  // WebGL 3D sahna 8 soniyada tayyor bo'lmasa yoki brauzerda WebGL umuman
  // yo'q bo'lsa — bo'sh canvas'da qolib ketmasdan, 2D ro'yxatga o'tadi (P0).
  useEffect(() => {
    if (!hasWebGL()) {
      setFallbackReason("webgl_unsupported");
      setView("list");
      return;
    }
    const timeout = window.setTimeout(() => {
      setSceneReady((ready) => {
        if (!ready) {
          setFallbackReason("timeout");
          setView("list");
        }
        return ready;
      });
    }, WEBGL_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasKey]);

  // Deep-link: /campus?department=sotuv&agent=botir-ai — sahifa ochilganda
  // to'g'ridan-to'g'ri kerakli agentni tanlab, drawer'ni ochadi.
  useEffect(() => {
    const agentParam = searchParams.get("agent");
    const deptParam = searchParams.get("department");
    if (agentParam && AGENTS.some((a) => a.id === agentParam || a.id === `sotuv-${agentParam}`)) {
      const match = AGENTS.find((a) => a.id === agentParam || a.id === `sotuv-${agentParam}`);
      if (match) setSelectedId(match.id);
    } else if (deptParam) {
      const first = AGENTS.find((a) => a.zoneKey === deptParam);
      if (first) setSelectedId(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // Mobil brauzer sahifani fonga yuborib, keyin qaytarganda WebGL kontekstini
    // jimgina yo'qotishi mumkin (context-lost hodisasi kechikishi yoki
    // umuman signal bermasligi mumkin) — shu sababli qo'shimcha xavfsizlik
    // chorasi sifatida sahna har safar qayta ko'rinishga kelganda yangilanadi.
    function onVisible() {
      if (document.visibilityState === "visible") {
        setCanvasKey((k) => k + 1);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const selectedAgent = useMemo(() => AGENTS.find((a) => a.id === selectedId) ?? null, [selectedId]);
  const selectedZone = selectedAgent ? zoneByKey(selectedAgent.zoneKey) : null;
  const selectedStatus = selectedId ? statuses[selectedId] : null;

  function handleStateChange(id: string, state: AgentState, task: string) {
    setStatuses((prev) => ({ ...prev, [id]: { state, task } }));
  }

  function retry3d() {
    setFallbackReason(null);
    setSceneReady(false);
    setCanvasKey((k) => k + 1);
    setView("3d");
  }

  return (
    <div>

      <PageHeader title={t("campus_title", lang)} subtitle={t("campus_subtitle", lang, { agentCount: AI_AGENT_COUNT, deptCount: ZONES.length })}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setView("3d")}
              disabled={fallbackReason === "webgl_unsupported"}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                view === "3d" ? "bg-brand text-brand-contrast" : "text-foreground hover:bg-surface-alt"
              }`}
            >
              <BoxIcon size={13} /> {t("campus_view_3d", lang)}
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                view === "list" ? "bg-brand text-brand-contrast" : "text-foreground hover:bg-surface-alt"
              }`}
            >
              <List size={13} /> {t("campus_view_list", lang)}
            </button>
          </div>
          <button
            onClick={() => setReducedMotion((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-alt ${
              reducedMotion ? "bg-brand-light text-brand" : "text-foreground"
            }`}
          >
            <Layers size={13} /> {reducedMotion ? t("campus_motion_off", lang) : t("campus_motion_on", lang)}
          </button>
          {view === "3d" && (
            <button
              onClick={() => setCanvasKey((k) => k + 1)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-alt"
            >
              <RotateCcw size={13} /> {t("campus_reset_camera", lang)}
            </button>
          )}
        </div>
      </PageHeader>

      <div className="flex items-center gap-1.5 rounded-lg bg-info-bg px-3 py-1.5 text-xs text-info mb-2 w-fit">
        <Wifi size={13} />
        {t("campus_demo_notice", lang)}
      </div>

      {fallbackReason && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-warning-bg px-3 py-1.5 text-xs text-warning">
          <AlertTriangle size={13} />
          {t(fallbackReason === "webgl_unsupported" ? "campus_fallback_webgl" : "campus_fallback_timeout", lang)}
          {fallbackReason === "timeout" && (
            <button onClick={retry3d} className="ml-1 font-semibold underline underline-offset-2">
              {t("campus_retry_3d", lang)}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card className="relative flex-1 !p-0 overflow-hidden">
          {view === "3d" ? (
            <div className="h-[560px] w-full">
              <CampusScene
                key={canvasKey}
                reducedMotion={reducedMotion}
                selectedId={selectedId}
                lang={lang}
                onSelect={(id, state, task) => {
                  setSelectedId(id);
                  handleStateChange(id, state, task);
                }}
                onStateChange={handleStateChange}
                onContextLost={() => setCanvasKey((k) => k + 1)}
                onReady={() => setSceneReady(true)}
              />
            </div>
          ) : (
            <div className="h-[560px] overflow-y-auto p-5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted">
                    <th className="pb-2 font-medium">{t("campus_col_agent", lang)}</th>
                    <th className="pb-2 font-medium">{t("campus_col_department", lang)}</th>
                    <th className="pb-2 font-medium">{t("campus_col_status", lang)}</th>
                    <th className="pb-2 font-medium">{t("campus_col_task", lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENTS.map((a) => {
                    const z = zoneByKey(a.zoneKey);
                    const st = statuses[a.id];
                    return (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedId(a.id)}
                        className="cursor-pointer border-b border-border last:border-0 hover:bg-surface-alt"
                      >
                        <td className="py-2.5 font-medium text-foreground">{a.name}</td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center gap-1.5 text-muted">
                            <span className="h-2 w-2 rounded-full" style={{ background: z.color }} />
                            {t(`nav_${z.key}`, lang)}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <Badge
                            tone={
                              a.demoStatus === "planned"
                                ? "neutral"
                                : a.demoStatus === "partial" && (st.state === "WORK" || st.state === "SIT")
                                  ? "warning"
                                  : toneForLevel(st.state === "ERROR" ? "yuqori" : st.state === "WORK" ? "sog'lom" : "o'rta")
                            }
                          >
                            {t(displayStatusKey(a.id, st.state), lang)}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-muted">{st.task}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {selectedAgent && selectedZone && selectedStatus && (
          <Card className="relative w-80 flex-shrink-0" title={t("campus_inspector_title", lang)} subtitle={t("campus_inspector_subtitle", lang)}>
            <button
              onClick={() => setSelectedId(null)}
              className="absolute right-4 top-4 text-muted hover:text-foreground"
              aria-label="Yopish"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: selectedAgent.color }}
              >
                {selectedAgent.name.slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedAgent.name}</p>
                <p className="text-xs text-muted">{selectedAgent.role}</p>
              </div>
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t("campus_field_department", lang)}</dt>
                <dd className="font-medium text-foreground">{t(`nav_${selectedZone.key}`, lang)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">{t("campus_field_status", lang)}</dt>
                <dd>
                  <Badge
                    tone={
                      selectedAgent.demoStatus === "planned"
                        ? "neutral"
                        : selectedAgent.demoStatus === "partial" && (selectedStatus.state === "WORK" || selectedStatus.state === "SIT")
                          ? "warning"
                          : toneForLevel(selectedStatus.state === "ERROR" ? "yuqori" : "sog'lom")
                    }
                  >
                    {t(displayStatusKey(selectedAgent.id, selectedStatus.state), lang)}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted">
                  {selectedAgent.demoStatus === "planned" ? t("campus_field_planned_task", lang) : t("campus_field_task", lang)}
                </dt>
                <dd className="max-w-[60%] text-right font-medium text-foreground">{selectedStatus.task}</dd>
              </div>
            </dl>

            {selectedAgent.demoStatus !== "planned" && selectedAgent.taskPool.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-xs font-semibold text-muted">{t("campus_timeline_title", lang)}</p>
                <ul className="space-y-1.5 text-xs text-muted">
                  {selectedAgent.taskPool.slice(0, 3).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedZone?.key === "sotuv" && (
              <Link
                href="/sotuv#sales-agents"
                className="mt-4 flex items-center justify-center gap-1.5 rounded-lg brand-gradient px-4 py-2 text-xs font-semibold text-white shadow-brand"
              >
                {t("campus_go_to_sales", lang)}
              </Link>
            )}
          </Card>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-9">
        {ZONES.map((z) => (
          <div key={z.key} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: z.color }} />
            <span className="font-medium text-foreground">{t(`nav_${z.key}`, lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
