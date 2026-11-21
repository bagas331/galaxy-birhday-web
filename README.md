# A Little Universe, For You — 3D Galaxy Birthday Experience

An immersive, interactive 3D birthday universe built with Next.js, React Three
Fiber and TypeScript. The visitor flies through a colorful nebula into a little
galaxy of six celestial bodies — a Birthday Planet, a Memory Planet, a Love
Letter world, an "Our Orbit" timeline, a Music Star, and a hidden Secret Star —
each opening a personal, readable content panel.

## Quick start

```bash
bun install        # or npm install
bun run dev        # dev server on http://localhost:3000
bun run lint       # eslint
bunx tsc --noEmit  # typecheck
bun run build      # production build
bun run start      # run the production build
```

Deploy like any Next.js app (Vercel is the easiest: push the repo and import
it — no environment variables are required).

## Make it yours — one file

**All personal content lives in [`src/data/birthday-content.ts`](src/data/birthday-content.ts).**
No component hardcodes names or messages.

Any value still wrapped in `[brackets]` renders on the site in a **distinct
gold, dashed-underline style** so it can never be accidentally shipped
unnoticed. Replace the brackets with your real content and the special style
disappears automatically.

| Field | What it changes |
| --- | --- |
| `recipientName` / `senderName` | Her name / your name (intro, birthday panel, letter signature, closing credit) |
| `birthdayDate` | Shown above the birthday title |
| `heroTitle` / `heroSubtitle` | Intro screen title & tagline |
| `birthdayMessage` | Paragraphs of the birthday message (array of strings) |
| `letterGreeting` / `letterParagraphs` / `letterSignOff` | The love letter |
| `songTitle` / `songArtist` / `songSrc` | Music info & file path |
| `gallery` | Photo list: `src`, `caption`, optional `date`, `alt` |
| `memories` | Timeline items: `title`, `description`, optional `date` + `photo` |
| `secretMessage` | The hidden message behind the Secret Star |
| `closingMessage` | The finale text + `replayLabel` |

### Replace the photos

1. Drop your photos into `public/assets/images/memories/` (WebP/JPG, ~1200px
   wide is plenty).
2. Point the `gallery` (and optionally `memories[].photo`) entries at them.
3. Write real captions; only set `date` when it is real — never invent dates.

The shipped images are **placeholder cosmic artwork** (clearly captioned as
placeholders), not fake memories.

### Replace the music

1. Put your song at `public/assets/audio/our-song.mp3` (or edit `songSrc`).
2. Update `songTitle` and `songArtist`.

The shipped track is a **generated ambient loop** (royalty-free, synthesized
for this project) so the player works out of the box. If the audio file is
missing or fails to load, the site shows a friendly notice and **every other
feature keeps working**. Audio only ever starts after the visitor clicks
*Enter Our Universe* (browser autoplay policy).

## Features

- **Cinematic intro** — stars and nebula reveal, personal greeting,
  *Enter Our Universe* fly-through with letterboxing, *Skip Intro*.
- **Interactive 3D universe** — orbit / zoom (mouse + touch), six clickable
  celestial bodies with hover feedback and floating labels; selecting a body
  flies the camera to it.
- **Content panels** — birthday message, photo gallery with lightbox
  (arrows + Escape + swipe-friendly buttons), memory timeline, animated
  love-letter envelope, music player, secret message with meteor shower.
- **Closing scene** — camera pulls back to reveal the whole galaxy, replay.
- **Persistent music** — play/pause, mute, volume; keeps playing across all
  sections; graceful audio-error handling.
- **Alternative navigation** — a button bar opens every section without
  touching the 3D scene (accessibility + mobile).
- **2D fallback** — automatic when WebGL is unavailable, and a manual
  *2D mode* switch; contains every piece of content.
- **Reduced motion** — `prefers-reduced-motion` disables auto-rotation,
  ambient meteors and softens animations.
- **Performance tiers** — particle counts, DPR and antialiasing adapt to the
  device; all 3D textures are procedurally generated (tiny payload).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Three.js + @react-three/fiber + @react-three/drei · GSAP (camera choreography) ·
Howler.js (audio) · Zustand (state) · Framer Motion (UI motion)

## Project structure

```
src/
  app/                     # layout, page, global styles, icon
  data/birthday-content.ts # ← ALL personal content
  types/universe.ts        # shared types
  lib/
    universe-store.ts      # zustand phase/section/camera state
    audio-manager.ts       # Howler singleton + useAudio hook
    textures.ts            # procedural planet/ring/nebula/glow textures
  hooks/                   # webgl, reduced-motion, device tier
  components/
    app/                   # orchestrator + boot screen
    intro/                 # cinematic intro overlay
    universe/              # canvas, camera rig, bodies, effects, labels
    navigation/            # nav bar, music widget, 2D-mode switch
    panels/                # panel shell + all content sections
    fallback/              # full 2D experience (no WebGL needed)
    shared/                # buttons, placeholder-aware text
public/assets/
  images/memories/         # your photos
  audio/our-song.mp3       # your song
```

## Accessibility notes

- All buttons are labelled (`aria-label`) with ≥44px touch targets.
- Panels and the lightbox close with **Escape**; lightbox supports arrow keys.
- Every section is reachable without the 3D scene (nav bar or 2D mode).
- Photos have alt text; placeholders are visually distinct for a reason.
- No horizontal overflow at 360–390px widths (verified).

## Testing performed

- ESLint + `tsc --noEmit` clean; dev server compiles without warnings.
- End-to-end click-through in a real browser: intro → enter/skip → all six
  bodies → every panel → lightbox prev/next/Escape → music play/pause/mute →
  secret discovery (label + nav update + meteor burst) → closing → replay →
  2D round-trip → audio-failure path → mobile viewport 390×844 (no overflow).
- Console monitored: no errors during the flows above (only a harmless
  upstream `THREE.Clock` deprecation notice from React Three Fiber).
