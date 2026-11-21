"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { GlowButton, GhostButton } from "@/components/shared/buttons";
import { ContentValue } from "@/components/shared/content-value";

interface IntroScreenProps {
  onEnter: () => void;
  onSkip: () => void;
}

/**
 * SCENE 1 — the cinematic intro. Stars fade in behind (the live 3D
 * scene), the nebula slowly reveals itself, and a personal greeting
 * invites the visitor into the universe.
 */
export function IntroScreen({ onEnter, onSkip }: IntroScreenProps) {
  const { heroTitle, heroSubtitle, enterButtonLabel, skipIntroLabel, recipientName } =
    birthdayContent;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
      role="dialog"
      aria-label="Welcome"
    >
      {/* Readability gradient over the 3D scene (kept gentle) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,rgba(8,11,36,0.2)_0%,rgba(8,11,36,0.66)_62%,rgba(8,11,36,0.92)_100%)]"
      />

      {/* Skip control */}
      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-8">
        <GhostButton onClick={onSkip} aria-label="Skip the intro">
          {skipIntroLabel}
        </GhostButton>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.1, ease: "easeOut" }}
          className="mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.42em] text-glow-cyan/90 sm:text-xs"
        >
          <span className="h-px w-8 bg-glow-cyan/50 sm:w-12" aria-hidden />
          A birthday universe for
          <ContentValue value={recipientName} className="font-display text-sm normal-case italic tracking-normal text-soft-gold sm:text-base" />
          <span className="h-px w-8 bg-glow-cyan/50 sm:w-12" aria-hidden />
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1.3, ease: "easeOut" }}
          className="font-display max-w-4xl text-4xl leading-[1.12] text-white sm:text-6xl lg:text-7xl"
        >
          {heroTitle.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05 + i * 0.16, duration: 0.9, ease: "easeOut" }}
              className={
                i >= heroTitle.split(" ").length - 2
                  ? "gradient-text-cosmic italic"
                  : undefined
              }
            >
              {word}
              {i < heroTitle.split(" ").length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 1.2, ease: "easeOut" }}
          className="mt-7 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base"
        >
          {heroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1.1, ease: "easeOut" }}
          className="mt-12"
        >
          <GlowButton onClick={onEnter} accent="gold" className="px-9 py-3.5 text-sm">
            <Sparkles aria-hidden className="h-4 w-4" />
            {enterButtonLabel}
            <Sparkles aria-hidden className="h-4 w-4" />
          </GlowButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 1.2 }}
          className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/35"
        >
          Best experienced with sound on
        </motion.p>
      </div>
    </motion.div>
  );
}
