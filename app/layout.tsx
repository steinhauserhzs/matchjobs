import type { Metadata, Viewport } from "next";
import { Unbounded, Sora } from "next/font/google";
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
  title: "Trampolim — deslize pro trampo certo",
  description:
    "O Tinder das vagas: deslize, dê match e converse com quem quer te contratar. Chega de formulário infinito.",
  applicationName: "Trampolim",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Trampolim",
  },
  openGraph: {
    title: "Trampolim — deslize pro trampo certo",
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
      <body>{children}</body>
    </html>
  );
}
