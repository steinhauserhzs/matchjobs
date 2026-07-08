"use client";

import { useEffect, useRef, useState } from "react";
import type { Mensagem, Swipe, Vaga } from "@/lib/types";
import { store } from "@/lib/store";
import { Avatar, ScoreRing } from "./ui";

function hora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function Chat({
  swipe,
  vaga,
  onVoltar,
}: {
  swipe: Swipe;
  vaga: Vaga;
  onVoltar: () => void;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [digitando, setDigitando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    store.getMensagens(swipe.id).then(setMensagens);
    setTimeout(() => input.current?.focus(), 350);
  }, [swipe.id]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length, digitando]);

  async function enviar() {
    const t = texto.trim();
    if (!t) return;
    setTexto("");
    const minha = await store.addMensagem({
      swipe_id: swipe.id,
      autor: "candidato",
      texto: t,
    });
    setMensagens((prev) => [...prev, minha]);

    // resposta simulada do RH (uma única vez, com "digitando…")
    const jaRespondeu =
      mensagens.filter((m) => m.autor === "empresa").length >= 2;
    if (!jaRespondeu) {
      setTimeout(() => setDigitando(true), 700);
      setTimeout(async () => {
        setDigitando(false);
        const resposta = await store.addMensagem({
          swipe_id: swipe.id,
          autor: "empresa",
          texto:
            "Fechado! Que tal quinta às 15h? Te mando o convite. Qualquer coisa me chama aqui 😉",
        });
        setMensagens((prev) => [...prev, resposta]);
      }, 2300);
    }
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-bg">
      {/* header */}
      <div className="glass flex items-center gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button
          onClick={onVoltar}
          aria-label="Voltar"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Avatar emoji={vaga.logo} cor={vaga.cor} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{vaga.empresa}</p>
          <p className="truncate text-[11px] text-muted">
            {vaga.cargo} · RH (simulação)
          </p>
        </div>
        <ScoreRing score={swipe.score} size={38} stroke={4} />
      </div>

      {/* mensagens */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {mensagens.map((m) => {
          const minha = m.autor === "candidato";
          return (
            <div
              key={m.id}
              className={`anim-rise max-w-[80%] px-4 py-2.5 text-[14px] leading-relaxed ${
                minha
                  ? "ml-auto rounded-[18px_18px_4px_18px] bg-volt text-bg"
                  : "rounded-[18px_18px_18px_4px] border border-line bg-card text-ink"
              }`}
            >
              {m.texto}
              <span
                className={`mt-1 block text-right text-[9px] ${
                  minha ? "text-bg/60" : "text-muted/60"
                }`}
              >
                {hora(m.created_at)}
              </span>
            </div>
          );
        })}
        {digitando && (
          <div className="anim-pop flex w-fit items-center gap-1 rounded-[18px_18px_18px_4px] border border-line bg-card px-4 py-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-muted"
                style={{
                  animation: `float-slow 0.9s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        <div ref={fim} />
      </div>

      {/* input */}
      <div className="glass flex items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
        <input
          ref={input}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviar()}
          placeholder="Escreva sua mensagem…"
          className="flex-1 rounded-full border border-line bg-card px-4 py-3 text-sm outline-none placeholder:text-muted/50 focus:border-volt/60"
        />
        <button
          onClick={enviar}
          aria-label="Enviar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-volt text-bg transition active:scale-90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 11.5 21 3l-8.5 18-2.3-7.2L3 11.5Z"
              stroke="#0a0a10"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
