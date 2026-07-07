"use client";

import type { Swipe, Vaga } from "@/lib/types";

export default function Matches({
  swipes,
  vagas,
  onAbrirChat,
}: {
  swipes: Swipe[];
  vagas: Vaga[];
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
        Seus matches
      </h1>
      <p className="mt-1 text-sm text-muted">
        Empresas que também te querem. Puxa papo!
      </p>

      {matches.length === 0 && emAnalise.length === 0 && (
        <div className="mt-20 text-center">
          <p className="text-5xl">🫧</p>
          <p className="mt-4 font-bold">Nada por aqui ainda</p>
          <p className="mt-1 text-sm text-muted">
            Deslize umas vagas pra direita e volte.
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="stagger mt-6 space-y-3">
          {matches.map((s) => {
            const v = vagaDe(s.vaga_id);
            if (!v) return null;
            return (
              <button
                key={s.id}
                onClick={() => onAbrirChat(s, v)}
                className="flex w-full items-center gap-3.5 rounded-2xl border border-volt/25 bg-card p-4 text-left transition active:scale-[0.98]"
              >
                <div
                  className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: `${v.cor}22`, border: `1px solid ${v.cor}55`, width: 52, height: 52 }}
                >
                  {v.logo}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{v.cargo}</p>
                  <p className="truncate text-xs text-muted">
                    {v.empresa} · {v.cidade}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-volt px-2 py-0.5 text-[10px] font-black text-bg">
                    {s.score}%
                  </span>
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
          <div className="mt-3 space-y-2">
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
                  <span className="rounded-full border border-azul/40 px-2.5 py-1 text-[10px] font-bold text-azul">
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
