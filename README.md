# 🤸 Trampolim — deslize pro trampo certo

> **O Tinder das vagas.** Deslize, dê match e converse com quem quer te contratar.
> Chega de formulário de 40 minutos, currículo em PDF e "manteremos seu cadastro em nosso banco de talentos".

**MVP funcional** · Next.js 16 + Tailwind v4 · PWA mobile-first · pronto para Supabase

---

## 1. O problema

InfoJobs, Gupy, Catho e afins tratam candidatura como burocracia:

| Modelo tradicional | Trampolim |
|---|---|
| Formulário de 40 min por vaga | Perfil único de 1 minuto |
| Currículo PDF que ninguém lê | Skills estruturadas que geram score |
| "Enviado" e silêncio eterno | Match instantâneo + chat |
| Busca por filtros chatos | Deck ordenado por compatibilidade |
| Algoritmo caixa-preta | Score transparente ("por que essa vaga?") |

A tese: **procurar emprego deveria ter a fricção de um app de namoro, não a de um cartório.**

## 2. O produto (o que já funciona neste MVP)

- **Onboarding gamificado (1 min)**: nome + avatar emoji, área, senioridade, 3–8 skills, pretensão salarial (slider), modelo de trabalho e cidade. Sem e-mail, sem senha.
- **Deck de vagas estilo Tinder**: swipe direita = *QUERO!*, esquerda = *PASSO*, botão estrela = *É ESSE!* (super interesse). Física de arrasto nativa (pointer events), carimbos animados, rewind ↩️ do último swipe.
- **Score de compatibilidade transparente (0–100)**: skills (45) + senioridade (15) + área (15) + salário (15) + modelo (10). Cada card mostra o *motivo* ("5 skills em comum", "salário na sua faixa").
- **Match instantâneo**: like com score ≥ 65 (ou super com ≥ 45) simula o aceite da empresa → modal *DEU MATCH!* com confete.
- **Chat por match**: mensagem de boas-vindas automática da "empresa" + resposta simulada de RH (rotulada como simulação).
- **Candidaturas em análise**: likes sem match ficam com status visível — nada some no vácuo.
- **Perfil com stats**: vistas, queros, matches e taxa de conversão. Editar perfil, zerar deck, apagar tudo (LGPD-friendly desde o dia 1).
- **PWA**: instalável no celular, dark-mode nativo, identidade "volt sobre noite" (Unbounded + Sora).
- **24 vagas seed** realistas (salários BR 2026, 8 áreas, empresas fictícias com personalidade).

## 3. Arquitetura

```
app/            → Next.js App Router (SPA client-side, 100% estática)
components/     → Deck, JobCard, MatchModal, Chat, Onboarding, Matches, Profile, TabBar
lib/
  types.ts      → domínio (Vaga, Profile, Swipe, Mensagem)
  match.ts      → algoritmo de score + regra de match
  store.ts      → camada de dados com DOIS adapters (ver abaixo)
  seed-data.json→ fonte única das vagas seed
supabase/
  migrations/   → schema completo com RLS (trampolim_*)
  seed.sql      → gerado por scripts/gen-seed-sql.mjs
```

### Camada de dados: local-first, nuvem-ready

O `Store` é uma interface única com duas implementações:

- **LocalStore (ativo por padrão)** — localStorage + seed embutido. Zero backend, zero custo, funciona offline.
- **SupabaseStore** — ativa automaticamente quando `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` existem.

**Para ligar o modo nuvem** (2 minutos):
1. Crie um projeto free no Supabase (a org `trampolim` já existe; é preciso liberar um slot free — pausar um projeto antigo — ou usar plano pago).
2. Aplique `supabase/migrations/*.sql` e depois `supabase/seed.sql` (SQL Editor ou `supabase db push`).
3. Preencha as duas variáveis no Vercel e redeploy. Pronto.

> ⚠️ **Nota de segurança (MVP)**: o modo nuvem usa identidade por UUID de dispositivo com policies de escrita abertas ao `anon` nas tabelas de demo. Para produção: Supabase Anonymous Auth + policies `auth.uid()`, rate limiting e CAPTCHA no onboarding. Detalhes no comentário da migration.

## 4. Rodando local

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de produção (estático)
```

## 5. Modelo de negócio (visão)

1. **B2C grátis para sempre** — candidato nunca paga (liquidez do lado da oferta de talento).
2. **B2B por vaga ativa** — empresa paga por vaga publicada no deck (R$ 99–299/mês/vaga), com destaque pago (aparece mais cedo no deck).
3. **Super Quero como moeda** — pacote de super likes para candidatos power users (upsell leve, nunca pay-to-win).
4. **Dados agregados** — relatórios de mercado salarial/skills por região (anonimizados).

## 6. Roadmap

**Fase 2 — dois lados de verdade**
- [ ] Portal da empresa: publicar vaga, ver fila de candidatos que deram like, dar like de volta (match real, não simulado)
- [ ] Supabase Auth (anonymous → upgrade para conta), Realtime no chat
- [ ] Notificações push ("3 empresas curtiram você hoje")

**Fase 3 — crescimento**
- [ ] Boost semanal gratuito (mecânica de retenção)
- [ ] Importar perfil do LinkedIn (1 clique)
- [ ] IA: gerar "pitch de 3 linhas" do candidato e triagem assistida para empresas
- [ ] Filtros premium (só remoto, faixa salarial mínima)

**Fase 4 — hardening**
- [ ] RLS estrita com auth.uid(), rate limiting, moderação de chat
- [ ] Ícones PNG maskable + service worker offline completo
- [ ] Analytics de funil (onboarding → primeiro swipe → primeiro match)

## 7. Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · TypeScript · Supabase (opcional) · Vercel · pnpm

---

Feito com 🔥 no Brasil. MVP gerado em uma sessão de vibe-coding com Claude.
