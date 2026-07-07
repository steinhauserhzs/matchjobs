"use client";

import { useState } from "react";
import type { Direcao, ScoreResult, Vaga } from "@/lib/types";
import { faixaSalarial, MODELOS } from "@/lib/data";

export default function JobCard({
  vaga,
  score,
  dx,
  leaving,
  topo,
}: {
  vaga: Vaga;
  score: ScoreResult;
  dx: number;
  leaving: Direcao | null;
  topo: boolean;
}) {
  const [aberta, setAberta] = useState(false);

  const opQuero = leaving === "like" ? 1 : Math.min(1, Math.max(0, dx / 110));
  const opPasso = leaving === "nope" ? 1 : Math.min(1, Math.max(0, -dx / 110));
  const opSuper = leaving === "super" ? 1 : 0;
  const modelo = MODELOS.find((m) => m.value === vaga.modelo);

  return (
    <div className="relative flex h-full w-full select-none flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]">
      {/* header colorido da empresa */}
      <div
        className="relative shrink-0 px-5 pb-4 pt-5"
        style={{
          background: `linear-gradient(140deg, ${vaga.cor}26 0%, transparent 65%)`,
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
              style={{ background: `${vaga.cor}22`, border: `1px solid ${vaga.cor}55` }}
            >
              {vaga.logo}
            </div>
            <div>
              <p className="text-sm font-bold">{vaga.empresa}</p>
              <p className="text-xs text-muted">
                {modelo?.icon} {modelo?.label} · {vaga.cidade}
              </p>
            </div>
          </div>
          <div
            className="rounded-full px-3 py-1.5 text-xs font-extrabold"
            style={{
              background: score.score >= 65 ? "#c8ff16" : "#26263a",
              color: score.score >= 65 ? "#0a0a10" : "#f4f4f8",
            }}
          >
            {score.score}% match
          </div>
        </div>

        <h2 className="mt-4 font-[family-name:var(--font-display)] text-[22px] font-bold leading-tight">
          {vaga.cargo}
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-line bg-bg2 px-2.5 py-1 text-[11px] font-semibold text-muted">
            {vaga.senioridade}
          </span>
          <span className="rounded-full border border-line bg-bg2 px-2.5 py-1 text-[11px] font-semibold text-muted">
            {vaga.area}
          </span>
        </div>
      </div>

      {/* corpo */}
      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5">
        <p className="text-lg font-bold text-volt">
          {faixaSalarial(vaga.salario_min, vaga.salario_max)}
          <span className="ml-1 text-xs font-normal text-muted">/mês</span>
        </p>

        {score.motivos[0] && (
          <p className="mt-1.5 text-[13px] text-muted">
            <span className="text-volt">✦</span> {score.motivos[0]}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {vaga.skills.map((s) => {
            const tem = score.skillsEmComum.includes(s);
            return (
              <span
                key={s}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  background: tem ? "rgba(200,255,22,0.14)" : "#1d1d2c",
                  color: tem ? "#c8ff16" : "#9c9cb0",
                  border: tem ? "1px solid rgba(200,255,22,0.4)" : "1px solid transparent",
                }}
              >
                {tem && "✓ "}
                {s}
              </span>
            );
          })}
        </div>

        {aberta ? (
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 text-[13px] leading-relaxed text-ink/90">
            <p>{vaga.descricao}</p>
            <p className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wider text-muted">
              Benefícios
            </p>
            <ul className="space-y-1">
              {vaga.beneficios.map((b) => (
                <li key={b}>
                  <span className="text-coral">▸</span> {b}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
            {vaga.descricao}
          </p>
        )}

        {topo && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setAberta((v) => !v)}
            className="mt-auto self-start pt-2 text-xs font-bold text-azul"
          >
            {aberta ? "− menos detalhes" : "+ mais detalhes"}
          </button>
        )}
      </div>

      {/* carimbos */}
      <div
        className="pointer-events-none absolute left-5 top-16 rotate-[-14deg] rounded-lg border-4 border-volt px-3 py-1 font-[family-name:var(--font-display)] text-2xl font-black text-volt"
        style={{ opacity: opQuero }}
      >
        QUERO!
      </div>
      <div
        className="pointer-events-none absolute right-5 top-16 rotate-[14deg] rounded-lg border-4 border-rosa px-3 py-1 font-[family-name:var(--font-display)] text-2xl font-black text-rosa"
        style={{ opacity: opPasso }}
      >
        PASSO
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-24 mx-auto w-fit rotate-[-6deg] rounded-lg border-4 border-azul px-3 py-1 font-[family-name:var(--font-display)] text-2xl font-black text-azul"
        style={{ opacity: opSuper }}
      >
        É ESSE!
      </div>
    </div>
  );
}
