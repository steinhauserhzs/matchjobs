"use client";

import { useRef, useState } from "react";
import type { Direcao, ScoreResult, Vaga } from "@/lib/types";
import JobCard from "./JobCard";

export interface Carta {
  vaga: Vaga;
  score: ScoreResult;
}

const LIMIAR = 90; // px para confirmar o swipe

export default function Deck({
  cartas,
  onSwipe,
  onRewind,
  podeRewind,
}: {
  cartas: Carta[];
  onSwipe: (vaga: Vaga, direcao: Direcao, score: ScoreResult) => void;
  onRewind: () => void;
  podeRewind: boolean;
}) {
  const [drag, setDrag] = useState({ dx: 0, dy: 0, ativo: false });
  const [saindo, setSaindo] = useState<Direcao | null>(null);
  const inicio = useRef<{ x: number; y: number } | null>(null);

  const topo = cartas[0];

  function lancar(direcao: Direcao) {
    if (!topo || saindo) return;
    setSaindo(direcao);
    setTimeout(() => {
      onSwipe(topo.vaga, direcao, topo.score);
      setSaindo(null);
      setDrag({ dx: 0, dy: 0, ativo: false });
    }, 320);
  }

  function pointerDown(e: React.PointerEvent) {
    if (saindo) return;
    inicio.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ dx: 0, dy: 0, ativo: true });
  }

  function pointerMove(e: React.PointerEvent) {
    if (!inicio.current || saindo) return;
    setDrag({
      dx: e.clientX - inicio.current.x,
      dy: e.clientY - inicio.current.y,
      ativo: true,
    });
  }

  function pointerUp() {
    if (!inicio.current || saindo) return;
    const { dx } = drag;
    inicio.current = null;
    if (dx > LIMIAR) lancar("like");
    else if (dx < -LIMIAR) lancar("nope");
    else setDrag({ dx: 0, dy: 0, ativo: false });
  }

  function transformTopo(): string {
    if (saindo === "like") return "translate(120vw, -8vh) rotate(28deg)";
    if (saindo === "nope") return "translate(-120vw, -8vh) rotate(-28deg)";
    if (saindo === "super") return "translate(0, -130vh) rotate(-8deg) scale(1.05)";
    return `translate(${drag.dx}px, ${drag.dy * 0.35}px) rotate(${drag.dx * 0.055}deg)`;
  }

  if (!topo) return null;

  return (
    <div className="flex h-full flex-col">
      {/* pilha */}
      <div className="relative min-h-0 flex-1">
        {cartas.slice(0, 3).map((carta, i) => {
          const ehTopo = i === 0;
          return (
            <div
              key={carta.vaga.id}
              className="absolute inset-0"
              style={{
                zIndex: 10 - i,
                transform: ehTopo
                  ? transformTopo()
                  : `translateY(${i * 13}px) scale(${1 - i * 0.045})`,
                opacity: ehTopo ? 1 : 1 - i * 0.25,
                transition:
                  ehTopo && drag.ativo
                    ? "none"
                    : "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease",
                touchAction: "none",
                cursor: ehTopo ? "grab" : "default",
              }}
              onPointerDown={ehTopo ? pointerDown : undefined}
              onPointerMove={ehTopo ? pointerMove : undefined}
              onPointerUp={ehTopo ? pointerUp : undefined}
              onPointerCancel={ehTopo ? pointerUp : undefined}
            >
              <JobCard
                vaga={carta.vaga}
                score={carta.score}
                dx={ehTopo ? drag.dx : 0}
                leaving={ehTopo ? saindo : null}
                topo={ehTopo}
              />
            </div>
          );
        })}
      </div>

      {/* controles */}
      <div className="flex items-center justify-center gap-4 pb-3 pt-4">
        <button
          onClick={onRewind}
          disabled={!podeRewind}
          aria-label="Desfazer último swipe"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card text-muted transition active:scale-90 disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 14 4 9l5-5M4 9h9a7 7 0 1 1-1 13.9"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={() => lancar("nope")}
          aria-label="Passar vaga"
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-rosa/60 bg-card text-rosa transition active:scale-90"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <button
          onClick={() => lancar("super")}
          aria-label="Super interesse"
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-azul/60 bg-card text-azul transition active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2Z" />
          </svg>
        </button>

        <button
          onClick={() => lancar("like")}
          aria-label="Quero essa vaga"
          className="anim-glow flex h-16 w-16 items-center justify-center rounded-full bg-volt text-bg transition active:scale-90"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M13.5 2s.8 2.6-1.3 5.2C10.2 9.7 8 10.8 8 14a5.5 5.5 0 0 0 11 0c0-2.2-1-3.8-2-5-.6 1.2-1.5 1.8-1.5 1.8S17 6 13.5 2Z"
              fill="#0a0a10"
            />
            <path
              d="M5.5 8.5c0 0 .5 1.5-.1 3C4.7 13.1 4 14 4 15.7a4 4 0 0 0 4.9 3.9"
              stroke="#0a0a10"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
