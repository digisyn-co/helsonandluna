import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Jost } from "next/font/google";
import { couple, wedding } from "@/content/wedding";
import "@/styles/globals.css";

const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const sans = Jost({ variable: "--font-sans", subsets: ["latin"], weight: ["300", "400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: `${couple.joined} · ${wedding.dateShort}`,
  description: `You are invited to the wedding of ${couple.joined} — ${wedding.dateLong}, ${wedding.city}.`,
  robots: { index: false, follow: false }, // private invitation
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070a16",
};

/** Runs before first paint so revealable text is hidden only when motion is actually on. */
const MOTION_SCRIPT = `(function(){try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches||location.search.indexOf('reduced')>-1;document.documentElement.dataset.motion=r?'reduced':'full';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
