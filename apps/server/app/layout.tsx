import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const interDisplay = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://go-place.vercel.app"),
  title: "go. — get to class, or pay $100",
  description:
    "Go connects your calendar, walks you to class 30 minutes early, and charges $100 if you’re late. The commitment device for showing up.",
  openGraph: {
    title: "go. — get to class, or pay $100",
    description:
      "Go connects your calendar, walks you to class 30 minutes early, and charges $100 if you’re late.",
    url: "https://go-place.vercel.app",
    siteName: "go.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${interDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF7] text-[#0A0A0A]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
