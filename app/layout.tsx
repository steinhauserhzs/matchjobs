import type { Metadata, Viewport } from "next";
import { Unbounded, Sora } from "next/font/google";
import PwaSetup from "@/components/PwaSetup";
import "./globals.css";

const display = Unbounded({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "MatchJobs — deslize pro trampo certo",
  description:
    "O Tinder das vagas: deslize, dê match e converse com quem quer te contratar. Chega de formulário infinito.",
  applicationName: "MatchJobs",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MatchJobs",
  },
  openGraph: {
    title: "MatchJobs — deslize pro trampo certo",
    description:
      "O Tinder das vagas: deslize, dê match e converse com quem quer te contratar.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a10",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sora.variable}`}>
      <body>
        {children}
        <PwaSetup />
      </body>
    </html>
  );
}
