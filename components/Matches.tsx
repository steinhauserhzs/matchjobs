"use client";

import type { Empresa, Swipe, Vaga } from "@/lib/types";
import { Avatar, EmptyState, ScoreRing, SeloTag } from "./ui";

export default function Matches({
  swipes,
  vagas,
  empresas,
  onAbrirChat,
}: {
  swipes: Swipe[];
  vagas: Vaga[];
  empresas?: Record<string, Empresa>;
  onAbrirChat: (swipe: Swipe, vaga: Vaga) => void;
}) {
  const vagaDe = (id: string) => vagas.find((v) => v.id === id);
  const matches = swipes
    .filter((s) => s.matched)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const emAnalise = swipes
    .filter((s) => !s.matched && s.direcao !== "nope")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
        Seus <span className="grad-text">matches</span>
      </h1>
      <p className="mt-1 text-sm text-muted">
        Empresas que também te querem. Puxa papo!
      </p>

      {matches.length === 0 && emAnalise.length === 0 && (
        <EmptyState
          emoji="🫧"
          titulo="Nada por aqui ainda"
          sub="Deslize umas vagas pra direita e volte."
        />
      )}

      {matches.length > 0 && (
        <div className="stagger mt-6 space-y-3">
          {matches.map((s) => {
            const v = vagaDe(s.vaga_id);
            if (!v) return null;
            const emp = v.empresa_id ? empresas?.[v.empresa_id] : undefined;
            return (
              <button
                key={s.id}
                onClick={() => onAbrirChat(s, v)}
                className="glass flex w-full items-center gap-3.5 rounded-2xl border border-volt/25 p-4 text-left transition hover:border-volt/50 active:scale-[0.98]"
              >
                <Avatar emoji={v.logo} cor={v.cor} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{v.cargo}</p>
                  <p className="truncate text-xs text-muted">
                    {v.empresa} · {v.cidade}
                  </p>
                  {emp && emp.selos.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {emp.selos.slice(0, 2).map((selo) => (
                        <SeloTag key={selo} id={selo} small />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <ScoreRing score={s.score} size={40} stroke={4} />
                  {s.direcao === "super" && <span className="text-xs">⭐</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {emAnalise.length > 0 && (
        <>
          <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-muted">
            Candidaturas em análise · {emAnalise.length}
          </h2>
          <div className="stagger mt-3 space-y-2">
            {emAnalise.map((s) => {
              const v = vagaDe(s.vaga_id);
              if (!v) return null;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card/60 px-3.5 py-3"
                >
                  <span className="text-xl">{v.logo}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold">{v.cargo}</p>
                    <p className="truncate text-[11px] text-muted">{v.empresa}</p>
                  </div>
                  <span
                    className="rounded-full border border-azul/40 px-2.5 py-1 text-[10px] font-bold text-azul"
                    style={{ animation: "glow-pulse 3s ease-in-out infinite" }}
                  >
                    EM ANÁLISE
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
