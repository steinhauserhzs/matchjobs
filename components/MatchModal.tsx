"use client";

import { useMemo } from "react";
import type { Vaga } from "@/lib/types";
import { Avatar, ScoreRing } from "./ui";

const CORES = ["#c8ff16", "#ff5c39", "#4da6ff", "#ff4d6d", "#f4f4f8", "#ffd24d", "#b18cff"];

export default function MatchModal({
  vaga,
  emojiUsuario,
  fotoUsuario,
  score,
  onMensagem,
  onContinuar,
}: {
  vaga: Vaga;
  emojiUsuario: string;
  fotoUsuario?: string;
  score: number;
  onMensagem: () => void;
  onContinuar: () => void;
}) {
  const confetes = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${(i * 29) % 100}%`,
        delay: `${(i % 11) * 0.11}s`,
        dur: `${1.9 + ((i * 17) % 12) / 6}s`,
        cor: CORES[i % CORES.length],
        w: 5 + ((i * 7) % 9),
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md">
      {/* anéis expansivos */}
      {[0, 0.4, 0.8].map((d) => (
        <span
          key={d}
          className="pointer-events-none absolute h-48 w-48 rounded-full border-2 border-volt/60"
          style={{ animation: `ring-pop 1.8s ease-out ${d}s infinite` }}
        />
      ))}

      {/* confete */}
      {confetes.map((c, i) => (
        <span
          key={i}
          className="pointer-events-none absolute top-0 rounded-sm"
          style={{
            left: c.left,
            width: c.w,
            height: c.w * 1.6,
            background: c.cor,
            animation: `confetti-fall ${c.dur} linear ${c.delay} infinite`,
          }}
        />
      ))}

      <div className="anim-pop shine relative mx-6 w-full max-w-sm rounded-3xl border border-volt/30 bg-card p-7 text-center shadow-[0_0_90px_rgba(200,255,22,0.28)]">
        <p className="grad-text font-[family-name:var(--font-display)] text-[36px] font-black leading-none">
          DEU
          <br />
          MATCH!
        </p>
        <p className="mt-3 text-sm text-muted">
          A <span className="font-bold text-ink">{vaga.empresa}</span> também
          curtiu seu perfil para{" "}
          <span className="font-bold text-ink">{vaga.cargo}</span>
        </p>

        <div className="mt-6 flex items-center justify-center">
          <div className="anim-float">
            <Avatar foto={fotoUsuario} emoji={emojiUsuario} size={80} className="rounded-full" />
          </div>
          <div className="z-10 -mx-4">
            <ScoreRing score={score} size={62} stroke={6} />
          </div>
          <div className="anim-float" style={{ animationDelay: "0.4s" }}>
            <Avatar emoji={vaga.logo} size={80} cor={vaga.cor} className="rounded-full" />
          </div>
        </div>

        <button
          onClick={onMensagem}
          className="mt-7 w-full rounded-2xl bg-volt py-3.5 font-[family-name:var(--font-display)] text-sm font-bold text-bg transition active:scale-95"
        >
          MANDAR MENSAGEM
        </button>
        <button
          onClick={onContinuar}
          className="mt-2.5 w-full rounded-2xl border border-line py-3.5 text-sm font-semibold text-muted transition active:scale-95"
        >
          Continuar deslizando
        </button>
      </div>
    </div>
  );
}
