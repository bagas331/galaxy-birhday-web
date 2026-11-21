"use client";

import { birthdayContent, isPlaceholder } from "@/data/birthday-content";
import { cn } from "@/lib/utils";

/**
 * Renders a piece of personal content. Values still wrapped in
 * [brackets] get the distinct "replace me" treatment so they can
 * never be accidentally shipped unnoticed. Use variant="paper" on
 * light backgrounds (the love letter).
 */
export function ContentValue({
  value,
  className,
  as: Tag = "span",
  variant = "cosmic",
}: {
  value: string;
  className?: string;
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  variant?: "cosmic" | "paper";
}) {
  if (isPlaceholder(value)) {
    return (
      <Tag
        className={cn(variant === "paper" ? "content-placeholder-paper" : "content-placeholder", className)}
        title="Edit src/data/birthday-content.ts"
      >
        {value}
      </Tag>
    );
  }
  return <Tag className={className}>{value}</Tag>;
}

/**
 * Small hint shown under placeholder-rich areas, telling the owner
 * (not the visitor) where to personalise. Hidden once content is real.
 */
export function EditHint({ values }: { values: (string | undefined)[] }) {
  const hasPlaceholder = values.some((v) => isPlaceholder(v));
  if (!hasPlaceholder) return null;
  return (
    <p className="mt-4 rounded-lg border border-dashed border-soft-gold/40 bg-soft-gold/5 px-3 py-2 text-[11px] leading-relaxed text-soft-gold/90">
      This is a placeholder. Replace it in{" "}
      <code className="rounded bg-soft-gold/10 px-1 py-0.5 font-mono text-[10px]">
        src/data/birthday-content.ts
      </code>
      .
    </p>
  );
}

export function RecipientName({ className }: { className?: string }) {
  return <ContentValue value={birthdayContent.recipientName} className={className} />;
}
