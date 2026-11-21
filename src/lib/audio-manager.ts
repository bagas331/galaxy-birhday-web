"use client";

import { Howl } from "howler";
import { useSyncExternalStore } from "react";

/**
 * Global music manager built on Howler.
 *
 * - Audio is only ever started from an explicit user gesture
 *   (the "Enter Our Universe" button or the play control).
 * - Load errors never break the rest of the experience: the manager
 *   reports an error state and the UI shows a friendly notice.
 * - One instance for the whole app, so music keeps playing while the
 *   visitor moves between sections.
 */
export interface AudioState {
  /** A play attempt has been made (always after a user gesture). */
  started: boolean;
  playing: boolean;
  muted: boolean;
  volume: number;
  loading: boolean;
  error: string | null;
}

class AudioManager {
  private howl: Howl | null = null;
  private src: string | null = null;
  private listeners = new Set<() => void>();
  private state: AudioState = {
    started: false,
    playing: false,
    muted: false,
    volume: 0.65,
    loading: false,
    error: null,
  };

  getState = (): AudioState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(patch: Partial<AudioState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  /** Lazily creates the Howl on first user-gesture play. */
  play(src: string) {
    if (this.state.error) return;
    if (!this.howl || this.src !== src) {
      this.howl?.unload();
      this.src = src;
      this.emit({ loading: true });
      this.howl = new Howl({
        src: [src],
        html5: true,
        loop: true,
        volume: this.state.volume,
        onload: () => this.emit({ loading: false }),
        onloaderror: () =>
          this.emit({
            loading: false,
            playing: false,
            error:
              "The music file could not be loaded. Add your song at public/assets/audio/our-song.mp3 — everything else still works.",
          }),
        onplayerror: () =>
          this.emit({
            playing: false,
            error: "Audio playback was blocked by the browser. Try pressing play again.",
          }),
        onplay: () => this.emit({ playing: true, started: true }),
        onpause: () => this.emit({ playing: false }),
      });
    }
    this.howl.play();
  }

  pause() {
    this.howl?.pause();
  }

  toggle(src: string) {
    if (this.state.playing) this.pause();
    else this.play(src);
  }

  setVolume(volume: number) {
    const clamped = Math.min(1, Math.max(0, volume));
    this.howl?.volume(clamped);
    this.emit({ volume: clamped });
  }

  toggleMute() {
    const muted = !this.state.muted;
    this.howl?.mute(muted);
    this.emit({ muted });
  }

  destroy() {
    this.howl?.unload();
    this.howl = null;
    this.src = null;
    this.emit({ playing: false, started: false });
  }
}

export const audioManager = new AudioManager();

/** React binding for the audio manager. */
export function useAudio(): AudioState {
  return useSyncExternalStore(
    audioManager.subscribe,
    audioManager.getState,
    audioManager.getState,
  );
}
