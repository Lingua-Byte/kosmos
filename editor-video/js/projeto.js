// Estado do projeto: faixas, clipes, mídias, histórico (desfazer) e gravação local.
// Tempos sempre em segundos. Um clipe ocupa [inicio, inicio + duracao) na linha do tempo
// e mostra a mídia a partir de "entrada" (segundos dentro do arquivo original).

const CHAVE_PROJETO = "editor-video:projeto";
const BANCO = "editor-video";

export const estado = {
  projeto: null,
  midias: new Map(),      // id -> { id, nome, tipo, url, duracao, largura, altura, miniatura }
  selecao: new Set(),     // ids de clipes
  cursor: 0,              // tempo do cursor (playhead)
  tocando: false,
  zoom: 80,               // pixels por segundo
};

const ouvintes = new Set();
export function aoMudar(fn) { ouvintes.add(fn); }
export function avisar(motivo = "geral") {
  for (const fn of ouvintes) fn(motivo);
  if (motivo !== "cursor" && motivo !== "selecao") gravarDepois();
}

let contador = Date.now() % 100000;
export const novoId = (prefixo) => `${prefixo}${(contador++).toString(36)}`;

export function projetoVazio() {
  return {
    nome: "Projeto sem título",
    largura: 1920,
    altura: 1080,
    fps: 30,
    faixas: [
      { id: "T1", tipo: "video", nome: "Títulos", oculta: false, muda: false },
      { id: "V2", tipo: "video", nome: "V2", oculta: false, muda: false },
      { id: "V1", tipo: "video", nome: "V1", oculta: false, muda: false },
      { id: "A1", tipo: "audio", nome: "A1", oculta: false, muda: false },
      { id: "A2", tipo: "audio", nome: "A2", oculta: false, muda: false },
    ],
    clipes: [],
    marcadores: [],
  };
}

// ---------- consultas ----------
export const faixa = (id) => estado.projeto.faixas.find((f) => f.id === id);
export const clipe = (id) => estado.projeto.clipes.find((c) => c.id === id);
export const fim = (c) => c.inicio + c.duracao;

export function duracaoProjeto() {
  let maior = 0;
  for (const c of estado.projeto.clipes) maior = Math.max(maior, fim(c));
  return maior;
}

export function clipesDaFaixa(idFaixa) {
  return estado.projeto.clipes.filter((c) => c.faixa === idFaixa).sort((a, b) => a.inicio - b.inicio);
}

export function fimDaFaixa(idFaixa) {
  return clipesDaFaixa(idFaixa).reduce((m, c) => Math.max(m, fim(c)), 0);
}

// Quanto da mídia ainda existe depois da entrada (Infinity para imagem e texto).
export function duracaoMaxima(c) {
  const m = c.midia && estado.midias.get(c.midia);
  if (!m || m.tipo === "imagem" || c.tipo === "texto") return Infinity;
  return Math.max(0.04, (m.duracao || 0) - c.entrada);
}

export function faixaCompativel(tipoClipe, idFaixa) {
  const f = faixa(idFaixa);
  if (!f) return false;
  return tipoClipe === "audio" ? f.tipo === "audio" : f.tipo === "video";
}

export function primeiraFaixa(tipoClipe) {
  const faixas = estado.projeto.faixas;
  if (tipoClipe === "audio") return faixas.find((f) => f.tipo === "audio")?.id;
  if (tipoClipe === "texto") return faixas.find((f) => f.tipo === "video")?.id;
  const videos = faixas.filter((f) => f.tipo === "video");
  return videos[videos.length - 1]?.id; // a mais de baixo (V1)
}

// ---------- operações (usadas pela interface e pelo assistente) ----------
const q = (t) => Math.max(0, Math.round(t * 1000) / 1000);

export function criarClipe({ midia, faixa: idFaixa, inicio, entrada = 0, duracao, texto, estilo }) {
  let tipo = "texto";
  let m = null;
  if (midia) {
    m = estado.midias.get(midia);
    if (!m) throw new Error(`Mídia ${midia} não existe.`);
    tipo = m.tipo;
  }
  idFaixa = idFaixa || primeiraFaixa(tipo);
  if (!faixaCompativel(tipo, idFaixa)) throw new Error(`A faixa ${idFaixa} não aceita ${tipo}.`);
  if (inicio === undefined || inicio === null) inicio = fimDaFaixa(idFaixa);
  const padrao = m ? (m.tipo === "imagem" ? 5 : Math.max(0.04, (m.duracao || 5) - entrada)) : 4;
  const c = {
    id: novoId("c"),
    tipo,
    faixa: idFaixa,
    midia: midia || null,
    inicio: q(inicio),
    entrada: q(entrada),
    duracao: q(duracao ?? padrao),
    volume: 1,
    opacidade: 1,
    fadeEntrada: 0,
    fadeSaida: 0,
  };
  c.duracao = Math.max(0.04, Math.min(c.duracao, duracaoMaxima(c)));
  if (tipo === "texto") {
    c.texto = texto || "Título";
    c.estilo = { tamanho: 8, cor: "#ffffff", y: 0.5, fundo: "", negrito: true, ...(estilo || {}) };
  }
  estado.projeto.clipes.push(c);
  return c;
}

export function moverClipe(c, { inicio, faixa: idFaixa }) {
  if (idFaixa !== undefined && idFaixa !== c.faixa) {
    if (!faixaCompativel(c.tipo, idFaixa)) throw new Error(`A faixa ${idFaixa} não aceita ${c.tipo}.`);
    c.faixa = idFaixa;
  }
  if (inicio !== undefined) c.inicio = q(inicio);
}

export function aparar(c, { entrada, duracao }) {
  if (entrada !== undefined) {
    const m = c.midia && estado.midias.get(c.midia);
    const limite = m && m.tipo !== "imagem" ? Math.max(0, (m.duracao || 0) - 0.04) : 0;
    c.entrada = m && m.tipo !== "imagem" ? q(Math.min(Math.max(0, entrada), limite)) : 0;
  }
  if (duracao !== undefined) c.duracao = q(Math.max(0.04, duracao));
  c.duracao = Math.max(0.04, Math.min(c.duracao, duracaoMaxima(c)));
}

// Divide o clipe no tempo t da linha do tempo. Devolve o pedaço da direita.
export function dividir(c, t) {
  if (t <= c.inicio + 0.02 || t >= fim(c) - 0.02) return null;
  const esquerda = t - c.inicio;
  const direita = structuredClone(c);
  direita.id = novoId("c");
  direita.inicio = q(t);
  direita.duracao = q(c.duracao - esquerda);
  if (c.tipo !== "imagem" && c.tipo !== "texto") direita.entrada = q(c.entrada + esquerda);
  direita.fadeEntrada = 0;
  c.duracao = q(esquerda);
  c.fadeSaida = 0;
  estado.projeto.clipes.push(direita);
  return direita;
}

export function remover(ids, fecharLacunas = false) {
  const alvo = new Set(ids);
  const removidos = estado.projeto.clipes.filter((c) => alvo.has(c.id));
  estado.projeto.clipes = estado.projeto.clipes.filter((c) => !alvo.has(c.id));
  if (fecharLacunas) {
    // Ripple: puxa para a esquerda o que vinha depois, na mesma faixa.
    for (const r of removidos.sort((a, b) => b.inicio - a.inicio)) {
      for (const c of estado.projeto.clipes) {
        if (c.faixa === r.faixa && c.inicio >= fim(r) - 0.001) c.inicio = q(c.inicio - r.duracao);
      }
    }
  }
  for (const id of ids) estado.selecao.delete(id);
  return removidos.length;
}

export function adicionarFaixa(tipo) {
  const prefixo = tipo === "audio" ? "A" : "V";
  let n = 1;
  while (faixa(prefixo + n)) n++;
  const f = { id: prefixo + n, tipo, nome: prefixo + n, oculta: false, muda: false };
  const faixas = estado.projeto.faixas;
  if (tipo === "audio") faixas.push(f);
  else faixas.splice(faixas[0]?.id === "T1" ? 1 : 0, 0, f); // nova camada de vídeo logo abaixo dos títulos
  return f;
}

// ---------- histórico ----------
const passado = [];
const futuro = [];
export function marcarDesfazer() {
  passado.push(JSON.stringify(estado.projeto));
  if (passado.length > 200) passado.shift();
  futuro.length = 0;
}
export function desfazer() {
  if (!passado.length) return false;
  futuro.push(JSON.stringify(estado.projeto));
  estado.projeto = JSON.parse(passado.pop());
  limparSelecao();
  avisar("projeto");
  return true;
}
export function refazer() {
  if (!futuro.length) return false;
  passado.push(JSON.stringify(estado.projeto));
  estado.projeto = JSON.parse(futuro.pop());
  limparSelecao();
  avisar("projeto");
  return true;
}
function limparSelecao() {
  for (const id of [...estado.selecao]) if (!clipe(id)) estado.selecao.delete(id);
}

// ---------- mídias ----------
function carregarMetadados(url, tipo) {
  return new Promise((resolve) => {
    if (tipo === "imagem") {
      const img = new Image();
      img.onload = () => resolve({ largura: img.naturalWidth, altura: img.naturalHeight, duracao: 0, miniatura: url });
      img.onerror = () => resolve({ largura: 0, altura: 0, duracao: 0 });
      img.src = url;
      return;
    }
    const el = document.createElement(tipo === "audio" ? "audio" : "video");
    el.preload = "auto";
    el.muted = true;
    el.onloadedmetadata = () => {
      const info = { duracao: el.duration, largura: el.videoWidth || 0, altura: el.videoHeight || 0 };
      if (tipo !== "video") return resolve(info);
      el.onseeked = () => {
        const tela = document.createElement("canvas");
        tela.width = 160;
        tela.height = Math.round(160 * (info.altura / info.largura || 9 / 16));
        tela.getContext("2d").drawImage(el, 0, 0, tela.width, tela.height);
        info.miniatura = tela.toDataURL("image/jpeg", 0.7);
        resolve(info);
      };
      el.currentTime = Math.min(1, el.duration / 3);
    };
    el.onerror = () => resolve({ duracao: 0, largura: 0, altura: 0 });
    el.src = url;
  });
}

function tipoDoArquivo(arquivo) {
  if (arquivo.type.startsWith("video/")) return "video";
  if (arquivo.type.startsWith("audio/")) return "audio";
  if (arquivo.type.startsWith("image/")) return "imagem";
  const ext = arquivo.name.split(".").pop().toLowerCase();
  if (["mp4", "webm", "mov", "mkv", "m4v"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "m4a", "aac", "flac"].includes(ext)) return "audio";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "imagem";
  return null;
}

export async function importarArquivo(arquivo, id = null) {
  const tipo = tipoDoArquivo(arquivo);
  if (!tipo) throw new Error(`Formato não suportado: ${arquivo.name}`);
  const url = URL.createObjectURL(arquivo);
  const info = await carregarMetadados(url, tipo);
  const m = { id: id || novoId("m"), nome: arquivo.name, tipo, url, ...info };
  estado.midias.set(m.id, m);
  if (!id) guardarArquivo(m.id, arquivo);
  return m;
}

// ---------- gravação local (projeto no localStorage, arquivos no IndexedDB) ----------
let temporizador = null;
function gravarDepois() {
  clearTimeout(temporizador);
  temporizador = setTimeout(gravarAgora, 400);
}
export function gravarAgora() {
  try {
    localStorage.setItem(CHAVE_PROJETO, JSON.stringify({ projeto: estado.projeto, cursor: estado.cursor, zoom: estado.zoom }));
  } catch { /* sem armazenamento: segue só na memória */ }
}

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(BANCO, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore("arquivos");
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function guardarArquivo(id, arquivo) {
  try {
    const banco = await abrirBanco();
    banco.transaction("arquivos", "readwrite").objectStore("arquivos").put(arquivo, id);
  } catch { /* sem IndexedDB: a mídia vale só nesta sessão */ }
}

export async function esquecerArquivo(id) {
  try {
    const banco = await abrirBanco();
    banco.transaction("arquivos", "readwrite").objectStore("arquivos").delete(id);
  } catch { /* nada */ }
}

async function lerArquivos() {
  try {
    const banco = await abrirBanco();
    return await new Promise((resolve) => {
      const saida = [];
      const cursor = banco.transaction("arquivos").objectStore("arquivos").openCursor();
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (!c) return resolve(saida);
        saida.push([c.key, c.value]);
        c.continue();
      };
      cursor.onerror = () => resolve(saida);
    });
  } catch {
    return [];
  }
}

export async function carregar() {
  let salvo = null;
  try { salvo = JSON.parse(localStorage.getItem(CHAVE_PROJETO) || "null"); } catch { /* nada */ }
  estado.projeto = salvo?.projeto || projetoVazio();
  estado.cursor = salvo?.cursor || 0;
  estado.zoom = salvo?.zoom || 80;
  for (const [id, arquivo] of await lerArquivos()) {
    try { await importarArquivo(arquivo, id); } catch { /* arquivo estragado */ }
  }
  // Clipes cuja mídia sumiu ficam marcados (a interface mostra "mídia ausente").
}

export async function novoProjeto() {
  estado.projeto = projetoVazio();
  estado.selecao.clear();
  estado.cursor = 0;
  for (const id of estado.midias.keys()) esquecerArquivo(id);
  estado.midias.clear();
  passado.length = 0;
  futuro.length = 0;
  avisar("projeto");
}
