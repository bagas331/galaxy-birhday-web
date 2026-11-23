import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import type { BirthdayContent, CustomUniverseRecord } from "@/types/universe";
import { birthdayContent } from "@/data/birthday-content";

interface StoredUniverseEntity extends CustomUniverseRecord {
  editPinHash: string;
}

const globalStore = globalThis as unknown as {
  __universeMemoryStore?: Map<string, StoredUniverseEntity>;
};

function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifySecret(secret: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedBuffer = crypto.scryptSync(secret, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derivedBuffer, keyBuffer);
}

function getStorageFilePath(): string {
  const localDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.accessSync(localDir, fs.constants.W_OK);
    return path.join(localDir, "universes.json");
  } catch {
    return path.join(os.tmpdir(), "galaxy-birthday-universes.json");
  }
}

function loadStore(): Map<string, StoredUniverseEntity> {
  if (globalStore.__universeMemoryStore) {
    return globalStore.__universeMemoryStore;
  }

  const map = new Map<string, StoredUniverseEntity>();
  const now = new Date().toISOString();

  // Seed default featured universe ("rizkia")
  map.set("rizkia", {
    slug: "rizkia",
    content: birthdayContent,
    planTier: "forever",
    createdAt: now,
    updatedAt: now,
    editPinHash: hashSecret("211126"),
  });

  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as StoredUniverseEntity[];
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && typeof item.slug === "string") {
            map.set(item.slug, item);
          }
        }
      }
    }
  } catch (err) {
    console.warn("[universe-repository] Could not read persisted file store:", err);
  }

  globalStore.__universeMemoryStore = map;
  return map;
}

function persistStore(map: Map<string, StoredUniverseEntity>): void {
  try {
    const filePath = getStorageFilePath();
    const list = Array.from(map.values());
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.warn("[universe-repository] Persist to disk skipped (serverless read-only):", err);
  }
}

function toPublicRecord(entity: StoredUniverseEntity): CustomUniverseRecord {
  const { editPinHash: _omitted, ...record } = entity;
  return record;
}

export const universeRepository = {
  listPublicSummaries() {
    const store = loadStore();
    return Array.from(store.values()).map((item) => ({
      slug: item.slug,
      recipientName: item.content.recipientName,
      senderName: item.content.senderName,
      birthdayDate: item.content.birthdayDate,
      hasAccessPin: Boolean(item.accessPin),
      planTier: item.planTier,
      updatedAt: item.updatedAt,
    }));
  },

  findBySlug(slug: string): StoredUniverseEntity | null {
    const store = loadStore();
    return store.get(slug.toLowerCase()) ?? null;
  },

  create(input: {
    slug: string;
    editPin: string;
    accessPin?: string;
    accessPinHint?: string;
    planTier: "free" | "premium" | "forever";
    content: BirthdayContent;
  }): CustomUniverseRecord {
    const store = loadStore();
    const normalizedSlug = input.slug.toLowerCase();
    if (store.has(normalizedSlug)) {
      throw new Error("SLUG_CONFLICT");
    }

    const now = new Date().toISOString();
    const entity: StoredUniverseEntity = {
      slug: normalizedSlug,
      content: input.content,
      accessPin: input.accessPin,
      accessPinHint: input.accessPinHint,
      planTier: input.planTier,
      createdAt: now,
      updatedAt: now,
      editPinHash: hashSecret(input.editPin),
    };

    store.set(normalizedSlug, entity);
    persistStore(store);
    return toPublicRecord(entity);
  },

  update(
    slug: string,
    input: {
      editPin: string;
      accessPin?: string;
      accessPinHint?: string;
      planTier?: "free" | "premium" | "forever";
      content: BirthdayContent;
    },
  ): CustomUniverseRecord {
    const store = loadStore();
    const normalizedSlug = slug.toLowerCase();
    const existing = store.get(normalizedSlug);
    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    if (!verifySecret(input.editPin, existing.editPinHash)) {
      throw new Error("INVALID_EDIT_PIN");
    }

    const updated: StoredUniverseEntity = {
      ...existing,
      content: input.content,
      accessPin: input.accessPin,
      accessPinHint: input.accessPinHint,
      planTier: input.planTier ?? existing.planTier,
      updatedAt: new Date().toISOString(),
    };

    store.set(normalizedSlug, updated);
    persistStore(store);
    return toPublicRecord(updated);
  },
};
