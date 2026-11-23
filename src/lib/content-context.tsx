"use client";

import React, { createContext, useContext } from "react";
import type { BirthdayContent } from "@/types/universe";
import { birthdayContent } from "@/data/birthday-content";

const BirthdayContentContext = createContext<BirthdayContent>(birthdayContent);

export function BirthdayContentProvider({
  content,
  children,
}: {
  content?: BirthdayContent;
  children: React.ReactNode;
}) {
  return (
    <BirthdayContentContext.Provider value={content ?? birthdayContent}>
      {children}
    </BirthdayContentContext.Provider>
  );
}

/**
 * Returns the active BirthdayContent for the current tree.
 * Defaults to `birthdayContent` from `src/data/birthday-content.ts`
 * so the root `/` experience stays 100% unchanged.
 */
export function useBirthdayContent(): BirthdayContent {
  return useContext(BirthdayContentContext);
}

/**
 * Clean, neutral starter template used when a new customer opens
 * the Self-Service Web Builder (/builder). Uses royalty-free cosmic
 * placeholder images and ambient track so private assets are not exposed.
 */
export function createStarterBirthdayContent(): BirthdayContent {
  return {
    recipientName: "Nama Pasanganmu",
    senderName: "Nama Kamu",
    birthdayDate: "14 Maret 2027 · 22nd Birthday",
    heroTitle: "A Little Universe, For You",
    heroSubtitle:
      "Somewhere in this endless universe, there is one person who makes my world special.",
    enterButtonLabel: "Enter Our Universe",
    skipIntroLabel: "Skip Intro",
    exploreHint: "Drag to orbit · Scroll to zoom · Tap a planet to explore",
    birthdayTitle: "Happy Birthday",
    birthdayMessage: [
      "Selamat ulang tahun untuk seseorang yang selalu berhasil membuat hariku terasa lebih hangat dan penuh warna.",
      "Semoga di usia baru ini, semua langkahmu dimudahkan dan setiap harapan baikmu terwujud satu per satu.",
    ],
    letterTitle: "A Letter, Written in the Stars",
    letterGreeting: "Untuk sayangku,",
    letterParagraphs: [
      "Terima kasih sudah hadir dan menemani perjalanan ini dengan penuh kesabaran dan kasih sayang.",
      "Setiap momen kecil yang kita lewati bersama selalu punya tempat spesial di hatiku.",
      "Selamat bertambah usia, semoga bahagia selalu menyertai kita.",
    ],
    letterSignOff: "Forever orbiting you,",
    songTitle: "Cosmic Ambient Loop",
    songArtist: "Default Instrumental",
    songSrc: "/assets/audio/our-song.mp3",
    gallery: [
      {
        src: "/assets/images/memories/memory-1.webp",
        caption: "Momen pertama yang selalu kuingat",
        alt: "Memory photo 1",
      },
      {
        src: "/assets/images/memories/memory-2.webp",
        caption: "Jalan-jalan sore bareng kamu",
        alt: "Memory photo 2",
      },
      {
        src: "/assets/images/memories/memory-3.webp",
        caption: "Cerita panjang di kafe favorit kita",
        alt: "Memory photo 3",
      },
      {
        src: "/assets/images/memories/memory-4.webp",
        caption: "Hari spesial yang penuh tawa",
        alt: "Memory photo 4",
      },
    ],
    memories: [
      {
        title: "Pertama Kali Bertemu",
        description: "Hari di mana cerita kita pertama kali dimulai.",
        photo: "/assets/images/memories/memory-2.webp",
      },
      {
        title: "Momen Favorit Bersama",
        description: "Salah satu hari paling seru yang tidak pernah terlupakan.",
        photo: "/assets/images/memories/memory-5.webp",
      },
      {
        title: "Hari Ulang Tahunmu",
        description: "Merayakan hari spesialmu di semesta kecil kita.",
        photo: "/assets/images/memories/memory-6.webp",
      },
    ],
    secretLeadIn: "You found the secret star…",
    secretMessage: [
      "Dari sekian banyak orang di dunia ini, aku bersyukur semesta mempertemukanku denganmu.",
      "Jangan pernah bosan tumbuh dan melangkah bersamaku, ya. ❤️",
    ],
    closingTitle: "To Be Continued",
    closingMessage: [
      "Out of all the stars in this universe, I'm grateful that I found you.",
    ],
    replayLabel: "Explore Our Universe Again",
  };
}
