"use client";

import dynamic from "next/dynamic";
import { BootScreen } from "@/components/app/boot-screen";

// The whole experience is a client-side 3D app — load it without SSR
// so WebGL, window and audio APIs are never touched on the server.
const BirthdayUniverse = dynamic(
  () => import("@/components/app/birthday-universe"),
  {
    ssr: false,
    loading: () => <BootScreen />,
  },
);

export default function Home() {
  return <BirthdayUniverse />;
}
