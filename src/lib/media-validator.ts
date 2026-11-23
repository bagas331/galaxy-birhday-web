"use client";

import type { BirthdayContent } from "@/types/universe";

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_FILE_BYTES = 8 * 1024 * 1024; // 8 MB input limit
const MIN_IMAGE_DIMENSION = 64;
const MAX_IMAGE_DIMENSION = 8000;

/**
 * Validates an uploaded image file (extension, MIME type, file size,
 * image integrity, dimensions) and compresses it into a lightweight
 * WebP/JPEG data URL so customer uploads work reliably without broken links.
 */
export async function validateAndCompressImageFile(
  file: File,
  maxWidth = 960,
  quality = 0.8,
): Promise<string> {
  const lowerName = file.name.toLowerCase();
  const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (!hasValidExt) {
    throw new Error("Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP.");
  }

  if (!ALLOWED_IMAGE_MIMES.includes(file.type)) {
    throw new Error("Tipe MIME gambar tidak valid. Pilih file foto JPG, PNG, atau WebP.");
  }

  if (file.size <= 0 || file.size > MAX_IMAGE_FILE_BYTES) {
    throw new Error("Ukuran foto maksimal 8 MB per file.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("File gambar rusak atau tidak dapat dibaca."));
      el.src = objectUrl;
    });

    if (
      img.naturalWidth < MIN_IMAGE_DIMENSION ||
      img.naturalHeight < MIN_IMAGE_DIMENSION
    ) {
      throw new Error("Resolusi gambar terlalu kecil (minimal 64×64 piksel).");
    }

    if (
      img.naturalWidth > MAX_IMAGE_DIMENSION ||
      img.naturalHeight > MAX_IMAGE_DIMENSION
    ) {
      throw new Error("Resolusi gambar terlalu besar (maksimal 8000×8000 piksel).");
    }

    const scale = Math.min(1, maxWidth / img.naturalWidth);
    const targetW = Math.round(img.naturalWidth * scale);
    const targetH = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Gagal memproses gambar di browser.");
    }
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const webp = canvas.toDataURL("image/webp", quality);
    if (webp.startsWith("data:image/webp")) {
      return webp;
    }
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export interface SharedUniverseSnapshot {
  slug: string;
  content: BirthdayContent;
  accessPin?: string;
  accessPinHint?: string;
}

const LOCAL_STORAGE_KEY_PREFIX = "galaxy_saas_universe_";

export function saveUniverseLocally(snapshot: SharedUniverseSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${LOCAL_STORAGE_KEY_PREFIX}${snapshot.slug.toLowerCase()}`,
      JSON.stringify(snapshot),
    );
  } catch (err) {
    console.warn("Could not save universe backup to localStorage:", err);
  }
}

export function loadUniverseLocally(slug: string): SharedUniverseSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${slug.toLowerCase()}`);
    if (!raw) return null;
    return JSON.parse(raw) as SharedUniverseSnapshot;
  } catch {
    return null;
  }
}

/**
 * Encodes a lightweight shareable snapshot into base64url for portable links
 * (used when images are URL/preset paths so the link works across devices even
 * on ephemeral serverless instances).
 */
export function encodePortableUniverseParam(snapshot: SharedUniverseSnapshot): string | null {
  try {
    const json = JSON.stringify(snapshot);
    // Only embed in URL if payload is reasonably compact (< 18 KB)
    if (json.length > 18000) return null;
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch {
    return null;
  }
}

export function decodePortableUniverseParam(encoded: string): SharedUniverseSnapshot | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as SharedUniverseSnapshot;
  } catch {
    return null;
  }
}
