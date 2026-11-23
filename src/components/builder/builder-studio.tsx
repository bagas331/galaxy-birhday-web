"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Cake,
  CheckCircle2,
  Eye,
  FolderOpen,
  Images,
  KeyRound,
  Lock,
  Mail,
  Music,
  Orbit,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { BootScreen } from "@/components/app/boot-screen";
import { createStarterBirthdayContent } from "@/lib/content-context";
import {
  encodePortableUniverseParam,
  saveUniverseLocally,
  validateAndCompressImageFile,
} from "@/lib/media-validator";
import { useUniverseStore } from "@/lib/universe-store";
import type { BirthdayContent, GalleryItem, MemoryItem } from "@/types/universe";
import { ShareQrModal } from "./share-qr-modal";

const BirthdayUniverse = dynamic(
  () => import("@/components/app/birthday-universe"),
  {
    ssr: false,
    loading: () => <BootScreen />,
  },
);

type BuilderTab = "identity" | "messages" | "gallery" | "orbit" | "music_secret";

const PRESET_SONGS = [
  {
    label: "Cosmic Ambient Loop (Default Instrumental)",
    title: "Cosmic Ambient",
    artist: "Galaxy Instrumental",
    src: "/assets/audio/our-song.mp3",
  },
  {
    label: "LANY — Soft",
    title: "Soft",
    artist: "LANY",
    src: "/assets/audio/lany-soft.mp3",
  },
];

const PRESET_GALLERY_IMAGES = [
  "/assets/images/memories/memory-1.webp",
  "/assets/images/memories/memory-2.webp",
  "/assets/images/memories/memory-3.webp",
  "/assets/images/memories/memory-4.webp",
  "/assets/images/memories/memory-5.webp",
  "/assets/images/memories/memory-6.webp",
  "/assets/images/memories/memory-7.webp",
  "/assets/images/memories/memory-8.webp",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 44);
}

export function BuilderStudio() {
  const searchParams = useSearchParams();
  const initialSlugParam = searchParams?.get("slug") ?? "";

  const [activeTab, setActiveTab] = useState<BuilderTab>("identity");
  const [slug, setSlug] = useState<string>(initialSlugParam || "pasangan-23");
  const [editPin, setEditPin] = useState<string>("123456");
  const [accessPin, setAccessPin] = useState<string>("");
  const [accessPinHint, setAccessPinHint] = useState<string>("");
  const [planTier, setPlanTier] = useState<"free" | "premium" | "forever">("premium");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const [content, setContent] = useState<BirthdayContent>(() =>
    createStarterBirthdayContent(),
  );

  const [showMobilePreview, setShowMobilePreview] = useState<boolean>(false);
  const [uploadingIndex, setUploadingIndex] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Load existing universe modal state
  const [loadSlugInput, setLoadSlugInput] = useState<string>("");
  const [loadPinInput, setLoadPinInput] = useState<string>("");
  const [showLoadBox, setShowLoadBox] = useState<boolean>(false);
  const [loadingExisting, setLoadingExisting] = useState<boolean>(false);

  // Share modal
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [publishedShareUrl, setPublishedShareUrl] = useState<string>("");
  const [publishedPortableUrl, setPublishedPortableUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialSlugParam) {
      setSlug(slugify(initialSlugParam));
    }
  }, [initialSlugParam]);

  const updateField = <K extends keyof BirthdayContent>(
    key: K,
    value: BirthdayContent[K],
  ) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  /* ── Array Helpers ────────────────────────────────────────────── */
  const updateParagraphList = (
    key: "birthdayMessage" | "letterParagraphs" | "secretMessage" | "closingMessage",
    index: number,
    value: string,
  ) => {
    const next = [...content[key]];
    next[index] = value;
    updateField(key, next);
  };

  const addParagraph = (
    key: "birthdayMessage" | "letterParagraphs" | "secretMessage" | "closingMessage",
    defaultText = "Tulis paragraf baru di sini…",
  ) => {
    updateField(key, [...content[key], defaultText]);
  };

  const removeParagraph = (
    key: "birthdayMessage" | "letterParagraphs" | "secretMessage" | "closingMessage",
    index: number,
  ) => {
    if (content[key].length <= 1) return;
    updateField(
      key,
      content[key].filter((_, i) => i !== index),
    );
  };

  /* ── Gallery Helpers ──────────────────────────────────────────── */
  const updateGalleryItem = (index: number, patch: Partial<GalleryItem>) => {
    const next = content.gallery.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    updateField("gallery", next);
  };

  const addGalleryItem = () => {
    if (content.gallery.length >= 16) return;
    const presetSrc =
      PRESET_GALLERY_IMAGES[content.gallery.length % PRESET_GALLERY_IMAGES.length];
    updateField("gallery", [
      ...content.gallery,
      {
        src: presetSrc,
        caption: `Momen indah ke-${content.gallery.length + 1}`,
        alt: `Memory photo ${content.gallery.length + 1}`,
      },
    ]);
  };

  const removeGalleryItem = (index: number) => {
    if (content.gallery.length <= 1) return;
    updateField(
      "gallery",
      content.gallery.filter((_, i) => i !== index),
    );
  };

  const handleGalleryImageUpload = async (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(`gallery-${index}`);
    setStatusMessage(null);
    try {
      const compressedDataUrl = await validateAndCompressImageFile(file);
      updateGalleryItem(index, {
        src: compressedDataUrl,
        alt: content.gallery[index]?.caption || file.name,
      });
      setStatusMessage({
        type: "success",
        text: `Foto #${index + 1} berhasil dikompres & dipasang.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengupload gambar.",
      });
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  /* ── Orbit / Timeline Helpers ─────────────────────────────────── */
  const updateMemoryItem = (index: number, patch: Partial<MemoryItem>) => {
    const next = content.memories.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    updateField("memories", next);
  };

  const addMemoryItem = () => {
    if (content.memories.length >= 12) return;
    const presetSrc =
      PRESET_GALLERY_IMAGES[content.memories.length % PRESET_GALLERY_IMAGES.length];
    updateField("memories", [
      ...content.memories,
      {
        title: `Momen Spesial #${content.memories.length + 1}`,
        description: "Ceritakan momen berkesan kalian di sini…",
        photo: presetSrc,
      },
    ]);
  };

  const removeMemoryItem = (index: number) => {
    if (content.memories.length <= 1) return;
    updateField(
      "memories",
      content.memories.filter((_, i) => i !== index),
    );
  };

  const handleMemoryImageUpload = async (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(`memory-${index}`);
    setStatusMessage(null);
    try {
      const compressedDataUrl = await validateAndCompressImageFile(file);
      updateMemoryItem(index, { photo: compressedDataUrl });
      setStatusMessage({
        type: "success",
        text: `Foto Our Orbit #${index + 1} berhasil dipasang.`,
      });
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal mengupload foto.",
      });
    } finally {
      setUploadingIndex(null);
      e.target.value = "";
    }
  };

  /* ── Load Existing Universe for Editing ───────────────────────── */
  const handleLoadExisting = async () => {
    const cleanSlug = slugify(loadSlugInput);
    if (!cleanSlug) {
      setStatusMessage({ type: "error", text: "Masukkan slug yang ingin diedit." });
      return;
    }
    setLoadingExisting(true);
    setStatusMessage(null);
    try {
      const query = loadPinInput
        ? `?pin=${encodeURIComponent(loadPinInput.trim())}`
        : "";
      const res = await fetch(`/api/universes/${encodeURIComponent(cleanSlug)}${query}`);
      const json = await res.json();
      if (!res.ok || !json?.data?.content) {
        setStatusMessage({
          type: "error",
          text:
            json?.message ??
            "Gagal memuat universe. Jika dikunci PIN Kado, masukkan PIN Kado terlebih dahulu.",
        });
        return;
      }
      setSlug(cleanSlug);
      setContent(json.data.content);
      setAccessPinHint(json.data.accessPinHint ?? "");
      setIsEditMode(true);
      setShowLoadBox(false);
      setStatusMessage({
        type: "success",
        text: `Universe "/u/${cleanSlug}" berhasil dimuat ke editor! Masukkan PIN Edit saat menyimpan perubahan.`,
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "Terjadi kesalahan jaringan saat memuat universe.",
      });
    } finally {
      setLoadingExisting(false);
    }
  };

  /* ── Publish / Save Universe ──────────────────────────────────── */
  const handlePublish = async () => {
    const normalizedSlug = slugify(slug);
    if (normalizedSlug.length < 3) {
      setStatusMessage({
        type: "error",
        text: "Slug URL minimal 3 karakter (contoh: rizkia-23).",
      });
      setActiveTab("identity");
      return;
    }
    if (editPin.trim().length < 4) {
      setStatusMessage({
        type: "error",
        text: "PIN Edit minimal 4 karakter agar kamu bisa mengedit link ini nanti.",
      });
      setActiveTab("identity");
      return;
    }

    setPublishing(true);
    setStatusMessage(null);

    try {
      const endpoint = isEditMode
        ? `/api/universes/${encodeURIComponent(normalizedSlug)}`
        : "/api/universes";
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: normalizedSlug,
          editPin: editPin.trim(),
          accessPin: accessPin.trim() || undefined,
          accessPinHint: accessPinHint.trim() || undefined,
          planTier,
          content,
        }),
      });

      const json = await res.json();

      // If POST returned 409 Conflict, automatically try PATCH with the supplied editPin
      if (!isEditMode && res.status === 409) {
        const patchRes = await fetch(
          `/api/universes/${encodeURIComponent(normalizedSlug)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              editPin: editPin.trim(),
              accessPin: accessPin.trim() || undefined,
              accessPinHint: accessPinHint.trim() || undefined,
              planTier,
              content,
            }),
          },
        );
        const patchJson = await patchRes.json();
        if (!patchRes.ok) {
          setStatusMessage({
            type: "error",
            text:
              patchJson?.message ??
              "Slug sudah dipakai. Gunakan slug lain atau masukkan PIN Edit yang benar.",
          });
          return;
        }
      } else if (!res.ok) {
        const detail = Array.isArray(json?.errors) ? ` (${json.errors[0]})` : "";
        setStatusMessage({
          type: "error",
          text: `${json?.message ?? "Gagal mempublikasikan universe."}${detail}`,
        });
        return;
      }

      const snapshot = {
        slug: normalizedSlug,
        content,
        accessPin: accessPin.trim() || undefined,
        accessPinHint: accessPinHint.trim() || undefined,
      };
      saveUniverseLocally(snapshot);

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const primaryUrl = `${origin}/u/${normalizedSlug}`;
      const encoded = encodePortableUniverseParam(snapshot);
      const portable = encoded ? `${primaryUrl}?d=${encoded}` : null;

      setSlug(normalizedSlug);
      setIsEditMode(true);
      setPublishedShareUrl(primaryUrl);
      setPublishedPortableUrl(portable);
      setShareModalOpen(true);
      setStatusMessage({
        type: "success",
        text: `Universe /u/${normalizedSlug} berhasil dipublikasikan!`,
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "Gagal menghubungi server. Periksa koneksi internet Anda.",
      });
    } finally {
      setPublishing(false);
    }
  };

  /* ── Preview Section Jump Helper ──────────────────────────────── */
  const jumpPreviewToSection = (tab: BuilderTab) => {
    setActiveTab(tab);
    const store = useUniverseStore.getState();
    if (tab === "identity") {
      useUniverseStore.setState({ phase: "intro", activeSection: null });
    } else if (tab === "messages") {
      useUniverseStore.setState({ phase: "universe" });
      store.openSection("birthday");
    } else if (tab === "gallery") {
      useUniverseStore.setState({ phase: "universe" });
      store.openSection("gallery");
    } else if (tab === "orbit") {
      useUniverseStore.setState({ phase: "universe" });
      store.openSection("timeline");
    } else if (tab === "music_secret") {
      useUniverseStore.setState({ phase: "universe" });
      store.openSection("secret");
    }
  };

  const tabs: { id: BuilderTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "identity", label: "1. Link & Nama", icon: Cake },
    { id: "messages", label: "2. Ucapan & Surat", icon: Mail },
    { id: "gallery", label: "3. Foto Memories", icon: Images },
    { id: "orbit", label: "4. Our Orbit", icon: Orbit },
    { id: "music_secret", label: "5. Musik & Secret", icon: Music },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-[#06081D] text-white">
      {/* ── Top SaaS Header Bar ────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#080B24]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Demo Utama
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-soft-gold" aria-hidden />
              <span className="font-display text-base font-semibold text-white sm:text-lg">
                Galaxy Birthday Studio
              </span>
              <span className="rounded-full border border-soft-gold/30 bg-soft-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-soft-gold">
                Self-Service SaaS
              </span>
            </div>
            <p className="hidden text-[11px] text-white/50 sm:block">
              Kustomisasi nama, teks, foto, dan lagu → klik Publish untuk mendapatkan link & QR Code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLoadBox((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <FolderOpen className="h-3.5 w-3.5 text-glow-cyan" />
            <span className="hidden sm:inline">Edit Link Lama</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMobilePreview((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-glow-cyan/35 bg-glow-cyan/10 px-3.5 py-2 text-xs font-semibold text-glow-cyan lg:hidden"
          >
            <Eye className="h-3.5 w-3.5" />
            {showMobilePreview ? "Tutup Preview" : "Live Preview"}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-soft-gold to-[#F2B96B] px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#150B2E] shadow-[0_0_25px_rgba(255,217,138,0.35)] transition hover:scale-[1.02] disabled:opacity-50"
          >
            <Rocket className="h-3.5 w-3.5" />
            {publishing
              ? "Memproses…"
              : isEditMode
                ? "Simpan Perubahan"
                : "Publish & Buat Link"}
          </button>
        </div>
      </header>

      {/* ── Load Existing Universe Bar ─────────────────────────────── */}
      {showLoadBox && (
        <div className="border-b border-white/10 bg-[#0D1033] px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-2.5">
            <span className="text-xs font-medium text-white/75">
              Muat universe yang sudah pernah dibuat:
            </span>
            <input
              type="text"
              value={loadSlugInput}
              onChange={(e) => setLoadSlugInput(e.target.value)}
              placeholder="Nama slug (contoh: rizkia)"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-soft-gold focus:outline-none"
            />
            <input
              type="password"
              value={loadPinInput}
              onChange={(e) => setLoadPinInput(e.target.value)}
              placeholder="PIN Kado (jika dikunci)"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-soft-gold focus:outline-none"
            />
            <button
              type="button"
              onClick={handleLoadExisting}
              disabled={loadingExisting}
              className="rounded-xl bg-glow-cyan px-4 py-1.5 text-xs font-semibold text-[#080B24] transition hover:opacity-90 disabled:opacity-50"
            >
              {loadingExisting ? "Memuat…" : "Muat Data"}
            </button>
          </div>
        </div>
      )}

      {/* ── Status Banner ──────────────────────────────────────────── */}
      {statusMessage && (
        <div
          role="status"
          className={`flex items-center justify-between px-4 py-2.5 text-xs font-medium sm:px-6 ${
            statusMessage.type === "success"
              ? "border-b border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
              : "border-b border-nebula-pink/40 bg-nebula-pink/15 text-nebula-pink"
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {statusMessage.text}
          </span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Main Split Workspace (Form Left, Live 3D Preview Right) ─ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Editor Column */}
        <div
          className={`flex w-full flex-col border-r border-white/10 lg:w-[540px] xl:w-[600px] ${
            showMobilePreview ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Step Tabs */}
          <nav
            aria-label="Builder steps"
            className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0A0D2C] p-2"
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => jumpPreviewToSection(t.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-soft-gold/20 text-soft-gold shadow-[0_0_15px_rgba(255,217,138,0.2)]"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Form Content Area */}
          <div className="cosmic-scroll flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
            {/* TAB 1: LINK & IDENTITAS */}
            {activeTab === "identity" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-soft-gold/25 bg-soft-gold/5 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-soft-gold">
                    Link Kado & Keamanan (Micro-SaaS)
                  </h3>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/80">
                        Custom URL Slug (Link Kado)
                      </label>
                      <div className="flex items-center rounded-xl border border-white/15 bg-[#06081D] px-3 py-2">
                        <span className="select-none text-xs text-white/40">
                          /u/
                        </span>
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          placeholder="rizkia-23"
                          className="w-full bg-transparent text-xs font-semibold text-soft-gold focus:outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-white/45">
                        Hasil link: <code className="text-glow-cyan">/u/{slug || "nama-pasangan"}</code>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/80">
                          <KeyRound className="h-3.5 w-3.5 text-soft-gold" />
                          PIN Edit (Wajib, min. 4 digit)
                        </label>
                        <input
                          type="password"
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value)}
                          placeholder="PIN pemilik untuk edit"
                          className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/80">
                          <Lock className="h-3.5 w-3.5 text-glow-cyan" />
                          PIN Kunci Kado (Opsional)
                        </label>
                        <input
                          type="text"
                          value={accessPin}
                          onChange={(e) => setAccessPin(e.target.value)}
                          placeholder="Kosongkan jika tanpa PIN"
                          className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-glow-cyan focus:outline-none"
                        />
                      </div>
                    </div>

                    {accessPin.trim().length > 0 && (
                      <div>
                        <label className="mb-1 block text-xs font-medium text-white/80">
                          Petunjuk PIN Kado (Ditampilkan di layar kunci)
                        </label>
                        <input
                          type="text"
                          value={accessPinHint}
                          onChange={(e) => setAccessPinHint(e.target.value)}
                          placeholder="Contoh: Tanggal jadian kita (DDMMYY)"
                          className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-glow-cyan focus:outline-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/80">
                        Paket Kado (Simulasi Tier SaaS)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            { id: "free", name: "Starter", desc: "Aktif 7 Hari" },
                            { id: "premium", name: "Premium", desc: "Aktif 1 Tahun + QR" },
                            { id: "forever", name: "Forever", desc: "Selamanya + PIN Lock" },
                          ] as const
                        ).map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            onClick={() => setPlanTier(tier.id)}
                            className={`rounded-xl border p-2.5 text-left transition ${
                              planTier === tier.id
                                ? "border-soft-gold bg-soft-gold/15 text-white"
                                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                            }`}
                          >
                            <p className="text-xs font-bold">{tier.name}</p>
                            <p className="text-[10px] opacity-75">{tier.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal Identity */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-glow-cyan">
                    Identitas & Layar Intro
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/80">
                        Nama Pasangan (Penerima)
                      </label>
                      <input
                        type="text"
                        value={content.recipientName}
                        onChange={(e) => updateField("recipientName", e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/80">
                        Nama Kamu (Pengirim)
                      </label>
                      <input
                        type="text"
                        value={content.senderName}
                        onChange={(e) => updateField("senderName", e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/80">
                        Tanggal & Usia Ulang Tahun
                      </label>
                      <input
                        type="text"
                        value={content.birthdayDate}
                        onChange={(e) => updateField("birthdayDate", e.target.value)}
                        placeholder="21 November 2026 · 23rd Birthday"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-white/80">
                        Judul Ucapan Ulang Tahun
                      </label>
                      <input
                        type="text"
                        value={content.birthdayTitle}
                        onChange={(e) => updateField("birthdayTitle", e.target.value)}
                        placeholder="Happy 23rd Birthday"
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/80">
                      Judul Besar Layar Pembuka (Hero Title)
                    </label>
                    <input
                      type="text"
                      value={content.heroTitle}
                      onChange={(e) => updateField("heroTitle", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-soft-gold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/80">
                      Kalimat Pembuka (Hero Subtitle)
                    </label>
                    <textarea
                      rows={2}
                      value={content.heroSubtitle}
                      onChange={(e) => updateField("heroSubtitle", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs leading-relaxed text-white focus:border-soft-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UCAPAN & LOVE LETTER */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                {/* Birthday Planet Message */}
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-glow-cyan">
                      Pesan di Birthday Planet
                    </h3>
                    <button
                      type="button"
                      onClick={() => addParagraph("birthdayMessage")}
                      className="inline-flex items-center gap-1 rounded-lg bg-glow-cyan/15 px-2.5 py-1 text-[11px] font-semibold text-glow-cyan hover:bg-glow-cyan/25"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Paragraf
                    </button>
                  </div>

                  {content.birthdayMessage.map((paragraph, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Paragraf #{i + 1}</span>
                        {content.birthdayMessage.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeParagraph("birthdayMessage", i)}
                            className="text-nebula-pink hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(e) =>
                          updateParagraphList("birthdayMessage", i, e.target.value)
                        }
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] p-3 text-xs leading-relaxed text-white focus:border-glow-cyan focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Love Letter */}
                <div className="space-y-3 rounded-2xl border border-soft-gold/25 bg-soft-gold/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-soft-gold">
                      Isi Amplop Love Letter
                    </h3>
                    <button
                      type="button"
                      onClick={() => addParagraph("letterParagraphs")}
                      className="inline-flex items-center gap-1 rounded-lg bg-soft-gold/20 px-2.5 py-1 text-[11px] font-semibold text-soft-gold hover:bg-soft-gold/30"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Paragraf
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] text-white/70">
                        Sapaan Awal Surat
                      </label>
                      <input
                        type="text"
                        value={content.letterGreeting}
                        onChange={(e) => updateField("letterGreeting", e.target.value)}
                        placeholder="My dearest Rizkia,"
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-white/70">
                        Kalimat Penutup (Sign-off)
                      </label>
                      <input
                        type="text"
                        value={content.letterSignOff}
                        onChange={(e) => updateField("letterSignOff", e.target.value)}
                        placeholder="Forever orbiting you,"
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {content.letterParagraphs.map((paragraph, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Paragraf Surat #{i + 1}</span>
                        {content.letterParagraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeParagraph("letterParagraphs", i)}
                            className="text-nebula-pink hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(e) =>
                          updateParagraphList("letterParagraphs", i, e.target.value)
                        }
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] p-3 text-xs leading-relaxed text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FOTO MEMORIES (GALLERY) */}
            {activeTab === "gallery" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-nebula-pink">
                      Memory Planet Gallery ({content.gallery.length} Foto)
                    </h3>
                    <p className="text-[11px] text-white/50">
                      Upload foto dari HP/Laptop (otomatis dikompres ke WebP) atau masukkan URL foto.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addGalleryItem}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-nebula-pink/20 px-3 py-2 text-xs font-semibold text-nebula-pink hover:bg-nebula-pink/30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Foto
                  </button>
                </div>

                <div className="space-y-3">
                  {content.gallery.map((item, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:flex-row sm:items-start"
                    >
                      <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl border border-white/15 bg-black/40 sm:w-32">
                        <img
                          src={item.src}
                          alt={item.alt}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          #{i + 1}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="mb-0.5 block text-[11px] text-white/60">
                            Caption Foto #{i + 1}
                          </label>
                          <input
                            type="text"
                            value={item.caption}
                            onChange={(e) =>
                              updateGalleryItem(i, {
                                caption: e.target.value,
                                alt: e.target.value || `Memory photo ${i + 1}`,
                              })
                            }
                            placeholder="Tulis cerita singkat tentang foto ini…"
                            className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-nebula-pink focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-nebula-pink/40 bg-nebula-pink/15 px-3 py-1.5 text-[11px] font-semibold text-nebula-pink transition hover:bg-nebula-pink/25">
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingIndex === `gallery-${i}`
                              ? "Mengompres…"
                              : "Upload Foto"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => handleGalleryImageUpload(i, e)}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            value={item.date ?? ""}
                            onChange={(e) =>
                              updateGalleryItem(i, {
                                date: e.target.value || undefined,
                              })
                            }
                            placeholder="Tanggal (opsional)"
                            className="w-36 rounded-xl border border-white/15 bg-[#06081D] px-2.5 py-1.5 text-[11px] text-white focus:border-soft-gold focus:outline-none"
                          />

                          {content.gallery.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(i)}
                              className="ml-auto inline-flex items-center gap-1 rounded-xl border border-white/10 px-2.5 py-1.5 text-[11px] text-white/55 hover:border-nebula-pink/40 hover:text-nebula-pink"
                              aria-label={`Hapus foto ${i + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: OUR ORBIT (TIMELINE) */}
            {activeTab === "orbit" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-electric-blue">
                      Our Orbit Timeline ({content.memories.length} Momen)
                    </h3>
                    <p className="text-[11px] text-white/50">
                      Urutan perjalanan atau momen paling berkesan bersama pasangan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addMemoryItem}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-electric-blue/20 px-3 py-2 text-xs font-semibold text-electric-blue hover:bg-electric-blue/30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Tambah Momen
                  </button>
                </div>

                <div className="space-y-4">
                  {content.memories.map((mem, i) => (
                    <div
                      key={i}
                      className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-electric-blue/20 px-2.5 py-0.5 text-[11px] font-bold text-electric-blue">
                          Orbit #{i + 1}
                        </span>
                        {content.memories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMemoryItem(i)}
                            className="inline-flex items-center gap-1 text-xs text-nebula-pink hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[11px] text-white/60">
                            Judul Momen
                          </label>
                          <input
                            type="text"
                            value={mem.title}
                            onChange={(e) =>
                              updateMemoryItem(i, { title: e.target.value })
                            }
                            placeholder="Contoh: The Day We Met"
                            className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-electric-blue focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] text-white/60">
                            Label Tanggal (Opsional)
                          </label>
                          <input
                            type="text"
                            value={mem.date ?? ""}
                            onChange={(e) =>
                              updateMemoryItem(i, {
                                date: e.target.value || undefined,
                              })
                            }
                            placeholder="Contoh: Mei 2025"
                            className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-electric-blue focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] text-white/60">
                          Cerita / Caption Momen
                        </label>
                        <textarea
                          rows={2}
                          value={mem.description}
                          onChange={(e) =>
                            updateMemoryItem(i, { description: e.target.value })
                          }
                          className="w-full rounded-xl border border-white/15 bg-[#06081D] p-3 text-xs leading-relaxed text-white focus:border-electric-blue focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        {mem.photo && (
                          <img
                            src={mem.photo}
                            alt={mem.title}
                            className="h-14 w-20 rounded-lg border border-white/15 object-cover"
                          />
                        )}
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-electric-blue/40 bg-electric-blue/15 px-3 py-1.5 text-[11px] font-semibold text-electric-blue transition hover:bg-electric-blue/25">
                          <Upload className="h-3.5 w-3.5" />
                          {uploadingIndex === `memory-${i}`
                            ? "Mengompres…"
                            : "Upload Foto Momen"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => handleMemoryImageUpload(i, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: MUSIK & SECRET STAR */}
            {activeTab === "music_secret" && (
              <div className="space-y-6">
                {/* Music Section */}
                <div className="space-y-3 rounded-2xl border border-soft-gold/25 bg-soft-gold/[0.04] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-soft-gold">
                    Lagu Latar (Music Star)
                  </h3>

                  <div>
                    <label className="mb-1 block text-[11px] text-white/70">
                      Pilih Preset Lagu Bawaan
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PRESET_SONGS.map((preset) => (
                        <button
                          key={preset.src}
                          type="button"
                          onClick={() => {
                            updateField("songTitle", preset.title);
                            updateField("songArtist", preset.artist);
                            updateField("songSrc", preset.src);
                          }}
                          className={`rounded-xl border p-2.5 text-left text-xs transition ${
                            content.songSrc === preset.src
                              ? "border-soft-gold bg-soft-gold/20 text-white"
                              : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                          }`}
                        >
                          <p className="font-semibold">{preset.title}</p>
                          <p className="text-[10px] opacity-75">{preset.artist}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] text-white/70">
                        Judul Lagu
                      </label>
                      <input
                        type="text"
                        value={content.songTitle}
                        onChange={(e) => updateField("songTitle", e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] text-white/70">
                        Nama Penyanyi / Artis
                      </label>
                      <input
                        type="text"
                        value={content.songArtist}
                        onChange={(e) => updateField("songArtist", e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] text-white/70">
                      URL Audio / Path MP3
                    </label>
                    <input
                      type="text"
                      value={content.songSrc}
                      onChange={(e) => updateField("songSrc", e.target.value)}
                      placeholder="/assets/audio/our-song.mp3 atau https://..."
                      className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Secret Star Section */}
                <div className="space-y-3 rounded-2xl border border-cosmic-violet/35 bg-cosmic-violet/10 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C9B4FF]">
                      Pesan Rahasia (Secret Star)
                    </h3>
                    <button
                      type="button"
                      onClick={() => addParagraph("secretMessage")}
                      className="inline-flex items-center gap-1 rounded-lg bg-cosmic-violet/25 px-2.5 py-1 text-[11px] font-semibold text-[#C9B4FF] hover:bg-cosmic-violet/40"
                    >
                      <Plus className="h-3 w-3" />
                      Tambah Paragraf
                    </button>
                  </div>

                  {content.secretMessage.map((paragraph, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-white/50">
                        <span>Paragraf Rahasia #{i + 1}</span>
                        {content.secretMessage.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeParagraph("secretMessage", i)}
                            className="text-nebula-pink hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={paragraph}
                        onChange={(e) =>
                          updateParagraphList("secretMessage", i, e.target.value)
                        }
                        className="w-full rounded-xl border border-white/15 bg-[#06081D] p-3 text-xs leading-relaxed text-white focus:border-[#C9B4FF] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Closing Finale */}
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                    Layar Penutup (Finale)
                  </h3>
                  <div>
                    <label className="mb-1 block text-[11px] text-white/60">
                      Judul Penutup
                    </label>
                    <input
                      type="text"
                      value={content.closingTitle}
                      onChange={(e) => updateField("closingTitle", e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#06081D] px-3 py-2 text-xs text-white focus:border-soft-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-white/60">
                      Kalimat Penutup
                    </label>
                    <textarea
                      rows={2}
                      value={content.closingMessage[0] ?? ""}
                      onChange={(e) =>
                        updateField("closingMessage", [e.target.value])
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#06081D] p-3 text-xs leading-relaxed text-white focus:border-soft-gold focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Publish Bar */}
          <div className="flex items-center justify-between border-t border-white/10 bg-[#080B24] px-5 py-3.5">
            <div className="text-xs text-white/60">
              Target URL:{" "}
              <span className="font-semibold text-soft-gold">
                /u/{slug || "nama-pasangan"}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-soft-gold to-[#F2B96B] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-[#150B2E] shadow-lg transition hover:scale-[1.02] disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {publishing
                ? "Mempublikasikan…"
                : isEditMode
                  ? "Simpan Perubahan"
                  : "Publish Universe"}
            </button>
          </div>
        </div>

        {/* Right Live Preview Column */}
        <div
          className={`relative flex-1 flex-col bg-midnight ${
            showMobilePreview ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0A0D2C] px-4 py-2 text-xs">
            <span className="flex items-center gap-2 font-medium text-white/75">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Interactive 3D Live Preview — untuk{" "}
              <strong className="text-soft-gold">{content.recipientName}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  useUniverseStore.setState({
                    phase: "intro",
                    activeSection: null,
                    focusedBody: null,
                  })
                }
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 hover:bg-white/10"
              >
                Layar Intro
              </button>
              <button
                type="button"
                onClick={() =>
                  useUniverseStore.setState({
                    phase: "universe",
                    activeSection: null,
                    focusedBody: null,
                  })
                }
                className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/75 hover:bg-white/10"
              >
                3D Galaxy
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <BirthdayUniverse customContent={content} embedded />
          </div>
        </div>
      </div>

      {/* Share & QR Code Modal */}
      <ShareQrModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        slug={slug}
        shareUrl={publishedShareUrl}
        portableUrl={publishedPortableUrl}
        accessPin={accessPin.trim() || undefined}
        content={content}
      />
    </div>
  );
}
