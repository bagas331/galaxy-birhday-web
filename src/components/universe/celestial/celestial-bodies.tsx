"use client";

import { celestialBodies } from "@/data/birthday-content";
import { useUniverseStore } from "@/lib/universe-store";
import { HeartStar } from "./heart-star";
import { Planet } from "./planet";
import { OrbitStructure } from "./orbit-structure";
import { StarObject } from "./star-object";

/**
 * The six interactive celestial bodies of the little galaxy:
 *   Birthday Planet · Memory Planet · Love Letter · Our Orbit ·
 *   Music Star · a Secret Star hiding far off the main disc.
 * Layout/visual parameters live here; personal content stays in
 * src/data/birthday-content.ts.
 */

// Body accent colours from the content config drive labels and glows.
const config = Object.fromEntries(celestialBodies.map((b) => [b.id, b]));

export function CelestialBodies({ reduced }: { reduced: boolean }) {
  const discoveredSecret = useUniverseStore((s) => s.discoveredSecret);

  return (
    <group>
      <HeartStar reduced={reduced} />

      {/* 1 — Birthday Planet: cool cyan world with a crystalline ring */}
      <Planet
        id="birthday"
        section="birthday"
        label={config.birthday.label}
        accent={config.birthday.color}
        size={1.55}
        orbitRadius={10.5}
        orbitSpeed={0.05}
        orbitTilt={0.07}
        startAngle={0.6}
        texturePalette={["#0E2A5C", "#2E6FBF", "#4B9CFF", "#73E7F5"]}
        textureSeed={11}
        turbulence={0.14}
        bandFrequency={6}
        atmosphereColor="#73E7F5"
        ring={{ colors: ["#9BD8FF", "#73E7F5", "#C7EEFF"], inner: 1.5, outer: 2.4 }}
      />

      {/* 2 — Memory Planet: warm rose world, no ring — the photos do the talking */}
      <Planet
        id="memory"
        section="gallery"
        label={config.memory.label}
        accent={config.memory.color}
        size={1.4}
        orbitRadius={14.5}
        orbitSpeed={-0.038}
        orbitTilt={-0.09}
        startAngle={2.4}
        texturePalette={["#4A1030", "#8F2A62", "#D4589F", "#F47ACB"]}
        textureSeed={23}
        turbulence={0.2}
        bandFrequency={5}
        atmosphereColor="#F47ACB"
      />

      {/* 3 — Love Letter: small golden world with a bright wedding-band ring */}
      <Planet
        id="letter"
        section="letter"
        label={config.letter.label}
        accent={config.letter.color}
        size={1.15}
        orbitRadius={18.5}
        orbitSpeed={0.03}
        orbitTilt={0.13}
        startAngle={4.4}
        texturePalette={["#5C3A14", "#A8742C", "#D9A852", "#FFE3A8"]}
        textureSeed={37}
        turbulence={0.12}
        bandFrequency={8}
        atmosphereColor="#FFD98A"
        ring={{ colors: ["#FFE9BC", "#FFD98A", "#F0C070"], inner: 1.45, outer: 2.1 }}
      />

      {/* 4 — Our Orbit: the timeline — a blue world ringed by memory-moons */}
      <OrbitStructure
        id="orbit"
        section="timeline"
        label={config.orbit.label}
        accent={config.orbit.color}
        size={1.0}
        orbitRadius={23}
        orbitSpeed={-0.022}
        orbitTilt={-0.05}
        startAngle={1.4}
      />

      {/* 5 — Music Star: a bright golden broadcaster pulsing to the song */}
      <StarObject
        id="music"
        section="music"
        label={config.music.label}
        accent={config.music.color}
        size={0.85}
        orbitRadius={27.5}
        orbitSpeed={0.018}
        orbitTilt={0.05}
        startAngle={5.4}
        variant="bright"
      />

      {/* 6 — Secret Star: dim, far away, off the main disc — until found */}
      <StarObject
        id="secret"
        section="secret"
        label={config.secret.label}
        accent="#A98CFF"
        size={0.55}
        orbitRadius={34}
        orbitSpeed={0.008}
        orbitTilt={0.55}
        startAngle={3.9}
        lift={7.5}
        variant="shy"
      />
    </group>
  );
}
