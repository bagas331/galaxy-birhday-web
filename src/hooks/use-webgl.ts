"use client";

import { useSyncExternalStore } from "react";

/**
 * One-time WebGL support probe, cached at module level so every
 * component sees the same result without re-probing.
 */
let webglResult: boolean | null = null;

function probeWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function getWebglSnapshot(): boolean | null {
  if (webglResult === null) webglResult = probeWebgl();
  return webglResult;
}

/** WebGL support (null while still unknown / on the server). */
export function useWebglSupport(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    getWebglSnapshot,
    () => null,
  );
}
