"use client";

import { useRef, useState } from "react";
import type { Profile } from "@/lib/types";
import { extrairTexto, parsearCv, type CvParseado } from "@/lib/cv";
import { BtnPrimary, Chip, Sheet } from "./ui";

type Estado = "vazio" | "lendo" | "pronto" | "erro";

export default function CvImport({
  aberto,
  onFechar,
  onAplicar,
}: {
  aberto: boolean;
  onFechar: () => void;
  onAplicar: (parcial: Partial<Profile>) => void;
}) {
  const [estado, setEstado] = useState<Estado>("vazio");
  const [cv, setCv] = useState<CvParseado | null>(null);
  const [skillsSel, setSkillsSel] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function processar(file: File) {
    setEstado("lendo");
    try {
      const texto = await extrairTexto(file);
      if (!texto.trim()) throw new Error("vazio");
      const parseado = parsearCv(texto);
      setCv(parseado);
      setSkillsSel(parseado.skills);
      setEstado("pronto");
    } catch (e) {
      console.error("Falha ao ler CV", e);
      setEstado("erro");
    }
  }

  function aplicar() {
    if (!cv) return;
    onAplicar({
      ...(cv.nome ? { nome: cv.nome } : {}),
      ...(cv.email ? { email: cv.email } : {}),
      ...(cv.telefone ? { telefone: cv.telefone } : {}),
      ...(cv.linkedin ? { linkedin: cv.linkedin } : {}),
      ...(skillsSel.length ? { skills: skillsSel } : {}),
      ...(cv.experiencias.length ? { experiencias: cv.experiencias } : {}),
      ...(cv.formacao.length ? { formacao: cv.formacao } : {}),
      cvImportado: true,
    });
    reset();
    onFechar();
  }

  function reset() {
    setEstado("vazio");
    setCv(null);
    setSkillsSel([]);
  }

  return (
    <Sheet aberto={aberto} onFechar={() => { reset(); onFechar(); }} titulo="Importar currículo">
      {estado === "vazio" && (
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="acc-border flex w-full flex-col items-center gap-3 rounded-3xl border-2 border-dashed bg-bg2/50 px-6 py-10 transition active:scale-[0.98]"
          >
            <span className="text-5xl">📄</span>
            <span className="font-[family-name:var(--font-display)] text-sm font-bold">
              Toque para escolher o arquivo
            </span>
            <span className="text-xs text-muted">PDF ou TXT · máx. 6 páginas</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processar(f);
            }}
          />
          <p className="mt-4 text-center text-[11px] leading-relaxed text-muted">
            🔒 Seu CV é processado <span className="font-bold text-ink">100% no seu aparelho</span>.
            <br />
            Nada é enviado a nenhum servidor.
          </p>
        </div>
      )}

      {estado === "lendo" && (
        <div className="space-y-3 py-4">
          <div className="skeleton h-6 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-full rounded-lg" />
          <div className="skeleton h-4 w-5/6 rounded-lg" />
          <div className="skeleton h-4 w-4/6 rounded-lg" />
          <p className="pt-2 text-center text-xs text-muted">
            Lendo seu currículo por aqui mesmo…
          </p>
        </div>
      )}

      {estado === "erro" && (
        <div className="py-6 text-center">
          <p className="text-4xl">😵‍💫</p>
          <p className="mt-3 font-bold">Não consegui ler esse arquivo</p>
          <p className="mt-1 text-sm text-muted">
            Tenta um PDF com texto (não escaneado) ou um .txt.
          </p>
          <BtnPrimary className="mt-5 w-full" onClick={reset}>
            TENTAR OUTRO ARQUIVO
          </BtnPrimary>
        </div>
      )}

      {estado === "pronto" && cv && (
        <div className="stagger space-y-4 pb-2">
          <p className="text-xs text-muted">
            Achei isso aqui — revisa e edita o que quiser antes de aplicar:
          </p>

          {(
            [
              ["Nome", "nome"],
              ["E-mail", "email"],
              ["Telefone", "telefone"],
              ["LinkedIn", "linkedin"],
            ] as const
          ).map(([rotulo, campo]) => (
            <div key={campo}>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
                {rotulo}
              </label>
              <input
                value={(cv[campo] as string) ?? ""}
                onChange={(e) => setCv({ ...cv, [campo]: e.target.value })}
                placeholder="não detectado"
                className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none placeholder:text-muted/40 focus:border-volt/60"
              />
            </div>
          ))}

          {cv.skills.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted">
                Skills detectadas ({skillsSel.length} selecionadas)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {cv.skills.map((s) => (
                  <Chip
                    key={s}
                    small
                    ativo={skillsSel.includes(s)}
                    onClick={() =>
                      setSkillsSel((prev) =>
                        prev.includes(s)
                          ? prev.filter((x) => x !== s)
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

          {cv.experiencias.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-muted">
                Experiências detectadas
              </label>
              <div className="space-y-2">
                {cv.experiencias.map((e, i) => (
                  <div key={i} className="rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm">
                    <p className="font-semibold">{e.cargo}</p>
                    <p className="text-xs text-muted">
                      {e.empresa ? `${e.empresa} · ` : ""}
                      {e.inicio} – {e.fim ?? "atual"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <BtnPrimary className="w-full" onClick={aplicar}>
            APLICAR AO PERFIL ✨
          </BtnPrimary>
          <button onClick={reset} className="w-full text-center text-xs font-semibold text-muted">
            escolher outro arquivo
          </button>
        </div>
      )}
    </Sheet>
  );
}
