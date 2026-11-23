"use client";

import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useBirthdayContent } from "@/lib/content-context";
import { audioManager, useAudio } from "@/lib/audio-manager";
import { useUniverseStore } from "@/lib/universe-store";
import { cn } from "@/lib/utils";

/**
 * SCENE 7 (persistent controls) — a compact music pill that floats
 * above the navigation. It never unmounts while exploring, so the
 * song keeps playing across every section.
 */
export function MusicWidget() {
  const { songSrc, songTitle } = useBirthdayContent();
  const audio = useAudio();
  const openSection = useUniverseStore((s) => s.openSection);

  return (
    <div
      className="glass-bar fixed bottom-[5.5rem] right-3 z-30 flex items-center gap-1 rounded-full p-1.5 sm:bottom-[5.2rem] sm:right-5"
      role="group"
      aria-label="Music controls"
    >
      <button
        type="button"
        onClick={() => openSection("music")}
        title={`Now playing: ${songTitle}`}
        aria-label="Open music panel"
        className="flex h-9 w-9 items-center justify-center rounded-full text-soft-gold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-soft-gold"
      >
        <Music className={cn("h-4 w-4", audio.playing && "animate-pulse")} aria-hidden />
      </button>

      <button
        type="button"
        onClick={() => audioManager.toggle(songSrc)}
        disabled={Boolean(audio.error) || audio.loading}
        title={audio.playing ? "Pause music" : "Play music"}
        aria-label={audio.playing ? "Pause music" : "Play music"}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-gold/15 text-soft-gold transition hover:bg-soft-gold/25 focus-visible:outline-2 focus-visible:outline-soft-gold disabled:opacity-40"
      >
        {audio.playing ? (
          <Pause className="h-4 w-4" fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
        )}
      </button>

      <button
        type="button"
        onClick={() => audioManager.toggleMute()}
        disabled={Boolean(audio.error)}
        title={audio.muted ? "Unmute" : "Mute"}
        aria-label={audio.muted ? "Unmute music" : "Mute music"}
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/70 disabled:opacity-40"
      >
        {audio.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
