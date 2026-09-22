import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Jost } from "next/font/google";
import { couple, wedding } from "@/content/wedding";
import "@/styles/globals.css";

const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const sans = Jost({ variable: "--font-sans", subsets: ["latin"], weight: ["300", "400", "500"], display: "swap" });

/** Production domain on Vercel (follows a custom domain once added); localhost in dev. */
const siteHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = siteHost ? `https://${siteHost}` : "http://localhost:3200";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${couple.joined} · ${wedding.dateShort}`,
  description: `You are invited to the wedding of ${couple.joined} — ${wedding.dateLong}, ${wedding.city}.`,
  robots: { index: false, follow: false }, // private invitation
  // Link previews (Messenger, WhatsApp, iMessage). Image: src/app/opengraph-image.jpg, rebuilt with `pnpm og`.
  openGraph: {
    type: "website",
    title: couple.joined,
    description: `${wedding.dateLong} · ${wedding.city}. You are invited.`,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4c5172",
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
