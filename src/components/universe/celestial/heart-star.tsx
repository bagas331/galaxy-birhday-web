"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGlowTexture, getStarFlareTexture } from "@/lib/textures";

/**
 * The heart of the little universe — a warm, slowly breathing star that
 * lights every planet around it.
 */
export function HeartStar({ reduced }: { reduced: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const flareRef = useRef<THREE.Sprite>(null);
  const phaseRef = useRef(0);

  const glowTexture = useMemo(() => getGlowTexture(), []);
  const flareTexture = useMemo(() => getStarFlareTexture(), []);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    phaseRef.current += clampedDelta * (reduced ? 0.25 : 0.8);
    const pulse = Math.sin(phaseRef.current);
    const breathe = Math.sin(phaseRef.current * 0.37);

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + pulse * 0.045);
      coreRef.current.rotation.y += clampedDelta * 0.05;
    }
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.SpriteMaterial;
      material.opacity = 0.6 + pulse * 0.1;
      glowRef.current.scale.setScalar(15 + breathe * 0.9);
    }
    if (flareRef.current) {
      const material = flareRef.current.material as THREE.SpriteMaterial;
      material.opacity = 0.5 + pulse * 0.14;
      flareRef.current.scale.setScalar(11 + breathe * 0.6);
      flareRef.current.material.rotation += clampedDelta * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.7, 32, 32]} />
        <meshBasicMaterial color="#FFE8C2" toneMapped={false} />
      </mesh>

      <sprite ref={glowRef} raycast={() => null} scale={[15, 15, 1]}>
        <spriteMaterial
          map={glowTexture}
          color="#FFB9D6"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      <sprite ref={flareRef} raycast={() => null} scale={[11, 11, 1]}>
        <spriteMaterial
          map={flareTexture}
          color="#FFD98A"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* The light that makes every planet's day */}
      <pointLight color="#FFD9A8" intensity={140} distance={220} decay={1.45} />
    </group>
  );
}
