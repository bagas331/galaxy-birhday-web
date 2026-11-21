"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverseStore } from "@/lib/universe-store";
import { getGlowTexture } from "@/lib/textures";

const METEOR_POOL = 8;
const TRAIL_LENGTH = 6;

/** Shared material pool for the meteor trails (lazily built, disposed on unmount). */
let sharedMaterials: THREE.SpriteMaterial[] | null = null;

function getMeteorMaterials(): THREE.SpriteMaterial[] {
  if (sharedMaterials === null) {
    const glow = getGlowTexture();
    sharedMaterials = Array.from(
      { length: METEOR_POOL * TRAIL_LENGTH },
      () =>
        new THREE.SpriteMaterial({
          map: glow,
          color: new THREE.Color("#CDEFFF"),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
    );
  }
  return sharedMaterials;
}

interface MeteorState {
  active: boolean;
  age: number;
  lifetime: number;
  speed: number;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  history: THREE.Vector3[];
}

/**
 * Occasional shooting stars streaking across the sky, plus a meteor
 * shower burst (triggered through the store) for the secret surprise
 * and the closing scene. Materials live in a ref pool so the frame
 * loop can animate opacity without touching render-scope values.
 */
export function ShootingStars({ reduced }: { reduced: boolean }) {
  const spriteRefs = useRef<(THREE.Sprite | null)[][]>(
    Array.from({ length: METEOR_POOL }, () => Array(TRAIL_LENGTH).fill(null)),
  );

  const meteors = useRef<MeteorState[]>(
    Array.from({ length: METEOR_POOL }, () => ({
      active: false,
      age: 0,
      lifetime: 2,
      speed: 40,
      position: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      history: Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector3()),
    })),
  );

  const spawnTimer = useRef(3.5);

  const spawn = (meteor: MeteorState, burst = false) => {
    // Start on a distant shell, aimed to cross the visible sky
    const radius = 46 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const height = 14 + Math.random() * 26;
    meteor.position.set(Math.cos(theta) * radius, height, Math.sin(theta) * radius);
    // Fly roughly toward the opposite side, dipping slightly
    const target = new THREE.Vector3(
      -Math.cos(theta) * radius * (0.6 + Math.random() * 0.5),
      -6 + Math.random() * 14,
      -Math.sin(theta) * radius * (0.6 + Math.random() * 0.5),
    );
    meteor.direction.copy(target).sub(meteor.position).normalize();
    meteor.speed = burst ? 34 + Math.random() * 16 : 40 + Math.random() * 20;
    meteor.lifetime = burst ? 1.5 + Math.random() * 0.9 : 1.7 + Math.random() * 0.8;
    meteor.age = 0;
    meteor.active = true;
    for (const h of meteor.history) h.copy(meteor.position);
  };

  // Watch the store for burst requests (secret discovery / closing)
  useEffect(() => {
    let last = useUniverseStore.getState().meteorBurst;
    return useUniverseStore.subscribe((state) => {
      if (state.meteorBurst !== last) {
        last = state.meteorBurst;
        let delay = 0;
        for (const meteor of meteors.current) {
          if (!meteor.active) {
            const wait = delay;
            window.setTimeout(() => {
              if (!meteor.active) spawn(meteor, true);
            }, wait);
            delay += 130;
          }
        }
      }
    });
  }, []);

  useEffect(
    () => () => {
      sharedMaterials?.forEach((m) => m.dispose());
      sharedMaterials = null;
    },
    [],
  );

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const materials = sharedMaterials;
    if (!materials) return;

    if (!reduced) {
      spawnTimer.current -= clampedDelta;
      if (spawnTimer.current <= 0) {
        spawnTimer.current = 5 + Math.random() * 7;
        const idle = meteors.current.find((m) => !m.active);
        if (idle) spawn(idle);
      }
    }

    for (let i = 0; i < METEOR_POOL; i++) {
      const meteor = meteors.current[i];
      const sprites = spriteRefs.current[i];

      if (meteor.active) {
        meteor.age += clampedDelta;
        if (meteor.age >= meteor.lifetime) {
          meteor.active = false;
        } else {
          // Shift history (head first)
          for (let k = TRAIL_LENGTH - 1; k > 0; k--) {
            meteor.history[k].copy(meteor.history[k - 1]);
          }
          meteor.history[0].copy(meteor.position);
          meteor.position.addScaledVector(meteor.direction, meteor.speed * clampedDelta);
        }
      }

      const fade = meteor.active
        ? Math.sin(Math.min(1, meteor.age / meteor.lifetime) * Math.PI)
        : 0;

      for (let k = 0; k < TRAIL_LENGTH; k++) {
        const sprite = sprites[k];
        if (!sprite) continue;
        const material = materials[i * TRAIL_LENGTH + k];
        if (!meteor.active) {
          material.opacity = 0;
          sprite.visible = false;
          continue;
        }
        sprite.visible = true;
        const trailFade = fade * Math.pow(1 - k / TRAIL_LENGTH, 1.6);
        const pos = meteor.history[k];
        sprite.position.copy(pos);
        const scale = 2.4 * (1 - k / (TRAIL_LENGTH * 1.25));
        sprite.scale.set(scale, scale, 1);
        material.opacity = trailFade * 0.85;
        material.color.setHex(k === 0 ? 0xffffff : 0xcdefff);
      }
    }
  });

  return (
    <group>
      {Array.from({ length: METEOR_POOL }, (_, i) =>
        Array.from({ length: TRAIL_LENGTH }, (_, k) => (
          <sprite
            key={`${i}-${k}`}
            ref={(el) => {
              spriteRefs.current[i][k] = el;
            }}
            visible={false}
            raycast={() => null}
            material={getMeteorMaterials()[i * TRAIL_LENGTH + k]}
            scale={[0.1, 0.1, 1]}
          />
        )),
      )}
    </group>
  );
}
