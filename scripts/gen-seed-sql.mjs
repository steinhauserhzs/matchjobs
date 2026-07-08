// Gera supabase/seed.sql a partir de lib/seed-data.json + lib/seed-empresas.json
// + lib/seed-talentos.json (fonte única). Uso: node scripts/gen-seed-sql.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const ler = (p) => JSON.parse(readFileSync(join(raiz, p), "utf8"));
const vagas = ler("lib/seed-data.json");
const empresas = ler("lib/seed-empresas.json");
const talentos = ler("lib/seed-talentos.json");

const q = (s) =>
  s === undefined || s === null ? "null" : `'${String(s).replaceAll("'", "''")}'`;
const arr = (a) => `array[${(a ?? []).map(q).join(",")}]::text[]`;

const vagaRows = vagas.map(
  (v) =>
    `(${q(v.id)}::uuid, ${q(v.empresa_id)}, ${q(v.empresa)}, ${q(v.logo)}, ${q(v.cor)}, ${q(v.cargo)}, ` +
    `${q(v.area)}, ${q(v.senioridade)}, ${v.salario_min}, ${v.salario_max}, ` +
    `${q(v.modelo)}, ${q(v.cidade)}, ${arr(v.skills)}, ${q(v.descricao)}, ` +
    `${arr(v.beneficios)}, ${v.ativa})`,
);

const empresaRows = empresas.map(
  (e) =>
    `(${q(e.id)}, ${q(e.nome)}, ${q(e.logo)}, ${q(e.cor)}, ${q(e.setor)}, ${q(e.cidade)}, ` +
    `${q(e.tamanho)}, ${q(e.slogan)}, ${q(e.sobre)}, ${arr(e.selos)})`,
);

const talentoRows = talentos.map(
  (t) =>
    `(${q(t.id)}, ${q(t.nome)}, ${q(t.emoji)}, ${q(t.headline)}, ${q(t.area)}, ` +
    `${q(t.senioridade)}, ${q(t.cidade)}, ${q(t.modelo)}, ${t.pretensao}, ` +
    `${arr(t.skills)}, ${q(t.bio)}, ${t.disponivel})`,
);

const sql = `-- Gerado por scripts/gen-seed-sql.mjs — não editar na mão.
insert into public.matchjobs_vagas
  (id, empresa_id, empresa, logo, cor, cargo, area, senioridade, salario_min,
   salario_max, modelo, cidade, skills, descricao, beneficios, ativa)
values
${vagaRows.join(",\n")}
on conflict (id) do update set
  empresa_id = excluded.empresa_id, empresa = excluded.empresa,
  logo = excluded.logo, cor = excluded.cor, cargo = excluded.cargo,
  area = excluded.area, senioridade = excluded.senioridade,
  salario_min = excluded.salario_min, salario_max = excluded.salario_max,
  modelo = excluded.modelo, cidade = excluded.cidade, skills = excluded.skills,
  descricao = excluded.descricao, beneficios = excluded.beneficios,
  ativa = excluded.ativa;

insert into public.matchjobs_empresas
  (id, nome, logo, cor, setor, cidade, tamanho, slogan, sobre, selos)
values
${empresaRows.join(",\n")}
on conflict (id) do update set
  nome = excluded.nome, logo = excluded.logo, cor = excluded.cor,
  setor = excluded.setor, cidade = excluded.cidade, tamanho = excluded.tamanho,
  slogan = excluded.slogan, sobre = excluded.sobre, selos = excluded.selos;

insert into public.matchjobs_talentos
  (id, nome, emoji, headline, area, senioridade, cidade, modelo, pretensao,
   skills, bio, disponivel)
values
${talentoRows.join(",\n")}
on conflict (id) do update set
  nome = excluded.nome, emoji = excluded.emoji, headline = excluded.headline,
  area = excluded.area, senioridade = excluded.senioridade,
  cidade = excluded.cidade, modelo = excluded.modelo,
  pretensao = excluded.pretensao, skills = excluded.skills,
  bio = excluded.bio, disponivel = excluded.disponivel;
`;

writeFileSync(join(raiz, "supabase/seed.sql"), sql);
console.log(
  `supabase/seed.sql gerado: ${vagas.length} vagas, ${empresas.length} empresas, ${talentos.length} talentos.`,
);
