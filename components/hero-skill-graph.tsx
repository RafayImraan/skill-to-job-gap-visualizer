"use client";

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { Float, Line, OrbitControls, Sparkles, Sphere, Stars, Text, Torus } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Group, Mesh } from "three";

type HeroNode = {
  id: string;
  label: string;
  category: string;
  score: number;
  status: "core" | "strong" | "growing" | "missing" | "target";
  position: [number, number, number];
  color: string;
  size: number;
  description: string;
};

const nodes: HeroNode[] = [
  {
    id: "core",
    label: "Frontend Core",
    category: "Profile nucleus",
    score: 92,
    status: "core",
    position: [0, -0.15, 0],
    color: "#5EE9FF",
    size: 0.28,
    description: "Your strongest cluster. This is the anchor the rest of the graph should orbit around.",
  },
  {
    id: "react",
    label: "React",
    category: "Production strength",
    score: 88,
    status: "strong",
    position: [-2.9, 1.15, 1.4],
    color: "#00E38C",
    size: 0.18,
    description: "Healthy signal. This should feel close to the core and visually confident.",
  },
  {
    id: "next",
    label: "Next.js",
    category: "Production strength",
    score: 84,
    status: "strong",
    position: [2.8, 1.25, -1.3],
    color: "#7CF7FF",
    size: 0.18,
    description: "High-value framework skill that should connect directly to your role trajectory.",
  },
  {
    id: "typescript",
    label: "TypeScript",
    category: "Growing edge",
    score: 71,
    status: "growing",
    position: [0.8, 2.75, 1.9],
    color: "#FFB020",
    size: 0.16,
    description: "Important but still improving. This is where a premium graph should show upward motion.",
  },
  {
    id: "testing",
    label: "Testing",
    category: "Growing edge",
    score: 63,
    status: "growing",
    position: [3.55, -0.95, 1.25],
    color: "#FFD66E",
    size: 0.15,
    description: "Undersupplied compared to strong candidates. Worth highlighting through a softer amber treatment.",
  },
  {
    id: "sql",
    label: "SQL",
    category: "Needs work",
    score: 49,
    status: "missing",
    position: [-3.85, -0.55, -1.75],
    color: "#FF5A7A",
    size: 0.16,
    description: "Relevant but behind market expectations. Missing skills should sit further out with tension.",
  },
  {
    id: "docker",
    label: "Docker",
    category: "Growing edge",
    score: 58,
    status: "growing",
    position: [-1.95, 2.45, -1.55],
    color: "#F5C15B",
    size: 0.15,
    description: "Still developing. This is a good candidate for animated links toward the target role.",
  },
  {
    id: "system",
    label: "System Design",
    category: "Needs work",
    score: 43,
    status: "missing",
    position: [0.45, -3.2, -2.1],
    color: "#FF6B8A",
    size: 0.18,
    description: "A role-defining gap. This should read as distant, important, and slightly unstable.",
  },
  {
    id: "target",
    label: "Dream Role",
    category: "Career beacon",
    score: 96,
    status: "target",
    position: [0, 3.95, -3.25],
    color: "#B47CFF",
    size: 0.23,
    description: "The destination object. Everything should visually pull toward this beacon.",
  },
];

const links: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [0, 5],
  [1, 6],
  [0, 7],
  [3, 8],
  [6, 8],
  [7, 8],
];

function curvePoints(from: HeroNode["position"], to: HeroNode["position"]) {
  const midpoint: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 + 0.45,
    (from[2] + to[2]) / 2 + (to[2] - from[2]) * 0.18,
  ];

  return [from, midpoint, to];
}

function NodeOrb({
  node,
  active,
  onHover,
  onLeave,
}: {
  node: HeroNode;
  active: boolean;
  onHover: (nodeId: string) => void;
  onLeave: () => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const shellRef = useRef<Mesh>(null);
  const auraRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = active ? 1.18 + Math.sin(t * 2.6) * 0.1 : 1 + Math.sin(t * 1.8 + node.position[0]) * 0.05;
    const glow = active ? 1.9 : node.status === "missing" ? 1.3 : 1.1;

    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulse);
      meshRef.current.position.y = Math.sin(t * 1.2 + node.position[1]) * 0.03;
    }

    if (shellRef.current) {
      shellRef.current.rotation.x = t * 0.6;
      shellRef.current.rotation.y = t * 0.85;
      shellRef.current.scale.setScalar(active ? 1.28 : 1.08);
    }

    if (auraRef.current) {
      auraRef.current.scale.setScalar(glow);
    }
  });

  const textColor = node.status === "target" ? "#E6D7FF" : node.status === "missing" ? "#FFD4DD" : "#EAFBFF";

  return (
    <Float speed={active ? 2.4 : 1.4} rotationIntensity={active ? 0.26 : 0.12} floatIntensity={active ? 0.4 : 0.18}>
      <group
        position={node.position}
        onPointerOver={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onHover(node.id);
        }}
        onPointerOut={(event: ThreeEvent<PointerEvent>) => {
          event.stopPropagation();
          onLeave();
        }}
      >
        <Sphere ref={auraRef} args={[node.size * 1.95, 32, 32]}>
          <meshBasicMaterial color={node.color} transparent opacity={active ? 0.14 : 0.08} />
        </Sphere>

        <Sphere ref={meshRef} args={[node.size, 48, 48]}>
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={active ? 2.4 : 1.5}
            roughness={0.22}
            metalness={0.2}
          />
        </Sphere>

        {(node.status === "target" || node.status === "core") && (
          <Torus ref={shellRef} args={[node.size * 1.8, node.size * 0.13, 24, 80]}>
            <meshBasicMaterial color={node.color} transparent opacity={active ? 0.72 : 0.44} />
          </Torus>
        )}

        <Text
          position={[0, node.size + 0.32, 0]}
          fontSize={node.status === "target" ? 0.26 : 0.2}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="rgba(2, 6, 23, 0.95)"
        >
          {node.label}
        </Text>
      </group>
    </Float>
  );
}

function SkillConstellation({
  hoveredNode,
  onHover,
  onLeave,
}: {
  hoveredNode: string | null;
  onHover: (nodeId: string) => void;
  onLeave: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const coreHaloRef = useRef<Mesh>(null);
  const beaconRef = useRef<Mesh>(null);

  const activeLinks = useMemo(() => {
    if (!hoveredNode) {
      return new Set<string>();
    }

    const active = new Set<string>();
    for (const [fromIndex, toIndex] of links) {
      const from = nodes[fromIndex].id;
      const to = nodes[toIndex].id;
      if (from === hoveredNode || to === hoveredNode) {
        active.add(`${fromIndex}-${toIndex}`);
      }
    }
    return active;
  }, [hoveredNode]);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.08;
    groupRef.current.rotation.x = Math.sin(t * 0.32) * 0.06;
    groupRef.current.position.y = Math.sin(t * 0.45) * 0.08;

    if (coreHaloRef.current) {
      coreHaloRef.current.rotation.z = t * 0.35;
      coreHaloRef.current.scale.setScalar(1.05 + Math.sin(t * 1.6) * 0.04);
    }

    if (beaconRef.current) {
      beaconRef.current.rotation.x = t * 0.2;
      beaconRef.current.rotation.y = t * 0.45;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere position={[0, -0.15, -0.1]} args={[1.2, 40, 40]}>
        <meshBasicMaterial color="#0EA5E9" transparent opacity={0.06} />
      </Sphere>

      <Torus ref={coreHaloRef} position={[0, -0.15, 0]} args={[1.55, 0.04, 24, 96]}>
        <meshBasicMaterial color="#5EE9FF" transparent opacity={0.28} />
      </Torus>

      <Torus ref={beaconRef} position={[0, 3.95, -3.25]} args={[0.62, 0.03, 24, 96]}>
        <meshBasicMaterial color="#D5B6FF" transparent opacity={0.65} />
      </Torus>

      {links.map(([fromIndex, toIndex], index) => (
        <Line
          key={`${fromIndex}-${toIndex}-${index}`}
          points={curvePoints(nodes[fromIndex].position, nodes[toIndex].position)}
          color={activeLinks.has(`${fromIndex}-${toIndex}`) ? "#FFE29A" : index % 3 === 0 ? "#FFB020" : "#7BE7FF"}
          lineWidth={activeLinks.has(`${fromIndex}-${toIndex}`) ? 2.2 : 1.05}
          transparent
          opacity={activeLinks.has(`${fromIndex}-${toIndex}`) ? 0.95 : 0.38}
        />
      ))}

      {nodes.map((node) => (
        <NodeOrb
          key={node.id}
          node={node}
          active={hoveredNode === node.id}
          onHover={onHover}
          onLeave={onLeave}
        />
      ))}

      <Sparkles count={70} scale={[10, 7, 8]} size={2.8} speed={0.22} color="#9BE7FF" />

      <Text position={[0, -4.38, 0]} fontSize={0.34} color="#A5B4FC" anchorX="center" anchorY="middle">
        Skill Galaxy
      </Text>
    </group>
  );
}

export function HeroSkillGraph() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const ringStyle = useMemo(
    () => [
      { width: 220, height: 220, opacity: 0.2 },
      { width: 340, height: 340, opacity: 0.14 },
      { width: 470, height: 470, opacity: 0.08 },
    ],
    [],
  );

  const focusedNode = useMemo(
    () => nodes.find((node) => node.id === hoveredNode) ?? nodes.find((node) => node.id === "target") ?? nodes[0],
    [hoveredNode],
  );

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!wrapperRef.current) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        wrapperRef.current,
        { scale: 0.92, y: 40, opacity: 0.65 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
          },
        },
      );
    }, wrapperRef);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        minHeight: 380,
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 35%, rgba(94,233,255,0.18), transparent 34%), radial-gradient(circle at 72% 18%, rgba(180,124,255,0.16), transparent 26%), linear-gradient(180deg, rgba(4,10,24,0.95), rgba(2,6,23,0.98))",
      }}
    >
      {ringStyle.map((ring) => (
        <div
          key={`${ring.width}-${ring.height}`}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: ring.width,
            height: ring.height,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${ring.opacity})`,
            boxShadow: "0 0 56px rgba(94, 233, 255, 0.08)",
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: 18,
          top: 18,
          zIndex: 2,
          padding: "12px 14px",
          borderRadius: 18,
          maxWidth: 220,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(8, 15, 28, 0.62)",
          backdropFilter: "blur(14px)",
          color: "#E2E8F0",
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#7DD3FC" }}>
          {focusedNode.category}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>{focusedNode.label}</div>
        <div style={{ fontSize: 12, lineHeight: 1.55, marginTop: 8, color: "#B8C3D9" }}>{focusedNode.description}</div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          zIndex: 2,
          display: "grid",
          gap: 8,
          minWidth: 150,
          padding: "12px 14px",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(8, 15, 28, 0.55)",
          backdropFilter: "blur(14px)",
          color: "#E2E8F0",
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "#C4B5FD" }}>
          Hover Focus
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{focusedNode.score}%</div>
        <div style={{ fontSize: 12, color: "#B8C3D9" }}>Nodes in front/back layers now create actual depth.</div>
      </div>

      <Canvas camera={{ position: [0, 0.2, 9.8], fov: 46 }}>
        <fog attach="fog" args={["#020617", 8, 18]} />
        <ambientLight intensity={0.55} />
        <pointLight position={[8, 7, 8]} intensity={16} color="#5EE9FF" />
        <pointLight position={[-7, -5, 5]} intensity={11} color="#B47CFF" />
        <pointLight position={[0, 4, -6]} intensity={10} color="#FFE29A" />
        <Stars radius={75} depth={34} count={2600} factor={3.4} saturation={0.2} fade speed={0.55} />
        <SkillConstellation hoveredNode={hoveredNode} onHover={setHoveredNode} onLeave={() => setHoveredNode(null)} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 2.35}
          maxPolarAngle={Math.PI / 1.8}
          rotateSpeed={0.45}
        />
      </Canvas>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 14,
          transform: "translateX(-50%)",
          padding: "8px 12px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(6, 11, 23, 0.62)",
          color: "#94A3B8",
          fontSize: 11,
          letterSpacing: 0.4,
          pointerEvents: "none",
        }}
      >
        Drag to orbit. Hover nodes to inspect skill gravity.
      </div>
    </div>
  );
}
