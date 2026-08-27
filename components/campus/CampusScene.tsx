"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Billboard, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { ZONES, AGENTS, desksForZone, zoneByKey, HUB_Z, MEETING_TABLE, meetingSeat, AgentState } from "@/lib/campus-data";
import { Lang, t } from "@/lib/i18n";
import { Agent } from "./Agent";

// Sahna keng korridor (landscape) uchun mo'ljallangan. Tor/portret ekranlarda
// (masalan telefon) xuddi shu kamera FOV bilan sahnaning ko'p qismi kesilib qolmasligi
// uchun konteyner nisbatiga qarab kamerani orqaga tortadi.
function CameraFit() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useEffect(() => {
    const aspect = size.width / size.height;
    const scale = Math.min(2.4, Math.max(1, 1.55 / aspect));
    camera.position.set(0, 26 * scale, 36 * scale);
    camera.lookAt(0, 1, 4);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.updateProjectionMatrix();
    }
  }, [size.width, size.height, camera]);

  return null;
}

// Ba'zi konteynerlarda (masalan sahifa fonda ochilganda yoki hydration
// paytida) Canvas'ning ResizeObserver orqali o'lchanishi birinchi kadrda
// ishlamay qolishi mumkin — canvas standart 300x150 o'lchamda qotib qoladi.
// Shu holatni tuzatish uchun bir necha kadr davomida konteyner o'lchamini
// qo'lda tekshirib, kerak bo'lsa sahnani majburan qayta o'lchaymiz.
function ResizeKick() {
  const gl = useThree((s) => s.gl);
  const setSize = useThree((s) => s.setSize);
  const size = useThree((s) => s.size);

  useEffect(() => {
    let frame = 0;
    let raf = 0;

    const tick = () => {
      const parent = gl.domElement.parentElement;
      const w = parent?.clientWidth ?? 0;
      const h = parent?.clientHeight ?? 0;
      if (w > 0 && h > 0 && (w !== size.width || h !== size.height)) {
        setSize(w, h);
        return;
      }
      frame += 1;
      if (frame < 15) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, setSize]);

  return null;
}

function Desk({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.06, 0.6]} />
        <meshStandardMaterial color="#e5e0d8" />
      </mesh>
      {[
        [-0.48, -0.24],
        [0.48, -0.24],
        [-0.48, 0.24],
        [0.48, 0.24],
      ].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.19, lz]}>
          <boxGeometry args={[0.06, 0.38, 0.06]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      ))}
      <mesh position={[0, 0.62, -0.18]}>
        <boxGeometry args={[0.42, 0.28, 0.03]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

function MeetingTable({ seatCount }: { seatCount: number }) {
  const seats = Array.from({ length: seatCount }, (_, i) => meetingSeat(i, seatCount));
  return (
    <group>
      {/* Aylana stol */}
      <mesh position={[MEETING_TABLE.x, 0.72, MEETING_TABLE.z]} castShadow receiveShadow>
        <cylinderGeometry args={[MEETING_TABLE.tableRadius, MEETING_TABLE.tableRadius, 0.06, 40]} />
        <meshStandardMaterial color="#caa06a" />
      </mesh>
      <mesh position={[MEETING_TABLE.x, 0.36, MEETING_TABLE.z]} castShadow>
        <cylinderGeometry args={[0.13, 0.19, 0.72, 20]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh position={[MEETING_TABLE.x, 0.03, MEETING_TABLE.z]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 28]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Aylana stolchalar */}
      {seats.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <mesh position={[0, MEETING_TABLE.seatHeight, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.27, 0.27, 0.06, 24]} />
            <meshStandardMaterial color="#4c1d95" />
          </mesh>
          <mesh position={[0, MEETING_TABLE.seatHeight / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, MEETING_TABLE.seatHeight, 12]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ZoneFloor({ x, color, label }: { x: number; color: string; label: string }) {
  return (
    <group>
      <mesh position={[x, 0.005, 8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color={color} transparent opacity={0.14} />
      </mesh>
      <Billboard position={[x, 3.4, HUB_Z]}>
        <Text fontSize={0.42} color={color} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#ffffff">
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

interface Props {
  reducedMotion: boolean;
  selectedId: string | null;
  lang: Lang;
  onSelect: (id: string, state: AgentState, task: string) => void;
  onStateChange: (id: string, state: AgentState, task: string) => void;
  onContextLost?: () => void;
  onReady?: () => void;
}

export function CampusScene({ reducedMotion, selectedId, lang, onSelect, onStateChange, onContextLost, onReady }: Props) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 26, 36], fov: 42, far: 300 }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        // Mobil brauzerlar (ayniqsa iOS Safari) xotira tejash uchun sahna fonga
        // o'tganda WebGL kontekstini yo'qotib qo'yishi mumkin — bunda sahna kanvas
        // to'liq bo'shab qoladi. Buni ushlab, sahnani to'liq qayta yaratamiz.
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            onContextLost?.();
          },
          { once: true }
        );
        onReady?.();
      }}
    >
      <color attach="background" args={["#eef0f6"]} />
      <fog attach="fog" args={["#eef0f6", 50, 190]} />
      <hemisphereLight args={["#ffffff", "#d8dbe6", 0.9]} />
      <directionalLight position={[15, 22, 10]} intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <CameraFit />
      <ResizeKick />

      <Suspense fallback={null}>
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 3]}>
          <planeGeometry args={[64, 26]} />
          <meshStandardMaterial color="#f5f3ee" />
        </mesh>

        {/* Corridor strip */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
          <planeGeometry args={[62, 2.4]} />
          <meshStandardMaterial color="#dcdfe6" />
        </mesh>

        {/* Yig'ilish maydoni: gilam + aylana stol va stolchalar */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -4]} receiveShadow>
          <circleGeometry args={[2.9, 32]} />
          <meshStandardMaterial color="#ece7fb" />
        </mesh>
        <Billboard position={[0, 2.4, -4]}>
          <Text fontSize={0.3} color="#4c1d95" anchorX="center" outlineWidth={0.015} outlineColor="#ffffff">
            Yig'ilish maydoni
          </Text>
        </Billboard>
        <MeetingTable seatCount={AGENTS.length} />

        {ZONES.map((z) => (
          <ZoneFloor key={z.key} x={z.x} color={z.color} label={t(`nav_${z.key}`, lang)} />
        ))}

        {ZONES.flatMap((z) => desksForZone(z, AGENTS.filter((a) => a.zoneKey === z.key).length)).map((d) => (
          <Desk key={d.id} x={d.x} z={d.z} />
        ))}

        {AGENTS.map((a, i) => {
          const zoneAgents = AGENTS.filter((x) => x.zoneKey === a.zoneKey);
          const deskIndex = zoneAgents.findIndex((x) => x.id === a.id);
          const ownDesk = desksForZone(zoneByKey(a.zoneKey), zoneAgents.length)[deskIndex];
          return (
            <Agent
              key={a.id}
              agent={a}
              ownDesk={ownDesk}
              seatIndex={i}
              seatTotal={AGENTS.length}
              selected={selectedId === a.id}
              reducedMotion={reducedMotion}
              onSelect={onSelect}
              onStateChange={onStateChange}
            />
          );
        })}

        <ContactShadows position={[0, 0, 3]} opacity={0.25} scale={64} blur={2} far={10} />
      </Suspense>

      <OrbitControls
        makeDefault
        target={[0, 1, 4]}
        enablePan
        minDistance={8}
        maxDistance={120}
        maxPolarAngle={Math.PI / 2.15}
      />
    </Canvas>
  );
}
