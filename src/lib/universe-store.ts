"use client";

import { create } from "zustand";
import type {
  CelestialBodyId,
  ExperiencePhase,
  SectionId,
} from "@/types/universe";
import { celestialBodies } from "@/data/birthday-content";

/**
 * Central client state for the whole experience.
 * 3D scene and UI overlays both read from / write to this store,
 * so panels never need to reach into the Canvas.
 */
interface UniverseState {
  /** loading → intro → entering (cinematic flight) → universe */
  phase: ExperiencePhase;
  /** Currently open content panel (null = free universe exploration). */
  activeSection: SectionId | null;
  /** Celestial body the camera should frame (null = galaxy overview). */
  focusedBody: CelestialBodyId | null;
  /** Whether the hidden secret star has been discovered. */
  discoveredSecret: boolean;
  /** Manual 2D-mode switch (also used when WebGL is unavailable). */
  force2D: boolean;
  /** WebGL support probe result; null until checked. */
  webglAvailable: boolean | null;
  /** Incremented to trigger a meteor-shower burst in the 3D scene. */
  meteorBurst: number;
  /** Skip Intro was used — shorten the cinematic flight. */
  fastEnter: boolean;

  setWebglAvailable: (available: boolean) => void;
  setForce2D: (force: boolean) => void;
  /** Intro → cinematic flight (camera animation plays). */
  startEntering: (fast?: boolean) => void;
  /** Cinematic flight finished — free exploration enabled. */
  completeEntering: () => void;
  openSection: (section: SectionId) => void;
  closeSection: () => void;
  focusBody: (body: CelestialBodyId) => void;
  triggerMeteorBurst: () => void;
  /** "Explore again" from the closing scene. */
  restartExperience: () => void;
}

function bodyForSection(section: SectionId): CelestialBodyId | null {
  const body = celestialBodies.find((b) => b.section === section);
  return body ? body.id : null;
}

export const useUniverseStore = create<UniverseState>((set, get) => ({
  phase: "intro",
  activeSection: null,
  focusedBody: null,
  discoveredSecret: false,
  force2D: false,
  webglAvailable: null,
  meteorBurst: 0,
  fastEnter: false,

  setWebglAvailable: (available) => set({ webglAvailable: available }),
  setForce2D: (force) => set({ force2D: force }),

  startEntering: (fast = false) => {
    if (get().phase === "intro") set({ phase: "entering", fastEnter: fast });
  },

  completeEntering: () => {
    if (get().phase === "entering") set({ phase: "universe" });
  },

  openSection: (section) => {
    const patch: Partial<UniverseState> = {
      activeSection: section,
      focusedBody: bodyForSection(section),
    };
    if (section === "secret" && !get().discoveredSecret) {
      patch.discoveredSecret = true;
      patch.meteorBurst = get().meteorBurst + 1;
    }
    set(patch);
  },

  closeSection: () => set({ activeSection: null, focusedBody: null }),

  focusBody: (body) => set({ focusedBody: body }),

  triggerMeteorBurst: () => set({ meteorBurst: get().meteorBurst + 1 }),

  restartExperience: () =>
    set({ activeSection: null, focusedBody: null, phase: "universe" }),
}));
