"use client";

import { motion } from "framer-motion";

/**
 * FR-16 — loading state while the universe (and its code) is prepared.
 */
export function BootScreen({ label = "Preparing your universe…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-midnight">
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className="relative flex h-16 w-16 items-center justify-center"
        aria-hidden
      >
        <span className="absolute inset-0 rounded-full bg-soft-gold/25 blur-xl" />
        <span className="h-3 w-3 rounded-full bg-soft-gold shadow-[0_0_24px_rgba(255,217,138,0.9)]" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="mt-8 text-[11px] font-medium uppercase tracking-[0.4em] text-white/60"
        role="status"
      >
        {label}
      </motion.p>
    </div>
  );
}
