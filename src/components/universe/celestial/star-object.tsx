"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CelestialBodyId, SectionId } from "@/types/universe";
import { useUniverseStore } from "@/lib/universe-store";
import { registerBody, unregisterBody } from "../body-registry";
import { getGlowTexture, getStarFlareTexture } from "@/lib/textures";

export interface StarObjectProps {
  id: CelestialBodyId;
  section: SectionId;
  label: string;
  accent: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  startAngle: number;
  /** Extra inclination above the orbital plane so the star feels off-disc. */
  lift?: number;
  /** Dim, shy star (secret) vs bright pulsing star (music). */
  variant: "bright" | "shy";
}

/**
 * A glowing star body — the Music Star (bright, pulsing) and the
 * Secret Star (dim, shy twinkle with an occasional inviting glint).
 */
export function StarObject(props: StarObjectProps) {
  const {
    id,
    section,
    accent,
    size,
    orbitRadius,
    orbitSpeed,
    orbitTilt,
    startAngle,
    lift = 0,
    variant,
  } = props;

  const anchorRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const flareRef = useRef<THREE.Sprite>(null);
  const angleRef = useRef(startAngle);
  const currentSpeed = useRef(orbitSpeed);
  const phaseRef = useRef(0);
  const [hovered, setHovered] = useState(false);
  const openSection = useUniverseStore((s) => s.openSection);

  const glowTexture = useMemo(() => getGlowTexture(), []);
  const flareTexture = useMemo(() => getStarFlareTexture(), []);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    registerBody(id, { object: anchor, size, labelOffset: size * 2.8 + 1.2 });
    return () => unregisterBody(id);
  }, [id, size]);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const { activeSection } = useUniverseStore.getState();
    const targetSpeed = activeSection ? 0 : orbitSpeed;
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.06);
    angleRef.current += currentSpeed.current * clampedDelta;

    const anchor = anchorRef.current;
    if (anchor) {
      anchor.position.set(
        Math.cos(angleRef.current) * orbitRadius,
        lift + Math.sin(angleRef.current * 2) * 0.6,
        Math.sin(angleRef.current) * orbitRadius,
      );
    }

    const pulseSpeed = variant === "bright" ? 1.4 : 0.55;
    phaseRef.current += clampedDelta * pulseSpeed;
    const pulse = Math.sin(phaseRef.current);

    // Occasional glint every ~7s invites exploration of the shy star
    const glintCycle = (t * 0.14 + startAngle) % 1;
    const glint = variant === "shy" && glintCycle < 0.06 ? 1 - glintCycle / 0.06 : 0;

    if (coreRef.current) {
      const scale = 1 + pulse * (variant === "bright" ? 0.1 : 0.06) + (hovered ? 0.25 : 0);
      coreRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const base = variant === "bright" ? 5.4 : 3.1;
      const material = glowRef.current.material as THREE.SpriteMaterial;
      material.opacity =
        (variant === "bright" ? 0.75 : 0.4 + glint * 0.5) + pulse * 0.12 + (hovered ? 0.2 : 0);
      glowRef.current.scale.setScalar(base * size * (1 + pulse * 0.08 + glint * 0.5));
    }
    if (flareRef.current) {
      const material = flareRef.current.material as THREE.SpriteMaterial;
      material.opacity =
        variant === "bright" ? 0.55 + pulse * 0.15 : 0.1 + glint * 0.75 + (hovered ? 0.3 : 0);
      flareRef.current.scale.setScalar((variant === "bright" ? 8 : 4.5) * size);
    }
  });

  return (
    <group rotation={[orbitTilt, 0, 0]}>
      <group ref={anchorRef}>
        <group>
          <mesh
            ref={coreRef}
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
            <sphereGeometry args={[size, 24, 24]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>

          <sprite ref={glowRef} raycast={() => null} scale={[size * 5, size * 5, 1]}>
            <spriteMaterial
              map={glowTexture}
              color={accent}
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>

          <sprite ref={flareRef} raycast={() => null} scale={[size * 8, size * 8, 1]}>
            <spriteMaterial
              map={flareTexture}
              color={variant === "bright" ? "#FFF3D6" : "#C9B4FF"}
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>
        </group>
      </group>
    </group>
  );
}
