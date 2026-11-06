// =====================================================================
// MEDIDOR DE "CARA DE IA" DO KOSMOS
// ---------------------------------------------------------------------
// Uso:  node ferramentas/medir_texto.js                  (todas as missões publicadas)
//       node ferramentas/medir_texto.js prologo-x        (uma missão, pelo id)
//       node ferramentas/medir_texto.js arquivo.txt ...  (qualquer texto)
//
// Mede o que a pesquisa do GUIA_ESCRITA.md (seção 6) mostrou que separa texto de gente de texto de IA,
// e compara com a faixa medida em texto humano (legendas, notícias de 2026, Machado, mensagens do autor).
// Não precisa instalar nada. Os números são aproximados (contagem por padrão de palavras, sem analisador
// sintático): servem para achar o problema, não para dar nota. Quem decide é o autor.
//
// A fala é o que está entre aspas “ ” ou " "; o resto é narração.
// =====================================================================

const fs = require("fs");
const path = require("path");
const RAIZ = path.join(__dirname, "..");
const MISSOES = path.join(RAIZ, "site", "missoes");

// faixa humana medida (ver GUIA_ESCRITA.md, seção 6). [mín, máx] aceitável; fora disso, aviso.
const FAIXA = {
  variacao:        { nome: "variação do tamanho das frases", min: 0.68, dica: "frases do mesmo tamanho em fila; alternar curta e longa" },
  doispontos:      { nome: "dois-pontos a cada 100 frases", max: 6, dica: "trocar o dois-pontos por ponto final, ou cortar" },
  doispontosLista: { nome: "dois-pontos seguido de lista (por 100 frases)", max: 1, dica: "quebrar a lista em frases, ou ficar com um item" },
  trincas:         { nome: "listas curtas de três itens (por 100 frases)", max: 2, dica: "dois itens, ou um só; três só quando a cena pede" },
  naoX:            { nome: "\"não X, mas Y\" (por 100 frases)", max: 0.6, dica: "dizer só o Y" },
  deSempre:        { nome: "\"de sempre\"/\"como sempre\" a cada 10 mil palavras", max: 2, dica: "mostrar a rotina com alguém fazendo algo, sem rótulo" },
  diversidade:     { nome: "diversidade de vocabulário (MATTR, só informa)", info: true },
  umPorO:          { nome: "\"um\" para cada \"o\" nas falas", min: 0.09, so: "fala", dica: "na fala, coisa nova entra com \"um\" (\"Tem um cara na praça\")" },
  demonstrativos:  { nome: "\"esse/aquele\" a cada 100 palavras na narração", min: 0.3, so: "narr", dica: "o narrador pode apontar: \"aquele cheiro\", \"esse frio\"" },
  artigoO:         { nome: "artigos e contrações (o, a, do, na…) a cada 100 palavras na narração", max: 20, so: "narr", dica: "artigo definido em tudo trata tudo como já sabido" },
};

// ----------------------------------------------------------- leitura
function textosDaMissao(obj, acc = []) {
  if (Array.isArray(obj)) obj.forEach((v) => textosDaMissao(v, acc));
  else if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        if (["texto", "desc", "fala", "nota", "resultado"].includes(k) && v.split(/\s+/).length > 3) acc.push(v);
      } else textosDaMissao(v, acc);
    }
  }
  return acc;
}
function carregar(alvo) {
  if (fs.existsSync(alvo) && !alvo.endsWith(".json")) return { nome: path.basename(alvo), texto: fs.readFileSync(alvo, "utf8") };
  const arq = fs.existsSync(alvo) ? alvo : path.join(MISSOES, `${alvo}.json`);
  const j = JSON.parse(fs.readFileSync(arq, "utf8"));
  return { nome: path.basename(arq, ".json"), texto: textosDaMissao(j).map((t) => t.replace(/<[^>]+>/g, "")).join("\n") };
}

// ----------------------------------------------------------- medidas
const PAL = /[a-zà-úç]+(?:-[a-zà-úç]+)*/gi;
const palavras = (t) => (t.toLowerCase().match(PAL) || []);
const frases = (t) => t.split(/(?<=[.!?…])\s+|\n+/).map((f) => f.trim()).filter((f) => palavras(f).length > 0);
const conta = (t, re) => (t.match(re) || []).length;

function separar(t) {
  const falas = [];
  const narr = t.replace(/“([^”]+)”|"([^"]+)"/g, (_, a, b) => { falas.push(a || b); return " "; });
  return { narr, fala: falas.join("\n") };
}

function mattr(ps, janela = 100) {
  if (ps.length < janela + 10) return null;
  let soma = 0, n = 0;
  for (let i = 0; i + janela <= ps.length; i += 10) { soma += new Set(ps.slice(i, i + janela)).size / janela; n++; }
  return soma / n;
}

function medir(texto) {
  const { narr, fala } = separar(texto);
  const fr = frases(texto);
  const tam = fr.map((f) => palavras(f).length);
  const media = tam.reduce((a, b) => a + b, 0) / tam.length;
  const dp = Math.sqrt(tam.reduce((a, b) => a + (b - media) ** 2, 0) / tam.length);
  const n100 = 100 / fr.length;
  const item = "[A-Za-zÀ-úç0-9$]+(?: [A-Za-zÀ-úç0-9]+){0,4}";
  const curto = "[A-Za-zÀ-úç0-9$]+(?: [A-Za-zÀ-úç0-9]+)?";
  const reLista = new RegExp(`(?:^|[.:;]\\s*|, )${curto}, ${curto},? (?:e|ou) ${curto}[.!?;\\n]`, "gm");
  const reDoisLista = new RegExp(`:\\s*${item}, ${item}(?:,|,? e| e) ${item}`, "g");
  const pn = palavras(narr), pf = palavras(fala);
  const DEF = /\b(o|os|do|dos|no|nos|ao|aos|pelo|pelos)\b/gi;
  const INDEF = /\b(um|uns|dum|duns|num|nuns)\b/gi;
  const DEM = /\b(d|n)?(esse|essa|esses|essas|este|esta|estes|estas|aquele|aquela|aqueles|aquelas)\b/gi;
  const ART = /\b(o|a|os|as|do|da|dos|das|no|na|nos|nas|ao|à|aos|às|pelo|pela|pelos|pelas)\b/gi;
  const r = {
    frases: fr.length,
    palavras: palavras(texto).length,
    mediaFrase: media,
    variacao: dp / media,
    doispontos: conta(texto, /:\s/g) * n100,
    doispontosLista: conta(texto, reDoisLista) * n100,
    trincas: conta(texto, reLista) * n100,
    naoX: conta(texto, /\b(?:não|nem) [^.,;:!?]{1,40}(?:, mas |: )|\bnão é [^.!?]{1,30}, é /gi) * n100,
    deSempre: (1e4 * conta(texto, /\b(?:de|como) sempre\b/gi)) / palavras(texto).length,
    diversidade: mattr(palavras(texto)),
    umPorO: pf.length > 150 ? conta(fala, INDEF) / Math.max(conta(fala, DEF), 1) : null,
    demonstrativos: pn.length > 150 ? (100 * conta(narr, DEM)) / pn.length : null,
    artigoO: pn.length > 150 ? (100 * conta(narr, ART)) / pn.length : null,
    exemplos: {
      doispontosLista: (texto.match(reDoisLista) || []).slice(0, 3),
      naoX: (texto.match(/[^.!?\n]*\b(?:não|nem) [^.,;:!?]{1,40}(?:, mas |: )[^.!?\n]*/gi) || []).slice(0, 2),
      deSempre: (texto.match(/[^.!?\n]*\b(?:de|como) sempre\b[^.!?\n]*/gi) || []).slice(0, 3),
    },
  };
  return r;
}

// ----------------------------------------------------------- relatório
function relatorio({ nome, texto }) {
  const r = medir(texto);
  const fora = [];
  console.log(`\n■ ${nome}  (${r.palavras} palavras, ${r.frases} frases, ${r.mediaFrase.toFixed(1)} palavras por frase)`);
  for (const [k, f] of Object.entries(FAIXA)) {
    const v = r[k];
    if (v === null || v === undefined) continue;
    const ruim = !f.info && (f.min !== undefined && v < f.min) || (f.max !== undefined && v > f.max);
    const faixa = f.info ? "gente: 0,69 a 0,76" : f.min !== undefined ? `gente: ≥ ${f.min}` : `gente: ≤ ${f.max}`;
    console.log(`  ${ruim ? "✗" : "·"} ${f.nome.padEnd(48)} ${(Number.isInteger(v) ? v : v.toFixed(2)).toString().padStart(6)}   (${faixa})`);
    if (ruim) fora.push(`${f.nome}: ${f.dica}`);
  }
  for (const [k, ex] of Object.entries(r.exemplos)) if (ex.length && fora.some((x) => x.startsWith(FAIXA[k].nome))) {
    console.log(`    exemplos (${FAIXA[k].nome}):`);
    ex.forEach((e) => console.log(`      "${e.trim().slice(0, 110)}"`));
  }
  if (fora.length) { console.log("  O que fazer:"); fora.forEach((x) => console.log(`   - ${x}`)); }
  else console.log("  Dentro da faixa humana em tudo que foi medido.");
}

let alvos = process.argv.slice(2);
if (!alvos.length) {
  const ind = JSON.parse(fs.readFileSync(path.join(MISSOES, "indice.json"), "utf8"));
  alvos = (Array.isArray(ind) ? ind : ind.missoes || []).map((m) => (typeof m === "string" ? m : m.id));
}
for (const a of alvos) {
  try { relatorio(carregar(a)); } catch (e) { console.log(`\n■ ${a}: não consegui ler (${e.message})`); }
}
