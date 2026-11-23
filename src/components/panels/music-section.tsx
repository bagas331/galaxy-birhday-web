"use client";

import { motion } from "framer-motion";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useBirthdayContent } from "@/lib/content-context";
import { audioManager, useAudio } from "@/lib/audio-manager";
import { ContentValue, EditHint } from "@/components/shared/content-value";
import { cn } from "@/lib/utils";

/** Gentle equaliser bars that only dance while music plays. */
function Equalizer({ playing }: { playing: boolean }) {
  return (
    <div className="flex h-5 items-end gap-1" aria-hidden>
      {[0.9, 0.5, 0.75, 0.4, 0.85].map((delay, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-cosmic-violet to-soft-gold"
          animate={
            playing
              ? { height: [4, 17, 8, 20, 6, 14, 4] }
              : { height: 4 }
          }
          transition={
            playing
              ? { repeat: Infinity, duration: 1.5 + delay, ease: "easeInOut", delay: delay * 0.3 }
              : { duration: 0.4 }
          }
        />
      ))}
    </div>
  );
}

/**
 * SCENE 7 — music corner. Full player controls; the same audio manager
 * powers the persistent mini widget, so the song never restarts when
 * moving between sections. Errors degrade gracefully with a notice.
 */
export function MusicSection() {
  const { songTitle, songArtist, songSrc } = useBirthdayContent();
  const audio = useAudio();

  const disabled = Boolean(audio.error);

  return (
    <div>
      <div className="mb-7 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em] text-white/50">
        <Music className="h-4 w-4 text-soft-gold" aria-hidden />
        The song of our universe
      </div>

      <div className="flex flex-col items-center gap-8 py-2 sm:flex-row sm:items-center sm:gap-10">
        {/* Disc / artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-soft-gold/25 bg-[radial-gradient(circle_at_35%_30%,#4A2D96_0%,#241650_55%,#150B2E_100%)] shadow-[0_0_60px_rgba(255,217,138,0.14)]"
        >
          <motion.div
            animate={audio.playing ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-dashed border-soft-gold/25"
            aria-hidden
          >
            <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-soft-gold" />
          </motion.div>
          <Equalizer playing={audio.playing} />
        </motion.div>

        <div className="w-full min-w-0 flex-1 text-center sm:text-left">
          <h3 className="font-display truncate-none text-xl text-white sm:text-2xl">
            <ContentValue value={songTitle} />
          </h3>
          <p className="mt-1 text-sm text-white/60">
            <ContentValue value={songArtist} />
          </p>

          {/* Controls */}
          <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
            <button
              type="button"
              onClick={() => audioManager.toggle(songSrc)}
              disabled={disabled || audio.loading}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-soft-gold to-[#F2B96B] text-[#150B2E]",
                "shadow-[0_0_36px_rgba(255,217,138,0.4)] transition-all duration-300 hover:scale-105 active:scale-95",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-soft-gold",
                "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100",
              )}
              aria-label={audio.playing ? "Pause music" : "Play music"}
            >
              {audio.loading ? (
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-[#150B2E]/30 border-t-[#150B2E]"
                  aria-hidden
                />
              ) : audio.playing ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={() => audioManager.toggleMute()}
              disabled={disabled}
              className="touch-target flex items-center justify-center rounded-full border border-white/20 p-3 text-white/75 transition hover:border-white/45 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70 disabled:opacity-40"
              aria-label={audio.muted ? "Unmute music" : "Mute music"}
            >
              {audio.muted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-[220px]">
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/40" aria-hidden>
                Vol
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={audio.muted ? 0 : audio.volume}
                onChange={(e) => audioManager.setVolume(Number(e.target.value))}
                disabled={disabled}
                aria-label="Music volume"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-soft-gold disabled:opacity-40 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-soft-gold [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,217,138,0.6)]"
              />
            </div>
          </div>
        </div>
      </div>

      {audio.error && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-nebula-pink/30 bg-nebula-pink/10 px-4 py-3 text-[13px] leading-relaxed text-white/85"
        >
          {audio.error}
        </p>
      )}

      <EditHint values={[songTitle, songArtist]} />
    </div>
  );
}
