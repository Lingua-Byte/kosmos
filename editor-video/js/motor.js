// Motor: desenha o quadro do tempo atual no canvas, toca, mixa o áudio e exporta.
import { estado, avisar, fim, duracaoProjeto, faixa } from "./projeto.js";

let tela = null;
let g = null;
const elementos = new Map();   // id do clipe -> { el, ganho, midia }
const imagens = new Map();     // id da mídia -> HTMLImageElement
let audio = null;              // { ctx, mestre, gravacao }
let quadroPedido = false;

export function iniciarMotor(canvas) {
  tela = canvas;
  g = tela.getContext("2d");
  ajustarTamanho();
  desenhar();
}

export function ajustarTamanho() {
  const p = estado.projeto;
  if (tela.width !== p.largura || tela.height !== p.altura) {
    tela.width = p.largura;
    tela.height = p.altura;
  }
}

// ---------- áudio ----------
// O AudioContext só pode nascer depois de um gesto do usuário (clique, tecla).
export function ligarAudio() {
  if (audio) {
    if (audio.ctx.state === "suspended") audio.ctx.resume();
    return;
  }
  const ctx = new AudioContext();
  const mestre = ctx.createGain();
  const gravacao = ctx.createMediaStreamDestination();
  mestre.connect(ctx.destination);
  mestre.connect(gravacao);
  audio = { ctx, mestre, gravacao };
  for (const item of elementos.values()) conectar(item);
}

function conectar(item) {
  if (!audio || item.ganho) return;
  const fonte = audio.ctx.createMediaElementSource(item.el);
  item.ganho = audio.ctx.createGain();
  fonte.connect(item.ganho).connect(audio.mestre);
}

function elementoDoClipe(c) {
  let item = elementos.get(c.id);
  if (item && item.midia === c.midia) return item;
  if (item) descartar(c.id);
  const m = estado.midias.get(c.midia);
  if (!m) return null;
  const el = document.createElement(m.tipo === "audio" ? "audio" : "video");
  el.src = m.url;
  el.preload = "auto";
  el.playsInline = true;
  el.crossOrigin = "anonymous";
  el.addEventListener("seeked", pedirQuadro);
  el.addEventListener("loadeddata", pedirQuadro);
  item = { el, ganho: null, midia: c.midia };
  elementos.set(c.id, item);
  conectar(item);
  return item;
}

function descartar(id) {
  const item = elementos.get(id);
  if (!item) return;
  item.el.pause();
  item.el.removeAttribute("src");
  item.el.load();
  item.ganho?.disconnect();
  elementos.delete(id);
}

function imagemDaMidia(id) {
  let img = imagens.get(id);
  if (!img) {
    const m = estado.midias.get(id);
    if (!m) return null;
    img = new Image();
    img.onload = pedirQuadro;
    img.src = m.url;
    imagens.set(id, img);
  }
  return img;
}

// ---------- desenho ----------
function fator(c, t) {
  let f = 1;
  const dentro = t - c.inicio;
  const resta = fim(c) - t;
  if (c.fadeEntrada > 0) f = Math.min(f, dentro / c.fadeEntrada);
  if (c.fadeSaida > 0) f = Math.min(f, resta / c.fadeSaida);
  return Math.max(0, Math.min(1, f));
}

function ativo(faixaId, t) {
  let melhor = null;
  for (const c of estado.projeto.clipes) {
    if (c.faixa !== faixaId || t < c.inicio || t >= fim(c)) continue;
    if (!melhor || c.inicio >= melhor.inicio) melhor = c;
  }
  return melhor;
}

function encaixar(fonte, w, h) {
  const W = tela.width, H = tela.height;
  if (!w || !h) return;
  const escala = Math.min(W / w, H / h);
  const dw = w * escala, dh = h * escala;
  g.drawImage(fonte, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

function quebrarLinhas(texto, largura) {
  const linhas = [];
  for (const paragrafo of String(texto).split("\n")) {
    let atual = "";
    for (const palavra of paragrafo.split(" ")) {
      const teste = atual ? `${atual} ${palavra}` : palavra;
      if (g.measureText(teste).width > largura && atual) {
        linhas.push(atual);
        atual = palavra;
      } else atual = teste;
    }
    linhas.push(atual);
  }
  return linhas;
}

function desenharTexto(c) {
  const W = tela.width, H = tela.height;
  const e = c.estilo || {};
  const tamanho = Math.max(8, ((e.tamanho || 8) / 100) * H);
  g.font = `${e.negrito === false ? 500 : 800} ${tamanho}px "Inter", system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  const linhas = quebrarLinhas(c.texto || "", W * 0.9);
  const altura = tamanho * 1.2;
  const y0 = (e.y ?? 0.5) * H - ((linhas.length - 1) * altura) / 2;
  if (e.fundo) {
    const largura = Math.max(...linhas.map((l) => g.measureText(l).width));
    const pad = tamanho * 0.35;
    g.fillStyle = e.fundo;
    g.fillRect(W / 2 - largura / 2 - pad, y0 - altura / 2 - pad / 2, largura + pad * 2, altura * linhas.length + pad);
  }
  g.shadowColor = "rgba(0,0,0,0.6)";
  g.shadowBlur = e.fundo ? 0 : tamanho * 0.15;
  g.fillStyle = e.cor || "#fff";
  linhas.forEach((l, i) => g.fillText(l, W / 2, y0 + i * altura));
  g.shadowBlur = 0;
}

function sincronizar(el, alvo, tocando) {
  if (tocando) {
    if (el.paused) {
      el.currentTime = alvo;
      el.play().catch(() => {});
    } else if (Math.abs(el.currentTime - alvo) > 0.3) el.currentTime = alvo;
  } else {
    if (!el.paused) el.pause();
    if (!el.seeking && Math.abs(el.currentTime - alvo) > 0.02) el.currentTime = alvo;
  }
}

// Desenha o quadro do tempo t e acerta o áudio de todos os clipes.
export function desenhar(t = estado.cursor, tocando = estado.tocando) {
  if (!tela) return;
  ajustarTamanho();
  const p = estado.projeto;
  g.globalAlpha = 1;
  g.fillStyle = "#000";
  g.fillRect(0, 0, tela.width, tela.height);

  // Clipes com som ou imagem em movimento: liga os ativos, pausa os outros.
  const vivos = new Set();
  for (const c of p.clipes) {
    if (c.tipo !== "video" && c.tipo !== "audio") continue;
    const perto = t >= c.inicio - 1.5 && t < fim(c) + 0.5;
    if (!perto) continue;
    vivos.add(c.id);
    const item = elementoDoClipe(c);
    if (!item) continue;
    const dentro = t >= c.inicio && t < fim(c);
    const f = faixa(c.faixa);
    if (dentro) {
      sincronizar(item.el, c.entrada + (t - c.inicio), tocando);
      const vol = f?.muda ? 0 : (c.volume ?? 1) * fator(c, t);
      if (item.ganho) item.ganho.gain.value = vol;
      else item.el.volume = Math.min(1, vol);
    } else {
      if (!item.el.paused) item.el.pause();
      if (!item.el.seeking && Math.abs(item.el.currentTime - c.entrada) > 0.05) item.el.currentTime = c.entrada; // pré-carrega
    }
  }
  for (const id of [...elementos.keys()]) if (!vivos.has(id)) descartar(id);

  // Imagem: da faixa de vídeo mais de baixo para a mais de cima.
  const camadas = p.faixas.filter((f) => f.tipo === "video" && !f.oculta).reverse();
  for (const f of camadas) {
    const c = ativo(f.id, t);
    if (!c) continue;
    g.globalAlpha = (c.opacidade ?? 1) * fator(c, t);
    if (c.tipo === "video") {
      const el = elementos.get(c.id)?.el;
      if (el && el.readyState >= 2) encaixar(el, el.videoWidth, el.videoHeight);
    } else if (c.tipo === "imagem") {
      const img = imagemDaMidia(c.midia);
      if (img?.complete) encaixar(img, img.naturalWidth, img.naturalHeight);
    } else if (c.tipo === "texto") desenharTexto(c);
  }
  g.globalAlpha = 1;
}

function pedirQuadro() {
  if (estado.tocando || quadroPedido) return;
  quadroPedido = true;
  requestAnimationFrame(() => {
    quadroPedido = false;
    desenhar();
  });
}
export { pedirQuadro };

// ---------- reprodução ----------
let relogio = null;
export function tocar({ ate = null, aoTerminar = null } = {}) {
  if (estado.tocando) return;
  ligarAudio();
  const total = ate ?? duracaoProjeto();
  if (estado.cursor >= total - 0.01) estado.cursor = 0;
  estado.tocando = true;
  const t0 = performance.now();
  const c0 = estado.cursor;
  avisar("tocando");
  const passo = () => {
    if (!estado.tocando) return;
    estado.cursor = Math.min(total, c0 + (performance.now() - t0) / 1000);
    desenhar(estado.cursor, true);
    avisar("cursor");
    if (estado.cursor >= total) {
      parar();
      aoTerminar?.();
      return;
    }
    relogio = requestAnimationFrame(passo);
  };
  relogio = requestAnimationFrame(passo);
}

export function parar() {
  if (!estado.tocando) return;
  estado.tocando = false;
  cancelAnimationFrame(relogio);
  for (const item of elementos.values()) item.el.pause();
  desenhar();
  avisar("tocando");
}

export function irPara(t) {
  estado.cursor = Math.max(0, t);
  if (estado.tocando) {
    parar();
    tocar();
  } else desenhar();
  avisar("cursor");
}

// ---------- quadros para o assistente ----------
function esperarElementos(t) {
  const espera = [];
  for (const c of estado.projeto.clipes) {
    if (c.tipo !== "video" || t < c.inicio || t >= fim(c)) continue;
    const el = elementos.get(c.id)?.el;
    if (!el) continue;
    espera.push(new Promise((ok) => {
      const pronto = () => !el.seeking && el.readyState >= 2;
      if (pronto()) return ok();
      const limite = setTimeout(ok, 2000);
      const verificar = () => {
        if (pronto()) {
          clearTimeout(limite);
          el.removeEventListener("seeked", verificar);
          el.removeEventListener("loadeddata", verificar);
          ok();
        }
      };
      el.addEventListener("seeked", verificar);
      el.addEventListener("loadeddata", verificar);
    }));
  }
  return Promise.all(espera);
}

async function quadroEm(t) {
  desenhar(t, false);           // cria os elementos e pede o seek
  await esperarElementos(t);
  desenhar(t, false);           // agora com a imagem certa
}

// Folha de contato: vários instantes numa imagem só, com o tempo escrito em cada quadro.
export async function folhaDeQuadros(tempos, larguraMax = 1280) {
  if (estado.tocando) parar();
  const lista = tempos.slice(0, 12);
  const colunas = lista.length <= 1 ? 1 : lista.length <= 4 ? 2 : lista.length <= 9 ? 3 : 4;
  const linhas = Math.ceil(lista.length / colunas);
  const larg = Math.round(larguraMax / colunas);
  const alt = Math.round(larg * (tela.height / tela.width));
  const folha = document.createElement("canvas");
  folha.width = larg * colunas;
  folha.height = alt * linhas;
  const f = folha.getContext("2d");
  f.fillStyle = "#111";
  f.fillRect(0, 0, folha.width, folha.height);
  for (let i = 0; i < lista.length; i++) {
    await quadroEm(lista[i]);
    const x = (i % colunas) * larg, y = Math.floor(i / colunas) * alt;
    f.drawImage(tela, x, y, larg, alt);
    if (lista.length > 1) {
      f.fillStyle = "rgba(0,0,0,0.7)";
      f.fillRect(x, y, 96, 26);
      f.fillStyle = "#fff";
      f.font = "bold 16px system-ui, sans-serif";
      f.fillText(`${lista[i].toFixed(2)}s`, x + 8, y + 19);
    }
  }
  await quadroEm(estado.cursor);
  return folha.toDataURL("image/jpeg", 0.8).split(",")[1];
}

// ---------- exportação ----------
function formatoDeGravacao() {
  const opcoes = [
    ["video/mp4;codecs=avc1.640028,mp4a.40.2", "mp4"], // H.264 (Chrome/Edge); sem ele, WebM + conversão
    ["video/webm;codecs=vp9,opus", "webm"],
    ["video/webm;codecs=vp8,opus", "webm"],
    ["video/webm", "webm"],
  ];
  return opcoes.find(([tipo]) => window.MediaRecorder && MediaRecorder.isTypeSupported(tipo)) || null;
}

// Grava em tempo real o que o monitor mostra. Devolve { blob, extensao }.
export function exportar({ aoProgredir, sinal }) {
  return new Promise(async (resolve, reject) => {
    const formato = formatoDeGravacao();
    if (!formato) return reject(new Error("Este navegador não grava vídeo (use Chrome, Edge ou Firefox)."));
    const total = duracaoProjeto();
    if (total <= 0) return reject(new Error("A linha do tempo está vazia."));
    ligarAudio();
    parar();
    await quadroEm(0);
    estado.cursor = 0;

    const fluxo = tela.captureStream(estado.projeto.fps || 30);
    for (const trilha of audio.gravacao.stream.getAudioTracks()) fluxo.addTrack(trilha);
    const gravador = new MediaRecorder(fluxo, { mimeType: formato[0], videoBitsPerSecond: 12_000_000 });
    const pedacos = [];
    gravador.ondataavailable = (e) => e.data.size && pedacos.push(e.data);
    gravador.onstop = () => {
      fluxo.getVideoTracks().forEach((t) => t.stop());
      if (sinal?.cancelado) return reject(new Error("Exportação cancelada."));
      resolve({ blob: new Blob(pedacos, { type: formato[0].split(";")[0] }), extensao: formato[1] });
    };
    const vigia = setInterval(() => {
      aoProgredir?.(estado.cursor / total);
      if (sinal?.cancelado && gravador.state === "recording") {
        clearInterval(vigia);
        parar();
        gravador.stop();
      }
    }, 200);
    gravador.start(1000);
    tocar({
      ate: total,
      aoTerminar: () => {
        clearInterval(vigia);
        aoProgredir?.(1);
        setTimeout(() => gravador.state === "recording" && gravador.stop(), 150);
      },
    });
  });
}
