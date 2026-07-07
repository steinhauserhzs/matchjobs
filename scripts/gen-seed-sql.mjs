// Gera supabase/seed.sql a partir de lib/seed-data.json (fonte única).
// Uso: node scripts/gen-seed-sql.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const vagas = JSON.parse(
  readFileSync(join(raiz, "lib/seed-data.json"), "utf8"),
);

const q = (s) => `'${String(s).replaceAll("'", "''")}'`;
const arr = (a) => `array[${a.map(q).join(",")}]::text[]`;

const linhas = vagas.map(
  (v) =>
    `(${q(v.id)}::uuid, ${q(v.empresa)}, ${q(v.logo)}, ${q(v.cor)}, ${q(v.cargo)}, ` +
    `${q(v.area)}, ${q(v.senioridade)}, ${v.salario_min}, ${v.salario_max}, ` +
    `${q(v.modelo)}, ${q(v.cidade)}, ${arr(v.skills)}, ${q(v.descricao)}, ` +
    `${arr(v.beneficios)}, ${v.ativa})`,
);

const sql = `-- Gerado por scripts/gen-seed-sql.mjs — não editar na mão.
insert into public.trampolim_vagas
  (id, empresa, logo, cor, cargo, area, senioridade, salario_min, salario_max,
   modelo, cidade, skills, descricao, beneficios, ativa)
values
${linhas.join(",\n")}
on conflict (id) do update set
  empresa = excluded.empresa,
  logo = excluded.logo,
  cor = excluded.cor,
  cargo = excluded.cargo,
  area = excluded.area,
  senioridade = excluded.senioridade,
  salario_min = excluded.salario_min,
  salario_max = excluded.salario_max,
  modelo = excluded.modelo,
  cidade = excluded.cidade,
  skills = excluded.skills,
  descricao = excluded.descricao,
  beneficios = excluded.beneficios,
  ativa = excluded.ativa;
`;

writeFileSync(join(raiz, "supabase/seed.sql"), sql);
console.log(`supabase/seed.sql gerado com ${vagas.length} vagas.`);
