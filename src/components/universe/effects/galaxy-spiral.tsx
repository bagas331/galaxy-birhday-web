"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getDotTexture } from "@/lib/textures";
import type { DeviceTier } from "@/hooks/use-device-tier";

const ARMS = 3;
const MAX_R = 58;

/** Builds the spiral dust disc — module-level so no render-scope state is touched. */
function buildGalaxyGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const inner = new THREE.Color("#FFD98A");
  const mid = new THREE.Color("#F47ACB");
  const outer = new THREE.Color("#7544D8");
  const rim = new THREE.Color("#4B9CFF");
  const tmp = new THREE.Color();

  // Deterministic LCG so the galaxy is identical on every visit
  let s = 987654321;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  for (let i = 0; i < count; i++) {
    const arm = i % ARMS;
    const t = Math.pow(rand(), 0.62); // denser toward the centre
    const r = 2.5 + t * MAX_R;
    const spin = t * 4.4 + (arm / ARMS) * Math.PI * 2;
    const jitter = (rand() - 0.5) * (0.7 + t * 2.4);
    const angle = spin + jitter * 0.35;
    const thickness = (1 - t) * 3.4 + 0.5;

    positions[i * 3] = Math.cos(angle) * r + (rand() - 0.5) * 1.6;
    positions[i * 3 + 1] = (rand() - 0.5) * thickness;
    positions[i * 3 + 2] = Math.sin(angle) * r + (rand() - 0.5) * 1.6;

    if (t < 0.3) tmp.copy(inner).lerp(mid, t / 0.3);
    else if (t < 0.66) tmp.copy(mid).lerp(outer, (t - 0.3) / 0.36);
    else tmp.copy(outer).lerp(rim, (t - 0.66) / 0.34);
    tmp.offsetHSL(0, 0, (rand() - 0.5) * 0.18);

    colors[i * 3] = tmp.r;
    colors[i * 3 + 1] = tmp.g;
    colors[i * 3 + 2] = tmp.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

/**
 * A slow-rotating spiral galaxy of coloured dust points that wraps the
 * whole scene in depth. Geometry is built once; only the group rotates.
 */
export function GalaxySpiral({ tier }: { tier: DeviceTier }) {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(
    () => buildGalaxyGeometry(tier === "low" ? 2600 : 6200),
    [tier],
  );

  const dotTexture = useMemo(() => getDotTexture(), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += Math.min(delta, 0.05) * 0.006;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.06, 0, 0.03]}>
      <points geometry={geometry} raycast={() => null}>
        <pointsMaterial
          map={dotTexture}
          vertexColors
          size={tier === "low" ? 0.5 : 0.42}
          sizeAttenuation
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
