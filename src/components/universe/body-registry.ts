"use client";

import type * as THREE from "three";
import type { CelestialBodyId } from "@/types/universe";

/**
 * Runtime registry of interactive celestial bodies.
 * Bodies register their anchor Object3D on mount so the camera rig can
 * frame them (world position + visual size) without prop drilling.
 */
export interface RegistryEntry {
  object: THREE.Object3D;
  size: number;
  /** Vertical offset (world units) applied to the floating label. */
  labelOffset?: number;
}

const registry = new Map<CelestialBodyId, RegistryEntry>();

export const bodyRegistry = registry;

export function registerBody(id: CelestialBodyId, entry: RegistryEntry) {
  registry.set(id, entry);
}

export function unregisterBody(id: CelestialBodyId) {
  registry.delete(id);
}

export function getBodyEntry(id: CelestialBodyId): RegistryEntry | undefined {
  return registry.get(id);
}
