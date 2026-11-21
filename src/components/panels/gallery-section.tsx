"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { ContentValue, EditHint } from "@/components/shared/content-value";

/**
 * SCENE 4 — the memory gallery. Cosmic photo cards with lazy loading
 * and a keyboard-navigable lightbox (arrows + Escape).
 */
export function GallerySection() {
  const { gallery } = birthdayContent;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + gallery.length) % gallery.length)),
    [gallery.length],
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % gallery.length)),
    [gallery.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  const active = lightboxIndex !== null ? gallery[lightboxIndex] : null;

  return (
    <div>
      <div className="mb-5 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/50">
        <Images className="h-4 w-4 text-nebula-pink" aria-hidden />
        {gallery.length} moments captured
      </div>

      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item, i) => (
          <motion.button
            key={item.src}
            type="button"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i, duration: 0.5, ease: "easeOut" }}
            onClick={() => setLightboxIndex(i)}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left transition-all duration-300 hover:-translate-y-1 hover:border-nebula-pink/40 hover:shadow-[0_18px_50px_rgba(244,122,203,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nebula-pink"
            aria-label={`Open photo: ${item.alt}`}
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0830]/95 via-[#0a0830]/55 to-transparent px-3.5 pb-3 pt-8">
              <p className="line-clamp-2 text-[12px] leading-snug text-white/85">
                <ContentValue value={item.caption} />
              </p>
              {item.date && (
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-soft-gold/80">
                  {item.date}
                </p>
              )}
            </div>
            <span
              aria-hidden
              className="absolute right-3 top-3 rounded-full bg-[#0a0830]/70 p-2 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
            >
              <ChevronRight className="h-3.5 w-3.5 text-nebula-pink" />
            </span>
          </motion.button>
        ))}
      </div>

      <EditHint values={gallery.map((g) => g.caption)} />

      {/* ── Lightbox ─────────────────────────────────────────────── */}
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] flex flex-col bg-[#040318]/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <p className="text-xs font-medium tracking-[0.25em] text-white/60">
              {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {gallery.length}
            </p>
            <button
              onClick={closeLightbox}
              className="touch-target rounded-full border border-white/15 p-2.5 text-white/75 transition hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70"
              aria-label="Close photo viewer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-14 pb-4 sm:px-24">
            <motion.img
              key={active.src}
              src={active.src}
              alt={active.alt}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="max-h-[70dvh] max-w-full rounded-xl object-contain shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
            />

            <button
              onClick={showPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-[#0b0930]/70 p-3 text-white/80 backdrop-blur-md transition hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70 sm:left-6"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-[#0b0930]/70 p-3 text-white/80 backdrop-blur-md transition hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70 sm:right-6"
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 pb-6 text-center">
            <p className="mx-auto max-w-xl text-[13px] leading-relaxed text-white/80">
              <ContentValue value={active.caption} />
            </p>
            {active.date && (
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.24em] text-soft-gold/80">
                {active.date}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
