import type {
  BirthdayContent,
  CelestialBodyConfig,
} from "@/types/universe";

/**
 * ──────────────────────────────────────────────────────────────────────
 *  ALL PERSONAL CONTENT LIVES HERE.
 *  Replace every [bracketed placeholder] with your real content.
 *  Values wrapped in [brackets] are rendered in a distinct gold
 *  "placeholder" style on the site so they cannot be missed.
 *
 *  Photos: put your photos in public/assets/images/memories/ and update
 *  the `gallery` + `memories` arrays below.
 *  Music:  place your song at public/assets/audio/our-song.mp3 (or edit
 *  `songSrc`) and update `songTitle` / `songArtist`.
 * ──────────────────────────────────────────────────────────────────────
 */
export const birthdayContent: BirthdayContent = {
  recipientName: "Rizkia Damayanti",
  senderName: "Bagas Aditya",

  // The birthday date is displayed in the birthday panel.
  birthdayDate: "21 November 2026 · 23rd Birthday",

  heroTitle: "A Little Universe, For You",
  heroSubtitle:
    "Somewhere in this endless universe, there is one person who makes my world special.",
  enterButtonLabel: "Enter Our Universe",
  skipIntroLabel: "Skip Intro",
  exploreHint: "Drag to orbit · Scroll to zoom · Tap a planet to explore",

  birthdayTitle: "Happy 23rd Birthday",
  birthdayMessage: [
    "Happy 23rd birthday, Rizkia. Thank you for bringing so much warmth, laughter, and light into my life every single day.",
    "May this new chapter of your 23rd year bring you endless happiness, gentle days, and every dream your heart has been wishing for.",
  ],

  letterTitle: "A Letter, Written in the Stars",
  letterGreeting: "My dearest Rizkia,",
  letterParagraphs: [
    "Selamat ulang tahun yaa, sayangku! ❤️",
    "Terima kasih udah nemenin aku dari awal kita ketemu, dari aku yang masih sibuk sama skripsi sampai akhirnya bisa ada di titik sekarang. Seneng rasanya bisa jalan sejauh ini bareng kamu.",
    "Semoga baby selalu panjang umur, sehat terus, cantik selalu, makin sukses, dan semua hal yang lagi kamu usahain bisa tercapai satu per satu. Semoga juga makin sabar, terutama kalau lagi ngadepin aku yang kadang suka bikin kesel, hehe.",
    "Aku mungkin belum jadi orang yang sempurna buat kamu, masih banyak kurangnya dan kadang masih suka bikin kamu kesel atau kecewa. Tapi aku harap kita bisa terus belajar buat saling ngerti, saling sabar, dan nemenin satu sama lain.",
    "Pokoknya, semoga di umur yang baru ini lebih banyak hal baik yang datang ke hidup kamu. Jangan lupa bahagia yaa, baby. Aku seneng bisa jadi salah satu orang yang nemenin perjalanan kamu sampai hari ini. ❤️",
  ],
  letterSignOff: "Forever orbiting you,",
  // The sender name shown under the letter sign-off:
  // (uses senderName above)

  songTitle: "Soft",
  songArtist: "LANY",
  songSrc: "/assets/audio/lany-soft.mp3",

  // ── PHOTO GALLERY ───────────────────────────────────────────────────
  // Replace these placeholder artworks with your real photographs.
  // Only set `date` when it is real — never invent dates.
  gallery: [
    {
      src: "/assets/images/memories/foto1.jpeg",
      caption: "Abis mam daging langsung ngopi ke nees",
      alt: "Abis mam daging langsung ngopi ke nees",
    },
    {
      src: "/assets/images/memories/foto2.jpeg",
      caption: 'Petemuan ke 3 nongki di tempat sepii "soo creepy"',
      alt: 'Petemuan ke 3 nongki di tempat sepii "soo creepy"',
    },
    {
      src: "/assets/images/memories/foto3.jpeg",
      caption: "Cobain dimsum sekaligus pegang tangan pertama kali.. uhuuyyy",
      alt: "Cobain dimsum sekaligus pegang tangan pertama kali.. uhuuyyy",
    },
    {
      src: "/assets/images/memories/foto4.jpeg",
      caption: "Abis nemenin IPL langsung skripsian di foree",
      alt: "Abis nemenin IPL langsung skripsian di foree",
    },
    {
      src: "/assets/images/memories/foto5.jpeg",
      caption: "Suuttttttt jangan berisikkk",
      alt: "Suuttttttt jangan berisikkk",
    },
    {
      src: "/assets/images/memories/foto6.jpeg",
      caption: "Ini gatau lagi ngapain",
      alt: "Ini gatau lagi ngapain",
    },
    {
      src: "/assets/images/memories/foto7.jpeg",
      caption: "Senderan dipundak ❎, senderan dikepala ✅",
      alt: "Senderan dipundak ❎, senderan dikepala ✅",
    },
    {
      src: "/assets/images/memories/foto8.jpeg",
      caption: "Salah satu hari terbaik dan moment terbaik...",
      alt: "Salah satu hari terbaik dan moment terbaik...",
    },
  ],

  // ── MEMORY TIMELINE ─────────────────────────────────────────────────
  // Template slots — replace with your real moments, in order.
  // Delete items you do not need; `date` and `photo` are optional.
  memories: [
    {
      title: "The Day We Met",
      description:
        'Pertama kali ketemu baby aku seperti independent woman karismatik juga, kalo sekarang sukannya manjaa"',
      photo: "/assets/images/memories/001.jpeg",
    },
    {
      title: "Our Random Things",
      description:
        "udah berani opload foto di wa walaupun belum jadian wkwkwk",
      photo: "/assets/images/memories/002.jpeg",
    },
    {
      title: "Our Random Things",
      description:
        "Pertama kali upload foto di instastory, bedanya udah official",
      photo: "/assets/images/memories/003.jpeg",
    },
    {
      title: "Pertama kali main ber-enam",
      description:
        "Pas lagi happy-nya terus ada kejadian, pantesan kalo dikasih seneng terus harus curiga",
      photo: "/assets/images/memories/004.jpeg",
    },
  ],

  // ── SECRET SURPRISE ─────────────────────────────────────────────────
  secretLeadIn: "You found the secret star…",
  secretMessage: [
    "Satu hal yang mungkin ngga selalu aku ucapin secara langsung. Aku harap kamu tahu kalau kehadiran kamu punya arti besar buat aku. Dari semua hal random yang kita lewatin, cerita kecil, ketawa, sampai berantem karena hal sepele, semuanya jadi bagian yang pengen terus aku simpan.",
    "Aku ngga cuma pengen nemenin kamu hari ini, tapi juga di masa depan. Aku pengen suatu hari nanti bisa menjadikan kamu istri aku, membangun keluarga kecil bersama, melewati suka dan duka, dan menua bareng kamu.",
    "I love you, baby. Jangan bosen-bosen sama aku yaa. Kita masih punya banyak cerita yang belum ditulis. ❤️",
  ],

  // ── CLOSING ─────────────────────────────────────────────────────────
  closingTitle: "To Be Continued",
  closingMessage: [
    "Out of all the stars in this universe, I'm grateful that I found you.",
  ],
  replayLabel: "Explore Our Universe Again",
};

/**
 * The six interactive celestial bodies. Positions, sizes and orbital
 * parameters live in the 3D layer; this maps bodies to content sections.
 */
export const celestialBodies: CelestialBodyConfig[] = [
  {
    id: "birthday",
    label: "Birthday Planet",
    section: "birthday",
    color: "#73E7F5",
  },
  {
    id: "memory",
    label: "Memory Planet",
    section: "gallery",
    color: "#F47ACB",
  },
  {
    id: "letter",
    label: "Love Letter",
    section: "letter",
    color: "#FFD98A",
  },
  {
    id: "orbit",
    label: "Our Orbit",
    section: "timeline",
    color: "#4B9CFF",
  },
  {
    id: "music",
    label: "Music Star",
    section: "music",
    color: "#FFD98A",
  },
  {
    id: "secret",
    label: "Secret Star",
    section: "secret",
    color: "#7544D8",
  },
];

/** True when a string is still an unfilled [placeholder]. */
export function isPlaceholder(value: string | undefined): boolean {
  if (!value) return false;
  return /^\[[\s\S]+\]$/.test(value.trim());
}
