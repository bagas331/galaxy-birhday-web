"use client";

import { useEffect, useRef } from "react";
import { celestialBodies } from "@/data/birthday-content";
import { useUniverseStore } from "@/lib/universe-store";
import { labelPositions } from "./label-bridge";

/**
 * The floating planet labels as a plain DOM layer. A rAF loop applies
 * projected positions directly to the buttons (no React re-renders per
 * frame). The secret star stays label-less until discovered.
 */
export function LabelOverlay() {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const openSection = useUniverseStore((s) => s.openSection);
  const discoveredSecret = useUniverseStore((s) => s.discoveredSecret);
  const activeSection = useUniverseStore((s) => s.activeSection);

  useEffect(() => {
    let raf = 0;
    // The cinematic closing scene owns the full screen — labels would
    // bleed through the translucent overlay and fight the message.
    const hidden = activeSection === "closing";
    const tick = () => {
      const viewportWidth = window.innerWidth;
      for (const body of celestialBodies) {
        const el = buttonRefs.current[body.id];
        if (!el) continue;
        const pos = labelPositions.get(body.id);
        const showSecret = body.id !== "secret" || discoveredSecret;
        if (hidden || !pos || !pos.visible || !showSecret) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          // Final clamp with the pill's real width so it never clips
          const half = el.offsetWidth / 2 + 8;
          const x = Math.min(Math.max(pos.x, half), Math.max(half, viewportWidth - half));
          el.style.transform = `translate(-50%, -100%) translate3d(${x}px, ${pos.y}px, 0)`;
          el.style.opacity = "1";
          el.style.pointerEvents = "auto";
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [discoveredSecret, activeSection]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {celestialBodies.map((body) => (
        <button
          key={body.id}
          ref={(el) => {
            buttonRefs.current[body.id] = el;
          }}
          type="button"
          onClick={() => openSection(body.section)}
          className="group absolute left-0 top-0 flex touch-target items-center gap-2 rounded-full border border-white/15 bg-[#0b0930]/70 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 opacity-0 backdrop-blur-md transition-opacity duration-300 hover:border-white/40 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 sm:text-xs"
          style={{ pointerEvents: "none", boxShadow: `0 0 18px ${body.color}33` }}
          aria-label={`Open ${body.label}`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
            style={{ background: body.color, boxShadow: `0 0 8px ${body.color}` }}
          />
          {body.label}
        </button>
      ))}
    </div>
  );
}
