"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, ExternalLink, Lock, QrCode, Sparkles, X } from "lucide-react";
import type { BirthdayContent } from "@/types/universe";

interface ShareQrModalProps {
  open: boolean;
  onClose: () => void;
  slug: string;
  shareUrl: string;
  portableUrl: string | null;
  accessPin?: string;
  content: BirthdayContent;
}

export function ShareQrModal({
  open,
  onClose,
  slug,
  shareUrl,
  portableUrl,
  accessPin,
  content,
}: ShareQrModalProps) {
  const [copiedPrimary, setCopiedPrimary] = useState(false);
  const [copiedPortable, setCopiedPortable] = useState(false);

  if (!open) return null;

  const activeShareLink = portableUrl ?? shareUrl;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&color=150B2E&bgcolor=F8EFDD&data=${encodeURIComponent(
    shareUrl,
  )}`;

  const copyText = async (text: string, type: "primary" | "portable") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "primary") {
        setCopiedPrimary(true);
        setTimeout(() => setCopiedPrimary(false), 2200);
      } else {
        setCopiedPortable(true);
        setTimeout(() => setCopiedPortable(false), 2200);
      }
    } catch {
      // Fallback
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ slug, content }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `universe-${slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#040314]/85 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Universe Berhasil Dipublikasikan"
    >
      <div className="glass-panel relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-soft-gold/30 p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/15 p-2 text-white/70 transition hover:border-white/40 hover:text-white"
          aria-label="Tutup modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.26em] text-soft-gold">
          <Sparkles className="h-4 w-4" aria-hidden />
          Universe Siap Dibagikan
        </div>

        <h2 className="font-display mt-2 text-2xl text-white sm:text-3xl">
          Kado 3D untuk{" "}
          <span className="gradient-text-cosmic italic">{content.recipientName}</span>{" "}
          Telah Aktif!
        </h2>

        <p className="mt-2 text-xs leading-relaxed text-white/65 sm:text-sm">
          Bagikan link atau cetak kartu QR Code di bawah ini untuk pasanganmu.
        </p>

        {/* Printable Gift Card + QR */}
        <div className="mt-6 flex flex-col items-center rounded-2xl bg-gradient-to-b from-[#F8EFDD] to-[#EFE0C2] p-5 text-center text-[#1E1638] shadow-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8A3B62]">
            A Little Universe, For You
          </p>
          <h3 className="font-display mt-1 text-xl font-bold text-[#1E1638]">
            {content.recipientName}
          </h3>
          <p className="text-xs italic text-[#5A4B7A]">{content.birthdayDate}</p>

          <div className="my-4 overflow-hidden rounded-xl border-2 border-[#8A3B62]/25 bg-[#F8EFDD] p-2 shadow-inner">
            <img
              src={qrImageUrl}
              alt={`QR Code untuk ${shareUrl}`}
              width={176}
              height={176}
              className="h-44 w-44 rounded-lg object-contain"
            />
          </div>

          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5A4B7A]">
            <QrCode className="h-3.5 w-3.5 text-[#8A3B62]" aria-hidden />
            Scan QR untuk masuk ke 3D Galaxy
          </p>
          {accessPin && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#8A3B62]/15 px-3 py-0.5 text-[11px] font-bold text-[#8A3B62]">
              <Lock className="h-3 w-3" aria-hidden />
              PIN Akses: {accessPin}
            </p>
          )}
          <p className="mt-2 text-[10px] text-[#5A4B7A]/80">
            From: {content.senderName}
          </p>
        </div>

        {/* Short Link */}
        <div className="mt-5 space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Link Kado Utama
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyText(shareUrl, "primary")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-soft-gold px-3.5 py-2.5 text-xs font-semibold text-[#150B2E] transition hover:bg-soft-gold/90"
              >
                {copiedPrimary ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Salin
                  </>
                )}
              </button>
            </div>
          </div>

          {portableUrl && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-glow-cyan/80">
                Link Portabel (Termasuk Backup Data di URL)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={portableUrl}
                  className="w-full rounded-xl border border-glow-cyan/25 bg-white/5 px-3.5 py-2 text-xs text-white/80 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyText(portableUrl, "portable")}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-glow-cyan/40 bg-glow-cyan/15 px-3.5 py-2 text-xs font-semibold text-glow-cyan transition hover:bg-glow-cyan/25"
                >
                  {copiedPortable ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Salin
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" />
            Backup JSON
          </button>

          <Link
            href={activeShareLink}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-nebula-pink to-cosmic-violet px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-lg transition hover:opacity-95"
          >
            Buka Link Kado
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
