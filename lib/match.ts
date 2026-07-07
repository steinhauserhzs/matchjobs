import type { Profile, ScoreResult, Vaga } from "./types";
import { nivelDe } from "./data";

/**
 * Score de compatibilidade 0–100 entre candidato e vaga.
 * Pesos: skills 45 · senioridade 15 · área 15 · salário 15 · modelo 10.
 * O score é transparente: cada componente vira um "motivo" exibido no card.
 */
export function calcularScore(p: Profile, v: Vaga): ScoreResult {
  const motivos: string[] = [];

  // Skills (45)
  const emComum = v.skills.filter((s) => p.skills.includes(s));
  const propSkills = v.skills.length ? emComum.length / v.skills.length : 0;
  const ptsSkills = Math.round(45 * propSkills);
  if (emComum.length >= 3) motivos.push(`${emComum.length} skills em comum`);
  else if (emComum.length > 0)
    motivos.push(
      `Você domina ${emComum.length === 1 ? emComum[0] : emComum.join(" e ")}`,
    );

  // Senioridade (15) — exata = 15, 1 nível de distância = 8
  const dist = Math.abs(nivelDe(p.senioridade) - nivelDe(v.senioridade));
  const ptsSenioridade = dist === 0 ? 15 : dist === 1 ? 8 : 0;
  if (dist === 0) motivos.push("Senioridade na medida");

  // Área (15)
  const ptsArea = p.area === v.area ? 15 : 0;
  if (ptsArea) motivos.push(`Vaga da sua área (${v.area})`);

  // Salário (15) — teto da vaga cobre a pretensão; degrada proporcional
  let ptsSalario = 0;
  if (p.pretensao > 0) {
    if (v.salario_max >= p.pretensao) {
      ptsSalario = 15;
      motivos.push("Salário dentro da sua pretensão");
    } else {
      ptsSalario = Math.max(
        0,
        Math.round(15 * (v.salario_max / p.pretensao)) - 3,
      );
    }
  }

  // Modelo de trabalho (10) — vaga remota serve a todos
  let ptsModelo = 0;
  if (v.modelo === p.modelo || v.modelo === "remoto") {
    ptsModelo = 10;
    if (v.modelo === "remoto") motivos.push("100% remoto");
  } else if (v.modelo === "hibrido" && p.modelo === "presencial") {
    ptsModelo = 5;
  }

  const score = Math.min(
    100,
    ptsSkills + ptsSenioridade + ptsArea + ptsSalario + ptsModelo,
  );

  return { score, motivos, skillsEmComum: emComum };
}

/**
 * Regra de match instantâneo do MVP: simula o lado da empresa.
 * Like comum precisa de score alto; o Super Quero abaixa a régua
 * (sinal forte de interesse pesa na "decisão" da empresa).
 */
export function decidirMatch(direcao: "like" | "super", score: number): boolean {
  if (direcao === "super") return score >= 45;
  return score >= 65;
}

export function mensagemBoasVindas(nomeCandidato: string, v: Vaga): string {
  const nome = nomeCandidato.split(" ")[0] || "olá";
  return `Oi, ${nome}! Aqui é da ${v.empresa} 👋 Adoramos o seu perfil para a vaga de ${v.cargo}. Bora marcar um papo essa semana?`;
}
