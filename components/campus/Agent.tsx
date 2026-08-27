"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import { AgentDef, AgentState, HUB_Z, CORRIDOR_Z, MEETING_TABLE, meetingSeat, zoneByKey } from "@/lib/campus-data";

const SPEED = 3.4; // units/sec

interface Props {
  agent: AgentDef;
  ownDesk: { x: number; z: number };
  seatIndex: number;
  seatTotal: number;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: (id: string, state: AgentState, task: string) => void;
  onStateChange?: (id: string, state: AgentState, task: string) => void;
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// "planned" holatidagi agent hali qurilmagan — 3D sahnada hech qachon ishlab
// turgandek yoki yig'ilishga borayotgandek ko'rsatilmaydi (TZI AC-06): o'z
// stolida harakatsiz, xira turadi.
export function Agent({ agent, ownDesk, seatIndex, seatTotal, selected, reducedMotion, onSelect, onStateChange }: Props) {
  const zone = useMemo(() => zoneByKey(agent.zoneKey), [agent.zoneKey]);
  const seat = useMemo(() => meetingSeat(seatIndex, seatTotal), [seatIndex, seatTotal]);
  const isPlanned = agent.demoStatus === "planned";
  const isStatic = isPlanned || agent.entityType === "human" || agent.entityType === "synthesizer";

  const groupRef = useRef<THREE.Group>(null);
  const [state, setState] = useState<AgentState>(isPlanned ? "IDLE" : "WORK");
  const [task, setTask] = useState<string>(agent.taskPool[0] ?? "");

  // Mutable simulation state, kept out of React state for per-frame perf.
  const sim = useRef({
    pos: new THREE.Vector3(ownDesk.x, 0, ownDesk.z),
    queue: [] as THREE.Vector3[],
    holdTimer: randRange(2, 8), // offset so agents desync
    sitTimer: -1, // >=0 while transitioning SIT -> WORK
    phase: 0, // 0=WORK,1=WALK_TO_POD,2=MEETING,3=WALK_TO_DESK
    facing: 0,
    errorChance: Math.random(),
  });

  function setAgentState(next: AgentState, nextTask: string) {
    setState(next);
    setTask(nextTask);
    onStateChange?.(agent.id, next, nextTask);
  }

  function buildPathToPod() {
    const s = sim.current;
    const pts: THREE.Vector3[] = [];
    pts.push(new THREE.Vector3(zone.x, 0, HUB_Z));
    pts.push(new THREE.Vector3(zone.x, 0, CORRIDOR_Z));
    pts.push(new THREE.Vector3(seat.x, 0, CORRIDOR_Z));
    pts.push(new THREE.Vector3(seat.x, 0, seat.z));
    s.queue = pts;
  }

  function buildPathToDesk() {
    const s = sim.current;
    const pts: THREE.Vector3[] = [];
    pts.push(new THREE.Vector3(seat.x, 0, CORRIDOR_Z));
    pts.push(new THREE.Vector3(zone.x, 0, CORRIDOR_Z));
    pts.push(new THREE.Vector3(zone.x, 0, HUB_Z));
    pts.push(new THREE.Vector3(ownDesk.x, 0, ownDesk.z));
    s.queue = pts;
  }

  useFrame((_, delta) => {
    const s = sim.current;
    const group = groupRef.current;
    if (!group) return;

    if (reducedMotion || isStatic) {
      // Rejadagi, sintezator va inson entity'lar yig'ilish/ish aylanmasiga
      // qo'shilmaydi — doim o'z podium/stolida turadi, faqat nafas olishdek
      // yengil bob animatsiyasi bo'ladi (ishlayotgan bo'lib ko'rinmasin uchun).
      group.position.copy(s.pos);
      if (!isPlanned && !reducedMotion) {
        const t = performance.now() / 1000;
        group.position.y = Math.sin(t * 2.2) * 0.015;
      }
      return;
    }

    const speed = SPEED;

    if (s.queue.length > 0) {
      const target = s.queue[0];
      const dir = target.clone().sub(s.pos);
      const dist = dir.length();
      if (dist < 0.08) {
        s.pos.copy(target);
        s.queue.shift();
        if (s.queue.length === 0) {
          // arrived at a hold point
          if (s.phase === 1) {
            s.phase = 2;
            s.holdTimer = randRange(4, 7);
            // Stol markaziga qarab o'tiradi
            s.facing = Math.atan2(MEETING_TABLE.x - seat.x, MEETING_TABLE.z - seat.z);
            const errored = s.errorChance < 0.06;
            setAgentState(errored ? "ERROR" : "MEETING", errored ? "Integratsiya xatosi aniqlandi" : "Hamkorlik: bo'limlararo sinxronizatsiya");
          } else if (s.phase === 3) {
            s.phase = 0;
            s.holdTimer = randRange(9, 16);
            s.sitTimer = 1.1;
            setAgentState("SIT", agent.taskPool[Math.floor(Math.random() * agent.taskPool.length)]);
          }
        }
      } else {
        dir.normalize();
        s.pos.addScaledVector(dir, Math.min(speed * delta, dist));
        s.facing = Math.atan2(dir.x, dir.z);
      }
    } else {
      s.holdTimer -= delta;
      if (s.sitTimer >= 0) {
        s.sitTimer -= delta;
        if (s.sitTimer <= 0) {
          s.sitTimer = -1;
          setAgentState("WORK", task);
        }
      }
      if (s.holdTimer <= 0) {
        if (s.phase === 0) {
          s.phase = 1;
          buildPathToPod();
          setAgentState("WALK", "Yig'ilish maydoniga bormoqda");
        } else if (s.phase === 2) {
          s.phase = 3;
          buildPathToDesk();
          setAgentState("WALK", "Ish stoliga qaytmoqda");
        }
      }
    }

    group.position.copy(s.pos);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, s.facing, 0.15);

    // Idle/working bob
    const t = performance.now() / 1000;
    const bob = state === "WALK" ? Math.sin(t * 8) * 0.06 : state === "WORK" ? Math.sin(t * 4) * 0.02 : 0;
    group.position.y = bob + (state === "MEETING" ? MEETING_TABLE.seatHeight : 0);
  });

  const stateColor: Record<AgentState, string> = {
    IDLE: "#9ca3af",
    WALK: "#2563eb",
    SIT: "#9ca3af",
    WORK: "#16a34a",
    MEETING: "#7c3aed",
    TALK: "#7c3aed",
    ERROR: "#dc2626",
  };
  // "qisman" agent hech qachon "jonli" (yashil) bilan aralashtirilmasin —
  // ish/o'tirish holatida to'q sariq signal beradi, boshqa holatlarda odatiy rang.
  const statusDotColor =
    agent.demoStatus === "planned"
      ? "#94a3b8"
      : agent.demoStatus === "partial" && (state === "WORK" || state === "SIT")
        ? "#d97706"
        : stateColor[state];
  const bodyOpacity = isPlanned ? 0.42 : 1;

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent.id, state, task);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Block-style avatar */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.46, 0.7, 0.28]} />
        <meshStandardMaterial color={agent.color} transparent={isPlanned} opacity={bodyOpacity} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.36, 0.36, 0.36]} />
        <meshStandardMaterial color="#f4d9b8" transparent={isPlanned} opacity={bodyOpacity} />
      </mesh>
      <mesh position={[-0.32, 0.95, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.2]} />
        <meshStandardMaterial color={agent.color} transparent={isPlanned} opacity={bodyOpacity} />
      </mesh>
      <mesh position={[0.32, 0.95, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.2]} />
        <meshStandardMaterial color={agent.color} transparent={isPlanned} opacity={bodyOpacity} />
      </mesh>
      <mesh position={[-0.13, 0.28, 0]} castShadow>
        <boxGeometry args={[0.18, 0.56, 0.2]} />
        <meshStandardMaterial color="#374151" transparent={isPlanned} opacity={bodyOpacity} />
      </mesh>
      <mesh position={[0.13, 0.28, 0]} castShadow>
        <boxGeometry args={[0.18, 0.56, 0.2]} />
        <meshStandardMaterial color="#374151" transparent={isPlanned} opacity={bodyOpacity} />
      </mesh>

      {selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial color="#4c1d95" />
        </mesh>
      )}

      {/* Status dot + label — Billboard keeps it upright & facing camera always */}
      <Billboard position={[0, 2.05, 0]}>
        <mesh>
          <circleGeometry args={[0.09, 16]} />
          <meshBasicMaterial color={statusDotColor} />
        </mesh>
        <Text
          position={[0, 0.26, 0]}
          fontSize={0.22}
          color="#182132"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#ffffff"
        >
          {agent.name}
        </Text>
      </Billboard>
    </group>
  );
}
