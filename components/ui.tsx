"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Raridade } from "@/lib/types";
import { COR_RARIDADE, SELOS } from "@/lib/data";

/* ---------------------------------------------------------------- Avatar */
export function Avatar({
  foto,
  emoji,
  size = 56,
  cor,
  className = "",
}: {
  foto?: string;
  emoji: string;
  size?: number;
  cor?: string;
  className?: string;
}) {
  const borda = cor ?? "var(--accent)";
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        border: `1.5px solid color-mix(in srgb, ${borda} 55%, transparent)`,
        background: `color-mix(in srgb, ${borda} 14%, #161622)`,
      }}
    >
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt="" className="h-full w-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center"
          style={{ fontSize: size * 0.5 }}
        >
          {emoji}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Chip */
export function Chip({
  ativo,
  onClick,
  children,
  small,
}: {
  ativo?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border font-semibold transition active:scale-95 ${
        small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
      }`}
      style={{
        borderColor: ativo ? "var(--accent)" : "#26263a",
        background: ativo
          ? "color-mix(in srgb, var(--accent) 14%, transparent)"
          : "#161622",
        color: ativo ? "var(--accent)" : "#9c9cb0",
      }}
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------- Botões */
export function BtnPrimary({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`acc-bg rounded-2xl py-3.5 font-[family-name:var(--font-display)] text-sm font-bold transition active:scale-95 disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}

export function BtnGhost({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-line py-3.5 text-sm font-semibold text-muted transition active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- ScoreRing */
export function ScoreRing({
  score,
  size = 52,
  stroke = 5,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProg(score), 80);
    return () => clearTimeout(t);
  }, [score]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cor = score >= 65 ? "var(--accent)" : score >= 40 ? "#ffd24d" : "#9c9cb0";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#26263a" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * prog) / 100}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] font-bold"
        style={{ fontSize: size * 0.28, color: cor }}
      >
        {score}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- Selos */
export function SeloTag({ id, small }: { id: string; small?: boolean }) {
  const s = SELOS[id];
  if (!s) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      }`}
      style={{
        background: `color-mix(in srgb, ${s.cor} 15%, transparent)`,
        color: s.cor,
        border: `1px solid color-mix(in srgb, ${s.cor} 40%, transparent)`,
      }}
      title={s.desc}
    >
      {s.icone} {s.nome}
    </span>
  );
}

/* ------------------------------------------------------------ BadgeCoin */
export function BadgeCoin({
  icone,
  raridade,
  size = 64,
  bloqueada,
  destaque,
}: {
  icone: string;
  raridade: Raridade;
  size?: number;
  bloqueada?: boolean;
  destaque?: boolean;
}) {
  const cor = COR_RARIDADE[raridade];
  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${
        destaque ? "anim-badge shine" : ""
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.44,
        background: bloqueada
          ? "#14141f"
          : `radial-gradient(120% 120% at 30% 20%, color-mix(in srgb, ${cor} 38%, #14141f), #12121c)`,
        border: `2px solid ${bloqueada ? "#26263a" : cor}`,
        boxShadow: bloqueada ? "none" : `0 0 ${size / 3}px -4px ${cor}`,
        filter: bloqueada ? "grayscale(1) opacity(0.45)" : "none",
      }}
    >
      {bloqueada ? "🔒" : icone}
    </div>
  );
}

/* ---------------------------------------------------------------- Stat */
export function Stat({ n, l }: { n: React.ReactNode; l: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card py-3 text-center">
      <p className="anim-count font-[family-name:var(--font-display)] text-lg font-bold acc-text">
        {n}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{l}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Sheet */
export function Sheet({
  aberto,
  onFechar,
  children,
  titulo,
}: {
  aberto: boolean;
  onFechar: () => void;
  children: React.ReactNode;
  titulo?: string;
}) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onFechar}>
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" />
      <div
        className="anim-rise glass relative mx-auto max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" />
        {titulo && (
          <h3 className="mb-4 font-[family-name:var(--font-display)] text-lg font-bold">
            {titulo}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ EmptyState */
export function EmptyState({
  emoji,
  titulo,
  sub,
  acao,
}: {
  emoji: string;
  titulo: string;
  sub?: string;
  acao?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="anim-float text-6xl">{emoji}</p>
      <p className="mt-5 font-[family-name:var(--font-display)] text-lg font-bold">{titulo}</p>
      {sub && <p className="mt-2 max-w-[260px] text-sm text-muted">{sub}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}

/* ---------------------------------------------------------- PortalShell */
export function PortalShell({
  portal,
  titulo,
  sub,
  children,
  direita,
}: {
  portal: "empresa" | "hunter" | "admin";
  titulo: string;
  sub?: string;
  children: React.ReactNode;
  direita?: React.ReactNode;
}) {
  return (
    <div data-portal={portal} className="relative z-10 mx-auto min-h-dvh w-full max-w-lg px-5 pb-16 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-[11px] font-bold uppercase tracking-widest text-muted transition hover:text-ink"
          >
            ← Trampolim
          </Link>
          <h1 className="mt-1 truncate font-[family-name:var(--font-display)] text-2xl font-black">
            <span className="grad-text">{titulo}</span>
          </h1>
          {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
        </div>
        {direita}
      </header>
      {children}
    </div>
  );
}
