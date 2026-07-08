"use client";

import { useEffect, useMemo, useState } from "react";
import type { Empresa, LikeEmpresa, Modelo, Profile, Swipe, Talento, Vaga } from "@/lib/types";
import { store } from "@/lib/store";
import { calcularScore } from "@/lib/match";
import { AREAS, brl, faixaSalarial, MODELOS, SENIORIDADES, SKILLS_POR_AREA } from "@/lib/data";
import {
  Avatar,
  BtnPrimary,
  Chip,
  EmptyState,
  PortalShell,
  ScoreRing,
  SeloTag,
  Sheet,
  Stat,
} from "@/components/ui";

const K_ATIVA = "matchjobs:empresa_ativa";
type Aba = "geral" | "vagas" | "candidatos";

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

export default function PortalEmpresa() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [talentos, setTalentos] = useState<Talento[]>([]);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [likes, setLikes] = useState<LikeEmpresa[]>([]);
  const [perfilLocal, setPerfilLocal] = useState<Profile | null>(null);
  const [ativaId, setAtivaId] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>("geral");
  const [busca, setBusca] = useState("");
  const [novaAberta, setNovaAberta] = useState(false);
  const [vagaAlvo, setVagaAlvo] = useState<string>("");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    (async () => {
      const [e, v, t, s, l, p] = await Promise.all([
        store.getEmpresas(),
        store.getVagas(),
        store.getTalentos(),
        store.getSwipes(),
        store.getLikesEmpresa(),
        store.getProfile(),
      ]);
      setEmpresas(e);
      setVagas(v);
      setTalentos(t);
      setSwipes(s);
      setLikes(l);
      setPerfilLocal(p);
      setAtivaId(localStorage.getItem(K_ATIVA));
      setCarregado(true);
    })();
  }, []);

  const ativa = empresas.find((e) => e.id === ativaId) ?? null;
  const minhasVagas = useMemo(
    () => vagas.filter((v) => v.empresa_id === ativaId),
    [vagas, ativaId],
  );
  const curtidasRecebidas = useMemo(() => {
    const ids = new Set(minhasVagas.map((v) => v.id));
    return swipes.filter((s) => s.direcao !== "nope" && ids.has(s.vaga_id));
  }, [swipes, minhasVagas]);

  const vagaSelecionada =
    minhasVagas.find((v) => v.id === vagaAlvo) ?? minhasVagas[0] ?? null;

  useEffect(() => {
    if (!vagaAlvo && minhasVagas[0]) setVagaAlvo(minhasVagas[0].id);
  }, [minhasVagas, vagaAlvo]);

  function selecionar(id: string) {
    localStorage.setItem(K_ATIVA, id);
    setAtivaId(id);
    setAba("geral");
    setVagaAlvo("");
  }

  async function toggleAtiva(v: Vaga) {
    await store.updateVaga(v.id, { ativa: !v.ativa });
    setVagas((prev) =>
      prev.map((x) => (x.id === v.id ? { ...x, ativa: !v.ativa } : x)),
    );
  }

  async function curtirTalento(t: Talento) {
    if (!ativaId) return;
    await store.likeTalento(ativaId, t.id);
    setLikes(await store.getLikesEmpresa());
  }

  if (!carregado) {
    return (
      <PortalShell portal="empresa" titulo="Portal da Empresa">
        <div className="space-y-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      </PortalShell>
    );
  }

  /* ------------------------------------------------ seleção de empresa */
  if (!ativa) {
    const filtradas = empresas.filter(
      (e) =>
        !busca ||
        `${e.nome} ${e.setor} ${e.cidade}`.toLowerCase().includes(busca.toLowerCase()),
    );
    return (
      <PortalShell
        portal="empresa"
        titulo="Portal da Empresa"
        sub="Escolha sua empresa para entrar no painel (demo: qualquer uma)"
      >
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, setor ou cidade…"
          className="acc-border mb-4 w-full rounded-2xl border bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50"
        />
        <div className="stagger space-y-2.5">
          {filtradas.map((e) => (
            <button
              key={e.id}
              onClick={() => selecionar(e.id)}
              className="glass flex w-full items-center gap-3.5 rounded-2xl p-4 text-left transition hover:border-azul/50 active:scale-[0.98]"
            >
              <Avatar emoji={e.logo} cor={e.cor} size={50} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{e.nome}</p>
                <p className="truncate text-xs text-muted">
                  {e.setor} · {e.cidade} · {e.tamanho}
                </p>
                {e.selos.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {e.selos.map((s) => (
                      <SeloTag key={s} id={s} small />
                    ))}
                  </div>
                )}
              </div>
              <span className="acc-text text-lg">→</span>
            </button>
          ))}
        </div>
      </PortalShell>
    );
  }

  /* --------------------------------------------------------- dashboard */
  return (
    <PortalShell
      portal="empresa"
      titulo={ativa.nome}
      sub={`${ativa.setor} · ${ativa.cidade}`}
      direita={
        <button
          onClick={() => {
            localStorage.removeItem(K_ATIVA);
            setAtivaId(null);
          }}
          className="rounded-full border border-line px-3 py-1.5 text-[11px] font-bold text-muted transition active:scale-95"
        >
          trocar
        </button>
      }
    >
      <div className="mb-5 flex gap-2">
        <Chip ativo={aba === "geral"} onClick={() => setAba("geral")}>
          Visão geral
        </Chip>
        <Chip ativo={aba === "vagas"} onClick={() => setAba("vagas")}>
          Vagas · {minhasVagas.length}
        </Chip>
        <Chip ativo={aba === "candidatos"} onClick={() => setAba("candidatos")}>
          Candidatos
        </Chip>
      </div>

      {aba === "geral" && (
        <div className="stagger space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <Stat n={minhasVagas.filter((v) => v.ativa).length} l="ativas" />
            <Stat n={talentos.filter((t) => t.disponivel).length} l="no radar" />
            <Stat n={curtidasRecebidas.length} l="curtidas" />
            <Stat n={likes.filter((l) => l.empresa_id === ativa.id).length} l="matches" />
          </div>

          <div
            className="glass shine relative overflow-hidden rounded-3xl p-5"
            style={{ borderColor: `${ativa.cor}44` }}
          >
            <div className="flex items-center gap-3">
              <Avatar emoji={ativa.logo} cor={ativa.cor} size={56} />
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold">
                  {ativa.nome}
                </p>
                <p className="text-xs italic text-muted">“{ativa.slogan}”</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink/90">{ativa.sobre}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ativa.selos.map((s) => (
                <SeloTag key={s} id={s} />
              ))}
            </div>
          </div>

          {curtidasRecebidas.length > 0 && perfilLocal && (
            <div className="rounded-2xl border border-volt/30 bg-volt/5 p-4">
              <p className="text-sm font-bold text-volt">
                🔥 {perfilLocal.nome} curtiu{" "}
                {curtidasRecebidas.length === 1
                  ? "uma vaga sua"
                  : `${curtidasRecebidas.length} vagas suas`}
                !
              </p>
              <p className="mt-1 text-xs text-muted">
                Vai na aba Candidatos e curte de volta pra fechar o match.
              </p>
            </div>
          )}
        </div>
      )}

      {aba === "vagas" && (
        <div className="space-y-2.5">
          <BtnPrimary className="w-full" onClick={() => setNovaAberta(true)}>
            + PUBLICAR NOVA VAGA
          </BtnPrimary>
          {minhasVagas.length === 0 && (
            <EmptyState
              emoji="📭"
              titulo="Nenhuma vaga ainda"
              sub="Publique a primeira e apareça no deck dos candidatos."
            />
          )}
          <div className="stagger space-y-2.5">
            {minhasVagas.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4"
                style={{ opacity: v.ativa ? 1 : 0.55 }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">{v.cargo}</p>
                  <p className="truncate text-xs text-muted">
                    {v.area} · {v.senioridade} · {faixaSalarial(v.salario_min, v.salario_max)}
                  </p>
                </div>
                <button
                  onClick={() => toggleAtiva(v)}
                  className="relative h-7 w-12 rounded-full transition"
                  style={{ background: v.ativa ? "var(--accent)" : "#26263a" }}
                  aria-label={v.ativa ? "Pausar vaga" : "Ativar vaga"}
                >
                  <span
                    className="absolute top-1 h-5 w-5 rounded-full bg-bg transition-all"
                    style={{ left: v.ativa ? 26 : 4 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {aba === "candidatos" && (
        <div className="space-y-4">
          {minhasVagas.length > 0 && (
            <select
              value={vagaSelecionada?.id ?? ""}
              onChange={(e) => setVagaAlvo(e.target.value)}
              className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none"
            >
              {minhasVagas.map((v) => (
                <option key={v.id} value={v.id}>
                  Pontuar para: {v.cargo}
                </option>
              ))}
            </select>
          )}

          {/* candidato local que curtiu */}
          {perfilLocal &&
            curtidasRecebidas.map((s) => {
              const v = minhasVagas.find((x) => x.id === s.vaga_id);
              if (!v) return null;
              return (
                <div
                  key={s.id}
                  className="anim-pop rounded-2xl border border-volt/40 bg-volt/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar foto={perfilLocal.foto} emoji={perfilLocal.emoji} size={50} cor="#c8ff16" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold">{perfilLocal.nome}</p>
                      <p className="truncate text-xs text-muted">
                        {perfilLocal.headline || `${perfilLocal.area} · ${perfilLocal.senioridade}`}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-volt px-2 py-0.5 text-[9px] font-black text-bg">
                        🔥 CURTIU: {v.cargo.toUpperCase()}
                      </span>
                    </div>
                    <ScoreRing score={s.score} size={44} stroke={4} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {s.matched
                      ? "✓ Vocês já deram match! O papo rola no app do candidato."
                      : "Candidatura em análise — o match fecha na regra de score do MVP."}
                  </p>
                </div>
              );
            })}

          {/* pool de talentos */}
          <div className="stagger space-y-2.5">
            {talentos
              .filter((t) => t.disponivel)
              .map((t) => ({
                t,
                score: vagaSelecionada
                  ? calcularScore(perfilDe(t), vagaSelecionada).score
                  : 0,
              }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 20)
              .map(({ t, score }) => {
                const jaCurtiu = likes.some(
                  (l) => l.empresa_id === ativa.id && l.talento_id === t.id,
                );
                return (
                  <div key={t.id} className="rounded-2xl border border-line bg-card p-4">
                    <div className="flex items-center gap-3">
                      <Avatar emoji={t.emoji} size={50} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold">{t.nome}</p>
                        <p className="truncate text-xs text-muted">{t.headline}</p>
                        <p className="truncate text-[11px] text-muted/80">
                          {t.senioridade} · {t.cidade} · {brl(t.pretensao)}
                        </p>
                      </div>
                      {vagaSelecionada && <ScoreRing score={score} size={44} stroke={4} />}
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {t.skills.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-bg2 px-2 py-0.5 text-[10px] font-semibold text-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => curtirTalento(t)}
                      disabled={jaCurtiu}
                      className={`mt-3 w-full rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                        jaCurtiu ? "anim-pop acc-border acc-text border" : "acc-bg"
                      }`}
                    >
                      {jaCurtiu ? "✓ MATCH ENVIADO" : "💙 CURTIR DE VOLTA"}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <NovaVaga
        aberta={novaAberta}
        empresa={ativa}
        onFechar={() => setNovaAberta(false)}
        onCriada={(v) => {
          setVagas((prev) => [v, ...prev]);
          setNovaAberta(false);
          setAba("vagas");
        }}
      />
    </PortalShell>
  );
}

/* ------------------------------------------------------ form nova vaga */
function NovaVaga({
  aberta,
  empresa,
  onFechar,
  onCriada,
}: {
  aberta: boolean;
  empresa: Empresa;
  onFechar: () => void;
  onCriada: (v: Vaga) => void;
}) {
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState<string>("");
  const [senioridade, setSenioridade] = useState("Pleno");
  const [salMin, setSalMin] = useState(2500);
  const [salMax, setSalMax] = useState(5000);
  const [modelo, setModelo] = useState<Modelo>("presencial");
  const [cidade, setCidade] = useState(empresa.cidade);
  const [skills, setSkills] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [beneficios, setBeneficios] = useState(["", "", ""]);

  const skillsDaArea = area ? SKILLS_POR_AREA[area] ?? [] : [];
  const valida =
    cargo.trim().length >= 3 && !!area && skills.length >= 2 && descricao.trim().length >= 10;

  async function criar() {
    const vaga = await store.addVaga({
      empresa_id: empresa.id,
      empresa: empresa.nome,
      logo: empresa.logo,
      cor: empresa.cor,
      cargo: cargo.trim(),
      area,
      senioridade,
      salario_min: Math.min(salMin, salMax),
      salario_max: Math.max(salMin, salMax),
      modelo,
      cidade: cidade.trim() || empresa.cidade,
      skills,
      descricao: descricao.trim(),
      beneficios: beneficios.map((b) => b.trim()).filter(Boolean),
      ativa: true,
    });
    onCriada(vaga);
    setCargo("");
    setSkills([]);
    setDescricao("");
  }

  return (
    <Sheet aberto={aberta} onFechar={onFechar} titulo="Publicar nova vaga">
      <div className="space-y-4 pb-2">
        <input
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          placeholder="Cargo — ex.: Cozinheiro(a) de produção"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50"
        />
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted">
            Área
          </label>
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setSkills([]);
            }}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none"
          >
            <option value="">Selecione…</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted">
            Senioridade
          </label>
          <div className="flex flex-wrap gap-1.5">
            {SENIORIDADES.map((s) => (
              <Chip key={s} small ativo={senioridade === s} onClick={() => setSenioridade(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted">
            Faixa salarial —{" "}
            <span className="acc-text">
              {brl(Math.min(salMin, salMax))} a {brl(Math.max(salMin, salMax))}
            </span>
          </label>
          <input
            type="range"
            min={1500}
            max={30000}
            step={250}
            value={salMin}
            onChange={(e) => setSalMin(Number(e.target.value))}
            style={{ ["--fill" as string]: `${((salMin - 1500) / 28500) * 100}%` }}
          />
          <input
            type="range"
            min={1500}
            max={30000}
            step={250}
            value={salMax}
            onChange={(e) => setSalMax(Number(e.target.value))}
            className="mt-2"
            style={{ ["--fill" as string]: `${((salMax - 1500) / 28500) * 100}%` }}
          />
        </div>
        <div className="flex gap-2">
          {MODELOS.map((m) => (
            <Chip key={m.value} small ativo={modelo === m.value} onClick={() => setModelo(m.value)}>
              {m.icon} {m.label}
            </Chip>
          ))}
        </div>
        <input
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          placeholder="Cidade"
          className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50"
        />
        {area && (
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted">
              Skills da vaga ({skills.length}/6)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {skillsDaArea.map((s) => (
                <Chip
                  key={s}
                  small
                  ativo={skills.includes(s)}
                  onClick={() =>
                    setSkills((prev) =>
                      prev.includes(s)
                        ? prev.filter((x) => x !== s)
                        : prev.length >= 6
                          ? prev
                          : [...prev, s],
                    )
                  }
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        )}
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          placeholder="Descrição com personalidade — por que essa vaga é boa de verdade?"
          className="w-full resize-none rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50"
        />
        {beneficios.map((b, i) => (
          <input
            key={i}
            value={b}
            onChange={(e) =>
              setBeneficios((l) => l.map((x, j) => (j === i ? e.target.value : x)))
            }
            placeholder={`Benefício ${i + 1}`}
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted/50"
          />
        ))}
        <BtnPrimary className="w-full" disabled={!valida} onClick={criar}>
          PUBLICAR VAGA 🚀
        </BtnPrimary>
      </div>
    </Sheet>
  );
}
