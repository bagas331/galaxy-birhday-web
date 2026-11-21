"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CelestialBodyId, SectionId } from "@/types/universe";
import { useUniverseStore } from "@/lib/universe-store";
import { registerBody, unregisterBody } from "../body-registry";
import { getGlowTexture, getPlanetTexture } from "@/lib/textures";

export interface OrbitStructureProps {
  id: CelestialBodyId;
  section: SectionId;
  label: string;
  accent: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  startAngle: number;
}

const MOON_COUNT = 7;

/**
 * "Our Orbit" — the timeline celestial body: a small blue world wrapped
 * in a wide glowing ring of memory-moons, each one a moment that keeps
 * circling around it.
 */
export function OrbitStructure(props: OrbitStructureProps) {
  const { id, section, accent, size, orbitRadius, orbitSpeed, orbitTilt, startAngle } =
    props;

  const anchorRef = useRef<THREE.Group>(null);
  const moonsRef = useRef<THREE.Group>(null);
  const angleRef = useRef(startAngle);
  const currentSpeed = useRef(orbitSpeed);
  const [hovered, setHovered] = useState(false);
  const openSection = useUniverseStore((s) => s.openSection);

  const surface = useMemo(
    () => getPlanetTexture(id, { palette: ["#1E3A8A", "#4B9CFF", "#73E7F5"], turbulence: 0.22, bandFrequency: 4, seed: 9 }),
    [id],
  );
  const glowTexture = useMemo(() => getGlowTexture(), []);

  const ringRadius = size * 2.4;

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    registerBody(id, { object: anchor, size: size * 2.6, labelOffset: size * 2.4 + 0.8 });
    return () => unregisterBody(id);
  }, [id, size]);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const { activeSection } = useUniverseStore.getState();
    const targetSpeed = activeSection ? 0 : orbitSpeed;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.06);
    angleRef.current += currentSpeed.current * clampedDelta;

    const anchor = anchorRef.current;
    if (anchor) {
      anchor.position.set(
        Math.cos(angleRef.current) * orbitRadius,
        0,
        Math.sin(angleRef.current) * orbitRadius,
      );
      const s = THREE.MathUtils.lerp(anchor.scale.x, hovered ? 1.1 : 1, 0.1);
      anchor.scale.setScalar(s);
    }
    if (moonsRef.current) {
      moonsRef.current.rotation.y += clampedDelta * 0.5;
      moonsRef.current.rotation.x = 0.42;
    }
  });

  const moonAngles = useMemo(
    () => Array.from({ length: MOON_COUNT }, (_, i) => (i / MOON_COUNT) * Math.PI * 2),
    [],
  );

  return (
    <group rotation={[orbitTilt, 0, 0]}>
      <group ref={anchorRef}>
        {/* Core world */}
        <mesh
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            openSection(section);
          }}
        >
          <sphereGeometry args={[size, 40, 40]} />
          <meshStandardMaterial map={surface} roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Halo */}
        <sprite raycast={() => null} scale={[size * 6, size * 6, 1]}>
          <spriteMaterial
            map={glowTexture}
            color={accent}
            transparent
            opacity={hovered ? 0.45 : 0.28}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>

        {/* The memory-moon ring */}
        <group ref={moonsRef}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <ringGeometry args={[ringRadius - 0.02, ringRadius + 0.02, 128]} />
            <meshBasicMaterial
              color={accent}
              transparent
              opacity={hovered ? 0.4 : 0.25}
              side={THREE.DoubleSide}
            />
          </mesh>
          {moonAngles.map((a, i) => (
            <mesh
              key={i}
              position={[Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius]}
              raycast={() => null}
            >
              <sphereGeometry args={[0.075, 12, 12]} />
              <meshBasicMaterial color={i % 2 === 0 ? "#FFD98A" : "#F47ACB"} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
