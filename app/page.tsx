"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Direcao, Profile, ScoreResult, Swipe, Vaga } from "@/lib/types";
import { store } from "@/lib/store";
import { calcularScore, decidirMatch, mensagemBoasVindas } from "@/lib/match";
import Onboarding from "@/components/Onboarding";
import Deck, { type Carta } from "@/components/Deck";
import MatchModal from "@/components/MatchModal";
import Matches from "@/components/Matches";
import Chat from "@/components/Chat";
import ProfileView from "@/components/Profile";
import TabBar, { type Tab } from "@/components/TabBar";

type Fase = "carregando" | "onboarding" | "app";

export default function Home() {
  const [fase, setFase] = useState<Fase>("carregando");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [tab, setTab] = useState<Tab>("vagas");
  const [match, setMatch] = useState<{ vaga: Vaga; swipe: Swipe } | null>(null);
  const [chat, setChat] = useState<{ swipe: Swipe; vaga: Vaga } | null>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, v, s] = await Promise.all([
          store.getProfile(),
          store.getVagas(),
          store.getSwipes(),
        ]);
        setVagas(v);
        setSwipes(s);
        setProfile(p);
        setFase(p ? "app" : "onboarding");
      } catch (e) {
        console.error("Falha ao carregar dados", e);
        setFase("onboarding");
      }
    })();
  }, []);

  const cartas: Carta[] = useMemo(() => {
    if (!profile) return [];
    const swipadas = new Set(swipes.map((s) => s.vaga_id));
    return vagas
      .filter((v) => !swipadas.has(v.id))
      .map((vaga) => ({ vaga, score: calcularScore(profile, vaga) }))
      .sort((a, b) => b.score.score - a.score.score);
  }, [profile, vagas, swipes]);

  const totalMatches = swipes.filter((s) => s.matched).length;

  const aoSwipe = useCallback(
    async (vaga: Vaga, direcao: Direcao, score: ScoreResult) => {
      if (!profile) return;
      const matched =
        direcao !== "nope" && decidirMatch(direcao, score.score);
      const swipe = await store.addSwipe({
        vaga_id: vaga.id,
        direcao,
        score: score.score,
        matched,
        status: matched ? "match" : direcao === "nope" ? "descartada" : "em_analise",
      });
      setSwipes((prev) => [...prev.filter((s) => s.vaga_id !== vaga.id), swipe]);
      if (matched) {
        await store.addMensagem({
          swipe_id: swipe.id,
          autor: "empresa",
          texto: mensagemBoasVindas(profile.nome, vaga),
        });
        setMatch({ vaga, swipe });
      }
    },
    [profile],
  );

  const aoRewind = useCallback(async () => {
    const ultimo = [...swipes].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )[0];
    if (!ultimo) return;
    await store.removeSwipe(ultimo.id);
    setSwipes((prev) => prev.filter((s) => s.id !== ultimo.id));
  }, [swipes]);

  async function salvarPerfil(p: Profile) {
    await store.saveProfile(p);
    setProfile(p);
    setEditando(false);
    setFase("app");
    setTab("vagas");
  }

  async function zerarDeck() {
    if (!confirm("Zerar o deck? Suas candidaturas e matches serão apagados.")) return;
    await store.resetSwipes();
    setSwipes([]);
    setTab("vagas");
  }

  async function apagarTudo() {
    if (!confirm("Apagar perfil, matches e conversas? Não tem volta.")) return;
    await store.clearAll();
    setProfile(null);
    setSwipes([]);
    setFase("onboarding");
    setTab("vagas");
  }

  // ------------------------------------------------------------ render
  if (fase === "carregando") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="anim-pop flex h-20 w-20 items-center justify-center rounded-[24px] border border-volt/40 bg-card text-4xl">
          🤸
        </div>
      </div>
    );
  }

  if (fase === "onboarding" || editando) {
    return (
      <Onboarding
        inicial={editando ? profile : null}
        onDone={salvarPerfil}
      />
    );
  }

  if (!profile) return null;

  return (
    <div className="relative z-10 min-h-dvh">
      {tab === "vagas" && (
        <div
          className="mx-auto flex max-w-md flex-col px-5 pt-[calc(env(safe-area-inset-top)+1rem)]"
          style={{ height: "calc(100dvh - 68px)" }}
        >
          <header className="mb-3 flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-display)] text-lg font-black">
              TRAMPO<span className="text-volt">LIM</span>
            </h1>
            <span className="rounded-full border border-line bg-card px-3 py-1 text-[11px] font-bold text-muted">
              {cartas.length} {cartas.length === 1 ? "vaga" : "vagas"}
            </span>
          </header>

          {cartas.length > 0 ? (
            <Deck
              cartas={cartas}
              onSwipe={aoSwipe}
              onRewind={aoRewind}
              podeRewind={swipes.length > 0}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
              <p className="anim-float text-6xl">🏖️</p>
              <p className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold">
                Você viu tudo por aqui!
              </p>
              <p className="mt-2 max-w-[240px] text-sm text-muted">
                Novas vagas chegam todo dia. Enquanto isso, confira seus
                matches.
              </p>
              <button
                onClick={() => setTab("matches")}
                className="mt-6 rounded-2xl bg-volt px-6 py-3 font-[family-name:var(--font-display)] text-xs font-bold text-bg transition active:scale-95"
              >
                VER MATCHES ({totalMatches})
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "matches" && (
        <Matches
          swipes={swipes}
          vagas={vagas}
          onAbrirChat={(swipe, vaga) => setChat({ swipe, vaga })}
        />
      )}

      {tab === "perfil" && (
        <ProfileView
          profile={profile}
          swipes={swipes}
          onEditar={() => setEditando(true)}
          onZerarDeck={zerarDeck}
          onApagarTudo={apagarTudo}
        />
      )}

      <TabBar tab={tab} onChange={setTab} badgeMatches={totalMatches} />

      {match && (
        <MatchModal
          vaga={match.vaga}
          emojiUsuario={profile.emoji}
          score={match.swipe.score}
          onMensagem={() => {
            setChat({ swipe: match.swipe, vaga: match.vaga });
            setMatch(null);
          }}
          onContinuar={() => setMatch(null)}
        />
      )}

      {chat && (
        <Chat
          swipe={chat.swipe}
          vaga={chat.vaga}
          onVoltar={() => setChat(null)}
        />
      )}
    </div>
  );
}
