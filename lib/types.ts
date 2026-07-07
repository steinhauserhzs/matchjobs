export type Modelo = "remoto" | "hibrido" | "presencial";
export type Direcao = "like" | "nope" | "super";

export interface Vaga {
  id: string;
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
}

export interface Profile {
  id: string;
  nome: string;
  area: string;
  senioridade: string;
  cidade: string;
  modelo: Modelo;
  pretensao: number;
  skills: string[];
  emoji: string;
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

export interface ScoreResult {
  score: number;
  motivos: string[];
  skillsEmComum: string[];
}
