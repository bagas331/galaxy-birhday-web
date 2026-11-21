"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWebglSupport } from "@/hooks/use-webgl";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useDeviceTier } from "@/hooks/use-device-tier";
import { useUniverseStore } from "@/lib/universe-store";
import { audioManager } from "@/lib/audio-manager";
import { birthdayContent } from "@/data/birthday-content";
import { BootScreen } from "./boot-screen";
import { IntroScreen } from "@/components/intro/intro-screen";
import { ExploreHint, UniverseNav } from "@/components/navigation/universe-nav";
import { MusicWidget } from "@/components/navigation/music-widget";
import { SettingsMenu } from "@/components/navigation/settings-menu";
import { PanelRouter } from "@/components/panels/panel-router";
import { TwoDFallback } from "@/components/fallback/two-d-fallback";
import { LabelOverlay } from "@/components/universe/label-overlay";

// The 3D universe is a large client-only chunk — load it dynamically.
const UniverseCanvas = dynamic(() => import("@/components/universe/universe-canvas"), {
  ssr: false,
});

/**
 * Top-level orchestrator: phase machine (intro → entering → universe),
 * 3D-vs-2D routing, and the persistent overlay UI.
 */
export default function BirthdayUniverse() {
  const webgl = useWebglSupport();
  const reduced = useReducedMotion();
  const tier = useDeviceTier();

  const phase = useUniverseStore((s) => s.phase);
  const activeSection = useUniverseStore((s) => s.activeSection);
  const force2D = useUniverseStore((s) => s.force2D);
  const setWebglAvailable = useUniverseStore((s) => s.setWebglAvailable);
  const startEntering = useUniverseStore((s) => s.startEntering);
  const completeEntering = useUniverseStore((s) => s.completeEntering);

  const [hintDismissed, setHintDismissed] = useState(false);

  useEffect(() => {
    if (webgl !== null) setWebglAvailable(webgl);
  }, [webgl, setWebglAvailable]);

  // Auto-hide the exploration hint shortly after arriving
  useEffect(() => {
    if (phase !== "universe") return;
    const timer = window.setTimeout(() => setHintDismissed(true), 13000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const use2D = force2D || webgl === false;

  // Audio may only start from an explicit user gesture (browser
  // autoplay policy) — both entry paths go through these handlers.
  const handleEnter = () => {
    audioManager.play(birthdayContent.songSrc);
    startEntering(false);
  };

  const handleSkip = () => {
    audioManager.play(birthdayContent.songSrc);
    startEntering(true);
  };

  /* ── WebGL unavailable / manual 2D mode ─────────────────────────── */
  if (use2D) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-midnight">
        <TwoDFallback />
        <MusicWidget />
        <SettingsMenu />
      </div>
    );
  }

  /* ── Still probing WebGL / loading the 3D chunk ─────────────────── */
  if (webgl === null) {
    return <BootScreen />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-midnight">
      {/* The universe */}
      <div className="absolute inset-0">
        <UniverseCanvas tier={tier} reduced={reduced} />
      </div>

      {/* SCENE 1 — cinematic intro */}
      <AnimatePresence>
        {phase === "intro" && <IntroScreen key="intro" onEnter={handleEnter} onSkip={handleSkip} />}
      </AnimatePresence>

      {/* Cinematic letterbox during the fly-through */}
      <AnimatePresence>
        {phase === "entering" && (
          <motion.div key="letterbox" className="pointer-events-none absolute inset-0 z-20">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "8vh" }}
              exit={{ height: 0, transition: { duration: 0.9, delay: 0.2 } }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="w-full bg-[#04030f]"
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "8vh" }}
              exit={{ height: 0, transition: { duration: 0.9, delay: 0.2 } }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute bottom-0 w-full bg-[#04030f]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCENE 2 — free exploration UI */}
      {phase === "universe" && (
        <>
          <LabelOverlay />
          <PanelRouter />
          <UniverseNav />
          <MusicWidget />
          <SettingsMenu />
          <ExploreHint
            visible={!hintDismissed && !activeSection}
            onDismiss={() => setHintDismissed(true)}
          />
        </>
      )}

      {/* Safety: if a phase transition is ever lost, this unlocks the UI */}
      {phase === "entering" && (
        <button
          type="button"
          onClick={completeEntering}
          className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/30 transition hover:text-white/70"
          aria-label="Continue to the universe"
        >
          Continue →
        </button>
      )}
    </div>
  );
}
