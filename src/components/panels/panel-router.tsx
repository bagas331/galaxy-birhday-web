"use client";

import { AnimatePresence } from "framer-motion";
import { useUniverseStore } from "@/lib/universe-store";
import { birthdayContent } from "@/data/birthday-content";
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

const SECTION_META: Record<SectionId, SectionMeta> = {
  birthday: { eyebrow: "Birthday Planet", title: "A Wish For You", accent: "#73E7F5" },
  gallery: { eyebrow: "Memory Planet", title: "Our Little Memories", accent: "#F47ACB", wide: true },
  timeline: { eyebrow: "Our Orbit", title: "Moments I Keep", accent: "#4B9CFF" },
  letter: { eyebrow: "Love Letter", title: birthdayContent.letterTitle, accent: "#FFD98A" },
  music: { eyebrow: "Music Star", title: "Our Song", accent: "#FFD98A" },
  secret: { eyebrow: "Secret Star", title: "You Found Me", accent: "#C9B4FF" },
  closing: { eyebrow: "", title: birthdayContent.closingTitle, accent: "#FFD98A" },
};

/**
 * Maps the active section to its overlay panel. The 3D universe stays
 * mounted underneath, so the music and the scene keep running.
 */
export function PanelRouter() {
  const activeSection = useUniverseStore((s) => s.activeSection);
  const closeSection = useUniverseStore((s) => s.closeSection);
  const restartExperience = useUniverseStore((s) => s.restartExperience);

  return (
    <AnimatePresence>
      {activeSection && (
        <PanelShell
          key={activeSection}
          title={SECTION_META[activeSection].title}
          eyebrow={SECTION_META[activeSection].eyebrow || undefined}
          accent={SECTION_META[activeSection].accent}
          wide={SECTION_META[activeSection].wide}
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
