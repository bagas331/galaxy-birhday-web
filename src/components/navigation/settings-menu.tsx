"use client";

import { MonitorSmartphone, Settings2 } from "lucide-react";
import { useUniverseStore } from "@/lib/universe-store";

/**
 * Display settings: lets visitors drop to the lightweight 2D mode on
 * slow devices or when 3D feels uncomfortable. Also shown
 * automatically when WebGL is unavailable.
 */
export function SettingsMenu() {
  const force2D = useUniverseStore((s) => s.force2D);
  const setForce2D = useUniverseStore((s) => s.setForce2D);

  return (
    <div className="glass-bar fixed right-3 top-3 z-30 flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 sm:right-5 sm:top-5">
      <button
        type="button"
        onClick={() => setForce2D(!force2D)}
        aria-pressed={force2D}
        title={force2D ? "Switch back to the 3D universe" : "Switch to lightweight 2D mode"}
        aria-label={force2D ? "Switch back to the 3D universe" : "Switch to lightweight 2D mode"}
        className="flex items-center gap-2 rounded-full px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition focus-visible:outline-2 focus-visible:outline-white/70"
        style={{ color: force2D ? "#FFD98A" : "rgba(255,255,255,0.65)" }}
      >
        {force2D ? (
          <MonitorSmartphone className="h-4 w-4" aria-hidden />
        ) : (
          <Settings2 className="h-4 w-4" aria-hidden />
        )}
        <span className="hidden sm:inline">{force2D ? "3D mode" : "2D mode"}</span>
      </button>
    </div>
  );
}
