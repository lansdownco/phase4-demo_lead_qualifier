import type { Metadata } from "next";
import { Cormorant_Garamond, Syne, Space_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "AI Lead Qualifier",
  description: "Precision lead qualification powered by DeepSeek AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${syne.variable} ${spaceMono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-primary font-ui antialiased">
        {children}
      </body>
    </html>
  );
}
