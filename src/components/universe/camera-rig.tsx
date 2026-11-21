"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { useUniverseStore } from "@/lib/universe-store";
import { getBodyEntry } from "./body-registry";

const OVERVIEW_POS = new THREE.Vector3(0, 11, 36);
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0);
const CLOSING_POS = new THREE.Vector3(0, 34, 78);
const CLOSING_TARGET = new THREE.Vector3(0, 0, 0);

interface FlyOptions {
  duration?: number;
  ease?: string;
  /** Keep controls locked after the flight (e.g. behind closing scene). */
  lock?: boolean;
  mid?: THREE.Vector3;
  onDone?: () => void;
}

/**
 * Cinematic camera choreography:
 *  - intro: slow drift inside the far nebula field
 *  - entering: GSAP fly-through into the galaxy (with an altitude arc)
 *  - focus: frame the selected celestial body
 *  - closing: pull far back to reveal the whole universe
 */
export function CameraRig({ reduced }: { reduced: boolean }) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const camera = useThree((s) => s.camera);
  const phase = useUniverseStore((s) => s.phase);
  const focusedBody = useUniverseStore((s) => s.focusedBody);
  const activeSection = useUniverseStore((s) => s.activeSection);
  const flightRef = useRef<gsap.core.Timeline | null>(null);

  const killFlight = () => {
    flightRef.current?.kill();
    flightRef.current = null;
  };

  const flyTo = (pos: THREE.Vector3, target: THREE.Vector3, options: FlyOptions = {}) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const { duration = 1.8, ease = "power3.inOut", lock = false, mid, onDone } = options;
    killFlight();
    controls.enabled = false;

    const tl = gsap.timeline({
      onComplete: () => {
        flightRef.current = null;
        controls.enabled = !lock;
        onDone?.();
      },
    });
    if (mid) {
      tl.to(
        camera.position,
        { x: mid.x, y: mid.y, z: mid.z, duration: duration * 0.45, ease: "power2.in" },
        0,
      );
      tl.to(
        camera.position,
        { x: pos.x, y: pos.y, z: pos.z, duration: duration * 0.62, ease: "power2.out" },
        duration * 0.42,
      );
    } else {
      tl.to(
        camera.position,
        { x: pos.x, y: pos.y, z: pos.z, duration, ease },
        0,
      );
    }
    tl.to(
      controls.target,
      {
        x: target.x,
        y: target.y,
        z: target.z,
        duration,
        ease,
        onUpdate: () => controls.update(),
      },
      0,
    );
    flightRef.current = tl;
  };

  /* ── Intro: gentle drift while the title screen is up ───────────── */
  useFrame((state) => {
    if (phase !== "intro" || flightRef.current) return;
    const t = state.clock.elapsedTime;
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, Math.sin(t * 0.07) * 3.5, 0.015);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, 3 + Math.sin(t * 0.05) * 1.4, 0.015);
    cam.lookAt(0, 0, 0);
  });

  /* ── Entering: cinematic fly-through from deep space ────────────── */
  useEffect(() => {
    if (phase !== "entering") return;
    const controls = controlsRef.current;
    if (controls) controls.enabled = false;
    const fast = useUniverseStore.getState().fastEnter;
    const duration = reduced ? 1.0 : fast ? 1.5 : 3.6;
    flyTo(OVERVIEW_POS, OVERVIEW_TARGET, {
      duration,
      mid: reduced || fast ? undefined : new THREE.Vector3(0, 20, 66),
      onDone: () => {
        useUniverseStore.getState().completeEntering();
      },
    });
  }, [phase]);

  /* ── Focus / overview / closing transitions ─────────────────────── */
  useEffect(() => {
    if (phase !== "universe") return;

    if (activeSection === "closing") {
      flyTo(CLOSING_POS, CLOSING_TARGET, {
        duration: reduced ? 1.2 : 3.2,
        ease: "power2.inOut",
        lock: true,
      });
      return;
    }

    if (focusedBody) {
      const entry = getBodyEntry(focusedBody);
      if (entry) {
        const bodyPos = new THREE.Vector3();
        entry.object.getWorldPosition(bodyPos);
        const dir = bodyPos.clone().normalize();
        if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
        const dist = entry.size * 2.9 + 3.4;
        const camPos = bodyPos
          .clone()
          .add(dir.multiplyScalar(dist))
          .add(new THREE.Vector3(0, entry.size * 1.05, 0));
        flyTo(camPos, bodyPos, { duration: reduced ? 0.7 : 1.9 });
        return;
      }
    }

    // Back to the galaxy overview (skip if we are already there)
    if (camera.position.distanceTo(OVERVIEW_POS) > 3) {
      flyTo(OVERVIEW_POS, OVERVIEW_TARGET, { duration: reduced ? 0.7 : 1.9 });
    } else {
      const controls = controlsRef.current;
      if (controls) controls.enabled = true;
    }
  }, [focusedBody, activeSection, phase]);

  /* ── Idle auto-rotation ──────────────────────────────────────────── */
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate =
      phase === "universe" && !focusedBody && !activeSection && !reduced;
    controls.autoRotateSpeed = 0.32;
  }, [phase, focusedBody, activeSection, reduced]);

  /* ── Cleanup on unmount ──────────────────────────────────────────── */
  useEffect(() => () => killFlight(), []);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      enablePan={false}
      minDistance={6.5}
      maxDistance={72}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      rotateSpeed={0.55}
      zoomSpeed={0.75}
      enabled={phase === "universe"}
    />
  );
}
