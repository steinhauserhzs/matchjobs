import type { Modelo } from "./types";

export const AREAS = [
  "Tecnologia",
  "Dados",
  "Segurança",
  "Design",
  "Marketing",
  "Vendas",
  "Produto",
  "Operações",
] as const;

export const SENIORIDADES = [
  "Estágio",
  "Júnior",
  "Pleno",
  "Sênior",
  "Lead",
] as const;

export const MODELOS: { value: Modelo; label: string; icon: string }[] = [
  { value: "remoto", label: "Remoto", icon: "🌎" },
  { value: "hibrido", label: "Híbrido", icon: "🔀" },
  { value: "presencial", label: "Presencial", icon: "🏢" },
];

export const SKILLS_POR_AREA: Record<string, string[]> = {
  Tecnologia: [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "Java",
    "Go",
    "Flutter",
    "AWS",
    "Docker",
    "SQL",
    "APIs REST",
  ],
  Dados: [
    "SQL",
    "Python",
    "Power BI",
    "dbt",
    "Spark",
    "Machine Learning",
    "Estatística",
    "ETL",
    "BigQuery",
  ],
  Segurança: [
    "Pentest",
    "AppSec",
    "Cloud Security",
    "SIEM",
    "Forense",
    "LGPD",
    "Redes",
    "Linux",
    "OSINT",
  ],
  Design: [
    "Figma",
    "UI Design",
    "UX Research",
    "Design System",
    "Prototipagem",
    "Motion",
    "Branding",
    "Ilustração",
  ],
  Marketing: [
    "SEO",
    "Mídia Paga",
    "CRM",
    "Copywriting",
    "Social Media",
    "Growth",
    "Analytics",
    "E-mail Marketing",
  ],
  Vendas: [
    "Prospecção",
    "Negociação",
    "CRM",
    "Inside Sales",
    "Field Sales",
    "Pós-venda",
    "SDR",
  ],
  Produto: [
    "Discovery",
    "Roadmap",
    "Métricas",
    "A/B Testing",
    "Scrum",
    "UX Writing",
    "Benchmark",
  ],
  Operações: [
    "Excel",
    "Processos",
    "Logística",
    "Atendimento",
    "Financeiro",
    "RH",
    "Compras",
  ],
};

export const EMOJIS_AVATAR = ["🚀", "🔥", "⚡", "🦾", "🎯", "🧠", "🌟", "🐆"];

export function brl(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function faixaSalarial(min: number, max: number): string {
  return `${brl(min)} – ${brl(max)}`;
}

const NIVEL: Record<string, number> = {
  Estágio: 0,
  Júnior: 1,
  Pleno: 2,
  Sênior: 3,
  Lead: 4,
};

export function nivelDe(senioridade: string): number {
  return NIVEL[senioridade] ?? 2;
}
