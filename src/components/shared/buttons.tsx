"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * The primary interactive button of the experience — a star-cored pill
 * with a soft cosmic halo. Used for Enter, Replay and other key actions.
 */
export const GlowButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { accent?: "gold" | "cyan" | "pink" }
>(function GlowButton({ className, accent = "gold", children, ...props }, ref) {
  const accents: Record<string, string> = {
    gold: "from-soft-gold/90 via-[#F2B96B]/90 to-nebula-pink/80 shadow-[0_0_36px_rgba(255,217,138,0.35)]",
    cyan: "from-glow-cyan/90 via-electric-blue/90 to-cosmic-violet/90 shadow-[0_0_36px_rgba(115,231,245,0.3)]",
    pink: "from-nebula-pink/90 via-cosmic-violet/90 to-electric-blue/90 shadow-[0_0_36px_rgba(244,122,203,0.32)]",
  };
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex min-h-11 items-center justify-center gap-2.5 overflow-hidden rounded-full",
        "bg-gradient-to-r px-7 py-3 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#150B2E]",
        "transition-all duration-300 hover:scale-[1.045] hover:brightness-110 active:scale-100",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-soft-gold",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
        accents[accent],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <span className="relative flex items-center gap-2.5">{children}</span>
    </button>
  );
});

/** Ghost / secondary button (skip, back, close). */
export const GhostButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function GhostButton({ className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5",
        "text-[12px] font-medium uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm",
        "transition-all duration-300 hover:border-white/45 hover:bg-white/[0.09] hover:text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
