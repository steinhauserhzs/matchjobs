"use client";

import { useState } from "react";
import type { BadgeConquistado, Profile, Swipe } from "@/lib/types";
import { brl, COR_RARIDADE, MODELOS } from "@/lib/data";
import { BADGES, type BadgeDef } from "@/lib/badges";
import { MODO_DADOS } from "@/lib/store";
import { Avatar, BadgeCoin, BtnGhost, BtnPrimary, Sheet, Stat } from "./ui";

const NOME_RARIDADE: Record<string, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  diamante: "Diamante",
};

export default function ProfileView({
  profile,
  swipes,
  badges,
  onEditar,
  onZerarDeck,
  onApagarTudo,
}: {
  profile: Profile;
  swipes: Swipe[];
  badges: BadgeConquistado[];
  onEditar: () => void;
  onZerarDeck: () => void;
  onApagarTudo: () => void;
}) {
  const [badgeAberta, setBadgeAberta] = useState<BadgeDef | null>(null);

  const vistas = swipes.length;
  const queros = swipes.filter((s) => s.direcao !== "nope").length;
  const matches = swipes.filter((s) => s.matched).length;
  const taxa = queros ? Math.round((matches / queros) * 100) : 0;
  const modelo = MODELOS.find((m) => m.value === profile.modelo);
  const conquistadas = new Set(badges.map((b) => b.badge_id));

  const contatos = [
    profile.email && { icone: "✉️", rotulo: profile.email, href: `mailto:${profile.email}` },
    profile.telefone && { icone: "📱", rotulo: profile.telefone, href: `tel:${profile.telefone.replace(/\D/g, "")}` },
    profile.linkedin && {
      icone: "💼",
      rotulo: profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
      href: profile.linkedin.startsWith("http") ? profile.linkedin : `https://${profile.linkedin}`,
    },
  ].filter(Boolean) as { icone: string; rotulo: string; href: string }[];

  return (
    <div className="mx-auto max-w-md px-5 pb-28 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      {/* cabeçalho */}
      <div className="stagger">
        <div className="flex items-center gap-4">
          <div className="acc-glow rounded-[26px]">
            <Avatar foto={profile.foto} emoji={profile.emoji} size={88} className="rounded-[26px]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-[family-name:var(--font-display)] text-xl font-bold">
              {profile.nome}
            </h1>
            {profile.headline && (
              <p className="mt-0.5 text-[13px] font-semibold text-volt">{profile.headline}</p>
            )}
            <p className="mt-0.5 text-xs text-muted">
              {profile.area} · {profile.senioridade}
            </p>
            <p className="text-xs text-muted">
              {modelo?.icon} {modelo?.label}
              {profile.cidade ? ` · ${profile.cidade}` : ""}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 rounded-2xl border border-line bg-card px-4 py-3 text-[13px] leading-relaxed text-ink/90">
            {profile.bio}
          </p>
        )}

        {contatos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {contatos.map((c) => (
              <a
                key={c.href}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[11px] font-semibold text-muted transition hover:border-volt/50 hover:text-ink"
              >
                {c.icone} {c.rotulo}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* stats */}
      <div className="stagger mt-6 grid grid-cols-4 gap-2">
        <Stat n={vistas} l="vistas" />
        <Stat n={queros} l="queros" />
        <Stat n={matches} l="matches" />
        <Stat n={`${taxa}%`} l="taxa" />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3.5">
        <span className="text-sm text-muted">Pretensão salarial</span>
        <span className="font-bold text-volt">{brl(profile.pretensao)}/mês</span>
      </div>

      {/* badges */}
      <div className="mt-7 flex items-baseline justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
          Conquistas
        </h2>
        <span className="text-[11px] font-bold text-volt">
          {conquistadas.size}/{BADGES.length}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {BADGES.map((b) => (
          <button
            key={b.id}
            onClick={() => setBadgeAberta(b)}
            className="flex flex-col items-center gap-1.5 transition active:scale-90"
          >
            <BadgeCoin
              icone={b.icone}
              raridade={b.raridade}
              size={58}
              bloqueada={!conquistadas.has(b.id)}
            />
            <span className="line-clamp-1 text-center text-[9px] font-semibold text-muted">
              {b.nome}
            </span>
          </button>
        ))}
      </div>

      {/* experiências */}
      {(profile.experiencias?.length ?? 0) > 0 && (
        <>
          <h2 className="mt-7 text-xs font-bold uppercase tracking-wider text-muted">
            Experiências
          </h2>
          <div className="mt-3 space-y-0">
            {profile.experiencias!.map((e, i) => (
              <div key={i} className="relative pb-4 pl-5">
                <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-volt shadow-[0_0_10px_#c8ff16]" />
                {i < profile.experiencias!.length - 1 && (
                  <span className="absolute left-[4px] top-4 h-full w-0.5 bg-line" />
                )}
                <p className="text-sm font-bold">{e.cargo || "—"}</p>
                <p className="text-xs text-muted">
                  {e.empresa}
                  {e.empresa && " · "}
                  {e.inicio} – {e.fim ?? "atual"}
                </p>
                {e.descricao && (
                  <p className="mt-1 text-xs leading-relaxed text-muted/80">{e.descricao}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* formação + idiomas */}
      {(profile.formacao?.length ?? 0) > 0 && (
        <>
          <h2 className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
            Formação
          </h2>
          <div className="mt-2.5 space-y-2">
            {profile.formacao!.map((f, i) => (
              <div key={i} className="rounded-xl border border-line bg-card px-3.5 py-2.5">
                <p className="text-sm font-semibold">{f.curso}</p>
                <p className="text-xs text-muted">
                  {f.instituicao}
                  {f.ano ? ` · ${f.ano}` : ""}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {(profile.idiomas?.length ?? 0) > 0 && (
        <>
          <h2 className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
            Idiomas
          </h2>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {profile.idiomas!.map((idm, i) => (
              <span
                key={i}
                className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink"
              >
                {idm.idioma} <span className="text-muted">· {idm.nivel}</span>
              </span>
            ))}
          </div>
        </>
      )}

      {/* skills */}
      <h2 className="mt-5 text-xs font-bold uppercase tracking-wider text-muted">
        Skills
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
        <BtnPrimary className="w-full" onClick={onEditar}>
          EDITAR PERFIL
        </BtnPrimary>
        <BtnGhost className="w-full" onClick={onZerarDeck}>
          Zerar deck (rever todas as vagas)
        </BtnGhost>
        <button
          onClick={onApagarTudo}
          className="w-full rounded-2xl border border-rosa/30 py-3.5 text-sm font-semibold text-rosa/80 transition active:scale-95"
        >
          Apagar todos os meus dados
        </button>
      </div>

      <p className="mt-6 text-center text-[10px] text-muted/60">
        MatchJobs v2 · dados no modo <span className="font-bold">{MODO_DADOS}</span> ·
        feito com 🔥 no Brasil
      </p>

      {/* detalhe da badge */}
      <Sheet
        aberto={!!badgeAberta}
        onFechar={() => setBadgeAberta(null)}
        titulo={badgeAberta ? undefined : undefined}
      >
        {badgeAberta && (
          <div className="pb-4 text-center">
            <div className="flex justify-center">
              <BadgeCoin
                icone={badgeAberta.icone}
                raridade={badgeAberta.raridade}
                size={88}
                bloqueada={!conquistadas.has(badgeAberta.id)}
                destaque={conquistadas.has(badgeAberta.id)}
              />
            </div>
            <p
              className="mt-4 font-[family-name:var(--font-display)] text-lg font-black"
              style={{ color: COR_RARIDADE[badgeAberta.raridade] }}
            >
              {badgeAberta.nome}
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: COR_RARIDADE[badgeAberta.raridade] }}
            >
              {NOME_RARIDADE[badgeAberta.raridade]}
            </p>
            <p className="mt-2 text-sm text-muted">{badgeAberta.desc}</p>
            <p className="mt-3 text-xs font-bold">
              {conquistadas.has(badgeAberta.id) ? "Conquistada ✓" : "Ainda bloqueada 🔒"}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
