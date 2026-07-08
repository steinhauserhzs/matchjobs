import type { Profile, Raridade, Swipe, Vaga } from "./types";

export interface BadgeDef {
  id: string;
  nome: string;
  desc: string;
  icone: string;
  raridade: Raridade;
}

export const BADGES: BadgeDef[] = [
  { id: "estreante", nome: "Estreante", desc: "Deu o primeiro swipe", icone: "🎬", raridade: "bronze" },
  { id: "em-ritmo", nome: "Em Ritmo", desc: "10 vagas avaliadas", icone: "🏃", raridade: "bronze" },
  { id: "seletivo", nome: "Seletivo", desc: "Passou 10 vagas — sabe o que quer", icone: "🧐", raridade: "bronze" },
  { id: "super-fa", nome: "Super Fã", desc: "Usou 3 Super Queros", icone: "⭐", raridade: "bronze" },
  { id: "maratonista", nome: "Maratonista", desc: "30 vagas avaliadas", icone: "🏅", raridade: "prata" },
  { id: "primeiro-match", nome: "Primeiro Match", desc: "Uma empresa te quer!", icone: "💥", raridade: "prata" },
  { id: "explorador", nome: "Explorador", desc: "Avaliou vagas de 5 áreas diferentes", icone: "🧭", raridade: "prata" },
  { id: "cv-na-mao", nome: "CV na Mão", desc: "Importou o currículo", icone: "📄", raridade: "prata" },
  { id: "perfil-nota-dez", nome: "Perfil Nota 10", desc: "Foto, bio, experiência e 5+ skills", icone: "🌟", raridade: "ouro" },
  { id: "disputado", nome: "Disputado", desc: "3 matches — o mercado te quer", icone: "👑", raridade: "ouro" },
  { id: "lenda-do-deck", nome: "Lenda do Deck", desc: "8 matches. Absurdo.", icone: "💎", raridade: "diamante" },
];

export const BADGE_MAP: Record<string, BadgeDef> = Object.fromEntries(
  BADGES.map((b) => [b.id, b]),
);

/** Avalia quais badges o candidato merece agora (idempotente). */
export function avaliarBadges(
  profile: Profile | null,
  swipes: Swipe[],
  vagas: Vaga[],
): string[] {
  const ids: string[] = [];
  const total = swipes.length;
  const nopes = swipes.filter((s) => s.direcao === "nope").length;
  const supers = swipes.filter((s) => s.direcao === "super").length;
  const matches = swipes.filter((s) => s.matched).length;
  const areaDe = new Map(vagas.map((v) => [v.id, v.area]));
  const areas = new Set(
    swipes.map((s) => areaDe.get(s.vaga_id)).filter(Boolean),
  );

  if (total >= 1) ids.push("estreante");
  if (total >= 10) ids.push("em-ritmo");
  if (total >= 30) ids.push("maratonista");
  if (nopes >= 10) ids.push("seletivo");
  if (supers >= 3) ids.push("super-fa");
  if (matches >= 1) ids.push("primeiro-match");
  if (matches >= 3) ids.push("disputado");
  if (matches >= 8) ids.push("lenda-do-deck");
  if (areas.size >= 5) ids.push("explorador");
  if (profile?.cvImportado) ids.push("cv-na-mao");
  if (
    profile &&
    profile.foto &&
    (profile.bio?.trim().length ?? 0) >= 20 &&
    (profile.experiencias?.length ?? 0) >= 1 &&
    profile.skills.length >= 5
  )
    ids.push("perfil-nota-dez");

  return ids;
}
