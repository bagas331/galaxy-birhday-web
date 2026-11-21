import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "A Little Universe, For You",
  description:
    "An interactive 3D galaxy birthday experience — explore planets, memories, and messages written in the stars.",
  keywords: ["birthday", "3D", "galaxy", "universe", "interactive", "love letter"],
  openGraph: {
    title: "A Little Universe, For You",
    description:
      "Explore an interactive 3D galaxy of birthday wishes, memories, and messages written in the stars.",
    type: "website",
    images: ["/assets/images/og-universe.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080B24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${outfit.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
