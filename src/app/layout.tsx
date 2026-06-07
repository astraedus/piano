import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Piano",
  description: "A piano app whose endpoint is musical expression and the ability to play by ear.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6EE" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0D0B" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-phase="1" data-instrument="piano" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {/* Inline script: read localStorage before paint to set phase/instrument/theme.
            Self-contained (runs before any module) — mirrors lib/domAttrs.setRootAttrs.
            Reads the v2 key first, falls back to the legacy v1 key pre-migration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var r=localStorage.getItem('practice.state')||localStorage.getItem('piano.state');var s=JSON.parse(r||'null');var d=document.documentElement;var p=s&&s.phase?String(s.phase):'1';var i=(s&&s.instrument)||'piano';var t=s&&s.theme;d.setAttribute('data-phase',p);d.setAttribute('data-instrument',i);if(t==='light'||t==='dark')d.setAttribute('data-theme',t);else d.removeAttribute('data-theme');}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
