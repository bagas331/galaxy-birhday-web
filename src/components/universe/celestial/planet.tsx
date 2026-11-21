"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { CelestialBodyId, SectionId } from "@/types/universe";
import { useUniverseStore } from "@/lib/universe-store";
import { registerBody, unregisterBody } from "../body-registry";
import {
  getGlowTexture,
  getPlanetTexture,
  getRingTexture,
} from "@/lib/textures";

export interface PlanetProps {
  id: CelestialBodyId;
  section: SectionId;
  label: string;
  accent: string;
  size: number;
  orbitRadius: number;
  /** Radians per second; negative = clockwise. */
  orbitSpeed: number;
  /** Tilt of the orbital plane (radians). */
  orbitTilt: number;
  startAngle: number;
  texturePalette: string[];
  textureSeed: number;
  turbulence?: number;
  bandFrequency?: number;
  atmosphereColor: string;
  ring?: { colors: string[]; inner: number; outer: number };
}

/** Fresnel rim-glow material for planetary atmospheres. */
function useAtmosphereMaterial(color: string, intensity = 0.9) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: intensity },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewDir = normalize(-mvPosition.xyz);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          uniform float uIntensity;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.8);
            gl_FragColor = vec4(uColor, fresnel * uIntensity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color, intensity],
  );
}

/** Saturn-like ring with radially remapped UVs. */
function PlanetRing({
  inner,
  outer,
  colors,
  seedKey,
}: {
  inner: number;
  outer: number;
  colors: string[];
  seedKey: string;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.RingGeometry(inner, outer, 96, 1);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const r = v.length();
      uv.setXY(i, (r - inner) / (outer - inner), 0.5);
    }
    return geo;
  }, [inner, outer]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const texture = useMemo(() => getRingTexture(seedKey, { colors, seed: 5 }), [seedKey, colors]);

  return (
    <mesh rotation={[-Math.PI / 2 + 0.22, 0, 0]}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * A revolving, clickable planet with atmosphere, optional ring and a
 * floating HTML label. Revolution gently halts while a content panel is
 * open so the framed view stays stable.
 */
export function Planet(props: PlanetProps) {
  const {
    id,
    section,
    accent,
    size,
    orbitRadius,
    orbitSpeed,
    orbitTilt,
    startAngle,
    texturePalette,
    textureSeed,
    turbulence = 0.16,
    bandFrequency = 7,
    atmosphereColor,
    ring,
  } = props;

  const anchorRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const angleRef = useRef(startAngle);
  const currentSpeed = useRef(orbitSpeed);
  const [hovered, setHovered] = useState(false);
  const openSection = useUniverseStore((s) => s.openSection);

  const surface = useMemo(
    () =>
      getPlanetTexture(id, {
        palette: texturePalette,
        turbulence,
        bandFrequency,
        seed: textureSeed,
      }),
    [id, texturePalette, turbulence, bandFrequency, textureSeed],
  );
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const atmosphere = useAtmosphereMaterial(atmosphereColor, 1.05);

  useEffect(() => () => atmosphere.dispose(), [atmosphere]);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    registerBody(id, {
      object: anchor,
      size,
      labelOffset: size + (ring ? size * 0.9 : 0.55) + 0.9,
    });
    return () => unregisterBody(id);
  }, [id, size, ring]);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const { activeSection } = useUniverseStore.getState();
    // The universe holds its breath while a story panel is open.
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
    }
    const body = bodyRef.current;
    if (body) {
      const targetScale = hovered ? 1.12 : 1;
      const s = THREE.MathUtils.lerp(body.scale.x, targetScale, 0.12);
      body.scale.setScalar(s);
      body.rotation.y += clampedDelta * 0.12;
    }
  });

  return (
    <group rotation={[orbitTilt, 0, 0]}>
      {/* Orbit guide line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[orbitRadius - 0.015, orbitRadius + 0.015, 128]} />
        <meshBasicMaterial color={accent} transparent opacity={0.14} side={THREE.DoubleSide} />
      </mesh>

      {/* Revolving anchor */}
      <group ref={anchorRef}>
        <group ref={bodyRef}>
          {/* Surface */}
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
            <sphereGeometry args={[size, 48, 48]} />
            <meshStandardMaterial map={surface} roughness={0.85} metalness={0.06} />
          </mesh>

          {/* Atmosphere rim glow */}
          <mesh raycast={() => null} material={atmosphere}>
            <sphereGeometry args={[size * 1.16, 48, 48]} />
          </mesh>

          {/* Soft halo behind the planet */}
          <sprite
            raycast={() => null}
            scale={[size * 5.2, size * 5.2, 1]}
            position={[0, 0, -0.2]}
          >
            <spriteMaterial
              map={glowTexture}
              color={atmosphereColor}
              transparent
              opacity={hovered ? 0.5 : 0.3}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </sprite>

          {ring && (
            <PlanetRing
              inner={size * ring.inner}
              outer={size * ring.outer}
              colors={ring.colors}
              seedKey={id}
            />
          )}
        </group>
      </group>
    </group>
  );
}
