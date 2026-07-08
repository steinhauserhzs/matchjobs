"use client";

import { useEffect, useMemo, useState } from "react";
import type { Profile, Talento, Vaga } from "@/lib/types";
import { store } from "@/lib/store";
import { calcularScore } from "@/lib/match";
import { AREAS, brl, MODELOS, SENIORIDADES } from "@/lib/data";
import {
  Avatar,
  Chip,
  EmptyState,
  PortalShell,
  ScoreRing,
  Stat,
} from "@/components/ui";

const K_CONVITES = "trampolim:convites_hunter";
type Modo = "explorar" | "shortlist";

interface Convite {
  talento_id: string;
  vaga_id: string;
  em: string;
}

function perfilDe(t: Talento): Profile {
  return {
    id: t.id,
    nome: t.nome,
    emoji: t.emoji,
    area: t.area,
    senioridade: t.senioridade,
    cidade: t.cidade,
    modelo: t.modelo,
    pretensao: t.pretensao,
    skills: t.skills,
  };
}

export default function PortalHunter() {
  const [talentos, setTalentos] = useState<Talento[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [modo, setModo] = useState<Modo>("explorar");
  const [fArea, setFArea] = useState("");
  const [fSenior, setFSenior] = useState("");
  const [fModelo, setFModelo] = useState("");
  const [busca, setBusca] = useState("");
  const [vagaAlvo, setVagaAlvo] = useState("");
  const [bioAberta, setBioAberta] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, v, s] = await Promise.all([
        store.getTalentos(),
        store.getVagas(),
        store.getShortlist(),
      ]);
      setTalentos(t);
      setVagas(v.filter((x) => x.ativa));
      setShortlist(s);
      try {
        setConvites(JSON.parse(localStorage.getItem(K_CONVITES) ?? "[]"));
      } catch {
        setConvites([]);
      }
      setCarregado(true);
    })();
  }, []);

  const alvo = vagas.find((v) => v.id === vagaAlvo) ?? null;

  const lista = useMemo(() => {
    let l = talentos;
    if (modo === "shortlist") l = l.filter((t) => shortlist.includes(t.id));
    if (fArea) l = l.filter((t) => t.area === fArea);
    if (fSenior) l = l.filter((t) => t.senioridade === fSenior);
    if (fModelo) l = l.filter((t) => t.modelo === fModelo);
    if (busca.trim()) {
      const b = busca.toLowerCase();
      l = l.filter((t) =>
        `${t.nome} ${t.headline} ${t.skills.join(" ")} ${t.cidade}`
          .toLowerCase()
          .includes(b),
      );
    }
    const pontuados = l.map((t) => ({
      t,
      score: alvo ? calcularScore(perfilDe(t), alvo).score : -1,
    }));
    if (alvo) pontuados.sort((a, b) => b.score - a.score);
    return pontuados;
  }, [talentos, modo, shortlist, fArea, fSenior, fModelo, busca, alvo]);

  async function toggleFav(id: string) {
    setShortlist(await store.toggleShortlist(id));
  }

  async function convidar(t: Talento) {
    if (!alvo?.empresa_id) return;
    await store.likeTalento(alvo.empresa_id, t.id);
    const novo: Convite = {
      talento_id: t.id,
      vaga_id: alvo.id,
      em: new Date().toISOString(),
    };
    const todos = [...convites.filter(
      (c) => !(c.talento_id === t.id && c.vaga_id === alvo.id),
    ), novo];
    setConvites(todos);
    localStorage.setItem(K_CONVITES, JSON.stringify(todos));
  }

  if (!carregado) {
    return (
      <PortalShell portal="hunter" titulo="Radar do Hunter">
        <div className="space-y-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      portal="hunter"
      titulo="Radar do Hunter"
      sub="Garimpe talentos de todas as áreas e convide para vagas"
    >
      {/* stats */}
      <div className="stagger mb-5 grid grid-cols-3 gap-2">
        <Stat n={lista.length} l="no radar" />
        <Stat n={shortlist.length} l="shortlist" />
        <Stat n={convites.length} l="convites" />
      </div>

      {/* modos */}
      <div className="mb-4 flex gap-2">
        <Chip ativo={modo === "explorar"} onClick={() => setModo("explorar")}>
          🔭 Explorar
        </Chip>
        <Chip ativo={modo === "shortlist"} onClick={() => setModo("shortlist")}>
          ♥ Shortlist · {shortlist.length}
        </Chip>
      </div>

      {/* vaga-alvo */}
      <select
        value={vagaAlvo}
        onChange={(e) => setVagaAlvo(e.target.value)}
        className="mb-3 w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none"
      >
        <option value="">🎯 Vaga-alvo (opcional — habilita score e convite)</option>
        {vagas.map((v) => (
          <option key={v.id} value={v.id}>
            {v.cargo} · {v.empresa}
          </option>
        ))}
      </select>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome, skill, cidade…"
        className="mb-3 w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted/50"
      />

      {/* filtros roláveis */}
      <div className="-mx-5 mb-1 overflow-x-auto px-5 pb-2">
        <div className="flex w-max gap-1.5">
          <Chip small ativo={!fArea} onClick={() => setFArea("")}>
            Todas as áreas
          </Chip>
          {AREAS.map((a) => (
            <Chip key={a} small ativo={fArea === a} onClick={() => setFArea(fArea === a ? "" : a)}>
              {a}
            </Chip>
          ))}
        </div>
      </div>
      <div className="-mx-5 mb-4 overflow-x-auto px-5 pb-2">
        <div className="flex w-max gap-1.5">
          {SENIORIDADES.map((s) => (
            <Chip key={s} small ativo={fSenior === s} onClick={() => setFSenior(fSenior === s ? "" : s)}>
              {s}
            </Chip>
          ))}
          {MODELOS.map((m) => (
            <Chip
              key={m.value}
              small
              ativo={fModelo === m.value}
              onClick={() => setFModelo(fModelo === m.value ? "" : m.value)}
            >
              {m.icon} {m.label}
            </Chip>
          ))}
        </div>
      </div>

      {lista.length === 0 && (
        <EmptyState
          emoji={modo === "shortlist" ? "🗂️" : "🔍"}
          titulo={modo === "shortlist" ? "Shortlist vazia" : "Ninguém nesse filtro"}
          sub={
            modo === "shortlist"
              ? "Favorite os brabos no modo Explorar."
              : "Afrouxa o filtro que o talento aparece."
          }
        />
      )}

      <div className="stagger space-y-2.5">
        {lista.map(({ t, score }) => {
          const fav = shortlist.includes(t.id);
          const convidado = alvo
            ? convites.some((c) => c.talento_id === t.id && c.vaga_id === alvo.id)
            : false;
          return (
            <div
              key={t.id}
              className="rounded-2xl border border-line bg-card p-4"
              style={{ opacity: t.disponivel ? 1 : 0.55 }}
            >
              <div className="flex items-center gap-3">
                <Avatar emoji={t.emoji} size={50} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">
                    {t.nome}{" "}
                    {!t.disponivel && (
                      <span className="rounded-full border border-line px-1.5 py-0.5 text-[9px] font-bold text-muted">
                        indisponível
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted">{t.headline}</p>
                  <p className="truncate text-[11px] text-muted/80">
                    {t.area} · {t.senioridade} · {t.cidade} · {brl(t.pretensao)}
                  </p>
                </div>
                {alvo && score >= 0 ? (
                  <ScoreRing score={score} size={44} stroke={4} />
                ) : null}
                <button
                  onClick={() => toggleFav(t.id)}
                  aria-label={fav ? "Remover da shortlist" : "Adicionar à shortlist"}
                  className={`text-2xl transition active:scale-75 ${fav ? "anim-pop" : "opacity-40 grayscale"}`}
                >
                  {fav ? "❤️" : "🤍"}
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1">
                {t.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-bg2 px-2 py-0.5 text-[10px] font-semibold text-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {bioAberta === t.id && (
                <p className="anim-rise mt-2.5 rounded-xl bg-bg2/60 px-3 py-2.5 text-xs leading-relaxed text-ink/85">
                  “{t.bio}”
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setBioAberta(bioAberta === t.id ? null : t.id)}
                  className="flex-1 rounded-xl border border-line py-2.5 text-xs font-bold text-muted transition active:scale-95"
                >
                  {bioAberta === t.id ? "− fechar bio" : "+ ver bio"}
                </button>
                {alvo && t.disponivel && (
                  <button
                    onClick={() => convidar(t)}
                    disabled={convidado}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                      convidado ? "anim-pop acc-border acc-text border" : "acc-bg"
                    }`}
                  >
                    {convidado ? "✓ CONVIDADO" : "📨 CONVIDAR P/ VAGA"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
