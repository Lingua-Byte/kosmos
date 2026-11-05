// =====================================================================
// TESTADOR DO KOSMOS: confere as missões publicadas e abre o jogo num navegador de verdade.
// ---------------------------------------------------------------------
// Uso:  node ferramentas/testar.js            (precisa do Playwright: npm i playwright)
//       node ferramentas/testar.js --rapido   (só confere as missões, sem abrir o navegador)
//
// 1) Missões (site/missoes/<id>.json, as do indice.json):
//    · ERRO: "ir" para cena ou lugar que não existe, cena inicial inexistente, texto de cena vazio,
//      escolha sem texto, NPC citado que não está em "npcs", condição com flag que nada liga.
//    · AVISO: cena que nada alcança, parágrafo comprido demais para a tela, frase com cara de IA,
//      menos pistas do que o necessário para o marco, NPC sem balbucio (vozes.js) ou sem fala breve (barks).
// 2) Navegador: abre index.html, oficina.html e diagramas.html; erro de JavaScript na página é ERRO.
//    Confere também se cada lugar das missões do X existe no mapa de Port Halden (cidade-x.js).
// Sai com código 1 se houver ERRO (o robô do GitHub mostra em vermelho).
// =====================================================================

const fs = require("fs");
const path = require("path");
const http = require("http");

const RAIZ = path.join(__dirname, "..");
const SITE = path.join(RAIZ, "site");
const rapido = process.argv.includes("--rapido");

const erros = [];
const avisos = [];
const erro = (onde, msg) => erros.push(`${onde}: ${msg}`);
const aviso = (onde, msg) => avisos.push(`${onde}: ${msg}`);

// frases e tiques que o GUIA_ESCRITA.md manda cortar
const CARA_DE_IA = [
  /uma coisa é certa/i,
  /se houver amanhã/i,
  /por via das dúvidas\.$/i,
  /não há mais como evitar/i,
  /calm[oa] demais/i,
  /um arrepio/i,
  /algo (?:estranho|diferente) (?:no ar|acontece)/i,
];
const PARAGRAFO_MAX = 420; // caracteres; acima disso a tela do celular rola

// ---------- 1) Missões ----------
function lerJSON(arq) {
  try {
    return JSON.parse(fs.readFileSync(arq, "utf8"));
  } catch (e) {
    erro(path.relative(RAIZ, arq), `não é um JSON válido (${e.message})`);
    return null;
  }
}

// percorre todo o objeto chamando fn(valor, chave, caminho)
function andar(x, fn, cam = "") {
  if (Array.isArray(x)) x.forEach((v, i) => { fn(v, i, `${cam}[${i}]`); andar(v, fn, `${cam}[${i}]`); });
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) { fn(v, k, `${cam}.${k}`); andar(v, fn, `${cam}.${k}`); }
}

const perfisVozes = (() => {
  const t = fs.readFileSync(path.join(SITE, "js", "vozes.js"), "utf8");
  const bloco = t.slice(t.indexOf("PERFIS = {"), t.indexOf("};", t.indexOf("PERFIS = {")));
  return new Set([...bloco.matchAll(/^\s*"?([\w-]+)"?\s*:/gm)].map((m) => m[1]));
})();
// flags que o próprio motor liga (ex.: camp.flags.radioTocando = ...), além das da missão
const flagsDoMotor = new Set([...fs.readFileSync(path.join(SITE, "js", "cenas.js"), "utf8").matchAll(/camp\.flags\.(\w+)\s*=/g)].map((m) => m[1]));
const barks = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(SITE, "audio", "barks", "indice.json"), "utf8"));
  } catch {
    return {};
  }
})();

function conferirMissao(id) {
  const arq = path.join(SITE, "missoes", `${id}.json`);
  if (!fs.existsSync(arq)) return erro(`missoes/${id}.json`, "está no indice.json mas o arquivo não existe");
  const m = lerJSON(arq);
  if (!m) return;
  const onde = `missão ${id}`;
  const cenas = m.cenas || {};
  const lugares = m.lugares || {};
  const npcs = m.npcs || {};

  if (m.inicio && !cenas[m.inicio] && !lugares[m.inicio]) erro(onde, `cena inicial "${m.inicio}" não existe`);

  const flagsLigadas = new Set([...flagsDoMotor, ...(m.eventosRelogio || []).map((e) => e.flag).filter(Boolean)]);
  const flagsUsadas = [];
  const alvos = new Set([m.inicio, "chamado"]);
  let pistas = 0;

  andar(m, (v, k, cam) => {
    if (k === "efeitos" && v && v.flag) [].concat(v.flag).forEach((f) => flagsLigadas.add(f));
    if (k === "se" && v && typeof v === "object")
      for (const chave of ["flag", "algum"]) [].concat(v[chave] || []).forEach((f) => flagsUsadas.push([f, cam]));
    if (k === "pista" && typeof v === "string" && !/\.falha\./.test(cam)) pistas++;
    if (k === "npc" && typeof v === "string" && !npcs[v]) erro(onde, `${cam} cita o NPC "${v}", que não está na lista de NPCs`);
    if (k === "ir" && typeof v === "string" && v) {
      const [tipo, alvo] = v.split(":");
      if (tipo === "cena") { alvos.add(alvo); if (!cenas[alvo]) erro(onde, `${cam} vai para a cena "${alvo}", que não existe`); }
      else if (tipo === "lugar") { if (!lugares[alvo]) erro(onde, `${cam} vai para o lugar "${alvo}", que não existe`); }
    }
    if (k === "texto" && typeof v === "string") {
      v.split(/\n\s*\n/).forEach((par) => {
        if (par.length > PARAGRAFO_MAX) aviso(onde, `${cam} tem um parágrafo de ${par.length} caracteres (a tela pode rolar)`);
      });
      for (const re of CARA_DE_IA) if (re.test(v)) aviso(onde, `${cam} tem frase com cara de IA: "${v.match(re)[0]}"`);
    }
  });

  for (const [f, cam] of flagsUsadas) if (!flagsLigadas.has(f)) erro(onde, `${cam} espera a flag "${f}", mas nada na missão a liga`);

  for (const [cid, c] of Object.entries(cenas)) {
    if (!c.texto && !(c.variantes || []).length) erro(onde, `a cena "${cid}" não tem texto`);
    (c.opcoes || []).forEach((o, i) => { if (!o.texto) erro(onde, `a cena "${cid}" tem a escolha ${i + 1} sem texto`); });
    if (!alvos.has(cid)) aviso(onde, `nada leva à cena "${cid}"`);
  }
  for (const [lid, l] of Object.entries(lugares))
    (l.acoes || []).forEach((a, i) => { if (!a.texto) erro(onde, `o lugar "${lid}" tem a ação ${i + 1} sem texto`); });

  if (m.pistasParaMarco && pistas < m.pistasParaMarco) aviso(onde, `só ${pistas} pistas possíveis, e o marco pede ${m.pistasParaMarco}`);

  for (const npc of Object.keys(npcs)) {
    if (!perfisVozes.has(npc)) aviso(onde, `o NPC "${npc}" não tem balbucio próprio (PERFIS em js/vozes.js)`);
    if (!barks[npc]) aviso(onde, `o NPC "${npc}" não tem fala breve gravada (audio/barks)`);
  }
  return m;
}

const indice = lerJSON(path.join(SITE, "missoes", "indice.json")) || [];
const missoes = {};
for (const id of indice) missoes[id] = conferirMissao(id);

// ---------- 2) Navegador ----------
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".webmanifest": "application/manifest+json" };

function servidor() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      const url = decodeURIComponent(req.url.split("?")[0]);
      const arq = path.join(SITE, url === "/" ? "index.html" : url);
      if (!arq.startsWith(SITE) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "Content-Type": TIPOS[path.extname(arq)] || "application/octet-stream" });
      fs.createReadStream(arq).pipe(res);
    });
    s.listen(0, "127.0.0.1", () => ok(s));
  });
}

async function navegador() {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch {
    aviso("navegador", "Playwright não está instalado (npm i playwright); só as missões foram conferidas");
    return;
  }
  const s = await servidor();
  const base = `http://127.0.0.1:${s.address().port}`;
  const nav = await chromium.launch();
  try {
    for (const pagina of ["index.html", "oficina.html", "diagramas.html"]) {
      const p = await nav.newPage();
      p.on("pageerror", (e) => erro(pagina, `erro de JavaScript: ${e.message}`));
      await p.goto(`${base}/${pagina}`, { waitUntil: "load" });
      await p.waitForTimeout(2500);
      if (pagina === "index.html") {
        const r = await p.evaluate((ids) => {
          const faltam = ids.filter((id) => !(window.MISSOES || {})[id]);
          const mapa = typeof CIDADE_X !== "undefined" ? Object.keys(CIDADE_X.lugares) : null;
          const lig = typeof LIGACOES_X !== "undefined" ? LIGACOES_X : {};
          return { faltam, mapa, lig };
        }, indice);
        r.faltam.forEach((id) => erro("index.html", `a missão "${id}" não carregou no jogo`));
        if (r.mapa) {
          const noMapa = new Set(r.mapa);
          for (const [id, m] of Object.entries(missoes)) {
            if (!m || m.eixo !== "x") continue;
            for (const [lid, l] of Object.entries(m.lugares || {})) {
              const ids = [l.cidade, ...Object.values(l.cidadePor || {})].filter(Boolean);
              ids.forEach((c) => { if (!noMapa.has(c)) erro(`missão ${id}`, `o lugar "${lid}" aponta para "${c}", que não está no mapa de Port Halden`); });
              if (!ids.length && !(r.lig[id] || {})[lid]) aviso(`missão ${id}`, `o lugar "${lid}" não está ligado a nenhum ponto do mapa`);
            }
          }
        }
      }
      await p.close();
    }
  } finally {
    await nav.close();
    s.close();
  }
}

(async () => {
  if (!rapido) await navegador();
  const n = Object.keys(missoes).length;
  console.log(`\nKOSMOS · testador — ${n} missão(ões) conferida(s)${rapido ? " (sem navegador)" : " + navegador"}\n`);
  if (erros.length) { console.log(`✗ ${erros.length} ERRO(S):`); erros.forEach((e) => console.log("  · " + e)); console.log(); }
  if (avisos.length) { console.log(`! ${avisos.length} aviso(s):`); avisos.forEach((a) => console.log("  · " + a)); console.log(); }
  if (!erros.length) console.log("✓ Nenhum erro.");
  process.exit(erros.length ? 1 : 0);
})();
