"use client";

import {
  Cake,
  HelpCircle,
  Images,
  Mail,
  Music,
  Orbit,
  Sparkles,
  Telescope,
} from "lucide-react";
import { useUniverseStore } from "@/lib/universe-store";
import { useBirthdayContent } from "@/lib/content-context";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/types/universe";

interface NavItem {
  section: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * SCENE 2 (navigation) — the alternative, always-available navigation.
 * Every part of the universe is reachable without touching the 3D
 * scene: important for accessibility, mobile, and anyone who just
 * prefers buttons. The secret stays coy ("???") until discovered.
 */
export function UniverseNav() {
  const activeSection = useUniverseStore((s) => s.activeSection);
  const openSection = useUniverseStore((s) => s.openSection);
  const closeSection = useUniverseStore((s) => s.closeSection);
  const discoveredSecret = useUniverseStore((s) => s.discoveredSecret);

  const items: NavItem[] = [
    { section: "birthday", label: "Birthday", icon: Cake },
    { section: "gallery", label: "Memories", icon: Images },
    { section: "timeline", label: "Our Orbit", icon: Orbit },
    { section: "letter", label: "Letter", icon: Mail },
    { section: "music", label: "Music", icon: Music },
    {
      section: "secret",
      label: discoveredSecret ? "Secret" : "???",
      icon: discoveredSecret ? Sparkles : HelpCircle,
    },
  ];

  return (
    <nav
      aria-label="Universe navigation"
      className="glass-bar cosmic-scroll fixed bottom-3 left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full px-2 py-1.5 sm:bottom-5 [&::-webkit-scrollbar]:hidden"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Home / overview */}
      <button
        type="button"
        onClick={closeSection}
        aria-current={activeSection === null ? "true" : undefined}
        title="Back to the universe"
        aria-label="Back to the universe overview"
        className={cn(
          "touch-target flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1.5 sm:px-3 transition-all duration-300",
          activeSection === null
            ? "bg-white/12 text-white shadow-[0_0_18px_rgba(180,160,255,0.25)]"
            : "text-white/60 hover:bg-white/8 hover:text-white",
        )}
      >
        <Telescope className="h-4.5 w-4.5" aria-hidden />
        <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em]">Universe</span>
      </button>

      <span aria-hidden className="mx-0.5 h-7 w-px bg-white/12" />

      {items.map(({ section, label, icon: Icon }) => {
        const active = activeSection === section;
        return (
          <button
            key={section}
            type="button"
            onClick={() => openSection(section)}
            aria-current={active ? "true" : undefined}
            title={section === "secret" && !discoveredSecret ? "A hidden star…?" : label}
            aria-label={
              section === "secret" && !discoveredSecret ? "Unknown star" : `Open ${label}`
            }
            className={cn(
              "touch-target flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1.5 sm:px-3 transition-all duration-300",
              active
                ? "bg-white/12 text-white shadow-[0_0_18px_rgba(180,160,255,0.25)]"
                : "text-white/60 hover:bg-white/8 hover:text-white",
            )}
          >
            <Icon className={cn("h-4.5 w-4.5", section === "secret" && !discoveredSecret && "animate-pulse")} aria-hidden />
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em]">
              {label}
            </span>
          </button>
        );
      })}

      <span aria-hidden className="mx-0.5 h-7 w-px bg-white/12" />

      {/* Finale */}
      <button
        type="button"
        onClick={() => openSection("closing")}
        title="Watch the ending"
        aria-label="Watch the closing scene"
        aria-current={activeSection === "closing" ? "true" : undefined}
        className={cn(
          "touch-target flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1.5 sm:px-3 transition-all duration-300",
          activeSection === "closing"
            ? "bg-soft-gold/20 text-soft-gold shadow-[0_0_18px_rgba(255,217,138,0.3)]"
            : "text-soft-gold/80 hover:bg-soft-gold/12 hover:text-soft-gold",
        )}
      >
        <Sparkles className="h-4.5 w-4.5" aria-hidden />
        <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em]">Finale</span>
      </button>
    </nav>
  );
}

/** Small hint shown right after entering the universe; fades away. */
export function ExploreHint({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const { exploreHint } = useBirthdayContent();
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="glass-bar fixed bottom-[8.5rem] left-1/2 z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full px-5 py-2.5 text-[11px] font-medium tracking-[0.14em] text-white/70 sm:bottom-24 sm:text-xs"
      aria-label="Exploration hint — tap to dismiss"
    >
      {exploreHint}
    </button>
  );
}
