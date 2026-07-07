"use client";

import type { Profile, Swipe } from "@/lib/types";
import { brl, MODELOS } from "@/lib/data";
import { MODO_DADOS } from "@/lib/store";

export default function ProfileView({
  profile,
  swipes,
  onEditar,
  onZerarDeck,
  onApagarTudo,
}: {
  profile: Profile;
  swipes: Swipe[];
  onEditar: () => void;
  onZerarDeck: () => void;
  onApagarTudo: () => void;
}) {
  const vistas = swipes.length;
  const queros = swipes.filter((s) => s.direcao !== "nope").length;
  const matches = swipes.filter((s) => s.matched).length;
  const taxa = queros ? Math.round((matches / queros) * 100) : 0;
  const modelo = MODELOS.find((m) => m.value === profile.modelo);

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      {/* cabeçalho */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-volt/40 bg-card text-4xl shadow-[0_0_40px_rgba(200,255,22,0.15)]">
          {profile.emoji}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-display)] text-xl font-bold">
            {profile.nome}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            {profile.area} · {profile.senioridade}
          </p>
          <p className="text-xs text-muted">
            {modelo?.icon} {modelo?.label}
            {profile.cidade ? ` · ${profile.cidade}` : ""}
          </p>
        </div>
      </div>

      {/* stats */}
      <div className="stagger mt-6 grid grid-cols-4 gap-2">
        {[
          { n: vistas, l: "vistas" },
          { n: queros, l: "queros" },
          { n: matches, l: "matches" },
          { n: `${taxa}%`, l: "taxa" },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-2xl border border-line bg-card py-3 text-center"
          >
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-volt">
              {s.n}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              {s.l}
            </p>
          </div>
        ))}
      </div>

      {/* pretensão */}
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3.5">
        <span className="text-sm text-muted">Pretensão salarial</span>
        <span className="font-bold text-volt">{brl(profile.pretensao)}/mês</span>
      </div>

      {/* skills */}
      <h2 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">
        Suas skills
      </h2>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {profile.skills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-volt/40 bg-volt/10 px-3 py-1.5 text-xs font-semibold text-volt"
          >
            {s}
          </span>
        ))}
      </div>

      {/* ações */}
      <div className="mt-8 space-y-2.5">
        <button
          onClick={onEditar}
          className="w-full rounded-2xl bg-volt py-3.5 font-[family-name:var(--font-display)] text-sm font-bold text-bg transition active:scale-95"
        >
          EDITAR PERFIL
        </button>
        <button
          onClick={onZerarDeck}
          className="w-full rounded-2xl border border-line py-3.5 text-sm font-semibold text-muted transition active:scale-95"
        >
          Zerar deck (rever todas as vagas)
        </button>
        <button
          onClick={onApagarTudo}
          className="w-full rounded-2xl border border-rosa/30 py-3.5 text-sm font-semibold text-rosa/80 transition active:scale-95"
        >
          Apagar todos os meus dados
        </button>
      </div>

      <p className="mt-6 text-center text-[10px] text-muted/60">
        Trampolim MVP · dados no modo{" "}
        <span className="font-bold">{MODO_DADOS}</span> · feito com 🔥 no Brasil
      </p>
    </div>
  );
}
