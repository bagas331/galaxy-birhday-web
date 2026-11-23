"use client";

import { AnimatePresence } from "framer-motion";
import { useUniverseStore } from "@/lib/universe-store";
import { useBirthdayContent } from "@/lib/content-context";
import { PanelShell } from "./panel-shell";
import { BirthdaySection } from "./birthday-section";
import { GallerySection } from "./gallery-section";
import { TimelineSection } from "./timeline-section";
import { LetterSection } from "./letter-section";
import { MusicSection } from "./music-section";
import { SecretSection } from "./secret-section";
import { ClosingSection } from "./closing-section";
import type { SectionId } from "@/types/universe";

interface SectionMeta {
  eyebrow: string;
  title: string;
  accent: string;
  wide?: boolean;
}

/**
 * Maps the active section to its overlay panel. The 3D universe stays
 * mounted underneath, so the music and the scene keep running.
 */
export function PanelRouter() {
  const content = useBirthdayContent();
  const activeSection = useUniverseStore((s) => s.activeSection);
  const closeSection = useUniverseStore((s) => s.closeSection);
  const restartExperience = useUniverseStore((s) => s.restartExperience);

  const sectionMeta: Record<SectionId, SectionMeta> = {
    birthday: { eyebrow: "Birthday Planet", title: "A Wish For You", accent: "#73E7F5" },
    gallery: { eyebrow: "Memory Planet", title: "Our Little Memories", accent: "#F47ACB", wide: true },
    timeline: { eyebrow: "Our Orbit", title: "Moments I Keep", accent: "#4B9CFF" },
    letter: { eyebrow: "Love Letter", title: content.letterTitle, accent: "#FFD98A" },
    music: { eyebrow: "Music Star", title: "Our Song", accent: "#FFD98A" },
    secret: { eyebrow: "Secret Star", title: "You Found Me", accent: "#C9B4FF" },
    closing: { eyebrow: "", title: content.closingTitle, accent: "#FFD98A" },
  };

  return (
    <AnimatePresence>
      {activeSection && (
        <PanelShell
          key={activeSection}
          title={sectionMeta[activeSection].title}
          eyebrow={sectionMeta[activeSection].eyebrow || undefined}
          accent={sectionMeta[activeSection].accent}
          wide={sectionMeta[activeSection].wide}
          cinematic={activeSection === "closing"}
          onClose={closeSection}
        >
          {activeSection === "birthday" && <BirthdaySection />}
          {activeSection === "gallery" && <GallerySection />}
          {activeSection === "timeline" && <TimelineSection />}
          {activeSection === "letter" && <LetterSection />}
          {activeSection === "music" && <MusicSection />}
          {activeSection === "secret" && <SecretSection />}
          {activeSection === "closing" && (
            <ClosingSection onReplay={restartExperience} />
          )}
        </PanelShell>
      )}
    </AnimatePresence>
  );
}
