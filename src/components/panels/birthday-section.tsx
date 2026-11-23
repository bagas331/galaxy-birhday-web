"use client";

import { motion } from "framer-motion";
import { Cake } from "lucide-react";
import { useBirthdayContent } from "@/lib/content-context";
import { ContentValue, EditHint } from "@/components/shared/content-value";

/**
 * SCENE 3 — the birthday greeting. Typography-first, calm reveal that
 * never fights the message for attention.
 */
export function BirthdaySection() {
  const { birthdayTitle, birthdayDate, birthdayMessage, recipientName, senderName } =
    useBirthdayContent();

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-glow-cyan/30 bg-glow-cyan/10"
        aria-hidden
      >
        <Cake className="h-6 w-6 text-glow-cyan" />
      </motion.div>

      <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/50">
        <ContentValue value={birthdayDate} />
      </p>

      <motion.h3
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.7 }}
        className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl"
      >
        {birthdayTitle},{" "}
        <span className="gradient-text-cosmic italic">
          <ContentValue value={recipientName} />
        </span>
      </motion.h3>

      <div className="cosmic-rule my-7" />

      <div className="space-y-5">
        {birthdayMessage.map((paragraph, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.18, duration: 0.6 }}
            className="text-[15px] leading-[1.85] text-white/85 sm:text-base"
          >
            <ContentValue value={paragraph} />
          </motion.p>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.8 }}
        className="mt-9 flex items-center gap-4"
      >
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-nebula-pink/50 to-transparent" aria-hidden />
        <p className="font-display text-sm italic text-white/80 sm:text-base">
          With all my love,{" "}
          <span className="text-soft-gold not-italic">
            <ContentValue value={senderName} />
          </span>
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-nebula-pink/50 to-transparent" aria-hidden />
      </motion.div>

      <EditHint values={[birthdayDate, recipientName, senderName, ...birthdayMessage]} />
    </div>
  );
}
