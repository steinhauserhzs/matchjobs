"use client";

import type { BadgeDef } from "@/lib/badges";
import { COR_RARIDADE } from "@/lib/data";
import { BadgeCoin } from "./ui";

const NOME_RARIDADE: Record<string, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  diamante: "Diamante",
};

export default function BadgeUnlock({
  badge,
  onFechar,
}: {
  badge: BadgeDef;
  onFechar: () => void;
}) {
  const cor = COR_RARIDADE[badge.raridade];
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bg/85 backdrop-blur-md"
      onClick={onFechar}
    >
      {/* anéis expansivos */}
      {[0, 0.35, 0.7].map((d) => (
        <span
          key={d}
          className="pointer-events-none absolute h-40 w-40 rounded-full border-2"
          style={{
            borderColor: cor,
            animation: `ring-pop 1.6s ease-out ${d}s infinite`,
          }}
        />
      ))}

      <div
        className="anim-pop relative mx-8 w-full max-w-xs rounded-3xl border bg-card p-7 text-center"
        style={{
          borderColor: `color-mix(in srgb, ${cor} 45%, transparent)`,
          boxShadow: `0 0 70px -10px ${cor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
          Conquista desbloqueada
        </p>
        <div className="mt-4 flex justify-center">
          <BadgeCoin icone={badge.icone} raridade={badge.raridade} size={92} destaque />
        </div>
        <p
          className="mt-4 font-[family-name:var(--font-display)] text-xl font-black"
          style={{ color: cor }}
        >
          {badge.nome}
        </p>
        <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: cor }}>
          {NOME_RARIDADE[badge.raridade]}
        </p>
        <p className="mt-2 text-sm text-muted">{badge.desc}</p>
        <button
          onClick={onFechar}
          className="mt-6 w-full rounded-2xl py-3 font-[family-name:var(--font-display)] text-sm font-bold text-bg transition active:scale-95"
          style={{ background: cor }}
        >
          AEEE! 🎉
        </button>
      </div>
    </div>
  );
}
