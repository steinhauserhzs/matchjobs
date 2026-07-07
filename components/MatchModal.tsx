"use client";

import { useMemo } from "react";
import type { Vaga } from "@/lib/types";

const CORES = ["#c8ff16", "#ff5c39", "#4da6ff", "#ff4d6d", "#f4f4f8"];

export default function MatchModal({
  vaga,
  emojiUsuario,
  score,
  onMensagem,
  onContinuar,
}: {
  vaga: Vaga;
  emojiUsuario: string;
  score: number;
  onMensagem: () => void;
  onContinuar: () => void;
}) {
  const confetes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 9) * 0.12}s`,
        dur: `${2 + ((i * 13) % 10) / 6}s`,
        cor: CORES[i % CORES.length],
        w: 6 + ((i * 7) % 8),
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-md">
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

      <div className="anim-pop relative mx-6 w-full max-w-sm rounded-3xl border border-volt/30 bg-card p-7 text-center shadow-[0_0_80px_rgba(200,255,22,0.25)]">
        <p className="font-[family-name:var(--font-display)] text-[34px] font-black leading-none text-volt">
          DEU
          <br />
          MATCH!
        </p>
        <p className="mt-3 text-sm text-muted">
          A <span className="font-bold text-ink">{vaga.empresa}</span> também
          curtiu seu perfil para{" "}
          <span className="font-bold text-ink">{vaga.cargo}</span>
        </p>

        <div className="mt-6 flex items-center justify-center gap-[-8px]">
          <div className="anim-float flex h-20 w-20 items-center justify-center rounded-full border-2 border-volt bg-bg2 text-4xl">
            {emojiUsuario}
          </div>
          <div className="z-10 -mx-3 flex h-10 w-10 items-center justify-center rounded-full bg-volt text-lg font-black text-bg">
            {score}%
          </div>
          <div
            className="anim-float flex h-20 w-20 items-center justify-center rounded-full border-2 bg-bg2 text-4xl"
            style={{ borderColor: vaga.cor, animationDelay: "0.4s" }}
          >
            {vaga.logo}
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
