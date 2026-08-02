import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ExplainProvider } from "@/components/explain";
import { Analytics } from "@/components/Analytics";
import { BUILDER, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

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

/**
 * Site-wide metadata defaults. Every route inherits these and overrides only what
 * it needs, so no page can ship with an empty head.
 *
 * `metadataBase` is what makes the relative `alternates.canonical` paths in
 * `buildMetadata` resolve to absolute URLs, and what lets the generated
 * `opengraph-image` be referenced without hard-coding the origin at each call site.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: BUILDER }],
  creator: BUILDER,
  publisher: "Raedus Labs",
  category: "education",
  // Explicit rather than implied. This site previously shipped with no robots
  // directives at all, and "no signal" is a worse position than "index this".
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Google Search Console ownership (URL-prefix property, HTML-tag method). Added 2026-08-02
  // to start Google indexing the newly-crawlable site; renders <meta name="google-site-verification">.
  verification: {
    google: "BXUkGcaiNBTuy7DmGuylPsN-pODcpYASJYWgefGpgAA",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
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
  const body = (
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
        <ExplainProvider>{children}</ExplainProvider>
        <Analytics />
      </body>
    </html>
  );

  // Cloud sync is OPT-IN and defensive: only mount ClerkProvider when a
  // publishable key is configured. A deploy missing the Clerk env vars renders
  // the app exactly as before (localStorage-only) instead of crashing at boot.
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkProvider>{body}</ClerkProvider>;
  }
  return body;
}
