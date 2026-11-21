"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { useUniverseStore } from "@/lib/universe-store";
import { GlowButton } from "@/components/shared/buttons";
import { ContentValue } from "@/components/shared/content-value";
import { BirthdaySection } from "@/components/panels/birthday-section";
import { GallerySection } from "@/components/panels/gallery-section";
import { TimelineSection } from "@/components/panels/timeline-section";
import { LetterSection } from "@/components/panels/letter-section";
import { MusicSection } from "@/components/panels/music-section";
import { SecretSection } from "@/components/panels/secret-section";
import { ClosingSection } from "@/components/panels/closing-section";

/**
 * FR-15 / AC-13 — the complete experience without WebGL: every piece of
 * content is available as a calm, scrollable page. Used automatically
 * when WebGL is missing and manually via the 2D-mode switch.
 */
export function TwoDFallback() {
  const { heroTitle, heroSubtitle, enterButtonLabel } = birthdayContent;
  const restartExperience = useUniverseStore((s) => s.restartExperience);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sections = [
    { id: "birthday", label: "Birthday" },
    { id: "memories", label: "Memories" },
    { id: "orbit", label: "Our Orbit" },
    { id: "letter", label: "Letter" },
    { id: "music", label: "Music" },
    { id: "secret", label: "???" },
  ];

  return (
    <div className="cosmic-scroll relative h-full overflow-y-auto">
      {/* Starfield backdrop (pure CSS, no WebGL) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(140% 100% at 20% 0%, #30105E 0%, transparent 55%), radial-gradient(120% 90% at 85% 20%, #7544D833 0%, transparent 60%), radial-gradient(120% 100% at 50% 100%, #F47ACB1f 0%, transparent 55%), #080B24",
        }}
      />

      {/* Hero */}
      <header className="relative flex min-h-[86dvh] flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.4em] text-glow-cyan/80">
            A birthday universe for{" "}
            <ContentValue value={birthdayContent.recipientName} className="font-display normal-case italic tracking-normal text-soft-gold" />
          </p>
          <h1 className="font-display max-w-3xl text-4xl leading-tight text-white sm:text-6xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {heroSubtitle}
          </p>
          <div className="mt-10">
            <GlowButton
              accent="gold"
              onClick={() => scrollTo("birthday")}
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {enterButtonLabel}
              <Sparkles className="h-4 w-4" aria-hidden />
            </GlowButton>
          </div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/35">
            Lightweight 2D mode — all content, no 3D
          </p>
        </motion.div>
      </header>

      {/* Section quick-nav */}
      <nav
        aria-label="Sections"
        className="glass-bar sticky top-3 z-20 mx-auto flex w-fit max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-center gap-1 rounded-full px-2 py-1.5"
      >
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className="touch-target rounded-full px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70"
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main className="relative mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        <section id="birthday" aria-label="Birthday message" className="glass-panel scroll-mt-24 rounded-3xl p-6 sm:p-9">
          <BirthdaySection />
        </section>

        <section id="memories" aria-label="Photo gallery" className="glass-panel scroll-mt-24 rounded-3xl p-6 sm:p-9">
          <h2 className="font-display mb-6 text-2xl text-white sm:text-3xl">Our Little Memories</h2>
          <GallerySection />
        </section>

        <section id="orbit" aria-label="Memory timeline" className="glass-panel scroll-mt-24 rounded-3xl p-6 sm:p-9">
          <h2 className="font-display mb-6 text-2xl text-white sm:text-3xl">Moments I Keep</h2>
          <TimelineSection />
        </section>

        <section id="letter" aria-label="Love letter" className="glass-panel scroll-mt-24 rounded-3xl p-6 sm:p-9">
          <h2 className="font-display mb-6 text-2xl text-white sm:text-3xl">
            {birthdayContent.letterTitle}
          </h2>
          <LetterSection />
        </section>

        <section id="music" aria-label="Music" className="glass-panel scroll-mt-24 rounded-3xl p-6 sm:p-9">
          <h2 className="font-display mb-6 text-2xl text-white sm:text-3xl">Our Song</h2>
          <MusicSection />
        </section>

        <section id="secret" aria-label="Secret message" className="glass-panel scroll-mt-24 rounded-3xl p-6 sm:p-9">
          <h2 className="font-display mb-6 flex items-center gap-2.5 text-2xl text-white sm:text-3xl">
            <Heart className="h-5 w-5 text-[#C9B4FF]" aria-hidden />
            You Found Me
          </h2>
          <SecretSection />
        </section>

        <section aria-label="Closing message" className="glass-panel rounded-3xl p-6 text-center sm:p-9">
          <ClosingSection
            onReplay={() => {
              restartExperience();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </section>

        <footer className="pb-24 pt-4 text-center text-[10px] uppercase tracking-[0.3em] text-white/30">
          A little universe, made with love
        </footer>
      </main>
    </div>
  );
}
