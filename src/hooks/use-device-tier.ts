"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "low" | "high";

/**
 * Rough capability tier used to scale particle counts and render
 * quality. Measured once, cached at module level.
 * low  → phones / tablets / few cores
 * high → desktops with fine pointers
 */
let tierResult: DeviceTier | null = null;

function probeTier(): DeviceTier {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 768;
  const lowCores =
    typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
  return coarse || smallScreen || lowCores ? "low" : "high";
}

function getTierSnapshot(): DeviceTier {
  if (tierResult === null) tierResult = probeTier();
  return tierResult;
}

export function useDeviceTier(): DeviceTier {
  return useSyncExternalStore(
    () => () => {},
    getTierSnapshot,
    () => "high" as DeviceTier,
  );
}
