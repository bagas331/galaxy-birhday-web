"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { KeyRound, Lock, Sparkles, Wand2 } from "lucide-react";
import { BootScreen } from "@/components/app/boot-screen";
import { GlowButton } from "@/components/shared/buttons";
import {
  decodePortableUniverseParam,
  loadUniverseLocally,
  saveUniverseLocally,
  type SharedUniverseSnapshot,
} from "@/lib/media-validator";
import { useUniverseStore } from "@/lib/universe-store";
import type { BirthdayContent } from "@/types/universe";

const BirthdayUniverse = dynamic(
  () => import("@/components/app/birthday-universe"),
  {
    ssr: false,
    loading: () => <BootScreen />,
  },
);

type PageStatus = "loading" | "locked" | "ready" | "not_found" | "error";

export default function CustomUniversePage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = (params?.slug ?? "").toLowerCase();
  const encodedData = searchParams?.get("d") ?? null;

  const [status, setStatus] = useState<PageStatus>("loading");
  const [content, setContent] = useState<BirthdayContent | null>(null);
  const [recipientName, setRecipientName] = useState<string>("");
  const [accessPinHint, setAccessPinHint] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [submittingPin, setSubmittingPin] = useState<boolean>(false);
  const [localSnapshot, setLocalSnapshot] = useState<SharedUniverseSnapshot | null>(null);

  const resetUniverseStore = useCallback(() => {
    useUniverseStore.setState({
      phase: "intro",
      activeSection: null,
      focusedBody: null,
      discoveredSecret: false,
    });
  }, []);

  const fetchUniverse = useCallback(
    async (suppliedPin?: string) => {
      if (!slug) return;
      if (suppliedPin !== undefined) {
        setSubmittingPin(true);
        setPinError(null);
      } else {
        setStatus("loading");
      }

      try {
        const query = suppliedPin
          ? `?pin=${encodeURIComponent(suppliedPin)}`
          : "";
        const res = await fetch(`/api/universes/${encodeURIComponent(slug)}${query}`, {
          cache: "no-store",
        });
        const json = await res.json();

        if (res.status === 401 && json?.data?.locked) {
          setRecipientName(json.data.recipientName ?? slug);
          setAccessPinHint(json.data.accessPinHint ?? null);
          setPinError(json.message ?? "PIN kado tidak sesuai.");
          setStatus("locked");
          return;
        }

        if (res.ok && json?.data) {
          if (json.data.locked) {
            setRecipientName(json.data.recipientName ?? slug);
            setAccessPinHint(json.data.accessPinHint ?? null);
            setStatus("locked");
            return;
          }

          if (json.data.content) {
            resetUniverseStore();
            setContent(json.data.content);
            setStatus("ready");
            return;
          }
        }

        // Fallback to URL portable snapshot or localStorage backup if server cold-started
        const fallbackSnapshot =
          (encodedData ? decodePortableUniverseParam(encodedData) : null) ??
          loadUniverseLocally(slug);

        if (fallbackSnapshot) {
          saveUniverseLocally(fallbackSnapshot);
          setLocalSnapshot(fallbackSnapshot);
          if (
            fallbackSnapshot.accessPin &&
            fallbackSnapshot.accessPin !== (suppliedPin ?? "")
          ) {
            setRecipientName(fallbackSnapshot.content.recipientName);
            setAccessPinHint(fallbackSnapshot.accessPinHint ?? null);
            if (suppliedPin) {
              setPinError("PIN kado tidak sesuai.");
            }
            setStatus("locked");
            return;
          }
          resetUniverseStore();
          setContent(fallbackSnapshot.content);
          setStatus("ready");
          return;
        }

        if (res.status === 404) {
          setStatus("not_found");
        } else {
          setStatus("error");
        }
      } catch {
        const fallbackSnapshot =
          (encodedData ? decodePortableUniverseParam(encodedData) : null) ??
          loadUniverseLocally(slug);
        if (fallbackSnapshot) {
          setLocalSnapshot(fallbackSnapshot);
          if (
            fallbackSnapshot.accessPin &&
            fallbackSnapshot.accessPin !== (suppliedPin ?? "")
          ) {
            setRecipientName(fallbackSnapshot.content.recipientName);
            setAccessPinHint(fallbackSnapshot.accessPinHint ?? null);
            setStatus("locked");
            return;
          }
          resetUniverseStore();
          setContent(fallbackSnapshot.content);
          setStatus("ready");
          return;
        }
        setStatus("error");
      } finally {
        setSubmittingPin(false);
      }
    },
    [slug, encodedData, resetUniverseStore],
  );

  useEffect(() => {
    void fetchUniverse();
  }, [fetchUniverse]);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = pinInput.trim();
    if (!trimmed) {
      setPinError("Masukkan PIN terlebih dahulu.");
      return;
    }

    if (localSnapshot && localSnapshot.accessPin) {
      if (localSnapshot.accessPin === trimmed) {
        resetUniverseStore();
        setContent(localSnapshot.content);
        setStatus("ready");
        return;
      }
      setPinError("PIN kado tidak sesuai.");
      return;
    }

    await fetchUniverse(trimmed);
  };

  if (status === "loading") {
    return <BootScreen />;
  }

  if (status === "locked") {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-midnight px-6 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 25%, rgba(117,68,216,0.28) 0%, rgba(8,11,36,0.95) 70%)",
          }}
        />
        <div className="glass-panel relative z-10 w-full max-w-md rounded-3xl p-7 sm:p-9">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-soft-gold/35 bg-soft-gold/10">
            <Lock className="h-6 w-6 text-soft-gold" aria-hidden />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-glow-cyan/80">
            Private Birthday Universe
          </p>
          <h1 className="font-display mt-2 text-2xl text-white sm:text-3xl">
            Untuk <span className="gradient-text-cosmic italic">{recipientName}</span>
          </h1>
          <p className="mt-3 text-xs leading-relaxed text-white/65 sm:text-sm">
            Universe spesial ini dikunci dengan PIN rahasia. Masukkan kode PIN dari pengirim untuk membukanya.
          </p>

          {accessPinHint && (
            <p className="mt-4 rounded-xl border border-soft-gold/25 bg-soft-gold/5 px-3.5 py-2 text-xs text-soft-gold/90">
              Petunjuk PIN: <span className="font-semibold">{accessPinHint}</span>
            </p>
          )}

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                aria-hidden
              />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="Masukkan PIN Kado…"
                aria-label="PIN Kado"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-center text-sm tracking-widest text-white placeholder:tracking-normal placeholder:text-white/35 focus:border-soft-gold focus:outline-none"
                autoFocus
              />
            </div>

            {pinError && (
              <p role="alert" className="text-xs font-medium text-nebula-pink">
                {pinError}
              </p>
            )}

            <GlowButton
              type="submit"
              accent="gold"
              disabled={submittingPin}
              className="w-full justify-center py-3 text-xs"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {submittingPin ? "Membuka Universe…" : "Buka Universe"}
            </GlowButton>
          </form>
        </div>
      </div>
    );
  }

  if (status === "not_found" || status === "error" || !content) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-midnight px-6 text-center">
        <div className="glass-panel relative z-10 w-full max-w-lg rounded-3xl p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-nebula-pink">
            {status === "not_found" ? "404 · Universe Belum Dibuat" : "Gagal Memuat Universe"}
          </p>
          <h1 className="font-display mt-3 text-3xl text-white sm:text-4xl">
            Link <span className="gradient-text-cosmic italic">/u/{slug}</span> belum tersedia
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Universe dengan nama link ini belum dipublikasikan. Kamu bisa langsung klaim dan membuat kado ulang tahun 3D dengan link ini sekarang!
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/builder?slug=${encodeURIComponent(slug)}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-soft-gold to-[#F2B96B] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#150B2E] shadow-[0_0_30px_rgba(255,217,138,0.35)] transition hover:scale-105"
            >
              <Wand2 className="h-4 w-4" aria-hidden />
              Buat Universe /u/{slug}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:bg-white/10"
            >
              Lihat Demo Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BirthdayUniverse customContent={content} />;
}
