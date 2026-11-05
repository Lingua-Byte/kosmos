// =====================================================================
// ÍNDICE DE CONTINUIDADE: o que o jogador JÁ VIU no KOSMOS, tirado direto dos textos do jogo.
// ---------------------------------------------------------------------
// Uso:  node ferramentas/continuidade.js       → grava LORE_CONTINUIDADE.md na raiz
//
// Lê as missões publicadas (site/missoes/*.json), as missões e origens do código
// (site/js/missoes/*.js) e o mapa de Port Halden (site/js/cidade-x.js), e lista:
// NPCs e o que dizem, datas, horários, números marcantes, nomes próprios, motivos que se
// repetem e símbolos das línguas, cada um com ONDE aparece. O agente guardiao-da-lore usa
// este índice para conferir coerência; quem decide o que é canônico continua sendo o autor
// (CLAUDE.md e site/js/historia.js).
// =====================================================================

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.join(__dirname, "..");
const SITE = path.join(RAIZ, "site");

// ---------- carregar os textos ----------
function rodarJS(arquivos, extra = "") {
  const ctx = { window: {}, console, document: undefined, MISSOES: {} };
  ctx.window = ctx;
  vm.createContext(ctx);
  const codigo = arquivos.map((a) => fs.readFileSync(path.join(SITE, a), "utf8")).join("\n;\n") + "\n;" + extra;
  try {
    vm.runInContext(codigo, ctx, { timeout: 2000 });
  } catch (e) {
    console.warn(`(aviso) não consegui ler ${arquivos.join(", ")}: ${e.message}`);
  }
  return ctx;
}

const fontes = []; // [{ origem, valor }]
const indice = JSON.parse(fs.readFileSync(path.join(SITE, "missoes", "indice.json"), "utf8"));
const publicadas = {};
for (const id of indice) {
  const m = JSON.parse(fs.readFileSync(path.join(SITE, "missoes", `${id}.json`), "utf8"));
  publicadas[id] = m;
  fontes.push({ origem: `missão ${id}`, valor: m });
}
const doCodigo = rodarJS(["js/missoes/prologo-x.js", "js/missoes/origens-x.js", "js/missoes/x1-manha.js"], "window.__ORIGENS = typeof ORIGENS_X !== 'undefined' ? ORIGENS_X : null;");
for (const [id, m] of Object.entries(doCodigo.MISSOES || {})) if (!publicadas[id]) fontes.push({ origem: `missão ${id} (código)`, valor: m });
if (doCodigo.__ORIGENS) fontes.push({ origem: "origens do Prólogo X (código; a missão publicada vale por cima)", valor: doCodigo.__ORIGENS });
const cidade = rodarJS(["js/cidade-x.js"], "window.__C = CIDADE_X;").__C;

// todos os textos, com o caminho de onde vieram
const textos = [];
function andar(x, origem, cam) {
  if (typeof x === "string") { if (x.length > 3) textos.push({ origem, cam, t: x }); }
  else if (Array.isArray(x)) x.forEach((v, i) => andar(v, origem, `${cam}[${i}]`));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) {
    if (["palavras", "id", "icone", "se", "situacao", "videoId", "forma", "cidadePor"].includes(k)) continue;
    andar(v, origem, cam ? `${cam}.${k}` : k);
  }
}
for (const f of fontes) andar(f.valor, f.origem, "");

// ---------- extrair ----------
const juntar = () => new Map();
const anotar = (mapa, chave, onde) => {
  if (!mapa.has(chave)) mapa.set(chave, new Set());
  mapa.get(chave).add(onde);
};
const datas = juntar(), horas = juntar(), numeros = juntar(), proprios = juntar(), motivos = juntar(), simbolos = juntar();

const MOTIVOS = [
  [/tr[eê]s (?:toques |batidas |pulsos )?(?:curt[oa]s|r[aá]pid[oa]s)[^.]{0,20}?(?:um|uma) long[oa]/i, "ritmo: três curtos, um longo"],
  [/conten[cç][aã]o/i, "Contenção / Diretoria de Contenção"],
  [/defesa civil/i, "Defesa Civil"],
  [/r[aá]dio pirata|frequ[eê]ncia pirata/i, "Rádio Pirata"],
  [/every breath|refr[aã]o|melodia/i, "a música / a melodia"],
  [/pra[cç]a central/i, "Praça Central"],
  [/riscador/i, "Riscadores"],
  [/delancey/i, "incêndio da Delancey Street"],
  [/capuz|mosteiro|sino/i, "visão do Eixo Y (capuz, pedra, velas, sino)"],
  [/nave|janela redonda|corredor de metal/i, "visão do Eixo Z (nave, metal)"],
];
const ABREVIACOES = new Set(["Dr", "Dra", "Sr", "Sra", "St", "Av", "Rua", "Linha", "Distrito", "Street", "Central", "Memorial", "Eixo", "Canal", "Centenas"]);
const PALAVRAS_COMUNS = new Set("Você Ele Ela Eles Elas Isso Esse Essa Este Esta Aqui Lá Hoje Amanhã Ontem Agora Depois Antes Quando Mas Não Sim Tudo Todo Toda Todos Nada Ninguém Alguém Algo Um Uma Uns Umas Os As O A No Na Nos Nas Do Da Dos Das De Se Por Para Com Sem Sua Seu Meu Minha Como Que Quem Onde Mais Menos Muito Pouco Só Já Ainda Até Também Então Bom Boa Obrigado Obrigada Desculpa Tá Toma Vai Vem Fala Olha Escuta Senhor Senhora Doutora Doutor Pai Mãe Filho Filha Deus".split(" "));

for (const { origem, cam, t } of textos) {
  const onde = `${origem} · ${cam}`;
  for (const m of t.matchAll(/\b(1[89]\d\d|20\d\d)\b/g)) anotar(datas, m[1], onde);
  for (const m of t.matchAll(/\b(\d{1,2})[h:](\d{2})\b/g)) anotar(horas, `${m[1].padStart(2, "0")}h${m[2]}`, onde);
  for (const m of t.matchAll(/\b(\d+(?:[.,]\d+)?)\s+(dias|anos|andares|horas|minutos|semanas|noites|pacientes|nomes|fiéis|senhoras|entregas|gorjetas)\b/gi)) anotar(numeros, `${m[1]} ${m[2].toLowerCase()}`, onde);
  for (const m of t.matchAll(/\b\d{2,3}\.\d\b/g)) anotar(numeros, `${m[0]} (frequência?)`, onde);
  for (const m of t.matchAll(/\$\s?\d+/g)) anotar(numeros, m[0].replace(/\s/, " "), onde);
  for (const [re, nome] of MOTIVOS) if (re.test(t)) anotar(motivos, nome, onde);
  for (const m of t.matchAll(/[∃∀∄¬ψσ𝒪ΛΔ∫√⊃◉◌⬡⌂ᚠ-ᛸ][^\s,.;:“”"]*(?:\s?[⇒→⟜⟡|∈:]\s?[^\s,.;:“”"]+)*/g)) if (m[0].length > 1 || /[∃ψ𝒪]/.test(m[0])) anotar(simbolos, m[0], onde);
  // nomes próprios: palavras com maiúscula que não começam frase
  for (const m of t.matchAll(/(?<![.!?…:]\s|^|[“"(]\s?)\b([A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç'’]+(?:\s(?:de|da|do|dos|das|&)?\s?[A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç'’.]+)*)/g)) {
    const nome = m[1].trim().replace(/\.$/, "");
    if (!PALAVRAS_COMUNS.has(nome.split(" ")[0]) && !ABREVIACOES.has(nome)) anotar(proprios, nome, onde);
  }
}

// NPCs: nome, missões e as falas (entre aspas) das ações em que aparecem
const npcs = new Map();
for (const f of fontes) {
  const m = f.valor;
  if (!m || !m.npcs) continue;
  for (const [id, nome] of Object.entries(m.npcs)) {
    const n = npcs.get(id) || { nome: typeof nome === "string" ? nome : nome.nome || id, missoes: new Set(), falas: [] };
    n.missoes.add(f.origem);
    npcs.set(id, n);
  }
  const visitar = (x) => {
    if (Array.isArray(x)) return x.forEach(visitar);
    if (!x || typeof x !== "object") return;
    if (typeof x.npc === "string" && npcs.has(x.npc)) {
      for (const r of [x.resultado, x.sucesso, x.falha]) {
        const t = r && typeof r.texto === "string" ? r.texto : "";
        for (const q of t.matchAll(/“([^”]{8,})”/g)) npcs.get(x.npc).falas.push(q[1]);
      }
    }
    Object.values(x).forEach(visitar);
  };
  visitar(m);
}

// ---------- escrever ----------
const corta = (s, n = 160) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const lista = (mapa, max = 6) => [...mapa.entries()]
  .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0], "pt"))
  .map(([k, ondes]) => `- **${k}** (${ondes.size}×): ${[...ondes].slice(0, max).join("; ")}${ondes.size > max ? "; …" : ""}`)
  .join("\n");

let md = `# KOSMOS — Índice de continuidade

> **Gerado por \`node ferramentas/continuidade.js\`. Não editar à mão.**
> É o que o jogador **já viu** nos textos do jogo, não a lore oficial. O que vale como regra está no
> \`CLAUDE.md\` e em \`site/js/historia.js\`. Usado pelo agente \`guardiao-da-lore\`.

Fontes: ${fontes.map((f) => f.origem).join(", ")}, mapa de Port Halden.

## NPCs
${[...npcs.entries()].map(([id, n]) => `- **${n.nome}** (\`${id}\`) — ${[...n.missoes].join(", ")}${n.falas.length ? `\n  - falas: ${n.falas.slice(0, 3).map((f) => `“${corta(f, 140)}”`).join(" · ")}` : ""}`).join("\n")}

## Datas (anos)
${lista(datas)}

## Horários
${lista(horas)}

## Números marcantes (quantidades, frequências, dinheiro)
${lista(numeros, 3)}

## Motivos que se repetem
${lista(motivos, 4)}

## Símbolos das línguas usados no texto
${lista(simbolos, 3)}

## Mapa de Port Halden
${cidade ? Object.entries(cidade.bairros).map(([bid, b]) => `- **${b.nome}**: ${Object.values(cidade.lugares).filter((l) => l.bairro === bid).map((l) => l.nome + (l.segredo ? " (segredo)" : "")).join(", ")}`).join("\n") : "(não consegui ler js/cidade-x.js)"}

## Nomes próprios (aparecem 2 vezes ou mais)
${lista(new Map([...proprios].filter(([, s]) => s.size >= 2)), 3)}
`;

fs.writeFileSync(path.join(RAIZ, "LORE_CONTINUIDADE.md"), md);
console.log(`LORE_CONTINUIDADE.md gravado: ${npcs.size} NPCs, ${datas.size} datas, ${horas.size} horários, ${motivos.size} motivos, ${proprios.size} nomes próprios.`);
