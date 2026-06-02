/**
 * Root layout — minimal, mobile-first.
 */
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "325 Barrio",
  description:
    "Your local guide and AI concierge for your stay at 325 Barrio, Barrio Logan, San Diego.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
