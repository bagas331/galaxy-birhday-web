"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelShellProps {
  title: string;
  eyebrow?: string;
  accent?: string;
  onClose: () => void;
  children: ReactNode;
  /** Wider layout for galleries. */
  wide?: boolean;
  /** Full-bleed cinematic mode (closing scene). */
  cinematic?: boolean;
}

/**
 * Shared overlay frame for every content section. Escape and the
 * backdrop close it; the inner content scrolls with a cosmic scrollbar.
 * Music keeps playing underneath — panels never unmount the canvas.
 */
export function PanelShell({
  title,
  eyebrow,
  accent = "#73E7F5",
  onClose,
  children,
  wide = false,
  cinematic = false,
}: PanelShellProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (cinematic) {
    return (
      <motion.section
        className="absolute inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto px-6 py-14 text-center"
        style={{
          background:
            "radial-gradient(130% 100% at 50% 30%, rgba(8,11,36,0.76) 0%, rgba(8,11,36,0.94) 100%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1.4 } }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2.5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </motion.section>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#05041a]/55 backdrop-blur-[3px]"
        tabIndex={-1}
      />

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 210, damping: 26 }}
        className={cn(
          "glass-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl",
          wide ? "sm:max-w-4xl" : "sm:max-w-2xl",
        )}
      >
        {/* Accent aura */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${accent}26` }}
        />

        <header className="relative flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-8 sm:pt-7">
          <div className="min-w-0">
            {eyebrow && (
              <p
                className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.34em] sm:text-[11px]"
                style={{ color: accent }}
              >
                <span
                  className="inline-block h-1 w-1 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                  aria-hidden
                />
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-2xl leading-tight text-white sm:text-[2rem]">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="touch-target shrink-0 rounded-full border border-white/15 p-2.5 text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70"
            aria-label="Close panel"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        <div className="cosmic-scroll relative flex-1 overflow-y-auto overscroll-contain px-5 pb-10 sm:px-8">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
