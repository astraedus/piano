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
  themeColor: "#0f0d0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-phase="1" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {/* Inline script to read localStorage phase + theme before paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=JSON.parse(localStorage.getItem('piano.state')||'null');var p=s&&s.phase?String(s.phase):'1';var t=(s&&s.theme)||'dark';document.documentElement.setAttribute('data-phase',p);if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
