"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registra o service worker (produção) e oferece o botão "Instalar app". */
export default function PwaSetup() {
  const [instalar, setInstalar] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((e) => {
        console.error("SW não registrou", e);
      });
    }
    const aoInstalar = (e: Event) => {
      e.preventDefault();
      setInstalar(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", aoInstalar);
    window.addEventListener("appinstalled", () => setInstalar(null));
    return () => window.removeEventListener("beforeinstallprompt", aoInstalar);
  }, []);

  if (!instalar) return null;

  return (
    <button
      onClick={async () => {
        await instalar.prompt();
        setInstalar(null);
      }}
      className="anim-pop fixed right-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[70] flex items-center gap-1.5 rounded-full border border-volt/50 bg-card/90 px-3.5 py-2 text-xs font-bold text-volt shadow-[0_0_24px_-6px_#c8ff16] backdrop-blur-xl transition active:scale-95"
    >
      📲 Instalar app
    </button>
  );
}
