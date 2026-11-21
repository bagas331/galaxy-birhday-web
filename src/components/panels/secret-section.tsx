"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { useUniverseStore } from "@/lib/universe-store";
import { ContentValue, EditHint } from "@/components/shared/content-value";

/**
 * SCENE 8 — the secret surprise. Opening this panel fires a meteor
 * shower in the 3D universe behind (visible through the translucent
 * panel), while a hidden message glows into view. Easy to close,
 * never blocks navigation.
 */
export function SecretSection() {
  const { secretLeadIn, secretMessage } = birthdayContent;
  const triggerMeteorBurst = useUniverseStore((s) => s.triggerMeteorBurst);

  useEffect(() => {
    triggerMeteorBurst();
  }, [triggerMeteorBurst]);

  return (
    <div className="relative">
      {/* Soft meteor-trail decoration behind the message */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rotate-12 rounded-full bg-cosmic-violet/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 15 }}
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-cosmic-violet/40 bg-cosmic-violet/15"
      >
        <Star className="h-6 w-6 text-[#C9B4FF]" fill="currentColor" aria-hidden />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#C9B4FF]"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        {secretLeadIn}
      </motion.p>

      <div className="mt-6 space-y-4">
        {secretMessage.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.25, duration: 0.7 }}
            className="font-display text-xl leading-relaxed text-white sm:text-2xl"
          >
            <ContentValue value={line} />
          </motion.p>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-7 text-[11px] uppercase tracking-[0.28em] text-white/40"
      >
        — a wish just for you, hidden among the stars
      </motion.p>

      <EditHint values={secretMessage} />
    </div>
  );
}
