import type { Experiencia, Formacao } from "./types";
import { TODAS_SKILLS } from "./data";

export interface CvParseado {
  nome?: string;
  email?: string;
  telefone?: string;
  linkedin?: string;
  skills: string[];
  experiencias: Experiencia[];
  formacao: Formacao[];
  textoBruto: string;
}

/** Extrai texto de PDF no cliente (pdf.js) ou lê .txt direto. */
export async function extrairTexto(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let texto = "";
    for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      texto +=
        tc.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
    }
    return texto;
  }
  return file.text();
}

/**
 * Parser heurístico de currículo (100% client-side, privacidade total):
 * regexes para contato + matching de skills contra o catálogo + detecção
 * de períodos (2019–2023) para experiências. O usuário revisa tudo antes
 * de salvar — a heurística sugere, nunca decide.
 */
export function parsearCv(texto: string): CvParseado {
  const linhas = texto
    .split(/\n|(?<=[.;])\s{2,}/)
    .map((l) => l.trim())
    .filter(Boolean);

  const email = texto.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
  const telefone = texto
    .match(/(?:\+?55[\s.-]?)?(?:\(?\d{2}\)?[\s.-]?)?9?\d{4}[\s.-]?\d{4}/)?.[0]
    ?.trim();
  const linkedin = texto.match(/linkedin\.com\/in\/[\w-]+/i)?.[0];

  // nome: primeira linha "limpa" com 2+ palavras alfabéticas
  const nome = linhas.find(
    (l) =>
      /^[A-Za-zÀ-ÿ' ]{5,60}$/.test(l) &&
      l.split(/\s+/).length >= 2 &&
      l.split(/\s+/).length <= 5 &&
      !/curr[ií]culo|curriculum|vitae|resume|contato|endere[çc]o/i.test(l),
  );

  // skills: matching contra o catálogo completo
  const textoLower = texto.toLowerCase();
  const skills = TODAS_SKILLS.filter((s) =>
    textoLower.includes(s.toLowerCase()),
  ).slice(0, 8);

  // experiências: linhas com período (2019 - 2023 | 2021 – atual)
  const experiencias: Experiencia[] = [];
  const rePeriodo = /(\d{4})\s*(?:[-–—a]|até)\s*(\d{4}|atual|presente|hoje)/i;
  for (const l of linhas) {
    const m = l.match(rePeriodo);
    if (m && experiencias.length < 5) {
      const resto = l.replace(rePeriodo, "").replace(/[|•·()-]+/g, " ").trim();
      const [cargo, empresa] = resto.split(/\s{2,}|,| em | na | no /);
      experiencias.push({
        cargo: (cargo || "Experiência").slice(0, 60).trim(),
        empresa: (empresa || "").slice(0, 40).trim(),
        inicio: m[1],
        fim: /atual|presente|hoje/i.test(m[2]) ? undefined : m[2],
      });
    }
  }

  // formação: linhas com termos acadêmicos
  const formacao: Formacao[] = [];
  const reAcad =
    /universidade|faculdade|bacharel|licenciatura|tecn[oó]logo|gradua[çc][ãa]o|mba|p[óo]s[- ]gradua|mestrado|doutorado|senai|senac|etec|fatec/i;
  for (const l of linhas) {
    if (reAcad.test(l) && formacao.length < 3 && l.length < 120) {
      const ano = l.match(/\d{4}/)?.[0];
      formacao.push({ curso: l.slice(0, 80), instituicao: "", ano });
    }
  }

  return { nome, email, telefone, linkedin, skills, experiencias, formacao, textoBruto: texto };
}
