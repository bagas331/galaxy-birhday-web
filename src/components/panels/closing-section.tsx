"use client";

import { motion } from "framer-motion";
import { RotateCcw, Telescope } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { GlowButton } from "@/components/shared/buttons";
import { ContentValue, EditHint } from "@/components/shared/content-value";

/**
 * SCENE 9 — the cinematic ending. The camera pulls far back to reveal
 * the whole galaxy (handled by the camera rig) while a personal
 * closing message fades in, with an invitation to explore again.
 */
export function ClosingSection({ onReplay }: { onReplay: () => void }) {
  const { closingTitle, closingMessage, replayLabel, senderName } = birthdayContent;

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
        className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-soft-gold/30 bg-soft-gold/10"
        aria-hidden
      >
        <Telescope className="h-7 w-7 text-soft-gold" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="font-display gradient-text-cosmic text-3xl italic sm:text-5xl"
      >
        {closingTitle}
      </motion.h3>

      <div className="mx-auto mt-8 max-w-xl space-y-5">
        {closingMessage.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 0.35, duration: 1 }}
            className="font-display text-lg leading-relaxed text-white/90 sm:text-xl"
          >
            <ContentValue value={line} />
          </motion.p>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3, duration: 1 }}
        className="mt-10"
      >
        <GlowButton onClick={onReplay} accent="cyan" className="mx-auto">
          <RotateCcw className="h-4 w-4" aria-hidden />
          {replayLabel}
        </GlowButton>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8, duration: 1 }}
        className="mt-10 text-[10px] uppercase tracking-[0.3em] text-white/35"
      >
        Made with love, by <ContentValue value={senderName} className="normal-case tracking-normal" />
      </motion.p>

      <EditHint values={[...closingMessage, senderName]} />
    </div>
  );
}
