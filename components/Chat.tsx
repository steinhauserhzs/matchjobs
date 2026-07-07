"use client";

import { useEffect, useRef, useState } from "react";
import type { Mensagem, Swipe, Vaga } from "@/lib/types";
import { store } from "@/lib/store";

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
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    store.getMensagens(swipe.id).then(setMensagens);
  }, [swipe.id]);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

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

    // resposta simulada do RH (uma única vez, para dar vida à demo)
    const jaRespondeu =
      mensagens.filter((m) => m.autor === "empresa").length >= 2;
    if (!jaRespondeu) {
      setTimeout(async () => {
        const resposta = await store.addMensagem({
          swipe_id: swipe.id,
          autor: "empresa",
          texto: `Fechado! Que tal quinta às 15h? Te mando o convite. Qualquer coisa me chama aqui 😉`,
        });
        setMensagens((prev) => [...prev, resposta]);
      }, 1400);
    }
  }

  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col bg-bg">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line bg-bg2/80 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-xl">
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
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ background: `${vaga.cor}22`, border: `1px solid ${vaga.cor}55` }}
        >
          {vaga.logo}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{vaga.empresa}</p>
          <p className="truncate text-[11px] text-muted">
            {vaga.cargo} · RH (simulação)
          </p>
        </div>
        <span className="rounded-full bg-volt px-2 py-0.5 text-[10px] font-black text-bg">
          {swipe.score}%
        </span>
      </div>

      {/* mensagens */}
      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
              m.autor === "candidato"
                ? "ml-auto rounded-br-md bg-volt text-bg"
                : "rounded-bl-md border border-line bg-card text-ink"
            }`}
          >
            {m.texto}
          </div>
        ))}
        <div ref={fim} />
      </div>

      {/* input */}
      <div className="flex items-center gap-2 border-t border-line bg-bg2/80 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl">
        <input
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
