"use client";

import { useMemo, useRef, useState } from "react";
import type { Experiencia, Formacao, Idioma, Modelo, Profile } from "@/lib/types";
import {
  AREAS,
  EMOJIS_AVATAR,
  MODELOS,
  SENIORIDADES,
  SKILLS_POR_AREA,
  brl,
} from "@/lib/data";
import { deviceId } from "@/lib/uid";
import { comprimirFoto } from "@/lib/img";
import { Avatar, BtnPrimary, Chip } from "./ui";
import CvImport from "./CvImport";

const NIVEIS_IDIOMA: Idioma["nivel"][] = [
  "básico",
  "intermediário",
  "avançado",
  "fluente",
  "nativo",
];

const TOTAL_PASSOS = 5;

export default function Onboarding({
  inicial,
  onDone,
}: {
  inicial: Profile | null;
  onDone: (p: Profile) => void;
}) {
  const [passo, setPasso] = useState(inicial ? 1 : 0);
  const [cvAberto, setCvAberto] = useState(false);
  const [cvImportado, setCvImportado] = useState(inicial?.cvImportado ?? false);

  // identidade
  const [nome, setNome] = useState(inicial?.nome ?? "");
  const [emoji, setEmoji] = useState(inicial?.emoji ?? "🚀");
  const [foto, setFoto] = useState<string | undefined>(inicial?.foto);
  const [headline, setHeadline] = useState(inicial?.headline ?? "");
  const [bio, setBio] = useState(inicial?.bio ?? "");
  // área
  const [area, setArea] = useState(inicial?.area ?? "");
  const [senioridade, setSenioridade] = useState(inicial?.senioridade ?? "");
  const [skills, setSkills] = useState<string[]>(inicial?.skills ?? []);
  // contato
  const [email, setEmail] = useState(inicial?.email ?? "");
  const [telefone, setTelefone] = useState(inicial?.telefone ?? "");
  const [linkedin, setLinkedin] = useState(inicial?.linkedin ?? "");
  // histórico
  const [experiencias, setExperiencias] = useState<Experiencia[]>(
    inicial?.experiencias ?? [],
  );
  const [formacao, setFormacao] = useState<Formacao[]>(inicial?.formacao ?? []);
  const [idiomas, setIdiomas] = useState<Idioma[]>(inicial?.idiomas ?? []);
  // combo final
  const [pretensao, setPretensao] = useState(inicial?.pretensao ?? 3000);
  const [modelo, setModelo] = useState<Modelo>(inicial?.modelo ?? "presencial");
  const [cidade, setCidade] = useState(inicial?.cidade ?? "");

  const fotoRef = useRef<HTMLInputElement>(null);

  const skillsDisponiveis = useMemo(() => {
    const daArea = area ? SKILLS_POR_AREA[area] ?? [] : [];
    const outras = Object.entries(SKILLS_POR_AREA)
      .filter(([a]) => a !== area)
      .flatMap(([, s]) => s);
    return [...new Set([...daArea, ...outras])].slice(0, 26);
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

  function aplicarCv(p: Partial<Profile>) {
    if (p.nome) setNome(p.nome);
    if (p.email) setEmail(p.email);
    if (p.telefone) setTelefone(p.telefone);
    if (p.linkedin) setLinkedin(p.linkedin);
    if (p.skills?.length) setSkills(p.skills.slice(0, 8));
    if (p.experiencias?.length) setExperiencias(p.experiencias);
    if (p.formacao?.length) setFormacao(p.formacao);
    setCvImportado(true);
    if (passo === 0) setPasso(1);
  }

  async function escolherFoto(file: File) {
    try {
      setFoto(await comprimirFoto(file));
    } catch (e) {
      console.error("Falha ao processar foto", e);
    }
  }

  function concluir() {
    onDone({
      id: deviceId(),
      nome: nome.trim(),
      emoji,
      foto,
      headline: headline.trim(),
      bio: bio.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      linkedin: linkedin.trim(),
      area,
      senioridade,
      cidade: cidade.trim(),
      modelo,
      pretensao,
      skills,
      experiencias,
      formacao,
      idiomas,
      cvImportado,
    });
  }

  const podeAvancar =
    passo === 0 ||
    (passo === 1 && nome.trim().length >= 2) ||
    (passo === 2 && !!area && !!senioridade) ||
    (passo === 3 && skills.length >= 3) ||
    passo === 4 ||
    passo === 5;

  const rotuloBotao =
    passo === 5 ? "VER VAGAS 🔥" : passo === 4 ? "CONTINUAR (pode pular)" : "CONTINUAR";

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      {/* splash */}
      {passo === 0 && (
        <div className="relative flex flex-1 flex-col items-center justify-center text-center">
          {/* orbes de fundo */}
          <span className="orb left-2 top-16 h-28 w-28" style={{ background: "#c8ff16" }} />
          <span className="orb right-4 top-40 h-20 w-20" style={{ background: "#4da6ff", animationDelay: "1.2s" }} />
          <span className="orb bottom-32 left-8 h-16 w-16" style={{ background: "#ff5c39", animationDelay: "2s" }} />

          {/* hero art (Higgsfield) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.png"
            alt=""
            className="anim-pop w-64"
            style={{
              maskImage:
                "radial-gradient(85% 85% at 50% 45%, #000 55%, transparent 98%)",
            }}
          />

          <h1 className="anim-rise -mt-4 font-[family-name:var(--font-display)] text-[34px] font-black leading-none">
            MATCH<span className="grad-text">JOBS</span>
          </h1>
          <p
            className="anim-rise mt-4 max-w-[270px] text-[15px] leading-relaxed text-muted"
            style={{ animationDelay: "0.1s" }}
          >
            Deslize. Dê match. <span className="font-bold text-ink">Trabalhe.</span>
            <br />
            De dev a confeiteira — todas as áreas, zero formulário chato.
          </p>

          <div className="anim-rise mt-9 w-full" style={{ animationDelay: "0.2s" }}>
            <BtnPrimary className="shine w-full" onClick={() => setPasso(1)}>
              COMEÇAR — LEVA 1 MINUTO
            </BtnPrimary>
            <button
              onClick={() => setCvAberto(true)}
              className="mt-2.5 w-full rounded-2xl border border-line py-3.5 text-sm font-semibold text-muted transition active:scale-95"
            >
              ⚡ Já tenho currículo — importar
            </button>
            <p className="mt-3 text-[11px] text-muted">
              Sem cadastro, sem e-mail obrigatório, sem PDF pro RH ignorar.
            </p>
          </div>

          <div className="anim-rise mt-8 flex items-center gap-3 text-[11px] font-semibold text-muted/70" style={{ animationDelay: "0.3s" }}>
            <a href="/empresa" className="transition hover:text-azul">Sou empresa</a>
            <span>·</span>
            <a href="/hunter" className="transition hover:text-coral">Sou hunter</a>
            <span>·</span>
            <a href="/admin" className="transition hover:text-viola">Admin</a>
          </div>
        </div>
      )}

      {passo > 0 && (
        <>
          {/* progresso */}
          <div className="mb-7 flex gap-1.5">
            {Array.from({ length: TOTAL_PASSOS }, (_, i) => i + 1).map((p) => (
              <div
                key={p}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: p <= passo ? "var(--accent)" : "#26263a" }}
              />
            ))}
          </div>

          {/* 1 — identidade */}
          {passo === 1 && (
            <div className="stagger flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                Quem tá no jogo?
              </h2>
              <p className="mb-5 mt-1 text-sm text-muted">
                Seu cartão de visitas no deck das empresas.
                {cvImportado && (
                  <span className="ml-1 font-bold text-volt">CV importado ✓</span>
                )}
              </p>

              <div className="mb-5 flex items-center gap-4">
                <button onClick={() => fotoRef.current?.click()} className="relative">
                  <Avatar foto={foto} emoji={emoji} size={84} className="rounded-[26px]" />
                  <span className="acc-bg absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-sm">
                    📷
                  </span>
                </button>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">
                    Foto (opcional)
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-muted/80">
                    Fica só no seu aparelho. Sem foto? Escolhe um emoji:
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {EMOJIS_AVATAR.slice(0, 6).map((e) => (
                      <button
                        key={e}
                        onClick={() => { setEmoji(e); setFoto(undefined); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border text-base transition active:scale-90"
                        style={{
                          borderColor: emoji === e && !foto ? "var(--accent)" : "#26263a",
                          background: emoji === e && !foto ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "#161622",
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  ref={fotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) escolherFoto(f);
                  }}
                />
              </div>

              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                Seu nome *
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como te chamam"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />

              <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-muted">
                Headline
              </label>
              <input
                value={headline}
                maxLength={60}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex.: Confeiteira que transforma açúcar em arte"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />

              <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-muted">
                Bio
              </label>
              <textarea
                value={bio}
                maxLength={240}
                rows={3}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Quem é você em 2 frases? As empresas leem isso antes do match."
                className="w-full resize-none rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />
              <p className="mt-1 text-right text-[10px] text-muted">{bio.length}/240</p>

              {!cvImportado && (
                <button
                  onClick={() => setCvAberto(true)}
                  className="mt-1 w-full rounded-2xl border border-dashed border-line py-3 text-xs font-bold text-muted transition active:scale-95"
                >
                  ⚡ Preencher tudo importando meu CV
                </button>
              )}
            </div>
          )}

          {/* 2 — área e momento */}
          {passo === 2 && (
            <div className="flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                Qual é a sua praia?
              </h2>
              <p className="mb-5 mt-1 text-sm text-muted">
                Todas as áreas valem — de tecnologia a gastronomia.
              </p>
              <div className="flex max-h-[38vh] flex-wrap content-start gap-2 overflow-y-auto pr-1">
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
                  <Chip key={s} ativo={senioridade === s} onClick={() => setSenioridade(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 3 — skills */}
          {passo === 3 && (
            <div className="flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                No que você é bom?
              </h2>
              <p className="mb-5 mt-1 text-sm text-muted">
                De 3 a 8 skills — são elas que geram seus matches.{" "}
                <span className="acc-text font-bold">{skills.length}/8</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {skillsDisponiveis.map((s) => (
                  <Chip key={s} ativo={skills.includes(s)} onClick={() => toggleSkill(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* 4 — contato */}
          {passo === 4 && (
            <div className="stagger flex-1">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                Como te acham?
              </h2>
              <p className="mb-5 mt-1 text-sm text-muted">
                Opcional — aparece só para empresas com match.
              </p>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                E-mail
              </label>
              <input
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />
              <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-muted">
                WhatsApp / Telefone
              </label>
              <input
                value={telefone}
                type="tel"
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(19) 99999-9999"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />
              <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-muted">
                LinkedIn
              </label>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/voce"
                className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
              />
            </div>
          )}

          {/* 5 — histórico + combo final */}
          {passo === 5 && (
            <div className="flex-1 space-y-5 overflow-y-auto pb-2 pr-1">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                  Fecha o combo
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Experiências contam pontos com as empresas.
                </p>
              </div>

              {/* experiências */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                  Experiências · {experiencias.length}
                </p>
                {experiencias.map((ex, i) => (
                  <div key={i} className="mb-2 rounded-2xl border border-line bg-card p-3">
                    <div className="flex gap-2">
                      <input
                        value={ex.cargo}
                        onChange={(e) =>
                          setExperiencias((l) =>
                            l.map((x, j) => (j === i ? { ...x, cargo: e.target.value } : x)),
                          )
                        }
                        placeholder="Cargo"
                        className="min-w-0 flex-1 rounded-lg border border-line bg-bg2 px-2.5 py-2 text-sm outline-none focus:border-volt/60"
                      />
                      <button
                        onClick={() => setExperiencias((l) => l.filter((_, j) => j !== i))}
                        className="text-rosa/70"
                        aria-label="Remover experiência"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={ex.empresa}
                        onChange={(e) =>
                          setExperiencias((l) =>
                            l.map((x, j) => (j === i ? { ...x, empresa: e.target.value } : x)),
                          )
                        }
                        placeholder="Empresa"
                        className="min-w-0 flex-1 rounded-lg border border-line bg-bg2 px-2.5 py-2 text-sm outline-none focus:border-volt/60"
                      />
                      <input
                        value={ex.inicio}
                        onChange={(e) =>
                          setExperiencias((l) =>
                            l.map((x, j) => (j === i ? { ...x, inicio: e.target.value } : x)),
                          )
                        }
                        placeholder="2022"
                        className="w-16 rounded-lg border border-line bg-bg2 px-2 py-2 text-center text-sm outline-none focus:border-volt/60"
                      />
                      <input
                        value={ex.fim ?? ""}
                        onChange={(e) =>
                          setExperiencias((l) =>
                            l.map((x, j) =>
                              j === i ? { ...x, fim: e.target.value || undefined } : x,
                            ),
                          )
                        }
                        placeholder="atual"
                        className="w-16 rounded-lg border border-line bg-bg2 px-2 py-2 text-center text-sm outline-none focus:border-volt/60"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setExperiencias((l) => [...l, { cargo: "", empresa: "", inicio: "" }])
                  }
                  className="w-full rounded-xl border border-dashed border-line py-2.5 text-xs font-bold text-muted transition active:scale-95"
                >
                  + adicionar experiência
                </button>
              </div>

              {/* formação */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                  Formação · {formacao.length}
                </p>
                {formacao.map((f, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input
                      value={f.curso}
                      onChange={(e) =>
                        setFormacao((l) =>
                          l.map((x, j) => (j === i ? { ...x, curso: e.target.value } : x)),
                        )
                      }
                      placeholder="Curso / formação"
                      className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-volt/60"
                    />
                    <input
                      value={f.instituicao}
                      onChange={(e) =>
                        setFormacao((l) =>
                          l.map((x, j) => (j === i ? { ...x, instituicao: e.target.value } : x)),
                        )
                      }
                      placeholder="Instituição"
                      className="w-28 rounded-xl border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-volt/60"
                    />
                    <button
                      onClick={() => setFormacao((l) => l.filter((_, j) => j !== i))}
                      className="text-rosa/70"
                      aria-label="Remover formação"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setFormacao((l) => [...l, { curso: "", instituicao: "" }])}
                  className="w-full rounded-xl border border-dashed border-line py-2.5 text-xs font-bold text-muted transition active:scale-95"
                >
                  + adicionar formação
                </button>
              </div>

              {/* idiomas */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                  Idiomas · {idiomas.length}
                </p>
                {idiomas.map((idm, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input
                      value={idm.idioma}
                      onChange={(e) =>
                        setIdiomas((l) =>
                          l.map((x, j) => (j === i ? { ...x, idioma: e.target.value } : x)),
                        )
                      }
                      placeholder="Inglês"
                      className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2.5 text-sm outline-none focus:border-volt/60"
                    />
                    <select
                      value={idm.nivel}
                      onChange={(e) =>
                        setIdiomas((l) =>
                          l.map((x, j) =>
                            j === i ? { ...x, nivel: e.target.value as Idioma["nivel"] } : x,
                          ),
                        )
                      }
                      className="rounded-xl border border-line bg-card px-2 py-2.5 text-sm outline-none"
                    >
                      {NIVEIS_IDIOMA.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIdiomas((l) => l.filter((_, j) => j !== i))}
                      className="text-rosa/70"
                      aria-label="Remover idioma"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setIdiomas((l) => [...l, { idioma: "", nivel: "intermediário" }])
                  }
                  className="w-full rounded-xl border border-dashed border-line py-2.5 text-xs font-bold text-muted transition active:scale-95"
                >
                  + adicionar idioma
                </button>
              </div>

              {/* pretensão / modelo / cidade */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                  Pretensão salarial — <span className="acc-text">{brl(pretensao)}/mês</span>
                </label>
                <input
                  type="range"
                  min={1500}
                  max={30000}
                  step={500}
                  value={pretensao}
                  onChange={(e) => setPretensao(Number(e.target.value))}
                  style={{ ["--fill" as string]: `${((pretensao - 1500) / 28500) * 100}%` }}
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted">
                  <span>R$ 1.500</span>
                  <span>R$ 30.000</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                  Modelo de trabalho
                </label>
                <div className="flex gap-2">
                  {MODELOS.map((m) => (
                    <Chip key={m.value} ativo={modelo === m.value} onClick={() => setModelo(m.value)}>
                      {m.icon} {m.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted">
                  Sua cidade
                </label>
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex.: Indaiatuba, SP"
                  className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 text-[15px] outline-none placeholder:text-muted/50 focus:border-volt/60"
                />
              </div>
            </div>
          )}

          {/* navegação */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setPasso((p) => p - 1)}
              className="rounded-2xl border border-line px-5 py-4 text-sm font-semibold text-muted transition active:scale-95"
            >
              Voltar
            </button>
            <BtnPrimary
              disabled={!podeAvancar}
              className="flex-1"
              onClick={() => (passo === TOTAL_PASSOS ? concluir() : setPasso((p) => p + 1))}
            >
              {rotuloBotao}
            </BtnPrimary>
          </div>
        </>
      )}

      <CvImport
        aberto={cvAberto}
        onFechar={() => setCvAberto(false)}
        onAplicar={aplicarCv}
      />
    </div>
  );
}
