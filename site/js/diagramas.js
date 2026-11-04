// Diagramas de missão: o autor desenha todas as vertentes de cada missão num quadro livre.
// Blocos (abertura, cena, lugar, escolha, final, marca, nota) ligados por setas
// (segue, sucesso, falha, abre). Arrastar, ligar, editar, zoom; funciona no celular e no PC.
//
// Onde fica: no repositório privado do autor, arquivo diagramas.json (a mesma conexão ☁ da
// Oficina). Cada aparelho guarda uma cópia; mudanças de dois aparelhos se juntam bloco a bloco.
// Formato:
//   { versao, missoes: [{ id, titulo, eixo, resumo,
//       nos: [{ id, tipo, titulo, texto, condicao, efeitos, notas, x, y }],
//       ligacoes: [{ id, de, para, rotulo, tipo }] }] }

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const copia = (o) => JSON.parse(JSON.stringify(o));
const novoId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const ARQUIVO = "diagramas.json";
const LOCAL = "kosmos.diagramas.local"; // { dados, base, sha }
const ATUAL = "kosmos.diagramas.atual"; // missão aberta e a vista dela

const TIPOS = {
  entrada: "Abertura / origem", cena: "Cena", lugar: "Lugar", mapa: "Exploração / mapa", escolha: "Escolha / teste",
  final: "Final / salto", marca: "Marca (passa adiante)", nota: "Nota do autor",
};
const LIGACOES = { segue: "segue", sucesso: "✓ sucesso", falha: "✗ falha", abre: "abre / destrava" };
const EIXOS_NOMES = { x: "∃ Urbano", y: "ᛉ Medieval", z: "◉ Espacial", lime: "Lime" };
const LARG = 230; // largura de um bloco (igual ao CSS)

let mundo = null; // { versao, missoes }
let base = null;
let baseSha = null;
let enviando = false;
let salvarAgendado = null;
let missaoId = null;
let selecao = null; // { tipo: "no" | "ligacao", id }
let ligandoDe = null; // id do bloco de onde sai a nova ligação
let vista = { x: 40, y: 40, z: 1 };

const vazio = () => ({ versao: 1, missoes: [] });
const missao = () => mundo.missoes.find((m) => m.id === missaoId) || null;
const no = (id) => missao()?.nos.find((n) => n.id === id);

// ======================= Guardar e sincronizar =======================

function lerLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL));
  } catch {
    return null;
  }
}
function guardarLocal() {
  try {
    localStorage.setItem(LOCAL, JSON.stringify({ dados: mundo, base, sha: baseSha }));
    localStorage.setItem(ATUAL, JSON.stringify({ missaoId, vistas: { ...(lerAtual().vistas || {}), [missaoId]: vista } }));
  } catch {}
}
function lerAtual() {
  try {
    return JSON.parse(localStorage.getItem(ATUAL)) || {};
  } catch {
    return {};
  }
}

function estadoSalvo(texto, classe = "") {
  const el = $("#estado-salvo");
  el.textContent = texto;
  el.className = "estado-salvo " + classe;
}

function mudou() {
  estadoSalvo("salvando…");
  guardarLocal();
  clearTimeout(salvarAgendado);
  salvarAgendado = setTimeout(salvarNuvem, 2000);
}

async function salvarNuvem() {
  if (!Nuvem.config()) return estadoSalvo("guardado neste aparelho · conecte a ☁ para ter no celular e no PC", "aviso");
  if (enviando) {
    clearTimeout(salvarAgendado);
    salvarAgendado = setTimeout(salvarNuvem, 1500);
    return;
  }
  enviando = true;
  const enviado = copia(mundo);
  try {
    baseSha = await Nuvem.enviar(enviado, baseSha, Nuvem.config(), ARQUIVO);
    base = enviado;
    guardarLocal();
    if (!Nuvem.igual(mundo, enviado)) mudou();
    else estadoSalvo(`☁ salvo ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, "ok");
  } catch (e) {
    enviando = false;
    if (e.status === 409) return sincronizar();
    estadoSalvo(`☁ não salvou (${e.message}) · guardado no aparelho`, "aviso");
  } finally {
    enviando = false;
  }
}

// Junta missão a missão; dentro de cada uma, bloco a bloco e ligação a ligação
function juntar(b, l, r) {
  b = b || vazio();
  const porId = (lista) => new Map((lista || []).map((x) => [x.id, x]));
  const B = porId(b.missoes), L = porId(l.missoes), R = porId(r.missoes);
  const ids = [...new Set([...(r.missoes || []).map((m) => m.id), ...(l.missoes || []).map((m) => m.id)])];
  const missoes = [];
  for (const id of ids) {
    const mb = B.get(id), ml = L.get(id), mr = R.get(id);
    if (!ml) { if (mr && mb && !Nuvem.igual(mb, mr)) missoes.push(mr); else if (mr && !mb) missoes.push(mr); continue; }
    if (!mr) { if (!mb || !Nuvem.igual(mb, ml)) missoes.push(ml); continue; }
    const meta = {};
    for (const k of ["titulo", "eixo", "resumo", "jogo"]) meta[k] = mb && !Nuvem.igual(mb[k], ml[k]) ? ml[k] : mr[k];
    missoes.push({
      ...mr, ...meta, id,
      nos: Nuvem.juntarLista(mb?.nos, ml.nos, mr.nos),
      ligacoes: Nuvem.juntarLista(mb?.ligacoes, ml.ligacoes, mr.ligacoes),
    });
  }
  return { ...r, versao: r.versao || 1, missoes };
}

async function sincronizar() {
  if (!Nuvem.config() || enviando) return;
  let remoto;
  try {
    remoto = await Nuvem.baixar(Nuvem.config(), ARQUIVO);
  } catch (e) {
    return estadoSalvo(`☁ sem conexão (${e.message}) · guardado no aparelho`, "aviso");
  }
  if (!remoto.dados) {
    base = baseSha = null;
    return salvarNuvem(); // primeira vez: este aparelho cria o arquivo
  }
  if (remoto.sha === baseSha) {
    if (!Nuvem.igual(mundo, base)) salvarNuvem();
    else estadoSalvo("☁ sincronizado", "ok");
    return;
  }
  const antes = mundo;
  mundo = juntar(base, mundo, remoto.dados);
  base = remoto.dados;
  baseSha = remoto.sha;
  guardarLocal();
  if (!Nuvem.igual(antes, mundo)) { escolherMissao(missaoId); render(); }
  if (!Nuvem.igual(mundo, base)) salvarNuvem();
  else estadoSalvo("☁ sincronizado", "ok");
}
setInterval(() => document.visibilityState === "visible" && !arrasto && sincronizar(), 30000);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && sincronizar());

// ======================= Desenhar =======================

const mundoEl = $("#dg-mundo");
const nosEl = $("#dg-nos");
const linhasEl = $("#dg-linhas");
const rotulosEl = $("#dg-rotulos"); // os rótulos ficam por cima dos blocos (senão os blocos cobrem)
const quadro = $("#dg-quadro");

function aplicarVista() {
  mundoEl.style.transform = `translate(${vista.x}px, ${vista.y}px) scale(${vista.z})`;
}

function linhaCond(n) {
  return n.condicao ? `<div class="dg-no-cond">só se: ${esc(n.condicao)}</div>` : "";
}

function render() {
  renderSeletor();
  renderNos();
  renderLigacoes();
  aplicarVista();
  renderPainel();
}

function renderNos() {
  const m = missao();
  $("#dg-vazio").hidden = !!(m && m.nos.length);
  $("#dg-vazio").innerHTML = !m
    ? "Nenhuma missão ainda.<br>Crie uma com ⋯ ou traga as do jogo com ⋯ → Importar do jogo."
    : "Missão vazia. Toque num tipo de bloco (Abertura, Cena…) para começar.";
  nosEl.innerHTML = m ? m.nos.map((n) => `
    <div class="dg-no t-${n.tipo} ${selecao?.tipo === "no" && selecao.id === n.id ? "selecionado" : ""} ${ligandoDe ? "alvo-ligar" : ""}" data-no="${n.id}" style="left:${n.x}px;top:${n.y}px">
      <div class="dg-no-tipo">${esc(TIPOS[n.tipo] || n.tipo)}</div>
      <div class="dg-no-titulo">${esc(n.titulo || "(sem título)")}</div>
      ${previa(n) ? `<div class="dg-no-texto">${esc(previa(n))}</div>` : ""}
      ${n.d && n.tipo === "escolha" ? `<div class="dg-no-cond">${esc(Criador.rotuloTeste(n.d))}</div>` : linhaCond(n)}
      ${n.efeitos ? `<div class="dg-no-efeitos">★ ${esc(n.efeitos)}</div>` : ""}
      ${n.tipo !== "nota" && n.tipo !== "final" ? `<button class="dg-no-ramo" data-ramo="${n.id}" title="Novo ramo a partir daqui">+</button>` : ""}
    </div>`).join("") : "";
}

// o que aparece dentro do bloco: o começo do texto de verdade (ou o resumo do planejamento)
function previa(n) {
  if (!n.d) return n.texto;
  const d = n.d;
  const t = n.tipo === "lugar" ? d.descricao?.texto : n.tipo === "escolha" ? (d.res?.sucesso || d.res?.resultado)?.texto : n.tipo === "mapa" ? `Relógio ${d.relogioMax || "?"} · ${(d.eventos || []).length} acontecimentos` : d.texto;
  return (t || n.texto || "").split(/\n\n/)[0];
}

// pontos de saída e chegada: o lado do bloco que fica de frente para o outro
function ancoras(a, b) {
  const ea = nosEl.querySelector(`[data-no="${a.id}"]`), eb = nosEl.querySelector(`[data-no="${b.id}"]`);
  const ha = ea ? ea.offsetHeight : 100, hb = eb ? eb.offsetHeight : 100;
  const ca = { x: a.x + LARG / 2, y: a.y + ha / 2 }, cb = { x: b.x + LARG / 2, y: b.y + hb / 2 };
  const dx = cb.x - ca.x, dy = cb.y - ca.y;
  if (Math.abs(dx) >= Math.abs(dy) * 0.8) {
    const s = Math.sign(dx) || 1;
    return { p1: { x: ca.x + (s * LARG) / 2, y: ca.y }, p2: { x: cb.x - (s * LARG) / 2, y: cb.y }, h: true };
  }
  const s = Math.sign(dy) || 1;
  return { p1: { x: ca.x, y: ca.y + (s * ha) / 2 }, p2: { x: cb.x, y: cb.y - (s * hb) / 2 }, h: false };
}

function renderLigacoes() {
  const m = missao();
  if (!m) return (linhasEl.innerHTML = rotulosEl.innerHTML = "");
  const rotulos = [];
  linhasEl.innerHTML = m.ligacoes.map((l) => {
    const a = no(l.de), b = no(l.para);
    if (!a || !b) return "";
    const { p1, p2, h } = ancoras(a, b);
    const k = Math.max(40, (h ? Math.abs(p2.x - p1.x) : Math.abs(p2.y - p1.y)) / 2);
    const c1 = h ? { x: p1.x + Math.sign(p2.x - p1.x || 1) * k, y: p1.y } : { x: p1.x, y: p1.y + Math.sign(p2.y - p1.y || 1) * k };
    const c2 = h ? { x: p2.x - Math.sign(p2.x - p1.x || 1) * k, y: p2.y } : { x: p2.x, y: p2.y - Math.sign(p2.y - p1.y || 1) * k };
    const d = `M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
    const sel = selecao?.tipo === "ligacao" && selecao.id === l.id ? "l-selecionada" : "";
    const meio = { x: (p1.x + 3 * c1.x + 3 * c2.x + p2.x) / 8, y: (p1.y + 3 * c1.y + 3 * c2.y + p2.y) / 8 };
    const rot = l.rotulo || (l.tipo === "sucesso" ? "✓" : l.tipo === "falha" ? "✗" : l.tipo === "abre" ? "abre" : "");
    const curto = rot.length > 22 ? rot.slice(0, 21) + "…" : rot;
    const w = curto.length * 7 + 16;
    if (rot) rotulos.push(`<g class="rotulo" data-ligacao="${l.id}"><title>${esc(rot)}</title><rect x="${meio.x - w / 2}" y="${meio.y - 11}" width="${w}" height="22" rx="11"/><text x="${meio.x}" y="${meio.y + 4}" text-anchor="middle">${esc(curto)}</text></g>`);
    return `<path d="${d}" class="l-${l.tipo || "segue"} ${sel}" marker-end="url(#ponta)"/>
      <path d="${d}" class="alvo" data-ligacao="${l.id}"/>`;
  }).join("");
  rotulosEl.innerHTML = rotulos.join("");
}

function renderSeletor() {
  const sel = $("#dg-missao");
  sel.innerHTML = mundo.missoes.length
    ? mundo.missoes.map((m) => `<option value="${m.id}" ${m.id === missaoId ? "selected" : ""}>${esc(EIXOS_NOMES[m.eixo] || "")} · ${esc(m.titulo)}</option>`).join("")
    : `<option value="">(nenhuma missão)</option>`;
}

// ---------- Painel de edição ----------
const painel = $("#dg-painel");

function campo(rotulo, chave, valor, tipo = "input", extra = "") {
  return `<label class="campo"><span>${rotulo}</span>${tipo === "textarea"
    ? `<textarea data-campo="${chave}" rows="4" ${extra}>${esc(valor)}</textarea>`
    : `<input data-campo="${chave}" value="${esc(valor)}" ${extra}>`}</label>`;
}

function renderPainel() {
  const m = missao();
  if (!m || !selecao) return (painel.hidden = true);
  painel.hidden = false;
  if (selecao.tipo === "no") {
    const n = no(selecao.id);
    if (!n) return (painel.hidden = true);
    const saidas = m.ligacoes.filter((l) => l.de === n.id);
    const entradas = m.ligacoes.filter((l) => l.para === n.id);
    if (n.d) {
      const rolagem = painel.scrollTop;
      painel.innerHTML = `
      <h2>${esc(TIPOS[n.tipo] || "Bloco")} <button class="btn" data-painel="fechar">Fechar</button></h2>
      ${Criador.painel(n, ctxCriador())}
      <details class="cr-secao"><summary>Notas do autor</summary>${campo("Notas", "notas", n.notas, "textarea", `rows="3"`)}</details>
      <div class="dg-botoes">
        <button class="btn primario" data-acao="ramo">+ Ramo</button>
        <button class="btn" data-acao="ligar">Ligar a outro bloco</button>
        <button class="btn" data-acao="duplicar">Duplicar</button>
        <button class="btn perigo" data-acao="apagar">Apagar</button>
      </div>`;
      painel.scrollTop = rolagem;
      return;
    }
    painel.innerHTML = `
      <h2>Bloco <button class="btn" data-painel="fechar">Fechar</button></h2>
      <label class="campo"><span>Tipo</span><select data-campo="tipo">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}" ${n.tipo === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      ${campo("Título", "titulo", n.titulo)}
      ${campo("O que acontece (texto, resumo)", "texto", n.texto, "textarea")}
      ${campo("Só aparece se… (condição)", "condicao", n.condicao, "input", `placeholder="ex.: relógio ≥ 4, salvou o Danny, Ressonância 5"`)}
      ${campo("Efeitos / marcas que passam adiante", "efeitos", n.efeitos, "input", `placeholder="ex.: +1 Ressonância, crachá da Contenção"`)}
      ${campo("Notas do autor", "notas", n.notas, "textarea", `rows="2"`)}
      <div class="dg-botoes">
        <button class="btn primario" data-acao="ramo">+ Ramo</button>
        <button class="btn" data-acao="ligar">Ligar a outro bloco</button>
        <button class="btn" data-acao="duplicar">Duplicar</button>
        <button class="btn perigo" data-acao="apagar">Apagar</button>
      </div>
      <h3>Saídas <small>${saidas.length}</small></h3>
      <div class="dg-saidas">${saidas.map((l) => `
        <div class="dg-saida">
          <small>→ ${esc(no(l.para)?.titulo || "?")}</small>
          <input data-lig="${l.id}" data-lig-campo="rotulo" value="${esc(l.rotulo || "")}" placeholder="rótulo (ex.: lutar)">
          <select data-lig="${l.id}" data-lig-campo="tipo">${Object.entries(LIGACOES).map(([k, v]) => `<option value="${k}" ${(l.tipo || "segue") === k ? "selected" : ""}>${v}</option>`).join("")}</select>
          <button class="btn perigo" data-tirar-lig="${l.id}" title="Tirar ligação">✕</button>
        </div>`).join("") || `<p class="ajuda">Nenhuma. Use + Ramo ou Ligar.</p>`}</div>
      ${entradas.length ? `<p class="ajuda">Chegam aqui: ${entradas.map((l) => esc(no(l.de)?.titulo || "?")).join(", ")}</p>` : ""}`;
  } else {
    const l = m.ligacoes.find((x) => x.id === selecao.id);
    if (!l) return (painel.hidden = true);
    painel.innerHTML = `
      <h2>Ligação <button class="btn" data-painel="fechar">Fechar</button></h2>
      <p class="ajuda">${esc(no(l.de)?.titulo || "?")} → ${esc(no(l.para)?.titulo || "?")}</p>
      <label class="campo"><span>Rótulo</span><input data-lig="${l.id}" data-lig-campo="rotulo" value="${esc(l.rotulo || "")}" placeholder="ex.: lutar, relógio cheio, 5 pistas"></label>
      <label class="campo"><span>Tipo</span><select data-lig="${l.id}" data-lig-campo="tipo">${Object.entries(LIGACOES).map(([k, v]) => `<option value="${k}" ${(l.tipo || "segue") === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <div class="dg-botoes">
        <button class="btn" data-acao="inverter">Inverter</button>
        <button class="btn perigo" data-tirar-lig="${l.id}">Apagar</button>
      </div>`;
  }
}

// O que o painel do criador precisa saber do diagrama
const porY = (a, b) => a.y - b.y || a.x - b.x;
function ctxCriador() {
  const m = missao();
  const escolhasDe = (id) => m.ligacoes.filter((l) => l.de === id).map((l) => no(l.para)).filter((n) => n && n.tipo === "escolha").sort(porY);
  const paiDe = (id) => m.ligacoes.filter((l) => l.para === id).map((l) => no(l.de)).find((n) => n && ["entrada", "cena", "final", "lugar", "mapa"].includes(n.tipo));
  const tipoLig = { sucesso: "sucesso", falha: "falha", resultado: "segue" };
  const opcoesDestino = (id, chave) => {
    const atual = m.ligacoes.find((l) => l.de === id && l.tipo === tipoLig[chave] && no(l.para) && no(l.para).tipo !== "escolha");
    const alvos = m.nos.filter((n) => ["entrada", "cena", "final", "lugar"].includes(n.tipo)).sort((a, b) => (a.tipo === "lugar") - (b.tipo === "lugar") || porY(a, b));
    return `<option value="">fica onde está / volta ao lugar</option>${alvos.map((n) => `<option value="${n.id}" ${atual && atual.para === n.id ? "selected" : ""}>${n.tipo === "lugar" ? "⌂ " : "▸ "}${esc(n.titulo)}</option>`).join("")}`;
  };
  return { m, escolhasDe, paiDe, opcoesDestino };
}

// ======================= Editar =======================

function criarNo(tipo, x, y, extra = {}) {
  const m = missao();
  const n = { id: novoId("n"), tipo, titulo: TIPOS[tipo].split(" /")[0], texto: "", condicao: "", efeitos: "", notas: "", x: Math.round(x), y: Math.round(y), ...extra };
  // blocos que viram jogo já nascem com os dados completos (cena, lugar, escolha…)
  if (!("d" in extra)) { const d = Criador.dadosNovos(tipo); if (d) n.d = d; }
  m.nos.push(n);
  return n;
}

function ligar(de, para, extra = {}) {
  const m = missao();
  if (de === para || m.ligacoes.some((l) => l.de === de && l.para === para)) return null;
  const l = { id: novoId("l"), de, para, rotulo: "", tipo: "segue", ...extra };
  m.ligacoes.push(l);
  return l;
}

// novo ramo: um bloco à direita, abaixo dos irmãos que já existem
function novoRamo(deId) {
  const m = missao();
  const pai = no(deId);
  const irmaos = m.ligacoes.filter((l) => l.de === deId).map((l) => no(l.para)).filter(Boolean);
  const y = irmaos.length ? Math.max(...irmaos.map((n) => n.y)) + 170 : pai.y;
  // de cena, lugar ou exploração nasce uma escolha; de uma escolha, a cena que vem depois
  const tipo = ["lugar", "mapa", "cena", "entrada"].includes(pai.tipo) && pai.d ? "escolha" : "cena";
  const n = criarNo(tipo, pai.x + LARG + 90, y);
  // não nasce em cima de outro bloco: procura o espaço livre mais perto (um pouco abaixo, depois à direita)
  const livre = (x, yy) => !m.nos.some((o) => o !== n && Math.abs(o.x - x) < LARG + 20 && Math.abs(o.y - yy) < 160);
  procura: for (let col = 0; col < 12; col++)
    for (let lin = 0; lin < 3; lin++) {
      // com irmãos, entra no fim da fila deles (mesma coluna); sem irmãos, à direita do bloco
      const x0 = irmaos.length ? irmaos.reduce((a, b) => (b.y > a.y ? b : a)).x : pai.x + LARG + 90;
      const x = x0 + col * (LARG + 40), yy = y + lin * 180;
      if (livre(x, yy)) { n.x = x; n.y = yy; break procura; }
    }
  // de uma escolha com teste: o primeiro ramo é o do sucesso, o segundo o da falha
  let tipoLig = "segue";
  if (pai.tipo === "escolha" && pai.d?.teste?.tipo && pai.d.teste.tipo !== "nenhum")
    tipoLig = m.ligacoes.some((l) => l.de === deId && l.tipo === "sucesso") ? "falha" : "sucesso";
  ligar(deId, n.id, { tipo: tipoLig });
  selecao = { tipo: "no", id: n.id };
  mudou();
  render();
  focarNoTitulo();
}

function focarNoTitulo() {
  mostrarSelecionado();
  const t = painel.querySelector('[data-campo="titulo"], [data-p="titulo"]');
  if (t && matchMedia("(min-width: 761px)").matches) { t.focus(); t.select(); }
}

// o bloco selecionado fica à vista: se nasceu atrás do painel ou fora da tela, o quadro anda até ele
function mostrarSelecionado() {
  const el = selecao?.tipo === "no" && nosEl.querySelector(`[data-no="${selecao.id}"]`);
  if (!el) return;
  const q = quadro.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const p = painel.hidden ? null : painel.getBoundingClientRect();
  const celular = matchMedia("(max-width: 760px)").matches;
  // área livre: o quadro menos o painel (à direita no PC, embaixo no celular)
  const livre = { left: q.left, top: q.top, right: !celular && p ? Math.min(q.right, p.left) : q.right, bottom: celular && p ? Math.min(q.bottom, p.top) : q.bottom };
  let dx = 0, dy = 0;
  if (r.right > livre.right - 20) dx = livre.right - 20 - r.right;
  if (r.left + dx < livre.left + 20) dx = livre.left + 20 - r.left;
  if (r.bottom > livre.bottom - 20) dy = livre.bottom - 20 - r.bottom;
  if (r.top + dy < livre.top + 20) dy = livre.top + 20 - r.top;
  if (!dx && !dy) return;
  vista.x += dx;
  vista.y += dy;
  aplicarVista();
  guardarLocal();
}

// centro da tela, em coordenadas do mundo
function centroDaTela() {
  const r = quadro.getBoundingClientRect();
  return { x: (r.width / 2 - vista.x) / vista.z - LARG / 2, y: (r.height / 3 - vista.y) / vista.z };
}

function aviso(texto) {
  const el = $("#dg-aviso");
  el.hidden = !texto;
  el.textContent = texto || "";
}

// ---------- Ferramentas ----------
$(".dg-ferramentas").addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  if (b.dataset.novo) {
    if (!missao()) novaMissao();
    const c = centroDaTela();
    const n = criarNo(b.dataset.novo, c.x + (Math.random() * 40 - 20), c.y + (Math.random() * 40 - 20));
    // ligado ao que estava selecionado, para crescer a árvore rápido
    if (selecao?.tipo === "no" && no(selecao.id)) {
      const pai = no(selecao.id);
      n.x = pai.x + LARG + 90;
      n.y = pai.y;
      ligar(pai.id, n.id);
    }
    selecao = { tipo: "no", id: n.id };
    mudou();
    render();
    focarNoTitulo();
  }
  if (b.dataset.zoom) {
    const z = +b.dataset.zoom;
    if (z === 0) return enquadrar();
    zoomEm(quadro.clientWidth / 2, quadro.clientHeight / 2, z > 0 ? 1.2 : 1 / 1.2);
  }
});

// ---------- Painel ----------
painel.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.dataset.p && selecao?.tipo === "no") {
    const n = no(selecao.id);
    const r = Criador.aplicar(n, t);
    renderNos();
    renderLigacoes();
    if (r === "repintar") renderPainel();
    mudou();
    return;
  }
  if (t.dataset.campo && selecao?.tipo === "no") {
    const n = no(selecao.id);
    n[t.dataset.campo] = t.value;
    // redesenha os blocos, não o painel (o campo continua com o foco)
    renderNos();
    renderLigacoes();
    if (t.dataset.campo === "tipo") renderPainel();
    mudou();
  }
  if (t.dataset.lig) {
    const l = missao().ligacoes.find((x) => x.id === t.dataset.lig);
    l[t.dataset.ligCampo] = t.value;
    renderLigacoes();
    mudou();
  }
});
// selects que mudam a estrutura: + condição/efeito e "vai para"
painel.addEventListener("change", (ev) => {
  const t = ev.target;
  const n = selecao?.tipo === "no" && no(selecao.id);
  if (!n) return;
  if (t.classList.contains("cr-add")) {
    Criador.acrescentar(n, t);
    mudou();
    return renderPainel();
  }
  if (t.dataset.destino) {
    const m = missao();
    const tipo = { sucesso: "sucesso", falha: "falha", resultado: "segue" }[t.dataset.destino];
    m.ligacoes = m.ligacoes.filter((l) => !(l.de === n.id && l.tipo === tipo && no(l.para) && no(l.para).tipo !== "escolha"));
    if (t.value) m.ligacoes.push({ id: novoId("l"), de: n.id, para: t.value, rotulo: "", tipo });
    mudou();
    renderLigacoes();
  }
});

painel.addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  const m = missao();
  const n0 = selecao?.tipo === "no" && no(selecao.id);
  if (n0 && (b.dataset.tirar || b.dataset.tirarItem || b.dataset.novoItem)) {
    if (b.dataset.tirar) Criador.tirar(n0, b.dataset.tirar);
    if (b.dataset.tirarItem) Criador.tirarItem(n0, b.dataset.tirarItem);
    if (b.dataset.novoItem) Criador.novoItem(n0, b.dataset.novoItem);
    mudou();
    renderNos();
    return renderPainel();
  }
  if (b.dataset.novaEscolha) return novoRamo(b.dataset.novaEscolha);
  if (b.dataset.irNo) {
    selecao = { tipo: "no", id: b.dataset.irNo };
    render();
    return mostrarSelecionado();
  }
  if (b.dataset.painel === "fechar") { selecao = null; ligandoDe = null; aviso(""); return render(); }
  if (b.dataset.tirarLig) {
    m.ligacoes = m.ligacoes.filter((l) => l.id !== b.dataset.tirarLig);
    if (selecao?.tipo === "ligacao") selecao = null;
    mudou();
    return render();
  }
  const acao = b.dataset.acao;
  if (acao === "ramo") return novoRamo(selecao.id);
  if (acao === "ligar") {
    ligandoDe = selecao.id;
    aviso("Toque no bloco de destino (Esc cancela)");
    return render();
  }
  if (acao === "duplicar") {
    const n = no(selecao.id);
    const c = criarNo(n.tipo, n.x + 30, n.y + 160, { titulo: n.titulo + " (cópia)", texto: n.texto, condicao: n.condicao, efeitos: n.efeitos, notas: n.notas, d: n.d ? copia(n.d) : undefined });
    if (!c.d) delete c.d;
    else if (c.d.chave) c.d.chave += "-copia";
    else if (c.tipo === "escolha" && c.d.id) c.d.id += "-copia";
    selecao = { tipo: "no", id: c.id };
    mudou();
    return render();
  }
  if (acao === "apagar") {
    const n = no(selecao.id);
    if (!confirm(`Apagar o bloco “${n.titulo}” e as ligações dele?`)) return;
    m.nos = m.nos.filter((x) => x.id !== n.id);
    m.ligacoes = m.ligacoes.filter((l) => l.de !== n.id && l.para !== n.id);
    selecao = null;
    mudou();
    return render();
  }
  if (acao === "inverter") {
    const l = m.ligacoes.find((x) => x.id === selecao.id);
    [l.de, l.para] = [l.para, l.de];
    mudou();
    return render();
  }
});

document.addEventListener("keydown", (ev) => {
  const digitando = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");
  if (ev.key === "Escape") {
    if (ligandoDe) { ligandoDe = null; aviso(""); return render(); }
    if (!digitando && selecao) { selecao = null; return render(); }
  }
  if ((ev.key === "Delete" || ev.key === "Backspace") && !digitando && selecao) {
    ev.preventDefault();
    painel.querySelector(selecao.tipo === "no" ? '[data-acao="apagar"]' : "[data-tirar-lig]")?.click();
  }
});

// ======================= Arrastar, tocar, zoom =======================
// Um dedo/mouse: no bloco arrasta o bloco; no fundo arrasta o quadro. Dois dedos: zoom.
let arrasto = null;
const ponteiros = new Map();

function zoomEm(px, py, fator) {
  const z = Math.min(2.5, Math.max(0.15, vista.z * fator));
  const f = z / vista.z;
  vista = { x: px - (px - vista.x) * f, y: py - (py - vista.y) * f, z };
  aplicarVista();
  guardarLocal();
}

function enquadrar() {
  const m = missao();
  if (!m || !m.nos.length) { vista = { x: 40, y: 40, z: 1 }; return aplicarVista(); }
  const xs = m.nos.map((n) => n.x), ys = m.nos.map((n) => n.y);
  const x0 = Math.min(...xs) - 40, y0 = Math.min(...ys) - 40, x1 = Math.max(...xs) + LARG + 40, y1 = Math.max(...ys) + 200;
  const z = Math.min(1.2, Math.max(0.15, Math.min(quadro.clientWidth / (x1 - x0), quadro.clientHeight / (y1 - y0))));
  vista = { z, x: (quadro.clientWidth - (x1 - x0) * z) / 2 - x0 * z, y: (quadro.clientHeight - (y1 - y0) * z) / 2 - y0 * z };
  aplicarVista();
  guardarLocal();
}

quadro.addEventListener("wheel", (ev) => {
  ev.preventDefault();
  const r = quadro.getBoundingClientRect();
  zoomEm(ev.clientX - r.left, ev.clientY - r.top, ev.deltaY < 0 ? 1.1 : 1 / 1.1);
}, { passive: false });

quadro.addEventListener("pointerdown", (ev) => {
  if (ev.target.closest(".dg-no-ramo")) return;
  ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  quadro.setPointerCapture(ev.pointerId);
  if (ponteiros.size === 2) {
    const [a, b] = [...ponteiros.values()];
    arrasto = { tipo: "pinca", dist: Math.hypot(a.x - b.x, a.y - b.y), meio: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
    return;
  }
  const elNo = ev.target.closest("[data-no]");
  const elLig = ev.target.closest("[data-ligacao]");
  arrasto = elNo
    ? { tipo: "no", id: elNo.dataset.no, x0: ev.clientX, y0: ev.clientY, nx: no(elNo.dataset.no).x, ny: no(elNo.dataset.no).y, moveu: false }
    : { tipo: "fundo", lig: elLig?.dataset.ligacao, x0: ev.clientX, y0: ev.clientY, vx: vista.x, vy: vista.y, moveu: false };
  if (!elNo) quadro.classList.add("arrastando");
});

quadro.addEventListener("pointermove", (ev) => {
  if (!ponteiros.has(ev.pointerId) || !arrasto) return;
  ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (arrasto.tipo === "pinca" && ponteiros.size === 2) {
    const [a, b] = [...ponteiros.values()];
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    const r = quadro.getBoundingClientRect();
    zoomEm(arrasto.meio.x - r.left, arrasto.meio.y - r.top, dist / arrasto.dist);
    arrasto.dist = dist;
    return;
  }
  const dx = ev.clientX - arrasto.x0, dy = ev.clientY - arrasto.y0;
  if (Math.hypot(dx, dy) > 5) arrasto.moveu = true;
  if (!arrasto.moveu) return;
  if (arrasto.tipo === "no") {
    const n = no(arrasto.id);
    n.x = Math.round(arrasto.nx + dx / vista.z);
    n.y = Math.round(arrasto.ny + dy / vista.z);
    const el = nosEl.querySelector(`[data-no="${n.id}"]`);
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";
    renderLigacoes();
  } else if (arrasto.tipo === "fundo") {
    vista.x = arrasto.vx + dx;
    vista.y = arrasto.vy + dy;
    aplicarVista();
  }
});

function soltar(ev) {
  ponteiros.delete(ev.pointerId);
  quadro.classList.remove("arrastando");
  if (!arrasto || ponteiros.size) { if (!ponteiros.size) arrasto = null; return; }
  const a = arrasto;
  arrasto = null;
  if (a.tipo === "no") {
    if (a.moveu) return mudou();
    // toque num bloco: liga (se estiver ligando) ou seleciona
    if (ligandoDe) {
      if (ligar(ligandoDe, a.id)) mudou();
      ligandoDe = null;
      aviso("");
      selecao = { tipo: "no", id: a.id };
    } else selecao = { tipo: "no", id: a.id };
    render();
    return mostrarSelecionado();
  }
  if (a.tipo === "fundo") {
    if (a.moveu) return guardarLocal();
    if (a.lig) selecao = { tipo: "ligacao", id: a.lig };
    else if (!ligandoDe) selecao = null;
    render();
  }
}
quadro.addEventListener("pointerup", soltar);
quadro.addEventListener("pointercancel", soltar);

nosEl.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-ramo]");
  if (b) novoRamo(b.dataset.ramo);
});

// ======================= Missões =======================

function escolherMissao(id) {
  missaoId = mundo.missoes.some((m) => m.id === id) ? id : mundo.missoes[0]?.id || null;
  const v = (lerAtual().vistas || {})[missaoId];
  vista = v ? { ...v } : { x: 40, y: 40, z: 1 };
  selecao = null;
  ligandoDe = null;
}

function novaMissao(titulo = "Nova missão", eixo = "x") {
  const m = { id: novoId("m"), titulo, eixo, resumo: "", nos: [], ligacoes: [] };
  mundo.missoes.push(m);
  escolherMissao(m.id);
  mudou();
  return m;
}

$("#dg-missao").addEventListener("change", (ev) => {
  guardarLocal();
  escolherMissao(ev.target.value);
  guardarLocal();
  render();
  if (!(lerAtual().vistas || {})[missaoId]) enquadrar();
});

const dlgMissao = $("#dg-dialogo-missao");
// o que impede (erros) ou merece atenção (avisos) antes de publicar
function publicarHtml(m) {
  const { erros, avisos } = Criador.validar(m);
  const lista = (l, cls) => (l.length ? `<ul class="cr-validacao ${cls}">${l.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "");
  return `${lista(erros, "erros")}${lista(avisos, "avisos")}
    ${!erros.length && !avisos.length ? `<p class="ajuda">✓ Tudo certo para publicar.</p>` : ""}
    ${m.jogo?.publicadoEm ? `<p class="ajuda">Publicada pela última vez em ${new Date(m.jogo.publicadoEm).toLocaleString("pt-BR")}.</p>` : ""}
    <div class="linha-botoes"><button class="btn primario" data-m="publicar" ${erros.length ? "disabled" : ""}>Publicar no jogo</button></div>
    <p class="ajuda" id="dg-publicar-estado">${erros.length ? "Corrija os erros acima para publicar." : "Ela aparece na Mesa para quem tiver liberado (missão anterior terminada e as marcas pedidas)."}</p>`;
}

// as missões que podem vir antes/depois: as do jogo e as deste criador
function opcoesMissao(atual) {
  const ids = new Map();
  for (const j of Object.values(window.MISSOES || {})) ids.set(j.id, j.titulo);
  for (const x of mundo.missoes) if (x.jogo?.id) ids.set(x.jogo.id, x.titulo);
  return `<option value="">(nenhuma)</option>${[...ids].map(([id, t]) => `<option value="${esc(id)}" ${id === atual ? "selected" : ""}>${esc(t)} · ${esc(id)}</option>`).join("")}`;
}
$("#dg-missao-menu").addEventListener("click", () => {
  const m = missao();
  const doJogo = Object.values(window.MISSOES || {});
  dlgMissao.innerHTML = `
    <h2>Missão</h2>
    ${m ? `
      <label class="campo"><span>Nome</span><input id="dg-m-titulo" value="${esc(m.titulo)}"></label>
      <label class="campo"><span>Mundo</span><select id="dg-m-eixo">${Object.entries(EIXOS_NOMES).map(([k, v]) => `<option value="${k}" ${m.eixo === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
      <label class="campo"><span>Resumo (aparece na Mesa)</span><textarea id="dg-m-resumo" rows="3">${esc(m.resumo)}</textarea></label>
      <h3>No jogo</h3>
      <div class="cr-duas"><label class="campo"><span>Id no jogo</span><input id="dg-j-id" value="${esc(m.jogo?.id || "")}" placeholder="ex.: x2-frequencia"></label>
        <label class="campo"><span>Subtítulo</span><input id="dg-j-sub" value="${esc(m.jogo?.subtitulo || "")}" placeholder="Ato 1 · Eixo X — Urbano"></label></div>
      <label class="campo"><span>Fase (etiqueta no topo)</span><input id="dg-j-fase" value="${esc(m.jogo?.fase || "")}"></label>
      <h3>Desbloqueio e encadeamento</h3>
      <div class="cr-duas"><label class="campo"><span>Missão anterior (precisa ter terminado)</span><select id="dg-j-anterior">${opcoesMissao(m.jogo?.anterior)}</select></label>
        <label class="campo"><span>Próxima missão</span><select id="dg-j-proxima">${opcoesMissao(m.jogo?.proxima)}</select></label></div>
      <label class="campo"><span>E também precisa das marcas (separadas por vírgula; vazio = nenhuma)</span><input id="dg-j-marcas" value="${esc([].concat(m.jogo?.desbloqueio?.marca || []).join(", "))}" placeholder="ex.: salvou:Danny"></label>
      <label class="campo"><span>Quem fala (NPCs: um por linha, id: nome)</span><textarea id="dg-j-npcs" rows="4">${esc(Object.entries(m.jogo?.npcs || {}).map(([k, v]) => `${k}: ${v}`).join("\n"))}</textarea></label>
      <details class="cr-secao"><summary>Avançado (JSON)</summary><textarea id="dg-j-avancado" rows="6">${esc(JSON.stringify(m.jogo?.avancado || {}, null, 1))}</textarea></details>
      <div class="linha-botoes"><button class="btn primario" data-m="salvar">Salvar</button><button class="btn" data-m="baixar">Baixar a missão (formato do jogo)</button><button class="btn perigo" data-m="apagar">Apagar missão</button></div>
      <h3>Publicar no jogo</h3>
      <div id="dg-publicar">${publicarHtml(m)}</div>
      <hr>` : ""}
    <div class="linha-botoes"><button class="btn" data-m="nova">+ Nova missão em branco</button></div>
    <h3>Importar do jogo</h3>
    <p class="ajuda">Traz a missão inteira como ela está no jogo hoje: todos os textos (com as variações por personagem), escolhas, testes, efeitos, condições, lugares, relógio e acontecimentos. Vira um projeto aqui, para você mudar qualquer detalhe.</p>
    <div class="linha-botoes">${doJogo.map((j) => `<button class="btn" data-importar="${j.id}">${esc(j.titulo)}</button>`).join("")}</div>
    <div class="linha-botoes"><button class="btn" data-m="fechar">Fechar</button></div>`;
  dlgMissao.showModal();
});

dlgMissao.addEventListener("click", (ev) => {
  const b = ev.target.closest("button");
  if (!b) return;
  const m = missao();
  if (b.dataset.m === "fechar") return dlgMissao.close();
  if (b.dataset.m === "salvar") {
    Object.assign(m, { titulo: $("#dg-m-titulo").value.trim() || m.titulo, eixo: $("#dg-m-eixo").value, resumo: $("#dg-m-resumo").value });
    let avancado = m.jogo?.avancado || {};
    try { avancado = JSON.parse($("#dg-j-avancado").value || "{}"); } catch { return alert("O JSON do Avançado tem um erro. Confira as vírgulas e aspas."); }
    const marcas = $("#dg-j-marcas").value.split(",").map((x) => x.trim()).filter(Boolean);
    const npcs = Object.fromEntries($("#dg-j-npcs").value.split("\n").map((l) => l.split(":")).filter((p) => p.length > 1 && p[0].trim()).map(([k, ...v]) => [k.trim(), v.join(":").trim()]));
    m.jogo = { ...(m.jogo || {}), id: $("#dg-j-id").value.trim(), subtitulo: $("#dg-j-sub").value, fase: $("#dg-j-fase").value, anterior: $("#dg-j-anterior").value, proxima: $("#dg-j-proxima").value, desbloqueio: marcas.length ? { marca: marcas } : {}, npcs, avancado };
    mudou();
    dlgMissao.close();
    return render();
  }
  if (b.dataset.m === "apagar") {
    if (!confirm(`Apagar a missão “${m.titulo}” inteira (${m.nos.length} blocos)?`)) return;
    mundo.missoes = mundo.missoes.filter((x) => x.id !== m.id);
    escolherMissao(null);
    mudou();
    dlgMissao.close();
    return render();
  }
  if (b.dataset.m === "publicar") {
    const caixa = $("#dg-publicar-estado");
    if (!confirm(`Publicar “${m.titulo}” no jogo? A versão que está no jogo hoje com o id “${m.jogo?.id}” é substituída.`)) return;
    b.disabled = true;
    caixa.textContent = "Publicando…";
    Criador.publicar(m, { aviso: (t) => (caixa.textContent = t) })
      .then((r) => {
        m.jogo = { ...(m.jogo || {}), publicadoEm: new Date().toISOString() };
        mudou();
        caixa.innerHTML = r.onde === "pc"
          ? "✓ Gravada no projeto (site/missoes). Para ir para o site, rode o publicar.sh (ou peça ao Claude)."
          : "✓ Publicada. Em 1 ou 2 minutos ela está no jogo, em todos os aparelhos.";
      })
      .catch((e) => {
        caixa.innerHTML = `✗ Não publicou: ${esc(e.message)}.${[403, 404].includes(e.status) ? `<br>No GitHub, edite o seu token (Settings → Developer settings → Fine-grained tokens), acrescente o repositório <b>kosmos</b> em <i>Repository access</i> com <i>Contents: Read and write</i>, e tente de novo.` : ""}`;
      })
      .finally(() => (b.disabled = false));
    return;
  }
  if (b.dataset.m === "baixar") {
    const jm = Criador.exportar(m);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(jm, null, 2)], { type: "application/json" }));
    a.download = `${jm.id || "missao"}.json`;
    a.click();
    return;
  }
  if (b.dataset.m === "nova") {
    novaMissao();
    dlgMissao.close();
    return render();
  }
  if (b.dataset.importar) {
    const nova = Criador.importar(window.MISSOES[b.dataset.importar]);
    mundo.missoes.push(nova);
    escolherMissao(nova.id);
    mudou();
    dlgMissao.close();
    render();
    requestAnimationFrame(() => { renderLigacoes(); enquadrar(); });
  }
});

// ======================= Importar uma missão do jogo =======================
// Cenas da história numa fila (da abertura ao final), a exploração embaixo, cada lugar numa
// coluna com as ações dele; "abre" liga quem destrava a quem é destravado.

function importar(jm) {
  const m = { id: novoId("m"), titulo: `${jm.titulo} (do jogo)`, eixo: jm.eixo, resumo: typeof jm.resumo === "string" ? jm.resumo : "", nos: [], ligacoes: [] };
  const ids = {};
  const txt = (v) => (typeof v === "function" ? "(o texto muda conforme o personagem)" : String(v || ""));
  const curto = (v, n = 160) => { const t = txt(v).replace(/\s+/g, " ").trim(); return t.length > n ? t.slice(0, n - 1) + "…" : t; };
  const add = (chave, tipo, titulo, x, y, extra = {}) => {
    const n = { id: novoId("n"), tipo, titulo, texto: "", condicao: "", efeitos: "", notas: "", x, y, ...extra };
    m.nos.push(n);
    if (chave) ids[chave] = n.id;
    return n;
  };
  const lig = (a, b, extra = {}) => a && b && m.ligacoes.push({ id: novoId("l"), de: a, para: b, rotulo: "", tipo: "segue", ...extra });
  const condicao = (se) => {
    if (!se) return "";
    const p = [];
    for (const f of [].concat(se.flag || [])) p.push(`depois de “${f}”`);
    for (const f of [].concat(se.semFlag || [])) p.push(`sem “${f}”`);
    if (se.algum) p.push(`algum de: ${[].concat(se.algum).join(", ")}`);
    if (se.relogioMin != null) p.push(`relógio ≥ ${se.relogioMin}`);
    if (se.ponto) p.push(`profissão: ${se.ponto}`);
    if (se.pronto) p.push(`só ${se.pronto}`);
    for (const f of [].concat(se.marca || [])) p.push(`marca ${f}`);
    return p.join(" · ");
  };
  const efeitosDe = (r) => {
    const e = (r && r.efeitos) || {};
    const p = [];
    for (const k of [].concat(e.marca || [])) p.push(k);
    if (e.ressonancia) p.push(`${e.ressonancia > 0 ? "+" : ""}${e.ressonancia} Res`);
    if (e.dissonancia) p.push(`${e.dissonancia > 0 ? "+" : ""}${e.dissonancia} Dis`);
    if (e.quest && e.quest.estado) p.push(`${e.quest.nome}: ${e.quest.estado}`);
    return p.join(", ");
  };
  const destino = (op) => [op.resultado, op.sucesso, op.falha].filter((r) => r && typeof r === "object" && r.ir).map((r) => r.ir);
  const flagsDe = (op) => [op.resultado, op.sucesso, op.falha].filter((r) => r && typeof r === "object").flatMap((r) => [].concat((r.efeitos || {}).flag || []));
  const teste = (op) => (op.convergencia ? `Convergência ${op.convergencia}` : op.situacao ? `teste: ${op.situacao}` : "");

  // 1. cenas da história, na ordem em que se chega nelas
  const ordem = [];
  const fila = [jm.inicio];
  while (fila.length) {
    const c = fila.shift();
    if (!c || ordem.includes(c) || !jm.cenas[c]) continue;
    ordem.push(c);
    for (const op of jm.cenas[c].opcoes || []) for (const d of destino(op)) if (d.startsWith("cena:")) fila.push(d.slice(5));
  }
  if (jm.cenas.chamado && !ordem.includes("chamado")) {
    // o chamado vem pelo marco (pistas ou relógio cheio): continua a fila a partir dele
    fila.push("chamado");
    while (fila.length) {
      const c = fila.shift();
      if (!c || ordem.includes(c) || !jm.cenas[c]) continue;
      ordem.push(c);
      for (const op of jm.cenas[c].opcoes || []) for (const d of destino(op)) if (d.startsWith("cena:")) fila.push(d.slice(5));
    }
  }
  for (const c of Object.keys(jm.cenas)) if (!ordem.includes(c)) ordem.push(c);

  ordem.forEach((c, i) => {
    const cena = jm.cenas[c];
    const tipo = c === jm.inicio ? "entrada" : cena.final ? "final" : (cena.opcoes || []).some((o) => o.convergencia || o.situacao || o.rodada) ? "escolha" : "cena";
    const ops = (cena.opcoes || []).map((o) => `• ${o.texto}${teste(o) ? ` (${teste(o)})` : ""}`).join("\n");
    add("cena:" + c, tipo, cena.titulo || c, i * 330, 0, { texto: [curto(cena.texto, 140), ops].filter(Boolean).join("\n") });
  });
  ordem.forEach((c) => {
    for (const op of jm.cenas[c].opcoes || []) {
      for (const [r, tipo] of [[op.resultado, "segue"], [op.sucesso, "sucesso"], [op.falha, "falha"]]) {
        if (!r || typeof r !== "object" || !r.ir || !r.ir.startsWith("cena:")) continue;
        if (!m.ligacoes.some((l) => l.de === ids["cena:" + c] && l.para === ids[r.ir])) lig(ids["cena:" + c], ids[r.ir], { tipo: tipo === "segue" ? "segue" : tipo, rotulo: op.texto.length < 28 ? op.texto : "" });
      }
    }
  });

  // 2. a exploração (lugares), embaixo da história
  const lugares = Object.entries(jm.lugares || {});
  if (lugares.length) {
    const hub = add("hub", "lugar", "Exploração livre", 330, 260, {
      texto: `${lugares.length} lugares. Cada ação gasta tempo no relógio (0–${jm.relogioMax}).`,
      condicao: jm.pistasParaMarco ? `segue para a história com ${jm.pistasParaMarco} pistas ou relógio cheio` : "",
    });
    for (const c of ordem) for (const op of jm.cenas[c].opcoes || []) for (const d of destino(op)) if (d.startsWith("lugar:")) lig(ids["cena:" + c], hub.id);
    if (ids["cena:chamado"]) lig(hub.id, ids["cena:chamado"], { rotulo: "marco: pistas ou relógio cheio" });
    if (jm.eventosRelogio?.length)
      add(null, "nota", "O relógio", -330, 260, { texto: jm.eventosRelogio.map((e) => `${e.em}: ${e.texto}`).join("\n") });

    const colunas = [...lugares, ...(jm.emTodaParte?.length ? [["_toda", { nome: "Em toda parte", acoes: jm.emTodaParte }]] : [])];
    colunas.forEach(([lid, l], col) => {
      const x = col * 300;
      const nome = typeof l.nome === "function" ? "Lugar inicial (trabalho / origem)" : l.nome;
      const comuns = l.acoes.filter((a) => a.comum).length;
      const lugar = add("lugar:" + lid, "lugar", nome, x, 560, { condicao: condicao(l.se), texto: [curto(l.descricao, 110), comuns ? `Vida comum: ${comuns} ações` : "", l.loja ? `Loja: ${l.loja.nome}` : ""].filter(Boolean).join("\n") });
      lig(hub.id, lugar.id);
      let y = 760;
      for (const a of l.acoes) {
        if (a.comum || (a.se && a.se.pronto)) continue;
        const partes = [];
        if (a.sucesso) partes.push(`✓ ${curto(a.sucesso.texto, 90)}`);
        if (a.falha) partes.push(`✗ ${curto(a.falha.texto, 70)}`);
        if (a.resultado) partes.push(curto(a.resultado.texto, 110));
        const ef = [efeitosDe(a.sucesso), efeitosDe(a.resultado)].filter(Boolean).join(", ");
        const n = add("acao:" + a.id, "escolha", a.texto, x, y, { texto: partes.join("\n"), condicao: [teste(a), condicao(a.se)].filter(Boolean).join(" · "), efeitos: ef });
        lig(lugar.id, n.id);
        y += 210;
      }
    });

    // 3. quem destrava quem (flags)
    const quemSeta = {};
    for (const [lid, l] of colunas) for (const a of l.acoes) for (const f of flagsDe(a)) (quemSeta[f] = quemSeta[f] || []).push("acao:" + a.id);
    for (const ev of jm.eventosRelogio || []) (quemSeta[ev.flag] = quemSeta[ev.flag] || []);
    for (const [lid, l] of colunas) {
      const alvos = [["lugar:" + lid, l.se], ...l.acoes.map((a) => ["acao:" + a.id, a.se])];
      for (const [chave, se] of alvos) {
        if (!se || !ids[chave]) continue;
        for (const f of [].concat(se.flag || [])) for (const de of quemSeta[f] || []) if (ids[de] && de !== chave) lig(ids[de], ids[chave], { tipo: "abre" });
      }
    }
  }

  // 4. as origens dos personagens prontos (só no prólogo do Urbano)
  if (jm.id === "prologo-x" && typeof ORIGENS_X !== "undefined") {
    Object.entries(ORIGENS_X).forEach(([pid, o], i) => {
      const n = add("origem:" + pid, "entrada", o.nome, -700, i * 230 - 400, { texto: curto(o.abertura, 150), efeitos: o.fio ? `fio: ${o.fio.nome}` : "", condicao: `só ${pid}` });
      lig(n.id, ids["cena:" + jm.inicio], { rotulo: pid.split("-")[0] });
      o.acoes.forEach((a, k) => {
        const an = add(null, "escolha", a.texto, -1000 - k * 260, i * 230 - 400, {
          texto: a.sucesso ? `✓ ${curto(a.sucesso.texto, 80)}` : curto(a.resultado?.texto, 90),
          efeitos: efeitosDe(a.sucesso || a.resultado),
        });
        lig(n.id, an.id);
      });
    });
  }
  return m;
}

// ======================= Começo =======================

(async function carregar() {
  const l = lerLocal();
  mundo = (l && l.dados) || vazio();
  base = (l && l.base) || null;
  baseSha = (l && l.sha) || null;
  escolherMissao(lerAtual().missaoId);
  render();
  requestAnimationFrame(renderLigacoes);
  if (!Nuvem.config()) estadoSalvo("guardado neste aparelho · conecte a ☁ para ter no celular e no PC", "aviso");
  await sincronizar();
})();

// ---------- Conectar à nuvem (a mesma conexão da Oficina) ----------
const dialogoNuvem = $("#dialogo-nuvem");
$("#btn-nuvem").addEventListener("click", () => {
  const c = Nuvem.config();
  dialogoNuvem.innerHTML = c
    ? `<h2>☁ Nuvem</h2><p>Conectado a <b>${esc(c.repo)}</b>. Os diagramas ficam em <i>${ARQUIVO}</i> e aparecem em todos os aparelhos conectados.</p>
       <div class="linha-botoes"><button class="btn primario" data-nv="sync">Sincronizar agora</button><button class="btn" data-nv="fechar">Fechar</button></div>`
    : `<h2>☁ Conectar</h2><p>Use a mesma conexão da Oficina: abra a <a href="oficina.html">Oficina</a> e conecte por ☁ Nuvem. Depois volte aqui.</p>
       <div class="linha-botoes"><button class="btn" data-nv="fechar">Fechar</button></div>`;
  dialogoNuvem.showModal();
});
dialogoNuvem.addEventListener("click", (ev) => {
  const a = ev.target.closest("[data-nv]")?.dataset.nv;
  if (a === "fechar") dialogoNuvem.close();
  if (a === "sync") { dialogoNuvem.close(); sincronizar(); }
});
