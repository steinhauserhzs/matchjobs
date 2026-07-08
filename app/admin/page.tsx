"use client";

import { useEffect, useMemo, useState } from "react";
import type { BadgeConquistado, Empresa, Swipe, Talento, Vaga } from "@/lib/types";
import { store } from "@/lib/store";
import { brl, COR_RARIDADE, faixaSalarial } from "@/lib/data";
import { BADGES } from "@/lib/badges";
import {
  Avatar,
  BadgeCoin,
  Chip,
  EmptyState,
  PortalShell,
  SeloTag,
  Stat,
} from "@/components/ui";

type Aba = "geral" | "vagas" | "empresas" | "badges";

function Barra({
  rotulo,
  valor,
  max,
  cor,
  texto,
  atraso,
}: {
  rotulo: string;
  valor: number;
  max: number;
  cor: string;
  texto: string;
  atraso: number;
}) {
  const [cheia, setCheia] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCheia(true), 120 + atraso * 70);
    return () => clearTimeout(t);
  }, [atraso]);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="truncate text-xs font-semibold text-ink/90">{rotulo}</span>
        <span className="ml-2 shrink-0 text-[11px] font-bold" style={{ color: cor }}>
          {texto}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-bg2">
        <div
          className="h-full rounded-full"
          style={{
            width: cheia ? `${Math.max(4, (valor / max) * 100)}%` : "0%",
            background: `linear-gradient(90deg, ${cor}88, ${cor})`,
            transition: "width 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
    </div>
  );
}

export default function PortalAdmin() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [talentos, setTalentos] = useState<Talento[]>([]);
  const [swipes, setSwipes] = useState<Swipe[]>([]);
  const [badges, setBadges] = useState<BadgeConquistado[]>([]);
  const [aba, setAba] = useState<Aba>("geral");
  const [busca, setBusca] = useState("");
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    (async () => {
      const [v, e, t, s, b] = await Promise.all([
        store.getVagas(),
        store.getEmpresas(),
        store.getTalentos(),
        store.getSwipes(),
        store.getBadges(),
      ]);
      setVagas(v);
      setEmpresas(e);
      setTalentos(t);
      setSwipes(s);
      setBadges(b);
      setCarregado(true);
    })();
  }, []);

  const ativas = vagas.filter((v) => v.ativa).length;
  const matches = swipes.filter((s) => s.matched).length;
  const queros = swipes.filter((s) => s.direcao !== "nope").length;
  const taxa = queros ? Math.round((matches / queros) * 100) : 0;

  const porArea = useMemo(() => {
    const m = new Map<string, number>();
    vagas.forEach((v) => m.set(v.area, (m.get(v.area) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [vagas]);

  const salarioPorArea = useMemo(() => {
    const m = new Map<string, { soma: number; n: number }>();
    vagas.forEach((v) => {
      const cur = m.get(v.area) ?? { soma: 0, n: 0 };
      m.set(v.area, { soma: cur.soma + (v.salario_min + v.salario_max) / 2, n: cur.n + 1 });
    });
    return [...m.entries()]
      .map(([a, { soma, n }]) => [a, Math.round(soma / n)] as const)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [vagas]);

  const spark = useMemo(() => {
    const dias: number[] = Array(14).fill(0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    swipes.forEach((s) => {
      const d = new Date(s.created_at);
      d.setHours(0, 0, 0, 0);
      const diff = Math.round((hoje.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < 14) dias[13 - diff] += 1;
    });
    const max = Math.max(1, ...dias);
    const pts = dias
      .map((v, i) => `${(i / 13) * 100},${34 - (v / max) * 30}`)
      .join(" ");
    return { pts, total: swipes.length, max };
  }, [swipes]);

  const vagasFiltradas = vagas.filter(
    (v) =>
      !busca ||
      `${v.cargo} ${v.empresa} ${v.area}`.toLowerCase().includes(busca.toLowerCase()),
  );

  async function toggleAtiva(v: Vaga) {
    await store.updateVaga(v.id, { ativa: !v.ativa });
    setVagas((prev) => prev.map((x) => (x.id === v.id ? { ...x, ativa: !v.ativa } : x)));
  }

  if (!carregado) {
    return (
      <PortalShell portal="admin" titulo="Admin">
        <div className="space-y-3">
          <div className="skeleton h-24 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      </PortalShell>
    );
  }

  const conquistadas = new Set(badges.map((b) => b.badge_id));

  return (
    <PortalShell
      portal="admin"
      titulo="Torre de Controle"
      sub="Métricas e gestão do Trampolim (dados reais deste dispositivo)"
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["geral", "Visão geral"],
            ["vagas", `Vagas · ${vagas.length}`],
            ["empresas", `Empresas · ${empresas.length}`],
            ["badges", "Badges"],
          ] as const
        ).map(([id, rotulo]) => (
          <Chip key={id} ativo={aba === id} onClick={() => setAba(id)}>
            {rotulo}
          </Chip>
        ))}
      </div>

      {aba === "geral" && (
        <div className="stagger space-y-5">
          <div className="grid grid-cols-5 gap-1.5">
            <Stat n={talentos.length + 1} l="usuários" />
            <Stat n={`${ativas}/${vagas.length}`} l="vagas" />
            <Stat n={swipes.length} l="swipes" />
            <Stat n={matches} l="matches" />
            <Stat n={`${taxa}%`} l="taxa" />
          </div>

          <div className="rounded-3xl border border-line bg-card p-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">
              Swipes · últimos 14 dias
            </p>
            <svg viewBox="0 0 100 36" className="h-16 w-full" preserveAspectRatio="none">
              <polyline
                points={spark.pts}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <polyline
                points={`0,36 ${spark.pts} 100,36`}
                fill="color-mix(in srgb, var(--accent) 14%, transparent)"
                stroke="none"
              />
            </svg>
            <p className="text-right text-[11px] text-muted">
              {spark.total} swipes no total · pico {spark.max}/dia
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-card p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Vagas por área · top 8
            </p>
            <div className="space-y-3">
              {porArea.map(([a, n], i) => (
                <Barra
                  key={a}
                  rotulo={a}
                  valor={n}
                  max={porArea[0][1]}
                  cor="#b18cff"
                  texto={`${n}`}
                  atraso={i}
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-card p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Salário médio por área · top 6
            </p>
            <div className="space-y-3">
              {salarioPorArea.map(([a, n], i) => (
                <Barra
                  key={a}
                  rotulo={a}
                  valor={n}
                  max={salarioPorArea[0][1]}
                  cor="#ffd24d"
                  texto={brl(n)}
                  atraso={i}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {aba === "vagas" && (
        <div className="space-y-3">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por cargo, empresa ou área…"
            className="w-full rounded-2xl border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted/50"
          />
          <p className="text-[11px] font-bold text-muted">
            {vagasFiltradas.filter((v) => v.ativa).length} ativas de {vagasFiltradas.length}
          </p>
          <div className="space-y-2">
            {vagasFiltradas.slice(0, 40).map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-card px-3.5 py-3"
                style={{ opacity: v.ativa ? 1 : 0.55 }}
              >
                <span className="text-xl">{v.logo}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{v.cargo}</p>
                  <p className="truncate text-[11px] text-muted">
                    {v.empresa} · {v.area} · {faixaSalarial(v.salario_min, v.salario_max)}
                  </p>
                </div>
                <button
                  onClick={() => toggleAtiva(v)}
                  className="relative h-6 w-11 shrink-0 rounded-full transition"
                  style={{ background: v.ativa ? "var(--accent)" : "#26263a" }}
                  aria-label={v.ativa ? "Pausar" : "Ativar"}
                >
                  <span
                    className="absolute top-1 h-4 w-4 rounded-full bg-bg transition-all"
                    style={{ left: v.ativa ? 24 : 4 }}
                  />
                </button>
              </div>
            ))}
          </div>
          {vagasFiltradas.length > 40 && (
            <p className="text-center text-[11px] text-muted">
              mostrando 40 de {vagasFiltradas.length} — refine a busca
            </p>
          )}
        </div>
      )}

      {aba === "empresas" && (
        <div className="stagger space-y-2.5">
          {empresas.map((e) => {
            const n = vagas.filter((v) => v.empresa_id === e.id).length;
            return (
              <div key={e.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-4">
                <Avatar emoji={e.logo} cor={e.cor} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{e.nome}</p>
                  <p className="truncate text-[11px] text-muted">
                    {e.setor} · {e.cidade}
                  </p>
                  {e.selos.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {e.selos.map((s) => (
                        <SeloTag key={s} id={s} small />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="acc-text font-[family-name:var(--font-display)] text-lg font-bold">
                    {n}
                  </p>
                  <p className="text-[9px] font-bold uppercase text-muted">vagas</p>
                </div>
              </div>
            );
          })}
          {empresas.length === 0 && <EmptyState emoji="🏢" titulo="Sem empresas" />}
        </div>
      )}

      {aba === "badges" && (
        <div>
          <p className="mb-4 text-sm text-muted">
            Usuário local conquistou{" "}
            <span className="acc-text font-bold">
              {conquistadas.size} de {BADGES.length}
            </span>{" "}
            conquistas.
          </p>
          <div className="stagger grid grid-cols-2 gap-3">
            {BADGES.map((b) => {
              const tem = conquistadas.has(b.id);
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5"
                >
                  <BadgeCoin icone={b.icone} raridade={b.raridade} size={46} bloqueada={!tem} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{b.nome}</p>
                    <p
                      className="text-[9px] font-bold uppercase tracking-widest"
                      style={{ color: COR_RARIDADE[b.raridade] }}
                    >
                      {b.raridade}
                    </p>
                    <p className="text-[10px] text-muted">{tem ? "✓ conquistada" : "bloqueada"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PortalShell>
  );
}
