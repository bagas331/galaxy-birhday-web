import { Suspense } from "react";
import type { Metadata } from "next";
import { BootScreen } from "@/components/app/boot-screen";
import { BuilderStudio } from "@/components/builder/builder-studio";

export const metadata: Metadata = {
  title: "Galaxy Birthday Studio — Buat Kado Website 3D",
  description:
    "Self-service web builder untuk membuat website ulang tahun 3D interaktif dengan nama, foto, surat cinta, dan lagu pilihanmu.",
};

export default function BuilderPage() {
  return (
    <Suspense fallback={<BootScreen />}>
      <BuilderStudio />
    </Suspense>
  );
}
