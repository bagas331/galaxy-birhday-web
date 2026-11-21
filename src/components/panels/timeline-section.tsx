"use client";

import { motion } from "framer-motion";
import { Orbit } from "lucide-react";
import { birthdayContent } from "@/data/birthday-content";
import { ContentValue, EditHint } from "@/components/shared/content-value";

/**
 * SCENE 5 — "Moments I Keep": memories floating along a cosmic orbit.
 * A glowing constellation spine with planet-node markers; cards
 * alternate sides on desktop and stack on mobile. Dates and stories
 * come only from real data — never invented.
 */
export function TimelineSection() {
  const { memories } = birthdayContent;

  return (
    <div>
      <div className="mb-7 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/50">
        <Orbit className="h-4 w-4 text-electric-blue" aria-hidden />
        Moments I keep, in orbit
      </div>

      <ol className="relative">
        {/* The orbit spine */}
        <span
          aria-hidden
          className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-electric-blue/10 via-electric-blue/60 to-nebula-pink/30 sm:left-1/2"
        />

        {memories.map((memory, i) => {
          const leftSide = i % 2 === 0;
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.14, duration: 0.55, ease: "easeOut" }}
              className="relative mb-8 pl-11 last:mb-2 sm:pl-0"
            >
              {/* Planet node */}
              <span
                aria-hidden
                className="absolute left-[7px] top-1.5 flex h-3.5 w-3.5 items-center justify-center sm:left-1/2 sm:-translate-x-1/2"
              >
                <span
                  className="absolute h-full w-full rounded-full"
                  style={{
                    background: i % 2 === 0 ? "#4B9CFF" : "#F47ACB",
                    boxShadow: `0 0 14px ${i % 2 === 0 ? "#4B9CFF" : "#F47ACB"}`,
                  }}
                />
                <span
                  className="absolute h-6 w-6 animate-ping rounded-full opacity-20"
                  style={{ background: i % 2 === 0 ? "#4B9CFF" : "#F47ACB" }}
                />
              </span>

              <div
                className={
                  leftSide
                    ? "sm:mr-[calc(50%+2rem)]"
                    : "sm:ml-[calc(50%+2rem)]"
                }
              >
                <article className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-all duration-300 hover:border-electric-blue/35 hover:bg-white/[0.06] sm:p-5">
                  {memory.date && (
                    <p className="mb-1.5 inline-flex rounded-full border border-soft-gold/30 bg-soft-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-gold">
                      {memory.date}
                    </p>
                  )}
                  <h4 className="font-display text-lg leading-snug text-white sm:text-xl">
                    <ContentValue value={memory.title} />
                  </h4>
                  <p className="mt-2 text-[13.5px] leading-[1.75] text-white/75">
                    <ContentValue value={memory.description} />
                  </p>
                  {memory.photo && (
                    <div className="mt-3.5 overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={memory.photo}
                        alt={memory.title}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                  )}
                </article>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <EditHint values={memories.flatMap((m) => [m.title, m.description])} />
    </div>
  );
}
