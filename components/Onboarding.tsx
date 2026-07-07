"use client";

import { useMemo, useState } from "react";
import type { Modelo, Profile } from "@/lib/types";
import {
  AREAS,
  EMOJIS_AVATAR,
  MODELOS,
  SENIORIDADES,
  SKILLS_POR_AREA,
  brl,
} from "@/lib/data";
import { deviceId } from "@/lib/uid";

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95"
      style={{
        borderColor: ativo ? "#c8ff16" : "#26263a",
        background: ativo ? "rgba(200,255,22,0.14)" : "#161622",
        color: ativo ? "#c8ff16" : "#9c9cb0",
      }}
    >
      {children}
    </button>
  );
}

export default function Onboarding({
  inicial,
  onDone,
}: {
  inicial: Profile | null;
  onDone: (p: Profile) => void;
}) {
  const [passo, setPasso] = useState(inicial ? 1 : 0);
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [emoji, setEmoji] = useState(inicial?.emoji ?? "🚀");
  const [area, setArea] = useState(inicial?.area ?? "");
  const [senioridade, setSenioridade] = useState(inicial?.senioridade ?? "");
  const [skills, setSkills] = useState<string[]>(inicial?.skills ?? []);
  const [pretensao, setPretensao] = useState(inicial?.pretensao ?? 5000);
  const [modelo, setModelo] = useState<Modelo>(inicial?.modelo ?? "remoto");
  const [cidade, setCidade] = useState(inicial?.cidade ?? "");

  const skillsDisponiveis = useMemo(() => {
    const daArea = area ? SKILLS_POR_AREA[area] ?? [] : [];
    const outras = Object.entries(SKILLS_POR_AREA)
      .filter(([a]) => a !== area)
      .flatMap(([, s]) => s);
    return [...new Set([...daArea, ...outras])].slice(0, 24);
  }, [area]);

  function toggleSkill(s: string) {
    setSkills((prev) =>
      prev.includes(s)
        ? prev.filter((x) => x !== s)
        : prev.length >= 8
          ? prev
          : [...prev, s],
    );
  }

  function concluir() {
    onDone({
      id: deviceId(),
      nome: nome.trim(),
      area,
      senioridade,
      cidade: cidade.trim(),
      modelo,
      pretensao,
      skills,
      emoji,
    });
  }

  const podeAvancar =
    passo === 0 ||
    (passo === 1 && nome.trim().length >= 2 && area && senioridade) ||
    (passo === 2 && skills.length >= 3) ||
    passo === 3;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-[calc(env(safe-area-inset-top)+2rem)]">
      {/* splash */}
      {passo === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="anim-pop mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-volt/40 bg-card text-5xl shadow-[0_0_60px_rgba(200,255,22,0.2)]">
            🤸
          </div>
          <h1 className="anim-rise font-[family-name:var(--font-display)] text-5xl font-black leading-none">
            TRAMPO
            <span className="text-volt">LIM</span>
          </h1>
          <p className="anim-rise mt-4 max-w-[260px] text-[15px] leading-relaxed text-muted" style={{ animationDelay: "0.1s" }}>
            Deslize. Dê match.{" "}
            <span className="font-bold text-ink">Trabalhe.</span>
            <br />
            Chega de formulário de 40 minutos.
          </p>
          <div className="anim-rise mt-10 w-full" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => setPasso(1)}
              className="w-full rounded-2xl bg-volt py-4 font-[family-name:var(--font-display)] text-sm font-bold text-bg transition active:scale-95"
            >
              COMEÇAR — LEVA 1 MINUTO
            </button>
            <p className="mt-3 text-[11px] text-muted">
              Sem cadastro, sem e-mail, sem currículo em PDF. Sério.
            </p>
          </div>
        </div>
      )}

      {passo > 0 && (
        <>
          {/* progresso */}
          <div className="mb-8 flex gap-1.5">
            {[1, 2, 3].map((p) => (
              <div
                key={p}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ background: p <= passo ? "#c8ff16" : "#26263a" }}
              />
            ))}
          </div>

          {passo === 1 && (
            <div className="stagger flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                Quem tá no jogo?
              </h2>
              <p className="mb-6 mt-1 text-sm text-muted">
                O básico para as empresas te conhecerem.
              </p>

              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Seu nome
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como te chamam"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />

              <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-muted">
                Seu avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS_AVATAR.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition active:scale-90"
                    style={{
                      borderColor: emoji === e ? "#c8ff16" : "#26263a",
                      background: emoji === e ? "rgba(200,255,22,0.14)" : "#161622",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-muted">
                Sua área
              </label>
              <div className="flex flex-wrap gap-2">
                {AREAS.map((a) => (
                  <Chip key={a} ativo={area === a} onClick={() => setArea(a)}>
                    {a}
                  </Chip>
                ))}
              </div>

              <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-muted">
                Seu momento
              </label>
              <div className="flex flex-wrap gap-2">
                {SENIORIDADES.map((s) => (
                  <Chip
                    key={s}
                    ativo={senioridade === s}
                    onClick={() => setSenioridade(s)}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {passo === 2 && (
            <div className="flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                No que você é bom?
              </h2>
              <p className="mb-6 mt-1 text-sm text-muted">
                Escolha de 3 a 8 skills — são elas que geram seus matches.{" "}
                <span className="font-bold text-volt">{skills.length}/8</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsDisponiveis.map((s) => (
                  <Chip
                    key={s}
                    ativo={skills.includes(s)}
                    onClick={() => toggleSkill(s)}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {passo === 3 && (
            <div className="stagger flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                Fecha o combo
              </h2>
              <p className="mb-6 mt-1 text-sm text-muted">
                Salário, modelo e onde você está.
              </p>

              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Pretensão salarial —{" "}
                <span className="text-volt">{brl(pretensao)}/mês</span>
              </label>
              <input
                type="range"
                min={1500}
                max={30000}
                step={500}
                value={pretensao}
                onChange={(e) => setPretensao(Number(e.target.value))}
                style={{
                  ["--fill" as string]: `${((pretensao - 1500) / 28500) * 100}%`,
                }}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>R$ 1.500</span>
                <span>R$ 30.000</span>
              </div>

              <label className="mb-1.5 mt-6 block text-xs font-bold uppercase tracking-wider text-muted">
                Modelo de trabalho
              </label>
              <div className="flex gap-2">
                {MODELOS.map((m) => (
                  <Chip
                    key={m.value}
                    ativo={modelo === m.value}
                    onClick={() => setModelo(m.value)}
                  >
                    {m.icon} {m.label}
                  </Chip>
                ))}
              </div>

              <label className="mb-1.5 mt-6 block text-xs font-bold uppercase tracking-wider text-muted">
                Sua cidade
              </label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Ex.: Indaiatuba, SP"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />
            </div>
          )}

          {/* navegação */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setPasso((p) => p - 1)}
              className="rounded-2xl border border-line px-5 py-4 text-sm font-semibold text-muted transition active:scale-95"
            >
              Voltar
            </button>
            <button
              disabled={!podeAvancar}
              onClick={() => (passo === 3 ? concluir() : setPasso((p) => p + 1))}
              className="flex-1 rounded-2xl bg-volt py-4 font-[family-name:var(--font-display)] text-sm font-bold text-bg transition active:scale-95 disabled:opacity-30"
            >
              {passo === 3 ? "VER VAGAS 🔥" : "CONTINUAR"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
