import type { Modelo, Raridade } from "./types";

/** TODAS as áreas — não só TI. */
export const AREAS = [
  "Tecnologia",
  "Dados",
  "Segurança",
  "Design",
  "Marketing",
  "Vendas",
  "Produto",
  "Financeiro",
  "Operações",
  "RH & Pessoas",
  "Saúde",
  "Educação",
  "Engenharia",
  "Jurídico",
  "Logística",
  "Gastronomia",
  "Varejo & Atendimento",
  "Construção & Manutenção",
  "Indústria & Produção",
  "Agro & Meio Ambiente",
  "Beleza & Bem-estar",
  "Turismo & Eventos",
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
  Tecnologia: ["React", "Next.js", "TypeScript", "Node.js", "Python", "Java", "Go", "Flutter", "AWS", "Docker", "SQL", "APIs REST"],
  Dados: ["SQL", "Python", "Power BI", "dbt", "Spark", "Machine Learning", "Estatística", "ETL", "BigQuery", "Excel Avançado"],
  Segurança: ["Pentest", "AppSec", "Cloud Security", "SIEM", "Forense", "LGPD", "Redes", "Linux", "OSINT", "Gestão de Riscos"],
  Design: ["Figma", "UI Design", "UX Research", "Design System", "Prototipagem", "Motion", "Branding", "Ilustração", "Design Gráfico"],
  Marketing: ["SEO", "Mídia Paga", "CRM", "Copywriting", "Social Media", "Growth", "Analytics", "E-mail Marketing", "Branding"],
  Vendas: ["Prospecção", "Negociação", "CRM", "Inside Sales", "Field Sales", "Pós-venda", "SDR", "Vendas Consultivas"],
  Produto: ["Discovery", "Roadmap", "Métricas", "A/B Testing", "Scrum", "UX Writing", "Benchmark", "Gestão de Stakeholders"],
  Financeiro: ["Contabilidade", "Controladoria", "FP&A", "Tesouraria", "Excel Avançado", "Impostos", "Auditoria", "Valuation"],
  Operações: ["Processos", "Excel Avançado", "Atendimento", "Compras", "Gestão de Projetos", "Qualidade", "BPO"],
  "RH & Pessoas": ["Recrutamento", "Employer Branding", "Departamento Pessoal", "Treinamento", "Cultura", "People Analytics", "Remuneração"],
  Saúde: ["Enfermagem", "Fisioterapia", "Nutrição", "Psicologia", "Farmácia", "Atendimento Clínico", "Prontuário Eletrônico", "Urgência e Emergência"],
  Educação: ["Docência", "Pedagogia", "Educação Infantil", "Tutoria EAD", "Design Instrucional", "Coordenação Pedagógica", "Reforço Escolar"],
  Engenharia: ["AutoCAD", "Projetos Elétricos", "Projetos Mecânicos", "Gestão de Obras", "Orçamento de Obras", "SolidWorks", "Manutenção Industrial", "Segurança do Trabalho"],
  Jurídico: ["Contratos", "Contencioso", "Trabalhista", "Tributário", "Societário", "Compliance", "LGPD", "Peticionamento"],
  Logística: ["Roteirização", "WMS", "Estoque", "Transporte", "Comércio Exterior", "Supply Chain", "Última Milha", "Empilhadeira"],
  Gastronomia: ["Cozinha Quente", "Confeitaria", "Panificação", "Gestão de Cozinha", "Ficha Técnica", "Boas Práticas", "Bar & Coquetelaria", "Atendimento de Salão"],
  "Varejo & Atendimento": ["Vendas de Loja", "Caixa", "Visual Merchandising", "Estoque de Loja", "Atendimento ao Cliente", "Telemarketing", "Gestão de Loja"],
  "Construção & Manutenção": ["Pedreiro", "Elétrica Predial", "Hidráulica", "Pintura", "Marcenaria", "Solda", "Leitura de Projeto", "Manutenção Predial"],
  "Indústria & Produção": ["Operação de Máquinas", "PCP", "Lean Manufacturing", "Controle de Qualidade", "CLP", "Usinagem", "Montagem", "5S"],
  "Agro & Meio Ambiente": ["Agronomia", "Manejo de Gado", "Operação de Trator", "Irrigação", "Licenciamento Ambiental", "Gestão Rural", "Agricultura de Precisão"],
  "Beleza & Bem-estar": ["Cabelo", "Barbearia", "Manicure", "Estética Facial", "Massoterapia", "Maquiagem", "Depilação", "Gestão de Salão"],
  "Turismo & Eventos": ["Recepção", "Hotelaria", "Guia de Turismo", "Produção de Eventos", "Cerimonial", "Reservas", "Inglês", "Espanhol"],
};

export const EMOJIS_AVATAR = ["🚀", "🔥", "⚡", "🦾", "🎯", "🧠", "🌟", "🐆", "🌻", "🛠️", "🩺", "📚"];

/** Selos de empresa (confiança/qualidade). */
export const SELOS: Record<string, { nome: string; icone: string; cor: string; desc: string }> = {
  verificada: { nome: "Verificada", icone: "✓", cor: "#4da6ff", desc: "CNPJ e presença confirmados pela equipe MatchJobs" },
  "top-empregadora": { nome: "Top Empregadora", icone: "🏆", cor: "#c8ff16", desc: "Entre as mais curtidas pelos candidatos" },
  "resposta-rapida": { nome: "Resposta Rápida", icone: "⚡", cor: "#ff5c39", desc: "Responde matches em menos de 24h" },
  diversidade: { nome: "Diversidade+", icone: "🌈", cor: "#b18cff", desc: "Compromisso público com inclusão" },
  "contratacao-agil": { nome: "Contratação Ágil", icone: "🚀", cor: "#ff4d6d", desc: "Processo seletivo em até 2 semanas" },
};

export const COR_RARIDADE: Record<Raridade, string> = {
  bronze: "#d09a5b",
  prata: "#c9d1e0",
  ouro: "#ffd24d",
  diamante: "#7de9ff",
};

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

export const TODAS_SKILLS: string[] = [
  ...new Set(Object.values(SKILLS_POR_AREA).flat()),
];
