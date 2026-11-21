"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, MailOpen } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { ContentValue, EditHint } from "@/components/shared/content-value";

/**
 * SCENE 6 — the love letter. A glowing envelope floats in space; a tap
 * lifts the flap and the letter rises out, then unfolds into a warm,
 * comfortably readable page. The envelope replay is part of the charm.
 */
export function LetterSection() {
  const { letterTitle, letterGreeting, letterParagraphs, letterSignOff, senderName } =
    birthdayContent;
  const [stage, setStage] = useState<"sealed" | "opening" | "reading">("sealed");

  const open = () => {
    if (stage !== "sealed") return;
    setStage("opening");
    window.setTimeout(() => setStage("reading"), 1500);
  };

  // Fallback: if the animation is interrupted, still show the letter
  useEffect(() => {
    if (stage === "opening") {
      const t = window.setTimeout(() => setStage("reading"), 2400);
      return () => window.clearTimeout(t);
    }
  }, [stage]);

  return (
    <div className="min-h-[420px]">
      <AnimatePresence mode="wait">
        {stage !== "reading" ? (
          <motion.div
            key="envelope"
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.4 } }}
            className="flex flex-col items-center justify-center py-8"
          >
            <button
              type="button"
              onClick={open}
              disabled={stage === "opening"}
              className="group relative outline-none"
              aria-label="Open the love letter"
            >
              <div style={{ perspective: 1200 }} className="relative h-48 w-72 sm:h-52 sm:w-80">
                {/* Envelope body */}
                <div className="absolute inset-0 rounded-xl border border-soft-gold/30 bg-gradient-to-b from-[#33206B] to-[#1D1145] shadow-[0_24px_70px_rgba(117,68,216,0.35)]" />

                {/* Letter peeking inside */}
                <motion.div
                  className="absolute inset-x-4 top-3 bottom-6 rounded-md bg-gradient-to-b from-[#F8EFDD] to-[#F0E2C6]"
                  initial={false}
                  animate={
                    stage === "opening"
                      ? { y: -88, scale: 1.04, transition: { delay: 0.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] } }
                      : { y: 0 }
                  }
                >
                  <div className="flex h-full flex-col items-center justify-end gap-2 px-6 pb-7 text-center">
                    <Heart className="h-4 w-4 text-[#B04A7A]" aria-hidden />
                    <p className="font-display text-sm italic text-[#5A4B7A]">{letterTitle}</p>
                  </div>
                </motion.div>

                {/* Flap */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-1/2 rounded-t-xl border-b border-soft-gold/25 bg-gradient-to-b from-[#4A2D96] to-[#37207B]"
                  style={{ transformOrigin: "top center", zIndex: 20, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                  initial={false}
                  animate={
                    stage === "opening"
                      ? { rotateX: 178, transition: { duration: 0.7, ease: "easeInOut" } }
                      : { rotateX: 0 }
                  }
                />

                {/* Wax seal */}
                <motion.div
                  className="absolute left-1/2 top-[44%] z-30 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#FFD98A]/40 bg-gradient-to-br from-[#E4568C] to-[#B04A7A] shadow-[0_0_24px_rgba(244,122,203,0.55)]"
                  initial={false}
                  animate={
                    stage === "opening"
                      ? { opacity: 0, scale: 0.4, transition: { duration: 0.35 } }
                      : { opacity: 1, scale: 1 }
                  }
                >
                  <Heart className="h-4.5 w-4.5 text-white" fill="currentColor" aria-hidden />
                </motion.div>

                {/* Glow pulse while sealed */}
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-full bg-nebula-pink/15 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ opacity: 0.6 }}
                />
              </div>
            </button>

            <motion.p
              animate={{ opacity: [0.45, 0.95, 0.45] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
              className="mt-9 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em] text-soft-gold/90"
            >
              <MailOpen className="h-3.5 w-3.5" aria-hidden />
              {stage === "opening" ? "Opening…" : "Tap the envelope to open"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.article
            key="letter"
            initial={{ opacity: 0, y: 34, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-xl overflow-hidden rounded-2xl bg-gradient-to-b from-[#F8EFDD] to-[#EFE0C2] p-6 text-[#2E2A45] shadow-[0_28px_80px_rgba(0,0,0,0.5)] sm:my-4 sm:p-10"
          >
            {/* Paper corner stars */}
            <span aria-hidden className="absolute right-4 top-4 text-[#B04A7A]/50">✦</span>
            <span aria-hidden className="absolute bottom-4 left-4 text-[#4B9CFF]/50">✦</span>

            <h3 className="font-display text-xl italic sm:text-2xl">{letterGreeting}</h3>

            <div className="my-5 h-px bg-gradient-to-r from-[#B04A7A]/40 via-[#B04A7A]/15 to-transparent" />

            <div className="space-y-4">
              {letterParagraphs.map((p, i) => (
                <p key={i} className="font-display text-[15px] leading-[1.95] sm:text-[16.5px]">
                  <ContentValue value={p} variant="paper" />
                </p>
              ))}
            </div>

            <div className="mt-8 text-right">
              <p className="font-display text-[15px] italic text-[#5A4B7A]">{letterSignOff}</p>
              <p className="font-display mt-1 text-lg font-semibold text-[#B04A7A]">
                <ContentValue value={senderName} variant="paper" />
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStage("sealed")}
              className="mt-7 rounded-full border border-[#B04A7A]/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8A3B62] transition hover:bg-[#B04A7A]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B04A7A]"
            >
              Seal it again
            </button>
          </motion.article>
        )}
      </AnimatePresence>

      <EditHint
        values={[letterGreeting, ...letterParagraphs, letterSignOff, senderName]}
      />
    </div>
  );
}
