import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchJobs — deslize pro trampo certo",
    short_name: "MatchJobs",
    description:
      "O Tinder das vagas: deslize, dê match e converse com quem quer te contratar.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a10",
    theme_color: "#0a0a10",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
