"use client";

import { Stars, Sparkles } from "@react-three/drei";
import type { DeviceTier } from "@/hooks/use-device-tier";

/**
 * Layered star backdrop: two depths of drei <Stars> plus near-field
 * floating sparkles for parallax when the camera moves.
 */
export function Starfield({ tier }: { tier: DeviceTier }) {
  const nearCount = tier === "low" ? 1100 : 2600;
  const farCount = tier === "low" ? 1400 : 3400;
  const sparkles = tier === "low" ? 70 : 140;

  return (
    <group>
      <Stars radius={130} depth={45} count={nearCount} factor={2.4} saturation={0.55} fade speed={0.5} />
      <Stars radius={210} depth={90} count={farCount} factor={4.2} saturation={0.4} fade speed={0.25} />
      <Sparkles
        count={sparkles}
        scale={[42, 18, 42]}
        size={2.2}
        speed={0.22}
        opacity={0.6}
        color="#73E7F5"
      />
      <Sparkles
        count={Math.round(sparkles / 2)}
        scale={[34, 14, 34]}
        size={2.6}
        speed={0.16}
        opacity={0.5}
        color="#F47ACB"
      />
    </group>
  );
}
