// Captura os screenshots do README (docs/screenshots/). Requer app em http://localhost:3777
// Uso: node scripts/screenshots.mjs
import puppeteer from "puppeteer-core";

const BASE = "http://localhost:3777";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const PERFIL = {
  id: "demo-0000-4000-8000-demo",
  nome: "Ana Souza",
  emoji: "🩺",
  headline: "Enfermeira que ama plantão que funciona",
  bio: "8 anos de urgência e emergência. Procuro hospital que respeite escala e invista em gente.",
  email: "ana@email.com",
  telefone: "(19) 98888-1234",
  linkedin: "linkedin.com/in/anasouza",
  area: "Saúde",
  senioridade: "Pleno",
  cidade: "Campinas, SP",
  modelo: "presencial",
  pretensao: 6000,
  skills: ["Enfermagem", "Urgência e Emergência", "Prontuário Eletrônico", "Atendimento Clínico"],
  experiencias: [
    { cargo: "Enfermeira de PS", empresa: "Santa Casa", inicio: "2020" },
    { cargo: "Técnica de Enfermagem", empresa: "Hospital Municipal", inicio: "2017", fim: "2020" },
  ],
  formacao: [{ curso: "Bacharelado em Enfermagem", instituicao: "Unicamp", ano: "2017" }],
  idiomas: [{ idioma: "Inglês", nivel: "intermediário" }],
  cvImportado: true,
};

const BADGES = [
  { badge_id: "estreante", em: new Date().toISOString() },
  { badge_id: "primeiro-match", em: new Date().toISOString() },
  { badge_id: "cv-na-mao", em: new Date().toISOString() },
  { badge_id: "perfil-nota-dez", em: new Date().toISOString() },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

async function shot(nome, { url = "/", seed = null, antes = null, espera = 900 } = {}) {
  await page.evaluateOnNewDocument((dados) => {
    localStorage.clear();
    if (dados) for (const [k, v] of Object.entries(dados)) localStorage.setItem(k, v);
  }, seed);
  await page.goto(BASE + url, { waitUntil: "networkidle0" });
  if (antes) await antes();
  await new Promise((r) => setTimeout(r, espera));
  await page.screenshot({ path: `docs/screenshots/${nome}.png` });
  console.log("✓", nome);
}

const seedApp = {
  "matchjobs:profile": JSON.stringify(PERFIL),
  "matchjobs:badges": JSON.stringify(BADGES),
};

await shot("01-splash", { espera: 1600 });
await shot("02-deck", { seed: seedApp, espera: 1600 });
await shot("03-match", {
  seed: seedApp,
  antes: async () => {
    await page.evaluate(() => {
      document.querySelector('button[aria-label="Quero essa vaga"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 1200));
  },
});
await shot("04-perfil", {
  seed: seedApp,
  antes: async () => {
    await page.evaluate(() => {
      [...document.querySelectorAll("button")].find((b) => b.textContent.trim().startsWith("Perfil"))?.click();
    });
  },
});
await shot("05-empresa", {
  seed: { "matchjobs:empresa_ativa": "hospital-luz-do-vale" },
  url: "/empresa",
  espera: 1400,
});
await shot("06-hunter", { url: "/hunter", espera: 1400 });
await shot("07-admin", { url: "/admin", espera: 1800 });

await browser.close();
console.log("Screenshots prontos em docs/screenshots/");
