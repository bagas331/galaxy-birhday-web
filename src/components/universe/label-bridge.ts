"use client";

import type { CelestialBodyId } from "@/types/universe";

/**
 * Screen-space bridge for the floating planet labels.
 * The in-canvas projector writes positions each frame; the DOM overlay
 * reads them in its own rAF loop — no React re-renders, no per-label
 * react-dom roots (which caused unmount race warnings with drei Html).
 */
export interface LabelScreenPos {
  x: number;
  y: number;
  visible: boolean;
}

export const labelPositions = new Map<CelestialBodyId, LabelScreenPos>();
