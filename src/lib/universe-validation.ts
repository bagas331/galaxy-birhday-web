import { z } from "zod";
import type { BirthdayContent } from "@/types/universe";

const safeUrlOrDataUrl = z
  .string()
  .min(1, "Path atau URL wajib diisi")
  .max(2_500_000, "Ukuran media terlalu besar")
  .refine(
    (val) =>
      val.startsWith("/") ||
      val.startsWith("https://") ||
      val.startsWith("http://") ||
      val.startsWith("data:image/") ||
      val.startsWith("data:audio/"),
    "Format URL atau media tidak valid",
  );

export const galleryItemSchema = z.object({
  src: safeUrlOrDataUrl,
  caption: z.string().trim().min(1, "Caption foto wajib diisi").max(300),
  date: z.string().trim().max(80).optional(),
  alt: z.string().trim().min(1).max(200),
});

export const memoryItemSchema = z.object({
  title: z.string().trim().min(1, "Judul momen wajib diisi").max(120),
  description: z.string().trim().min(1, "Cerita momen wajib diisi").max(600),
  date: z.string().trim().max(80).optional(),
  photo: safeUrlOrDataUrl.optional(),
});

export const birthdayContentSchema: z.ZodType<BirthdayContent> = z.object({
  recipientName: z.string().trim().min(1, "Nama penerima wajib diisi").max(100),
  senderName: z.string().trim().min(1, "Nama pengirim wajib diisi").max(100),
  birthdayDate: z.string().trim().min(1, "Tanggal ulang tahun wajib diisi").max(100),
  heroTitle: z.string().trim().min(1, "Judul pembuka wajib diisi").max(120),
  heroSubtitle: z.string().trim().min(1, "Subjudul pembuka wajib diisi").max(300),
  enterButtonLabel: z.string().trim().min(1).max(60),
  skipIntroLabel: z.string().trim().min(1).max(60),
  exploreHint: z.string().trim().min(1).max(160),
  birthdayTitle: z.string().trim().min(1, "Judul ucapan wajib diisi").max(100),
  birthdayMessage: z
    .array(z.string().trim().min(1, "Paragraf tidak boleh kosong").max(1200))
    .min(1, "Minimal 1 paragraf ucapan ulang tahun")
    .max(10),
  letterTitle: z.string().trim().min(1).max(120),
  letterGreeting: z.string().trim().min(1, "Sapaan surat wajib diisi").max(120),
  letterParagraphs: z
    .array(z.string().trim().min(1, "Paragraf surat tidak boleh kosong").max(1500))
    .min(1, "Minimal 1 paragraf surat cinta")
    .max(15),
  letterSignOff: z.string().trim().min(1).max(100),
  songTitle: z.string().trim().min(1, "Judul lagu wajib diisi").max(120),
  songArtist: z.string().trim().min(1, "Nama penyanyi wajib diisi").max(120),
  songSrc: safeUrlOrDataUrl,
  gallery: z
    .array(galleryItemSchema)
    .min(1, "Minimal 1 foto di galeri")
    .max(16, "Maksimal 16 foto di galeri"),
  memories: z
    .array(memoryItemSchema)
    .min(1, "Minimal 1 momen di Our Orbit")
    .max(12, "Maksimal 12 momen di Our Orbit"),
  secretLeadIn: z.string().trim().min(1).max(120),
  secretMessage: z
    .array(z.string().trim().min(1, "Pesan rahasia tidak boleh kosong").max(1200))
    .min(1, "Minimal 1 paragraf pesan Secret Star")
    .max(10),
  closingTitle: z.string().trim().min(1).max(120),
  closingMessage: z
    .array(z.string().trim().min(1).max(600))
    .min(1)
    .max(6),
  replayLabel: z.string().trim().min(1).max(80),
});

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Slug minimal 3 karakter")
  .max(48, "Slug maksimal 48 karakter")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug hanya boleh huruf kecil, angka, dan tanda hubung (contoh: rizkia-23)",
  );

export const createUniverseRequestSchema = z.object({
  slug: slugSchema,
  editPin: z
    .string()
    .trim()
    .min(4, "PIN Edit minimal 4 karakter")
    .max(32, "PIN Edit maksimal 32 karakter"),
  accessPin: z
    .string()
    .trim()
    .max(20, "PIN Kado maksimal 20 karakter")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  accessPinHint: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  planTier: z.enum(["free", "premium", "forever"]).default("premium"),
  content: birthdayContentSchema,
});

export const updateUniverseRequestSchema = z.object({
  editPin: z.string().trim().min(1, "PIN Edit wajib diisi untuk menyimpan perubahan"),
  accessPin: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  accessPinHint: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  planTier: z.enum(["free", "premium", "forever"]).optional(),
  content: birthdayContentSchema,
});

export function formatZodErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
