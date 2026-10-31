import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://patchwise-eight.vercel.app",
  ),
  applicationName: "Patchwise",
  title: "Patchwise — Understand and fix security flaws",
  description:
    "Paste JavaScript or TypeScript. Patchwise finds security problems, explains the risk, and verifies proposed fixes.",
  category: "developer tools",
  icons: {
    icon: "/patchwise-mark.svg",
    shortcut: "/patchwise-mark.svg",
  },
  openGraph: {
    title: "Patchwise — Understand and fix security flaws",
    description:
      "A free, open-source JavaScript and TypeScript security scanner that teaches and verifies fixes.",
    type: "website",
    siteName: "Patchwise",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
