// Liga tudo: painel de mídia, monitor, inspetor, atalhos de teclado e exportação.
import {
  estado, avisar, aoMudar, carregar, importarArquivo, criarClipe, clipe, fim, duracaoProjeto,
  dividir, remover, marcarDesfazer, desfazer, refazer, novoProjeto, primeiraFaixa, esquecerArquivo,
} from "./projeto.js";
import { iniciarMotor, desenhar, tocar, parar, irPara, exportar, ligarAudio } from "./motor.js";
import { iniciarLinhaDoTempo, formatarTempo, zoomPara, zoomParaCaber, escapar } from "./linha-do-tempo.js";
import { iniciarAssistente } from "./assistente.js";

const $ = (s) => document.querySelector(s);
let servidor = { ffmpeg: false };
window.addEventListener("estado-servidor", (e) => { servidor = e.detail; });

// O áudio só liga depois de um gesto do usuário.
document.addEventListener("pointerdown", ligarAudio, { once: true });
document.addEventListener("keydown", ligarAudio, { once: true });

// ---------- barra e monitor ----------
function atualizarTempo() {
  $("#tempo-atual").textContent = formatarTempo(estado.cursor);
}
function atualizarBarra() {
  const p = estado.projeto;
  atualizarTempo();
  $("#tempo-total").textContent = formatarTempo(duracaoProjeto());
  $("#bt-tocar").textContent = estado.tocando ? "⏸" : "▶";
  $("#info-projeto").textContent = `${p.largura}×${p.altura} · ${p.fps} fps`;
  const nome = $("#nome-projeto");
  if (document.activeElement !== nome) nome.value = p.nome;
  $("#zoom").value = estado.zoom;
  document.title = `${p.nome} · Editor de Vídeo`;
}

$("#nome-projeto").addEventListener("change", (e) => {
  marcarDesfazer();
  estado.projeto.nome = e.target.value.trim() || "Projeto sem título";
  avisar("geral");
});

const passoQuadro = () => 1 / (estado.projeto.fps || 30);
const transporte = {
  inicio: () => irPara(0),
  fim: () => irPara(duracaoProjeto()),
  voltar: () => { parar(); irPara(estado.cursor - passoQuadro()); },
  avancar: () => { parar(); irPara(estado.cursor + passoQuadro()); },
  tocar: () => (estado.tocando ? parar() : tocar()),
};
document.querySelectorAll("[data-transporte]").forEach((b) =>
  b.addEventListener("click", () => transporte[b.dataset.transporte]()));

$("#tela").addEventListener("click", transporte.tocar);

// ---------- mídia ----------
const arquivos = $("#arquivos");
$("#bt-importar").addEventListener("click", () => arquivos.click());
arquivos.addEventListener("change", async () => {
  await importar([...arquivos.files]);
  arquivos.value = "";
});

async function importar(lista) {
  for (const arquivo of lista) {
    try { await importarArquivo(arquivo); } catch (erro) { alert(erro.message); }
  }
  avisar("midias");
}

const painelMidias = $(".midias");
painelMidias.addEventListener("dragover", (e) => { e.preventDefault(); painelMidias.classList.add("alvo"); });
painelMidias.addEventListener("dragleave", () => painelMidias.classList.remove("alvo"));
painelMidias.addEventListener("drop", (e) => {
  e.preventDefault();
  painelMidias.classList.remove("alvo");
  if (e.dataTransfer.files.length) importar([...e.dataTransfer.files]);
});

function duracaoCurta(s) {
  if (!s) return "";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
}

function renderizarMidias() {
  const lista = $("#lista-midias");
  const midias = [...estado.midias.values()];
  if (!midias.length) {
    lista.innerHTML = `<p class="vazio">Arraste arquivos para cá ou clique em <b>Importar</b>.</p>`;
    return;
  }
  const usadas = new Set(estado.projeto.clipes.map((c) => c.midia));
  lista.innerHTML = midias.map((m) => `
    <div class="cartao-midia ${m.tipo}" draggable="true" data-midia="${m.id}" title="Arraste para a linha do tempo. Duplo clique adiciona no fim.">
      <div class="capa" style="${m.miniatura ? `background-image:url(${m.miniatura})` : ""}">
        ${m.tipo === "audio" ? "♪" : ""}<span class="dur">${duracaoCurta(m.duracao)}</span>
      </div>
      <div class="rotulo">
        <span>${escapar(m.nome)}</span>
        <button class="mini" data-apagar="${m.id}" title="Tirar do projeto">✕</button>
      </div>
      ${usadas.has(m.id) ? `<i class="em-uso" title="Na linha do tempo"></i>` : ""}
    </div>`).join("");
}

$("#lista-midias").addEventListener("dragstart", (e) => {
  const cartao = e.target.closest(".cartao-midia");
  if (!cartao) return;
  e.dataTransfer.setData("text/midia", cartao.dataset.midia);
  e.dataTransfer.effectAllowed = "copy";
});
$("#lista-midias").addEventListener("dblclick", (e) => {
  const cartao = e.target.closest(".cartao-midia");
  if (!cartao) return;
  const m = estado.midias.get(cartao.dataset.midia);
  marcarDesfazer();
  const c = criarClipe({ midia: m.id, faixa: primeiraFaixa(m.tipo) });
  estado.selecao.clear();
  estado.selecao.add(c.id);
  avisar("projeto");
});
$("#lista-midias").addEventListener("click", (e) => {
  const id = e.target.dataset.apagar;
  if (!id) return;
  const emUso = estado.projeto.clipes.filter((c) => c.midia === id);
  if (emUso.length && !confirm(`Esta mídia está em ${emUso.length} clipe(s). Tirar mesmo assim?`)) return;
  marcarDesfazer();
  remover(emUso.map((c) => c.id));
  URL.revokeObjectURL(estado.midias.get(id).url);
  estado.midias.delete(id);
  esquecerArquivo(id);
  avisar("projeto");
});

// ---------- abas ----------
function abrirAba(nome) {
  document.querySelectorAll(".aba").forEach((a) => a.classList.toggle("ativa", a.dataset.aba === nome));
  $("#assistente").hidden = nome !== "assistente";
  $("#inspetor").hidden = nome !== "inspetor";
}
document.querySelectorAll(".aba").forEach((a) => a.addEventListener("click", () => abrirAba(a.dataset.aba)));
document.addEventListener("abrir-inspetor", () => abrirAba("inspetor"));

// ---------- inspetor ----------
const RESOLUCOES = [
  ["1920x1080", "1920×1080 · horizontal (YouTube)"],
  ["1280x720", "1280×720 · horizontal leve"],
  ["3840x2160", "3840×2160 · 4K"],
  ["1080x1920", "1080×1920 · vertical (Reels, Shorts, TikTok)"],
  ["1080x1080", "1080×1080 · quadrado"],
  ["1080x1350", "1080×1350 · retrato 4:5"],
];

function campo(rotulo, chave, valor, attrs = "") {
  return `<label><span>${rotulo}</span><input data-campo="${chave}" value="${escapar(valor)}" ${attrs}></label>`;
}

function renderizarInspetor() {
  const painel = $("#inspetor");
  if (painel.contains(document.activeElement) && document.activeElement.tagName !== "BUTTON") return; // não atrapalha quem digita
  const sel = [...estado.selecao].map(clipe).filter(Boolean);
  if (sel.length !== 1) {
    const p = estado.projeto;
    const atual = `${p.largura}x${p.altura}`;
    painel.innerHTML = `
      <h4>${sel.length > 1 ? `${sel.length} clipes selecionados` : "Projeto"}</h4>
      <label><span>Formato</span><select data-projeto="resolucao">
        ${RESOLUCOES.map(([v, t]) => `<option value="${v}" ${v === atual ? "selected" : ""}>${t}</option>`).join("")}
        ${RESOLUCOES.some(([v]) => v === atual) ? "" : `<option selected>${atual}</option>`}
      </select></label>
      <label><span>Quadros/s</span><select data-projeto="fps">
        ${[24, 25, 30, 60].map((f) => `<option ${f === p.fps ? "selected" : ""}>${f}</option>`).join("")}
      </select></label>
      <p class="dica">Selecione um clipe para editar as propriedades dele.<br>
      <b>Atalhos:</b> Espaço toca · S divide · Delete apaga · Shift+Delete apaga e fecha a lacuna · M marcador · ←/→ quadro · Ctrl+Z desfaz · \\ mostra tudo.</p>`;
    return;
  }
  const c = sel[0];
  const m = c.midia ? estado.midias.get(c.midia) : null;
  const visual = c.tipo !== "audio";
  const som = c.tipo === "video" || c.tipo === "audio";
  const n = 'type="number" step="0.01" min="0"';
  painel.innerHTML = `
    <h4>${c.tipo === "texto" ? "Texto" : escapar(m?.nome || "Mídia ausente")}</h4>
    <p class="sutil">${c.id} · faixa ${c.faixa}</p>
    ${c.tipo === "texto" ? `<label class="largo"><span>Texto</span><textarea data-campo="texto" rows="3">${escapar(c.texto)}</textarea></label>` : ""}
    <div class="duas">
      ${campo("Início (s)", "inicio", c.inicio, n)}
      ${campo("Duração (s)", "duracao", c.duracao, n)}
      ${som ? campo("Entrada (s)", "entrada", c.entrada, n) : ""}
      ${campo("Fade entrada", "fadeEntrada", c.fadeEntrada, n)}
      ${campo("Fade saída", "fadeSaida", c.fadeSaida, n)}
    </div>
    ${som ? `<label><span>Volume <b>${Math.round(c.volume * 100)}%</b></span><input data-campo="volume" type="range" min="0" max="2" step="0.01" value="${c.volume}"></label>` : ""}
    ${visual ? `<label><span>Opacidade <b>${Math.round(c.opacidade * 100)}%</b></span><input data-campo="opacidade" type="range" min="0" max="1" step="0.01" value="${c.opacidade}"></label>` : ""}
    ${c.tipo === "texto" ? `
      <div class="duas">
        ${campo("Tamanho (%)", "estilo.tamanho", c.estilo.tamanho, 'type="number" step="0.5" min="1" max="40"')}
        ${campo("Posição (0–1)", "estilo.y", c.estilo.y, 'type="number" step="0.01" min="0" max="1"')}
        <label><span>Cor</span><input data-campo="estilo.cor" type="color" value="${escapar(c.estilo.cor)}"></label>
        ${campo("Tarja (CSS)", "estilo.fundo", c.estilo.fundo || "", 'placeholder="rgba(0,0,0,.6)"')}
      </div>` : ""}
    <div class="acoes">
      <button data-acao="dividir">✂ Dividir no cursor</button>
      <button data-acao="apagar">🗑 Apagar</button>
    </div>`;
}

const inspetor = $("#inspetor");
inspetor.addEventListener("focusin", (e) => { if (e.target.dataset.campo) marcarDesfazer(); });
inspetor.addEventListener("pointerdown", (e) => { if (e.target.type === "range") marcarDesfazer(); });
inspetor.addEventListener("input", (e) => {
  const chave = e.target.dataset.campo;
  if (!chave) return;
  const c = clipe([...estado.selecao][0]);
  if (!c) return;
  const bruto = e.target.value;
  const numerico = e.target.type === "number" || e.target.type === "range";
  const valor = numerico ? parseFloat(bruto) : bruto;
  if (numerico && !Number.isFinite(valor)) return;
  if (chave.startsWith("estilo.")) c.estilo[chave.slice(7)] = valor;
  else if (chave === "duracao") c.duracao = Math.max(0.04, valor);
  else c[chave] = valor;
  const rotulo = e.target.closest("label")?.querySelector("b");
  if (rotulo) rotulo.textContent = `${Math.round(valor * 100)}%`;
  desenhar();
  avisar("edicao");
});
inspetor.addEventListener("change", (e) => {
  const qual = e.target.dataset.projeto;
  if (!qual) return;
  marcarDesfazer();
  if (qual === "resolucao") {
    const [w, h] = e.target.value.split("x").map(Number);
    estado.projeto.largura = w;
    estado.projeto.altura = h;
  } else estado.projeto.fps = Number(e.target.value);
  avisar("projeto");
});
inspetor.addEventListener("focusout", () => setTimeout(() => {
  if (!inspetor.contains(document.activeElement)) avisar("projeto");
}, 0));
inspetor.addEventListener("click", (e) => {
  if (e.target.dataset.acao === "dividir") acoes.dividir();
  if (e.target.dataset.acao === "apagar") acoes.apagar(false);
});

// ---------- ações de edição ----------
const acoes = {
  dividir() {
    const t = estado.cursor;
    let alvos = [...estado.selecao].map(clipe).filter(Boolean);
    if (!alvos.length) alvos = estado.projeto.clipes.filter((c) => t > c.inicio && t < fim(c));
    alvos = alvos.filter((c) => t > c.inicio + 0.02 && t < fim(c) - 0.02);
    if (!alvos.length) return;
    marcarDesfazer();
    for (const c of alvos) dividir(c, t);
    avisar("projeto");
  },
  apagar(fechar) {
    if (!estado.selecao.size) return;
    marcarDesfazer();
    remover([...estado.selecao], fechar);
    avisar("projeto");
  },
  marcador() {
    marcarDesfazer();
    estado.projeto.marcadores.push({ tempo: Math.round(estado.cursor * 1000) / 1000, rotulo: "" });
    avisar("projeto");
  },
};
$("#bt-dividir").addEventListener("click", acoes.dividir);
$("#bt-apagar").addEventListener("click", (e) => acoes.apagar(e.shiftKey));
$("#bt-marcador").addEventListener("click", acoes.marcador);
$("#bt-desfazer").addEventListener("click", desfazer);
$("#bt-refazer").addEventListener("click", refazer);
$("#bt-caber").addEventListener("click", zoomParaCaber);
$("#zoom").addEventListener("input", (e) => zoomPara(Number(e.target.value)));
$("#bt-novo").addEventListener("click", () => {
  if (confirm("Começar um projeto vazio? Clipes e mídias deste projeto serão apagados.")) novoProjeto();
});

// ---------- teclado ----------
document.addEventListener("keydown", (e) => {
  const alvo = e.target;
  if (alvo.matches("input, textarea, select") && alvo.type !== "range") return;
  const ctrl = e.ctrlKey || e.metaKey;
  const tecla = e.key.toLowerCase();
  if (ctrl && tecla === "z") { e.preventDefault(); e.shiftKey ? refazer() : desfazer(); return; }
  if (ctrl && tecla === "y") { e.preventDefault(); refazer(); return; }
  if (ctrl && tecla === "a") {
    e.preventDefault();
    estado.projeto.clipes.forEach((c) => estado.selecao.add(c.id));
    avisar("selecao");
    return;
  }
  if (ctrl) return;
  const mapa = {
    " ": transporte.tocar, k: transporte.tocar,
    arrowleft: transporte.voltar, arrowright: transporte.avancar,
    home: transporte.inicio, end: transporte.fim,
    s: acoes.dividir, m: acoes.marcador, i: () => arquivos.click(),
    delete: () => acoes.apagar(e.shiftKey), backspace: () => acoes.apagar(e.shiftKey),
    "\\": zoomParaCaber, "=": () => zoomPara(estado.zoom * 1.25), "+": () => zoomPara(estado.zoom * 1.25),
    "-": () => zoomPara(estado.zoom / 1.25),
    escape: () => { estado.selecao.clear(); avisar("selecao"); },
  };
  const fn = mapa[tecla];
  if (fn) { e.preventDefault(); fn(); }
});

// ---------- exportação ----------
const dialogo = $("#exportacao");
let sinal = null;
let ultimo = null;

$("#bt-exportar").addEventListener("click", () => {
  if (duracaoProjeto() <= 0) return alert("A linha do tempo está vazia.");
  $("#exp-texto").textContent = `Duração: ${formatarTempo(duracaoProjeto())}. O vídeo é gravado em tempo real: deixe esta aba aberta e visível até terminar.`;
  $("#exp-barra").value = 0;
  $("#exp-baixar").hidden = true;
  $("#exp-mp4").hidden = true;
  $("#exp-iniciar").hidden = false;
  $("#exp-cancelar").textContent = "Fechar";
  dialogo.showModal();
});

$("#exp-iniciar").addEventListener("click", async () => {
  sinal = { cancelado: false };
  $("#exp-iniciar").hidden = true;
  $("#exp-cancelar").textContent = "Cancelar";
  try {
    ultimo = await exportar({ sinal, aoProgredir: (v) => { $("#exp-barra").value = v; } });
    oferecerDownload(ultimo.blob, ultimo.extensao);
    $("#exp-texto").textContent = `Pronto: ${(ultimo.blob.size / 1e6).toFixed(1)} MB em ${ultimo.extensao.toUpperCase()}.`;
    $("#exp-mp4").hidden = !(ultimo.extensao === "webm" && servidor.ffmpeg);
  } catch (erro) {
    $("#exp-texto").textContent = erro.message;
    $("#exp-iniciar").hidden = false;
  }
  sinal = null;
  $("#exp-cancelar").textContent = "Fechar";
});

function oferecerDownload(blob, extensao) {
  const link = $("#exp-baixar");
  if (link.href) URL.revokeObjectURL(link.href);
  link.href = URL.createObjectURL(blob);
  link.download = `${estado.projeto.nome.replace(/[\\/:*?"<>|]/g, "-")}.${extensao}`;
  link.textContent = `Baixar ${extensao.toUpperCase()}`;
  link.hidden = false;
}

$("#exp-mp4").addEventListener("click", async () => {
  if (!ultimo) return;
  $("#exp-mp4").disabled = true;
  $("#exp-texto").textContent = "Convertendo para MP4 no servidor (ffmpeg)…";
  try {
    const r = await fetch("/api/converter", { method: "POST", body: ultimo.blob });
    if (!r.ok) throw new Error((await r.json()).erro || `Erro ${r.status}`);
    const mp4 = await r.blob();
    oferecerDownload(mp4, "mp4");
    $("#exp-texto").textContent = `MP4 pronto: ${(mp4.size / 1e6).toFixed(1)} MB.`;
    $("#exp-mp4").hidden = true;
  } catch (erro) {
    $("#exp-texto").textContent = `Falhou: ${erro.message}`;
  }
  $("#exp-mp4").disabled = false;
});

$("#exp-cancelar").addEventListener("click", () => {
  if (sinal) sinal.cancelado = true;
  else dialogo.close();
});

// ---------- partida (no fim, depois de todas as declarações) ----------
await carregar();
iniciarMotor($("#tela"));
iniciarLinhaDoTempo($("#linha-do-tempo"));
iniciarAssistente($("#assistente"));
renderizarMidias();
renderizarInspetor();
atualizarBarra();

aoMudar((motivo) => {
  if (motivo === "cursor") return atualizarTempo();
  if (motivo === "tocando") return atualizarBarra();
  if (motivo === "midias" || motivo === "projeto") renderizarMidias();
  if (motivo !== "zoom") renderizarInspetor();
  if (motivo === "projeto") desenhar();
  atualizarBarra();
});
