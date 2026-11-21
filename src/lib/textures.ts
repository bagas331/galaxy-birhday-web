"use client";

import * as THREE from "three";

/**
 * Procedural texture atelier — every planet surface, ring, nebula and
 * glow sprite in the scene is painted here at runtime on a canvas.
 * No texture downloads, tiny initial payload, stable seeded randomness.
 */

const cache = new Map<string, THREE.Texture>();

/** Deterministic PRNG so the universe looks identical on every visit. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smoothNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency, seed + i * 101);
    amplitude *= 0.5;
    frequency *= 2.07;
  }
  return value;
}

function makeTexture(
  key: string,
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  colorSpace = THREE.SRGBColorSpace,
): THREE.Texture {
  const cached = cache.get(key);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = colorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  cache.set(key, texture);
  return texture;
}

/* ─── Glow sprites ─────────────────────────────────────────────────── */

/** Soft radial glow — the workhorse for stars, halos and particles. */
export function getGlowTexture(): THREE.Texture {
  return makeTexture("glow", 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.85)");
    g.addColorStop(0.42, "rgba(255,255,255,0.28)");
    g.addColorStop(0.72, "rgba(255,255,255,0.06)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Four-point star flare for the brightest stars. */
export function getStarFlareTexture(): THREE.Texture {
  return makeTexture("star-flare", 256, 256, (ctx, w, h) => {
    const cx = w / 2;
    const cy = h / 2;
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.16);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(0.5, "rgba(255,255,255,0.6)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);
    // Horizontal + vertical streaks
    for (const [rw, rh] of [
      [w, h * 0.045],
      [w * 0.045, h],
    ]) {
      const streak = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
      streak.addColorStop(0, "rgba(255,255,255,0.9)");
      streak.addColorStop(0.35, "rgba(255,255,255,0.22)");
      streak.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = streak;
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.restore();
    }
  });
}

/** Small soft dot for galaxy / particle clouds. */
export function getDotTexture(): THREE.Texture {
  return makeTexture("dot", 64, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/* ─── Planet surfaces ──────────────────────────────────────────────── */

export interface PlanetTextureOptions {
  /** 2–4 colours mixed into latitude bands. */
  palette: string[];
  /** Turbulence strength of the band distortion (0 = straight bands). */
  turbulence?: number;
  /** Band frequency (higher = more, thinner bands). */
  bandFrequency?: number;
  seed?: number;
}

/**
 * Paints a wavy-banded planet surface (equirectangular) with fbm
 * turbulence — a believable gas-giant / marble look.
 */
export function getPlanetTexture(key: string, options: PlanetTextureOptions): THREE.Texture {
  const { palette, turbulence = 0.16, bandFrequency = 7, seed = 1 } = options;
  return makeTexture(`planet-${key}`, 768, 384, (ctx, w, h) => {
    const img = ctx.createImageData(w, h);
    const colors = palette.map((hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b] as const;
    });
    const colorAt = (t: number): readonly [number, number, number] => {
      const scaled = Math.min(0.9999, Math.max(0, t)) * (colors.length - 1);
      const i = Math.floor(scaled);
      const f = scaled - i;
      const a = colors[i];
      const b = colors[Math.min(i + 1, colors.length - 1)];
      return [
        a[0] * (1 - f) + b[0] * f,
        a[1] * (1 - f) + b[1] * f,
        a[2] * (1 - f) + b[2] * f,
      ];
    };
    for (let y = 0; y < h; y++) {
      const v = y / h;
      for (let x = 0; x < w; x++) {
        const u = x / w;
        // Band coordinate distorted by fbm swirls (wrap horizontally)
        const swirl =
          fbm(u * 6, v * 3.2, seed, 4) - 0.5 +
          0.5 * (fbm(u * 12 + 40, v * 6 + 9, seed + 7, 3) - 0.5);
        const band = v + turbulence * swirl;
        const [r, g, b] = colorAt(0.5 + 0.5 * Math.sin(band * Math.PI * bandFrequency));
        // Subtle grain
        const grain = 1 + 0.08 * (fbm(u * 90, v * 90, seed + 31, 2) - 0.5);
        // Gentle polar darkening
        const polar = 0.82 + 0.18 * Math.sin(Math.PI * v);
        const idx = (y * w + x) * 4;
        img.data[idx] = Math.min(255, r * grain * polar);
        img.data[idx + 1] = Math.min(255, g * grain * polar);
        img.data[idx + 2] = Math.min(255, b * grain * polar);
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}

/* ─── Saturn-like rings ────────────────────────────────────────────── */

export interface RingTextureOptions {
  colors: string[];
  seed?: number;
}

/**
 * Ring band strip mapped along the ring radius (u = inner→outer edge).
 */
export function getRingTexture(key: string, options: RingTextureOptions): THREE.Texture {
  const { colors, seed = 5 } = options;
  return makeTexture(`ring-${key}`, 512, 16, (ctx, w, h) => {
    const rgb = colors.map((hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b] as const;
    });
    const img = ctx.createImageData(w, h);
    for (let x = 0; x < w; x++) {
      const t = x / w;
      // Layered noise decides band density; a couple of clean gaps
      const density =
        0.55 +
        0.45 * Math.sin(t * Math.PI * 14 + fbm(t * 24, 0.5, seed, 3) * 5);
      const gap1 = Math.abs(t - 0.34) < 0.045 ? 0.12 : 1;
      const gap2 = Math.abs(t - 0.66) < 0.03 ? 0.25 : 1;
      const edge = Math.min(1, Math.min(t / 0.08, (1 - t) / 0.12));
      const ci = Math.min(rgb.length - 1, Math.floor(t * rgb.length));
      const [r, g, b] = rgb[ci];
      const alpha = Math.max(0, Math.min(1, density * gap1 * gap2 * edge));
      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}

/* ─── Nebula clouds ────────────────────────────────────────────────── */

/**
 * A soft, blobby nebula sprite in the given palette.
 * Drawn on transparent canvas; edges fade out so sprites composite
 * cleanly when stacked in 3D.
 */
export function getNebulaTexture(key: string, palette: string[], seed = 11): THREE.Texture {
  return makeTexture(`nebula-${key}`, 512, 512, (ctx, w, h) => {
    const rand = mulberry32(seed);
    ctx.clearRect(0, 0, w, h);
    const blobs = 16 + Math.floor(rand() * 6);
    for (let i = 0; i < blobs; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = rand() * w * 0.26;
      const x = w / 2 + Math.cos(angle) * dist;
      const y = h / 2 + Math.sin(angle) * dist * 0.8;
      const r = (0.1 + rand() * 0.24) * w;
      const color = palette[Math.floor(rand() * palette.length)];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.14 + rand() * 0.16;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Fade the outer edge so sprites never show a hard square
    const mask = ctx.createRadialGradient(w / 2, h / 2, w * 0.18, w / 2, h / 2, w / 2);
    mask.addColorStop(0, "rgba(0,0,0,1)");
    mask.addColorStop(0.7, "rgba(0,0,0,0.85)");
    mask.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  });
}
