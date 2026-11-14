// Linha do tempo: régua, faixas, clipes, cursor. Arrastar move, bordas aparam, ímã nas emendas.
import {
  estado, avisar, aoMudar, faixa, clipe, fim, duracaoProjeto, duracaoMaxima,
  faixaCompativel, primeiraFaixa, criarClipe, marcarDesfazer, importarArquivo,
} from "./projeto.js";
import { desenhar, irPara } from "./motor.js";

const CABECA = 132;      // largura da coluna com o nome da faixa
const BORDA = 7;         // área para aparar nas pontas do clipe
const IMA = 8;           // distância do ímã, em pixels

let area, conteudo, regua, cursorEl, faixasEl;

export const tempoParaX = (t) => CABECA + t * estado.zoom;
export const xParaTempo = (x) => Math.max(0, (x - CABECA) / estado.zoom);

export function formatarTempo(t, fps = estado.projeto?.fps || 30) {
  const s = Math.max(0, t);
  const min = Math.floor(s / 60);
  const seg = Math.floor(s % 60);
  const quadro = Math.floor((s % 1) * fps);
  return `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}:${String(quadro).padStart(2, "0")}`;
}

export function iniciarLinhaDoTempo(raiz) {
  raiz.innerHTML = `
    <div class="lt-area" tabindex="-1">
      <div class="lt-conteudo">
        <div class="lt-linha lt-linha-regua">
          <div class="lt-cabeca lt-canto">
            <button class="mini" data-acao="faixa-video" title="Nova faixa de vídeo">+V</button>
            <button class="mini" data-acao="faixa-audio" title="Nova faixa de áudio">+A</button>
          </div>
          <div class="lt-regua"></div>
        </div>
        <div class="lt-faixas"></div>
        <div class="lt-cursor"><span></span></div>
      </div>
    </div>`;
  area = raiz.querySelector(".lt-area");
  conteudo = raiz.querySelector(".lt-conteudo");
  regua = raiz.querySelector(".lt-regua");
  faixasEl = raiz.querySelector(".lt-faixas");
  cursorEl = raiz.querySelector(".lt-cursor");

  raiz.querySelector(".lt-canto").addEventListener("click", async (e) => {
    const acao = e.target.dataset.acao;
    if (!acao) return;
    const { adicionarFaixa } = await import("./projeto.js");
    marcarDesfazer();
    adicionarFaixa(acao === "faixa-audio" ? "audio" : "video");
    avisar("projeto");
  });

  regua.addEventListener("pointerdown", arrastarCursor);
  faixasEl.addEventListener("pointerdown", aoApertar);
  faixasEl.addEventListener("dblclick", (e) => {
    const el = e.target.closest(".clipe");
    if (el) document.dispatchEvent(new CustomEvent("abrir-inspetor"));
  });
  area.addEventListener("wheel", aoRolar, { passive: false });
  faixasEl.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
  faixasEl.addEventListener("drop", aoSoltar);

  aoMudar((motivo) => {
    if (motivo === "cursor" || motivo === "tocando") return moverCursor();
    renderizar();
  });
  renderizar();
}

// ---------- desenho ----------
function intervaloDaRegua() {
  const passos = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
  return passos.find((p) => p * estado.zoom >= 70) || 600;
}

export function renderizar() {
  if (!area) return;
  const p = estado.projeto;
  const total = Math.max(duracaoProjeto() + 20, (area.clientWidth - CABECA) / estado.zoom);
  const largura = tempoParaX(total);
  conteudo.style.width = `${largura}px`;

  // Régua
  const passo = intervaloDaRegua();
  const menor = passo / 5;
  regua.style.backgroundSize = `${menor * estado.zoom}px 100%`;
  let html = "";
  for (let t = 0; t <= total; t += passo) {
    html += `<span class="marca" style="left:${t * estado.zoom}px">${rotuloRegua(t, passo)}</span>`;
  }
  for (const m of p.marcadores) {
    html += `<span class="marcador" style="left:${m.tempo * estado.zoom}px" title="${escapar(m.rotulo || "")}"></span>`;
  }
  regua.innerHTML = html;

  // Faixas e clipes
  faixasEl.innerHTML = p.faixas.map((f) => `
    <div class="lt-linha lt-faixa ${f.tipo}" data-faixa="${f.id}">
      <div class="lt-cabeca">
        <span class="nome">${escapar(f.nome)}</span>
        ${f.tipo === "video"
          ? `<button class="mini ${f.oculta ? "desligado" : ""}" data-alternar="oculta" title="Mostrar/ocultar">👁</button>`
          : `<button class="mini ${f.muda ? "desligado" : ""}" data-alternar="muda" title="Som liga/desliga">🔊</button>`}
      </div>
      <div class="lt-pista">${p.clipes.filter((c) => c.faixa === f.id).map(htmlDoClipe).join("")}</div>
    </div>`).join("");
  moverCursor();
}

function rotuloRegua(t, passo) {
  if (passo < 1) return `${t.toFixed(passo < 0.5 ? 2 : 1)}s`;
  const m = Math.floor(t / 60), s = Math.round(t % 60);
  return m ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

function htmlDoClipe(c) {
  const m = c.midia ? estado.midias.get(c.midia) : null;
  const nome = c.tipo === "texto" ? `T  ${c.texto}` : m ? m.nome : "mídia ausente";
  const fundo = m?.miniatura ? `background-image:url(${m.miniatura})` : "";
  const sel = estado.selecao.has(c.id) ? " selecionado" : "";
  const ausente = c.midia && !m ? " ausente" : "";
  const fadeE = c.fadeEntrada ? `<i class="fade e" style="width:${c.fadeEntrada * estado.zoom}px"></i>` : "";
  const fadeS = c.fadeSaida ? `<i class="fade s" style="width:${c.fadeSaida * estado.zoom}px"></i>` : "";
  return `<div class="clipe ${c.tipo}${sel}${ausente}" data-clipe="${c.id}"
      style="left:${c.inicio * estado.zoom}px;width:${Math.max(4, c.duracao * estado.zoom)}px">
      <div class="miniatura" style="${fundo}"></div>${fadeE}${fadeS}
      <span>${escapar(nome)}</span></div>`;
}

function moverCursor() {
  if (!cursorEl) return;
  const x = tempoParaX(estado.cursor);
  cursorEl.style.transform = `translateX(${x}px)`;
  if (estado.tocando) {
    const visivelFim = area.scrollLeft + area.clientWidth - 40;
    if (x > visivelFim || x < area.scrollLeft + CABECA) area.scrollLeft = x - CABECA - 40;
  }
}

export function escapar(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

// ---------- interação ----------
function xNaArea(e) {
  return e.clientX - area.getBoundingClientRect().left + area.scrollLeft;
}

function arrastarCursor(e) {
  regua.setPointerCapture(e.pointerId);
  const mover = (ev) => irPara(xParaTempo(xNaArea(ev)));
  mover(e);
  regua.onpointermove = mover;
  regua.onpointerup = () => { regua.onpointermove = null; regua.onpointerup = null; };
}

function pontosDeIma(ignorar) {
  const pontos = [0, estado.cursor, ...estado.projeto.marcadores.map((m) => m.tempo)];
  for (const c of estado.projeto.clipes) {
    if (ignorar.has(c.id)) continue;
    pontos.push(c.inicio, fim(c));
  }
  return pontos;
}

function imantar(t, pontos) {
  const limite = IMA / estado.zoom;
  let melhor = t, dist = limite;
  for (const p of pontos) {
    const d = Math.abs(p - t);
    if (d < dist) { dist = d; melhor = p; }
  }
  return melhor;
}

function aoApertar(e) {
  const botao = e.target.closest("[data-alternar]");
  if (botao) {
    const f = faixa(botao.closest(".lt-faixa").dataset.faixa);
    const chave = botao.dataset.alternar;
    f[chave] = !f[chave];
    desenhar();
    avisar("projeto");
    return;
  }
  if (e.target.closest(".lt-cabeca")) return;
  const el = e.target.closest(".clipe");
  if (!el) {
    if (!e.shiftKey) estado.selecao.clear();
    irPara(xParaTempo(xNaArea(e)));
    avisar("selecao");
    return;
  }
  const c = clipe(el.dataset.clipe);
  // Mede antes de avisar: avisar redesenha a linha do tempo e troca o elemento.
  const caixa = el.getBoundingClientRect();
  const dx = e.clientX - caixa.left;
  const modo = dx < BORDA ? "esquerda" : dx > caixa.width - BORDA ? "direita" : "mover";
  if (e.shiftKey) {
    estado.selecao.has(c.id) ? estado.selecao.delete(c.id) : estado.selecao.add(c.id);
  } else if (!estado.selecao.has(c.id)) {
    estado.selecao.clear();
    estado.selecao.add(c.id);
  }
  avisar("selecao");
  if (!estado.selecao.has(c.id)) return;

  const selecionados = [...estado.selecao].map(clipe).filter(Boolean);
  const originais = new Map(selecionados.map((s) => [s.id, { ...s }]));
  const pontos = pontosDeIma(estado.selecao);
  const x0 = e.clientX;
  let mexeu = false;

  faixasEl.setPointerCapture(e.pointerId);
  faixasEl.onpointermove = (ev) => {
    const dt = (ev.clientX - x0) / estado.zoom;
    if (!mexeu) {
      if (Math.abs(ev.clientX - x0) < 3) return;
      mexeu = true;
      marcarDesfazer();
    }
    const o = originais.get(c.id);
    if (modo === "mover") {
      // O clipe agarrado manda; os outros selecionados vão junto.
      let inicio = Math.max(0, o.inicio + dt);
      const iInicio = imantar(inicio, pontos);
      const iFim = imantar(inicio + o.duracao, pontos);
      if (iInicio !== inicio) inicio = iInicio;
      else if (iFim !== inicio + o.duracao) inicio = iFim - o.duracao;
      const desloc = Math.max(-Math.min(...[...originais.values()].map((x) => x.inicio)), inicio - o.inicio);
      for (const s of selecionados) s.inicio = Math.round((originais.get(s.id).inicio + desloc) * 1000) / 1000;
      if (selecionados.length === 1) {
        const sob = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".lt-faixa");
        if (sob && faixaCompativel(c.tipo, sob.dataset.faixa)) c.faixa = sob.dataset.faixa;
      }
    } else if (modo === "esquerda") {
      const temFonte = c.tipo === "video" || c.tipo === "audio";
      const minimo = temFonte ? o.inicio - o.entrada : 0;
      let inicio = imantar(o.inicio + dt, pontos);
      inicio = Math.min(Math.max(inicio, minimo, 0), fim(o) - 0.04);
      c.inicio = inicio;
      c.duracao = fim(o) - inicio;
      if (temFonte) c.entrada = o.entrada + (inicio - o.inicio);
    } else {
      let novoFim = imantar(fim(o) + dt, pontos);
      c.duracao = Math.min(Math.max(0.04, novoFim - o.inicio), duracaoMaxima(c));
    }
    renderizar();
    desenhar();
  };
  faixasEl.onpointerup = () => {
    faixasEl.onpointermove = null;
    faixasEl.onpointerup = null;
    if (mexeu) avisar("projeto");
  };
}

function aoRolar(e) {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  const tempoSob = xParaTempo(xNaArea(e));
  zoomPara(estado.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
  area.scrollLeft = tempoParaX(tempoSob) - (e.clientX - area.getBoundingClientRect().left);
}

export function zoomPara(z) {
  estado.zoom = Math.min(400, Math.max(4, z));
  renderizar();
  avisar("zoom");
}

export function zoomParaCaber() {
  const total = duracaoProjeto();
  if (total <= 0) return zoomPara(80);
  zoomPara((area.clientWidth - CABECA - 40) / total);
  area.scrollLeft = 0;
}

async function aoSoltar(e) {
  e.preventDefault();
  const linha = e.target.closest(".lt-faixa");
  const t = xParaTempo(xNaArea(e));
  const ids = [];
  const idMidia = e.dataTransfer.getData("text/midia");
  if (idMidia) ids.push(idMidia);
  for (const arquivo of e.dataTransfer.files || []) {
    try { ids.push((await importarArquivo(arquivo)).id); } catch (erro) { alert(erro.message); }
  }
  if (!ids.length) return;
  marcarDesfazer();
  let inicio = t;
  for (const id of ids) {
    const m = estado.midias.get(id);
    if (!m) continue;
    const alvo = linha && faixaCompativel(m.tipo, linha.dataset.faixa) ? linha.dataset.faixa : primeiraFaixa(m.tipo);
    const c = criarClipe({ midia: id, faixa: alvo, inicio });
    inicio = fim(c);
    estado.selecao.clear();
    estado.selecao.add(c.id);
  }
  avisar("midias");
  avisar("projeto");
}
