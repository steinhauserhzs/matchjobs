"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BadgeConquistado,
  Direcao,
  Empresa,
  Profile,
  ScoreResult,
  Swipe,
  Vaga,
} from "@/lib/types";
import { store } from "@/lib/store";
import { calcularScore, decidirMatch, mensagemBoasVindas } from "@/lib/match";
import { avaliarBadges, BADGE_MAP, type BadgeDef } from "@/lib/badges";
import Onboarding from "@/components/Onboarding";
import Deck, { type Carta } from "@/components/Deck";
import MatchModal from "@/components/MatchModal";
import Matches from "@/components/Matches";
import Chat from "@/components/Chat";
import ProfileView from "@/components/Profile";
import BadgeUnlock from "@/components/BadgeUnlock";
import TabBar, { type Tab } from "@/components/TabBar";
import { Avatar } from "@/components/ui";

type Fase = "carregando" | "onboarding" | "app";

export default function Home() {
  const [fase, setFase] = useState<Fase>("carregando");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [empresas, setEmpresas] = useState<Record<string, Empresa>>({});
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [badges, setBadges] = useState<BadgeConquistado[]>([]);
  const [filaBadges, setFilaBadges] = useState<BadgeDef[]>([]);
  const [tab, setTab] = useState<Tab>("vagas");
  const [match, setMatch] = useState<{ vaga: Vaga; swipe: Swipe } | null>(null);
  const [chat, setChat] = useState<{ swipe: Swipe; vaga: Vaga } | null>(null);
  const [editando, setEditando] = useState(false);
  const checandoBadges = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, v, s, e, b] = await Promise.all([
          store.getProfile(),
          store.getVagas(),
          store.getSwipes(),
          store.getEmpresas(),
          store.getBadges(),
        ]);
        setVagas(v);
        setSwipes(s);
        setProfile(p);
        setEmpresas(Object.fromEntries(e.map((emp) => [emp.id, emp])));
        setBadges(b);
        setFase(p ? "app" : "onboarding");
      } catch (e) {
        console.error("Falha ao carregar dados", e);
        setFase("onboarding");
      }
    })();
  }, []);

  /** Motor de conquistas: roda após qualquer mudança relevante. */
  const checarBadges = useCallback(
    async (p: Profile | null, s: Swipe[], v: Vaga[]) => {
      if (checandoBadges.current) return;
      checandoBadges.current = true;
      try {
        const merecidas = avaliarBadges(p, s, v);
        const atuais = await store.getBadges();
        const tem = new Set(atuais.map((b) => b.badge_id));
        const novas = merecidas.filter((id) => !tem.has(id));
        if (novas.length) {
          for (const id of novas) await store.addBadge(id);
          setBadges(await store.getBadges());
          setFilaBadges((fila) => [
            ...fila,
            ...novas.map((id) => BADGE_MAP[id]).filter(Boolean),
          ]);
        }
      } finally {
        checandoBadges.current = false;
      }
    },
    [],
  );

  const cartas: Carta[] = useMemo(() => {
    if (!profile) return [];
    const swipadas = new Set(swipes.map((s) => s.vaga_id));
    return vagas
      .filter((v) => v.ativa && !swipadas.has(v.id))
      .map((vaga) => ({ vaga, score: calcularScore(profile, vaga) }))
      .sort((a, b) => b.score.score - a.score.score);
  }, [profile, vagas, swipes]);

  const totalMatches = swipes.filter((s) => s.matched).length;

  const aoSwipe = useCallback(
    async (vaga: Vaga, direcao: Direcao, score: ScoreResult) => {
      if (!profile) return;
      const matched = direcao !== "nope" && decidirMatch(direcao, score.score);
      const swipe = await store.addSwipe({
        vaga_id: vaga.id,
        direcao,
        score: score.score,
        matched,
        status: matched ? "match" : direcao === "nope" ? "descartada" : "em_analise",
      });
      const novos = [...swipes.filter((s) => s.vaga_id !== vaga.id), swipe];
      setSwipes(novos);
      if (matched) {
        await store.addMensagem({
          swipe_id: swipe.id,
          autor: "empresa",
          texto: mensagemBoasVindas(profile.nome, vaga),
        });
        setMatch({ vaga, swipe });
      }
      checarBadges(profile, novos, vagas);
    },
    [profile, swipes, vagas, checarBadges],
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
    checarBadges(p, swipes, vagas);
  }

  async function zerarDeck() {
    if (!confirm("Zerar o deck? Suas candidaturas e matches serão apagados.")) return;
    await store.resetSwipes();
    setSwipes([]);
    setTab("vagas");
  }

  async function apagarTudo() {
    if (!confirm("Apagar perfil, matches, badges e conversas? Não tem volta.")) return;
    await store.clearAll();
    setProfile(null);
    setSwipes([]);
    setBadges([]);
    setFase("onboarding");
    setTab("vagas");
  }

  // ------------------------------------------------------------ render
  if (fase === "carregando") {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="anim-pop acc-glow flex h-20 w-20 items-center justify-center rounded-[24px] border acc-border bg-card text-4xl">
          💚
        </div>
      </div>
    );
  }

  if (fase === "onboarding" || editando) {
    return <Onboarding inicial={editando ? profile : null} onDone={salvarPerfil} />;
  }

  if (!profile) return null;

  return (
    <div className="relative z-10 min-h-dvh">
      {tab === "vagas" && (
        <div
          key="vagas"
          className="anim-rise mx-auto flex max-w-md flex-col px-5 pt-[calc(env(safe-area-inset-top)+1rem)]"
          style={{ height: "calc(100dvh - 68px)" }}
        >
          <header className="mb-3 flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-display)] text-lg font-black">
              MATCH<span className="text-volt">JOBS</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-line bg-card px-3 py-1 text-[11px] font-bold text-muted">
                {cartas.length} {cartas.length === 1 ? "vaga" : "vagas"}
              </span>
              <button onClick={() => setTab("perfil")} aria-label="Abrir perfil">
                <Avatar foto={profile.foto} emoji={profile.emoji} size={34} />
              </button>
            </div>
          </header>

          {cartas.length > 0 ? (
            <Deck
              cartas={cartas}
              empresas={empresas}
              onSwipe={aoSwipe}
              onRewind={aoRewind}
              podeRewind={swipes.length > 0}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-calm.png"
                alt=""
                className="anim-float w-52 rounded-3xl opacity-90"
                style={{ maskImage: "radial-gradient(80% 80% at 50% 45%, #000 55%, transparent 100%)" }}
              />
              <p className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold">
                Você viu tudo por aqui!
              </p>
              <p className="mt-2 max-w-[240px] text-sm text-muted">
                Novas vagas chegam todo dia. Enquanto isso, confira seus matches.
              </p>
              <button
                onClick={() => setTab("matches")}
                className="acc-bg mt-6 rounded-2xl px-6 py-3 font-[family-name:var(--font-display)] text-xs font-bold transition active:scale-95"
              >
                VER MATCHES ({totalMatches})
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "matches" && (
        <div key="matches" className="anim-rise">
          <Matches
            swipes={swipes}
            vagas={vagas}
            empresas={empresas}
            onAbrirChat={(swipe, vaga) => setChat({ swipe, vaga })}
          />
        </div>
      )}

      {tab === "perfil" && (
        <div key="perfil" className="anim-rise">
          <ProfileView
            profile={profile}
            swipes={swipes}
            badges={badges}
            onEditar={() => setEditando(true)}
            onZerarDeck={zerarDeck}
            onApagarTudo={apagarTudo}
          />
        </div>
      )}

      <TabBar tab={tab} onChange={setTab} badgeMatches={totalMatches} />

      {match && (
        <MatchModal
          vaga={match.vaga}
          emojiUsuario={profile.emoji}
          fotoUsuario={profile.foto}
          score={match.swipe.score}
          onMensagem={() => {
            setChat({ swipe: match.swipe, vaga: match.vaga });
            setMatch(null);
          }}
          onContinuar={() => setMatch(null)}
        />
      )}

      {chat && (
        <Chat swipe={chat.swipe} vaga={chat.vaga} onVoltar={() => setChat(null)} />
      )}

      {!match && filaBadges.length > 0 && (
        <BadgeUnlock
          badge={filaBadges[0]}
          onFechar={() => setFilaBadges((f) => f.slice(1))}
        />
      )}
    </div>
  );
}
