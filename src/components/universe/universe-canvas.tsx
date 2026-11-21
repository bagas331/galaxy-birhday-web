"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraRig } from "./camera-rig";
import { LabelProjector } from "./label-projector";
import { CelestialBodies } from "./celestial/celestial-bodies";
import { GalaxySpiral } from "./effects/galaxy-spiral";
import { NebulaField } from "./effects/nebula-field";
import { ShootingStars } from "./effects/shooting-stars";
import { Starfield } from "./effects/starfield";
import type { DeviceTier } from "@/hooks/use-device-tier";

interface UniverseCanvasProps {
  tier: DeviceTier;
  reduced: boolean;
}

/**
 * The 3D universe. Mounted only when WebGL is available and 2D mode is
 * not forced. All textures are procedural; nothing suspends long, but
 * a Suspense boundary keeps future async assets safe.
 */
export default function UniverseCanvas({ tier, reduced }: UniverseCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 3, 120], fov: 55, near: 0.1, far: 460 }}
      dpr={[1, tier === "high" ? 2 : 1.5]}
      gl={{
        antialias: tier === "high",
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
    >
      <color attach="background" args={["#080B24"]} />
      <fogExp2 attach="fog" args={["#080B24", 0.0026]} />

      {/* Lighting: the heart star provides the key light */}
      <ambientLight intensity={0.5} color="#8FA0E8" />
      <directionalLight position={[24, 30, 40]} intensity={0.32} color="#B9C8FF" />

      <Suspense fallback={null}>
        <Starfield tier={tier} />
        <NebulaField tier={tier} reduced={reduced} />
        <GalaxySpiral tier={tier} />
        <CelestialBodies reduced={reduced} />
        <ShootingStars reduced={reduced} />
      </Suspense>

      <LabelProjector />
      <CameraRig reduced={reduced} />
    </Canvas>
  );
}
