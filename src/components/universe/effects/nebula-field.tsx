"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getNebulaTexture } from "@/lib/textures";
import type { DeviceTier } from "@/hooks/use-device-tier";

interface NebulaSpec {
  position: [number, number, number];
  scale: number;
  palette: string[];
  opacity: number;
  rotationSpeed: number;
  seed: number;
}

/** The far, dreamy nebula clouds that give the scene its colour. */
const FAR_FIELDS: NebulaSpec[] = [
  { position: [-38, 10, -46], scale: 72, palette: ["#7544D8", "#F47ACB", "#30105E"], opacity: 0.5, rotationSpeed: 0.004, seed: 21 },
  { position: [44, -8, -38], scale: 66, palette: ["#4B9CFF", "#7544D8", "#F47ACB"], opacity: 0.45, rotationSpeed: -0.003, seed: 22 },
  { position: [10, 24, -60], scale: 80, palette: ["#F47ACB", "#30105E", "#7544D8"], opacity: 0.4, rotationSpeed: 0.002, seed: 23 },
  { position: [-30, -22, -30], scale: 58, palette: ["#73E7F5", "#7544D8", "#080B24"], opacity: 0.35, rotationSpeed: -0.005, seed: 24 },
  { position: [36, 16, 34], scale: 62, palette: ["#7544D8", "#F47ACB", "#4B9CFF"], opacity: 0.38, rotationSpeed: 0.003, seed: 25 },
  { position: [-46, 6, 26], scale: 68, palette: ["#F47ACB", "#73E7F5", "#30105E"], opacity: 0.36, rotationSpeed: -0.004, seed: 26 },
  { position: [8, -30, 12], scale: 54, palette: ["#4B9CFF", "#F47ACB", "#080B24"], opacity: 0.3, rotationSpeed: 0.005, seed: 27 },
];

/** Sprites placed along the intro camera path so the flight feels like flying *through* clouds. */
const INTRO_VEIL: NebulaSpec[] = [
  { position: [-7, 4, 62], scale: 34, palette: ["#7544D8", "#F47ACB"], opacity: 0.55, rotationSpeed: 0.008, seed: 31 },
  { position: [8, -3, 44], scale: 30, palette: ["#4B9CFF", "#7544D8"], opacity: 0.5, rotationSpeed: -0.01, seed: 32 },
  { position: [-5, 2, 26], scale: 26, palette: ["#F47ACB", "#30105E"], opacity: 0.45, rotationSpeed: 0.012, seed: 33 },
];

function NebulaSprite({ spec, reduced }: { spec: NebulaSpec; reduced: boolean }) {
  const ref = useRef<THREE.Sprite>(null);
  const texture = useMemo(
    () => getNebulaTexture(`n-${spec.seed}`, spec.palette, spec.seed),
    [spec.palette, spec.seed],
  );

  useFrame((_, delta) => {
    const sprite = ref.current;
    if (!sprite || reduced) return;
    sprite.material.rotation += spec.rotationSpeed * Math.min(delta, 0.05);
  });

  return (
    <sprite ref={ref} position={spec.position} scale={[spec.scale, spec.scale, 1]} raycast={() => null}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={spec.opacity}
        depthWrite={false}
      />
    </sprite>
  );
}

export function NebulaField({ tier, reduced }: { tier: DeviceTier; reduced: boolean }) {
  const fields = tier === "low" ? FAR_FIELDS.slice(0, 5) : FAR_FIELDS;
  return (
    <group>
      {fields.map((spec) => (
        <NebulaSprite key={spec.seed} spec={spec} reduced={reduced} />
      ))}
      {INTRO_VEIL.map((spec) => (
        <NebulaSprite key={spec.seed} spec={spec} reduced={reduced} />
      ))}
    </group>
  );
}
