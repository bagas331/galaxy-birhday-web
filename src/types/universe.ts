/**
 * Shared types for the 3D birthday universe experience.
 */

/** Sections of the experience opened as 2D overlay panels. */
export type SectionId =
  | "birthday"
  | "gallery"
  | "timeline"
  | "letter"
  | "music"
  | "secret"
  | "closing";

/** Interactive celestial bodies in the 3D scene. */
export type CelestialBodyId =
  | "birthday"
  | "memory"
  | "letter"
  | "orbit"
  | "music"
  | "secret";

/** High-level phases of the experience. */
export type ExperiencePhase = "loading" | "intro" | "entering" | "universe";

/** One photograph in the memory gallery. */
export interface GalleryItem {
  /** Path under /public, e.g. "/assets/images/memories/memory-1.webp" */
  src: string;
  /** Short caption shown under the photo / in the lightbox. */
  caption: string;
  /** Optional date string — only set it if real. */
  date?: string;
  /** Alt text for accessibility. */
  alt: string;
}

/** One moment on the relationship timeline. */
export interface MemoryItem {
  /** Optional real date — never invent one. */
  date?: string;
  title: string;
  description: string;
  /** Optional photo path under /public. */
  photo?: string;
}

/** Static description of one celestial body (drives 3D + navigation). */
export interface CelestialBodyConfig {
  id: CelestialBodyId;
  /** Short label floating next to the object in 3D space. */
  label: string;
  /** Section opened when the body is selected. */
  section: SectionId;
  /** Base colour used for glow / label accents. */
  color: string;
}

export interface BirthdayContent {
  recipientName: string;
  senderName: string;
  birthdayDate: string;
  heroTitle: string;
  heroSubtitle: string;
  enterButtonLabel: string;
  skipIntroLabel: string;
  exploreHint: string;
  birthdayTitle: string;
  birthdayMessage: string[];
  letterTitle: string;
  letterGreeting: string;
  letterParagraphs: string[];
  letterSignOff: string;
  songTitle: string;
  songArtist: string;
  songSrc: string;
  gallery: GalleryItem[];
  memories: MemoryItem[];
  secretLeadIn: string;
  secretMessage: string[];
  closingTitle: string;
  closingMessage: string[];
  replayLabel: string;
}
