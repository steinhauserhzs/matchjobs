export type Modelo = "remoto" | "hibrido" | "presencial";
export type Direcao = "like" | "nope" | "super";
export type Raridade = "bronze" | "prata" | "ouro" | "diamante";

export interface Experiencia {
  cargo: string;
  empresa: string;
  inicio: string; // "2022"
  fim?: string; // "2024" | undefined = atual
  descricao?: string;
}

export interface Formacao {
  curso: string;
  instituicao: string;
  ano?: string;
}

export interface Idioma {
  idioma: string;
  nivel: "básico" | "intermediário" | "avançado" | "fluente" | "nativo";
}

export interface Profile {
  id: string;
  nome: string;
  emoji: string;
  foto?: string; // dataURL comprimida
  headline?: string;
  bio?: string;
  email?: string;
  telefone?: string;
  linkedin?: string;
  area: string;
  senioridade: string;
  cidade: string;
  modelo: Modelo;
  pretensao: number;
  skills: string[];
  experiencias?: Experiencia[];
  formacao?: Formacao[];
  idiomas?: Idioma[];
  cvImportado?: boolean;
}

export interface Vaga {
  id: string;
  empresa_id?: string;
  empresa: string;
  logo: string;
  cor: string;
  cargo: string;
  area: string;
  senioridade: string;
  salario_min: number;
  salario_max: number;
  modelo: Modelo;
  cidade: string;
  skills: string[];
  descricao: string;
  beneficios: string[];
  ativa: boolean;
  created_at?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  logo: string;
  cor: string;
  setor: string;
  cidade: string;
  tamanho: string; // "11–50", "51–200"…
  slogan: string;
  sobre: string;
  selos: string[]; // ids de SELOS
}

/** Candidato do pool (portais empresa/hunter). */
export interface Talento {
  id: string;
  nome: string;
  emoji: string;
  headline: string;
  area: string;
  senioridade: string;
  cidade: string;
  modelo: Modelo;
  pretensao: number;
  skills: string[];
  bio: string;
  disponivel: boolean;
}

export interface Swipe {
  id: string;
  user_id: string;
  vaga_id: string;
  direcao: Direcao;
  score: number;
  matched: boolean;
  status: string;
  created_at: string;
}

export interface Mensagem {
  id: string;
  swipe_id: string;
  autor: "candidato" | "empresa";
  texto: string;
  created_at: string;
}

export interface BadgeConquistado {
  badge_id: string;
  em: string;
}

/** Like da empresa num talento (portal empresa) ou convite do hunter. */
export interface LikeEmpresa {
  empresa_id: string;
  talento_id: string;
  em: string;
}

export interface ScoreResult {
  score: number;
  motivos: string[];
  skillsEmComum: string[];
}
