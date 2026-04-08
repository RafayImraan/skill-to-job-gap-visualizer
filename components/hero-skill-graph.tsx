"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls, Sphere, Stars, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Group } from "three";

type HeroNode = {
  label: string;
  position: [number, number, number];
  color: string;
};

const nodes: HeroNode[] = [
  { label: "Frontend Core", position: [0, 0, 0], color: "#5EE9FF" },
  { label: "React", position: [-2.6, 1.2, 0.2], color: "#00E38C" },
  { label: "Next.js", position: [2.9, 1.1, -0.1], color: "#00E38C" },
  { label: "TypeScript", position: [0.9, 2.7, 0.3], color: "#FFB020" },
  { label: "Testing", position: [3.3, -0.9, 0.4], color: "#FFB020" },
  { label: "SQL", position: [-3.4, -0.4, -0.1], color: "#FF5A7A" },
  { label: "Docker", position: [-2.1, 2.5, 0.2], color: "#FFB020" },
  { label: "System Design", position: [0.3, -3, 0.1], color: "#FF5A7A" },
  { label: "Dream Role", position: [0, 4.2, -0.4], color: "#B47CFF" },
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

function SkillConstellation() {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.35) * 0.08;
  });

  return (
    <group ref={groupRef}>
      {links.map(([fromIndex, toIndex], index) => (
        <Line
          key={`${fromIndex}-${toIndex}-${index}`}
          points={[nodes[fromIndex].position, nodes[toIndex].position]}
          color={index % 3 === 0 ? "#FFB020" : "rgba(94, 233, 255, 0.85)"}
          lineWidth={1.1}
          transparent
          opacity={0.7}
        />
      ))}

      {nodes.map((node) => (
        <group key={node.label} position={node.position}>
          <Sphere args={[0.16, 32, 32]}>
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={1.35} />
          </Sphere>
          <Html center distanceFactor={12}>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(10,10,15,0.7)",
                color: "white",
                fontSize: 11,
                whiteSpace: "nowrap",
                backdropFilter: "blur(8px)",
              }}
            >
              {node.label}
            </div>
          </Html>
        </group>
      ))}

      <Text position={[0, -4.25, 0]} fontSize={0.34} color="#94A3B8">
        Skill Galaxy
      </Text>
    </group>
  );
}

export function HeroSkillGraph() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ringStyle = useMemo(
    () => [
      { width: 220, height: 220, opacity: 0.18 },
      { width: 320, height: 320, opacity: 0.14 },
      { width: 430, height: 430, opacity: 0.1 },
    ],
    [],
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
    <div ref={wrapperRef} style={{ position: "relative", minHeight: 340, borderRadius: 24, overflow: "hidden" }}>
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
            boxShadow: "0 0 42px rgba(94, 233, 255, 0.08)",
          }}
        />
      ))}

      <Canvas camera={{ position: [0, 0, 8.5], fov: 52 }}>
        <ambientLight intensity={0.85} />
        <pointLight position={[8, 7, 8]} intensity={14} color="#5EE9FF" />
        <pointLight position={[-6, -4, 6]} intensity={9} color="#B47CFF" />
        <Stars radius={60} depth={30} count={2000} factor={3} saturation={0.2} fade speed={0.7} />
        <SkillConstellation />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.45} />
      </Canvas>
    </div>
  );
}
