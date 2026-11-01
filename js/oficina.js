// Oficina do Autor: editor de perguntas, NPCs, missões (storylets) e tabelas dos geradores.
// Onde os textos ficam:
//   · Conectada à nuvem (repositório privado do GitHub, ver nuvem.js): celular e PC veem a mesma
//     coisa; cada aparelho guarda também uma cópia, para funcionar sem internet.
//   · Sem nuvem, pelo servidor do PC (ferramentas/servidor.py): salva em site/dados/oficina.json.
//   · Sem nenhum dos dois: fica só neste navegador (o botão Exportar baixa o arquivo).

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const LOCAL = "kosmos.oficina.local"; // { dados, base, sha }: cópia deste aparelho
const RASCUNHO_ANTIGO = "kosmos.oficina.rascunho";
const EIXOS_NOMES = { x: "∃ X · Urbano", y: "ᛉ Y · Medieval", z: "◉ Z · Espacial", lime: "Lime", todos: "Todos os eixos" };

let mundo = null;
let aba = "perguntas";
let npcAtual = null;
let missaoAtual = null;
let eixoGerador = "y";
let gerado = { npc: null, missao: null };
let salvarAgendado = null;

// estado da nuvem: base = última versão igual à da nuvem (para juntar mudanças de dois aparelhos)
let base = null;
let baseSha = null;
let enviando = false;
let comServidor = false;
let redesenharDepois = false;

const vazio = () => ({ versao: 1, perguntas: [], npcs: [], storylets: [], profissoes: [], tabelas: {}, pontos: {} });
const copia = (o) => JSON.parse(JSON.stringify(o));

function normalizar(m) {
  m = m || vazio();
  for (const k of ["perguntas", "npcs", "storylets", "profissoes"]) m[k] = m[k] || [];
  m.tabelas = m.tabelas || {};
  m.pontos = m.pontos || {};
  return m;
}

// ======================= Carregar e salvar =======================

function lerLocal() {
  try {
    const l = JSON.parse(localStorage.getItem(LOCAL));
    if (l) return l;
    const antigo = JSON.parse(localStorage.getItem(RASCUNHO_ANTIGO));
    return antigo ? { dados: antigo } : null;
  } catch {
    return null;
  }
}

function guardarLocal() {
  try {
    localStorage.setItem(LOCAL, JSON.stringify({ dados: mundo, base, sha: baseSha }));
    localStorage.removeItem(RASCUNHO_ANTIGO);
  } catch {}
}

async function doArquivo() {
  try {
    const r = await fetch("dados/oficina.json", { cache: "no-store" });
    if (r.ok) return await r.json();
  } catch {}
  return null;
}

async function carregar() {
  try {
    comServidor = (await fetch("__versao", { cache: "no-store" })).ok;
  } catch {}
  try {
    aba = sessionStorage.getItem("oficina.aba") || aba;
  } catch {}
  const guardado = lerLocal();

  if (Nuvem.config()) {
    if (guardado) ({ dados: mundo, base, sha: baseSha } = { dados: guardado.dados, base: guardado.base || null, sha: guardado.sha || null });
    if (mundo) mostrar();
    await sincronizar();
    if (!mundo) {
      mundo = normalizar((await doArquivo()) || null);
      mostrar();
    }
    return;
  }

  // sem nuvem: o arquivo do PC; mudanças presas neste navegador voltam se o autor quiser
  const arquivo = await doArquivo();
  if (guardado && guardado.dados && (!arquivo || !comServidor || confirm("Há mudanças guardadas só neste navegador que ainda não foram salvas no projeto. Usar essas mudanças?"))) {
    mundo = guardado.dados;
    if (comServidor) mudou();
    else estadoSalvo("guardado só neste aparelho · conecte a ☁ Nuvem", "aviso");
  } else mundo = arquivo;
  mostrar();
  if (!comServidor && !Nuvem.config()) estadoSalvo("conecte a ☁ Nuvem para sincronizar", "aviso");
}

function mostrar() {
  mundo = normalizar(mundo);
  if (!mundo.npcs.some((n) => n.id === npcAtual)) npcAtual = mundo.npcs[0]?.id || null;
  if (!mundo.storylets.some((s) => s.id === missaoAtual)) missaoAtual = mundo.storylets[0]?.id || null;
  render();
}

function mudou() {
  estadoSalvo("salvando…", "");
  guardarLocal();
  clearTimeout(salvarAgendado);
  salvarAgendado = setTimeout(salvar, Nuvem.config() ? 2000 : 700);
}

async function salvar() {
  if (Nuvem.config()) return salvarNuvem();
  try {
    const r = await fetch("__oficina", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mundo) });
    if (!r.ok) throw new Error(r.status);
    estadoSalvo("✓ salvo no projeto", "ok");
  } catch {
    estadoSalvo("guardado só neste aparelho · conecte a ☁ Nuvem", "aviso");
  }
}

// No PC, a nuvem também é copiada para o arquivo do projeto (o jogo e o Claude leem dali)
function espelharNoPC() {
  if (comServidor) fetch("__oficina", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mundo) }).catch(() => {});
}

async function salvarNuvem() {
  if (enviando) {
    clearTimeout(salvarAgendado);
    salvarAgendado = setTimeout(salvar, 1500);
    return;
  }
  enviando = true;
  const enviado = copia(mundo);
  try {
    baseSha = await Nuvem.enviar(enviado, baseSha);
    base = enviado;
    guardarLocal();
    espelharNoPC();
    if (!Nuvem.igual(mundo, enviado)) mudou(); // escreveu algo enquanto enviava
    else estadoSalvo(`☁ sincronizado ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, "ok");
  } catch (e) {
    if (e.status === 409) {
      enviando = false;
      return sincronizar(); // outro aparelho salvou antes: junta e envia de novo
    }
    estadoSalvo(`☁ não sincronizou (${e.message}) · guardado no aparelho`, "aviso");
  } finally {
    enviando = false;
  }
}

// Busca a versão da nuvem e junta com a deste aparelho
async function sincronizar({ primeiraVez = false } = {}) {
  if (!Nuvem.config() || enviando) return;
  let remoto;
  try {
    remoto = await Nuvem.baixar();
  } catch (e) {
    estadoSalvo(`☁ sem conexão (${e.message}) · guardado no aparelho`, "aviso");
    return;
  }
  if (!remoto.dados) {
    // nuvem vazia: este aparelho manda o que tem (ou os textos do projeto)
    if (!mundo) mundo = normalizar(await doArquivo());
    baseSha = null;
    base = null;
    mostrar();
    return salvarNuvem();
  }
  if (remoto.sha === baseSha) {
    if (mundo && !Nuvem.igual(mundo, base)) salvarNuvem(); // mudanças daqui ainda não enviadas
    else estadoSalvo("☁ sincronizado", "ok");
    return;
  }
  const antes = mundo;
  if (!mundo || (primeiraVez && !Nuvem.igual(mundo, remoto.dados) && !confirm("A nuvem já tem textos. Juntar com o que está neste aparelho? (Onde os dois forem diferentes, vale o deste aparelho.)\n\nCancelar = usar só o que está na nuvem."))) {
    mundo = remoto.dados;
  } else {
    mundo = Nuvem.juntar(base, mundo, remoto.dados);
  }
  base = remoto.dados;
  baseSha = remoto.sha;
  guardarLocal();
  espelharNoPC();
  if (!antes || !Nuvem.igual(antes, mundo)) redesenhar();
  if (!Nuvem.igual(mundo, base)) salvarNuvem();
  else estadoSalvo("☁ sincronizado", "ok");
}

// Não redesenha no meio da digitação: espera o campo perder o foco
function redesenhar() {
  const foco = document.activeElement;
  if (foco && foco.closest && foco.closest("#conteudo") && /INPUT|TEXTAREA|SELECT/.test(foco.tagName)) {
    redesenharDepois = true;
    return;
  }
  mostrar();
}
document.addEventListener("focusout", () => {
  if (!redesenharDepois) return;
  setTimeout(() => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) return;
    redesenharDepois = false;
    mostrar();
  }, 50);
});

// Olha a nuvem de tempos em tempos e quando o app volta para a tela
setInterval(() => document.visibilityState === "visible" && sincronizar(), 30000);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && sincronizar());

function estadoSalvo(texto, classe) {
  const el = $("#estado-salvo");
  el.textContent = texto;
  el.className = "estado-salvo " + classe;
}

// ---------- Conectar à nuvem ----------
const dialogoNuvem = $("#dialogo-nuvem");

function renderNuvem() {
  const c = Nuvem.config();
  dialogoNuvem.innerHTML = c
    ? `<h2>☁ Nuvem</h2>
       <p>Este aparelho está conectado a <b>${esc(c.repo)}</b>. Tudo o que você escreve aqui aparece nos outros aparelhos conectados.</p>
       <div class="linha-botoes">
         <button class="btn primario" data-nuvem="sincronizar">Sincronizar agora</button>
         <button class="btn perigo" data-nuvem="desconectar">Desconectar este aparelho</button>
         <button class="btn" data-nuvem="fechar">Fechar</button>
       </div>`
    : `<h2>☁ Conectar à nuvem</h2>
       <p>Os textos ficam num repositório <b>privado</b> do GitHub: só você vê, e o celular e o PC mostram sempre a mesma coisa.</p>
       <ol class="passos-nuvem">
         <li>No GitHub, crie um token em <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Settings → Fine-grained tokens</a>.</li>
         <li>Em <i>Repository access</i>, escolha <b>Only select repositories</b> e marque o repositório dos textos.</li>
         <li>Em <i>Permissions → Repository permissions</i>, dê <b>Contents: Read and write</b>.</li>
         <li>Gere, copie e cole abaixo. Faça isso uma vez no PC e uma vez no celular.</li>
       </ol>
       <label class="campo"><span>Repositório</span><input id="nuvem-repo" value="Lingua-Byte/kosmos-autor"></label>
       <label class="campo"><span>Token</span><input id="nuvem-token" type="password" autocomplete="off" placeholder="github_pat_…"></label>
       <p id="nuvem-erro" class="erro"></p>
       <div class="linha-botoes">
         <button class="btn primario" data-nuvem="conectar">Conectar</button>
         <button class="btn" data-nuvem="fechar">Cancelar</button>
       </div>
       <p class="ajuda">O token fica guardado só neste aparelho e só dá acesso a esse repositório.</p>`;
}

$("#btn-nuvem").addEventListener("click", () => {
  renderNuvem();
  dialogoNuvem.showModal();
});

dialogoNuvem.addEventListener("click", async (ev) => {
  const acao = ev.target.closest("[data-nuvem]")?.dataset.nuvem;
  if (!acao) return;
  if (acao === "fechar") return dialogoNuvem.close();
  if (acao === "desconectar") {
    if (!confirm("Desconectar este aparelho? Os textos continuam na nuvem e nos outros aparelhos.")) return;
    Nuvem.configurar(null);
    base = baseSha = null;
    guardarLocal();
    estadoSalvo("desconectado da nuvem", "aviso");
    return dialogoNuvem.close();
  }
  if (acao === "sincronizar") {
    dialogoNuvem.close();
    return sincronizar();
  }
  if (acao === "conectar") {
    const c = { repo: $("#nuvem-repo").value.trim(), token: $("#nuvem-token").value.trim() };
    const erro = $("#nuvem-erro");
    if (!/^[\w.-]+\/[\w.-]+$/.test(c.repo) || !c.token) {
      erro.textContent = "Preencha o repositório (dono/nome) e o token.";
      return;
    }
    erro.textContent = "Conectando…";
    try {
      await Nuvem.baixar(c);
    } catch (e) {
      erro.textContent = `Não conectou: ${e.message}.`;
      return;
    }
    Nuvem.configurar(c);
    base = baseSha = null;
    dialogoNuvem.close();
    await sincronizar({ primeiraVez: true });
  }
});

$("#btn-exportar").addEventListener("click", () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(mundo, null, 2)], { type: "application/json" }));
  a.download = "oficina.json";
  a.click();
});

$("#btn-importar").addEventListener("change", async (ev) => {
  const arq = ev.target.files[0];
  if (!arq) return;
  try {
    const dados = JSON.parse(await arq.text());
    if (!dados.storylets || !dados.npcs) throw new Error();
    if (!confirm("Substituir tudo o que está na Oficina pelo arquivo importado?")) return;
    mundo = normalizar(dados);
    mudou();
    mostrar();
  } catch {
    alert("Esse arquivo não parece uma Oficina do KOSMOS.");
  }
  ev.target.value = "";
});

// ======================= Campos ligados aos dados =======================
// Cada campo tem data-caminho (ex.: "npcs.2.nome") e data-tipo:
// texto · numero · lista (separada por vírgula) · linhas (uma por linha) · atitude ("mabel: 2, vasko: -1") · marca (checkbox)

function ler(caminho) {
  return caminho.split(".").reduce((o, k) => (o == null ? undefined : o[k]), mundo);
}

function escrever(caminho, valor) {
  const partes = caminho.split(".");
  let o = mundo;
  partes.slice(0, -1).forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== "object") o[k] = /^\d+$/.test(partes[i + 1]) ? [] : {};
    o = o[k];
  });
  const ultima = partes[partes.length - 1];
  const vazio = valor === "" || valor == null || (Array.isArray(valor) && !valor.length) || (typeof valor === "object" && !Array.isArray(valor) && !Object.keys(valor).length);
  if (vazio && !["texto", "nome", "resposta", "pergunta", "titulo"].includes(ultima)) delete o[ultima];
  else o[ultima] = valor;
}

function paraTexto(v, tipo) {
  if (v == null) return "";
  if (tipo === "lista") return [].concat(v).join(", ");
  if (tipo === "linhas") return [].concat(v).join("\n");
  if (tipo === "atitude") return Object.entries(v).map(([k, n]) => `${k}: ${n}`).join(", ");
  return v;
}

function deTexto(el) {
  const t = el.dataset.tipo;
  const v = el.type === "checkbox" ? el.checked : el.value;
  if (t === "marca") return v || "";
  if (t === "numero") return v === "" ? "" : Number(v);
  if (t === "lista") return v.split(",").map((s) => s.trim()).filter(Boolean);
  if (t === "linhas") return v.split("\n").map((s) => s.trim()).filter(Boolean);
  if (t === "atitude") {
    const o = {};
    for (const par of v.split(",")) {
      const [k, n] = par.split(":").map((s) => s.trim());
      if (k && n && !isNaN(+n)) o[k] = +n;
    }
    return o;
  }
  return v;
}

// campo("Nome", "npcs.0.nome", { tipo, area, linhas, ajuda, opcoes: [[valor, rótulo]], largura })
function campo(rotulo, caminho, o = {}) {
  const tipo = o.tipo || "texto";
  const valor = paraTexto(ler(caminho), tipo);
  const attrs = `data-caminho="${esc(caminho)}" data-tipo="${tipo}" ${o.estrutura ? 'data-estrutura="1"' : ""}`;
  let entrada;
  if (o.opcoes) {
    entrada = `<select ${attrs}>${o.opcoes.map(([v, r]) => `<option value="${esc(v)}" ${String(v) === String(valor) ? "selected" : ""}>${esc(r)}</option>`).join("")}</select>`;
  } else if (tipo === "marca") {
    return `<label class="campo marca ${o.classe || ""}"><input type="checkbox" ${attrs} ${valor ? "checked" : ""}> <span>${esc(rotulo)}</span></label>`;
  } else if (o.area) {
    entrada = `<textarea ${attrs} rows="${o.linhas || 3}" placeholder="${esc(o.exemplo || "")}">${esc(valor)}</textarea>`;
  } else {
    entrada = `<input ${attrs} ${tipo === "numero" ? 'type="number"' : ""} value="${esc(valor)}" placeholder="${esc(o.exemplo || "")}">`;
  }
  return `<label class="campo ${o.classe || ""}"><span>${esc(rotulo)}</span>${entrada}${o.ajuda ? `<small>${o.ajuda}</small>` : ""}</label>`;
}

document.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.dataset.caminho && !el.dataset.estrutura) {
    escrever(el.dataset.caminho, deTexto(el));
    mudou();
    if (el.tagName === "TEXTAREA") ajustarAltura(el);
  }
  if (el.dataset.teste) {
    teste[el.dataset.teste] = deTextoTeste(el);
    if (el.dataset.teste === "eixo") renderTestar();
  }
});

document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (!el.dataset.caminho) return;
  escrever(el.dataset.caminho, deTexto(el));
  // trocou o código (id): o item continua selecionado
  if (/^npcs\.\d+\.id$/.test(el.dataset.caminho)) npcAtual = el.value;
  if (/^storylets\.\d+\.id$/.test(el.dataset.caminho)) missaoAtual = el.value;
  if (el.dataset.estrutura || el.tagName === "SELECT" || el.type === "checkbox") {
    mudou();
    render();
  } else renderListas();
});

function ajustarAltura(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + 2 + "px";
}

// ======================= Abas =======================

document.querySelectorAll("[data-aba]").forEach((b) =>
  b.addEventListener("click", () => {
    aba = b.dataset.aba;
    try {
      sessionStorage.setItem("oficina.aba", aba);
    } catch {}
    render();
  })
);

function render() {
  document.querySelectorAll("[data-aba]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.aba === aba)));
  const r = { perguntas: renderPerguntas, profissoes: renderProfissoes, npcs: renderNPCs, missoes: renderMissoes, geradores: renderGeradores, testar: renderTestar }[aba];
  r();
  document.querySelectorAll("#conteudo textarea").forEach(ajustarAltura);
}

// listas laterais mudam de nome sem redesenhar o formulário (o cursor não pula)
function renderListas() {
  if (aba === "npcs") $("#lista-npcs").innerHTML = listaNPCs();
  if (aba === "missoes") $("#lista-missoes").innerHTML = listaMissoes();
  if (aba === "perguntas") $("#progresso").textContent = progresso();
}

// ======================= Perguntas =======================

function progresso() {
  const feitas = mundo.perguntas.filter((p) => (p.resposta || "").trim()).length;
  return `${feitas} de ${mundo.perguntas.length} respondidas`;
}

function renderPerguntas() {
  const temas = [...new Set(mundo.perguntas.map((p) => p.tema || "Outros"))];
  $("#conteudo").innerHTML = `
    <section class="intro">
      <p>Responda no seu ritmo, em tópicos ou em texto corrido. Pode deixar em branco o que ainda não sabe. Cada resposta me ajuda a escrever as storylets e os geradores do jeito do KOSMOS.</p>
      <p class="sub" id="progresso">${progresso()}</p>
    </section>
    ${temas.map((tema) => `
      <section class="grupo">
        <h2>${esc(tema)}</h2>
        ${mundo.perguntas.map((p, i) => ({ p, i })).filter(({ p }) => (p.tema || "Outros") === tema).map(({ p, i }) => `
          <article class="cartao pergunta ${(p.resposta || "").trim() ? "respondida" : ""}">
            ${campo("Pergunta", `perguntas.${i}.pergunta`, { area: true, linhas: 1, classe: "titulo-pergunta" })}
            ${p.ja ? `<p class="ja"><b>O que já sei:</b> ${esc(p.ja)}</p>` : ""}
            ${p.ajuda ? `<p class="ajuda">${esc(p.ajuda)}</p>` : ""}
            ${campo("Sua resposta", `perguntas.${i}.resposta`, { area: true, linhas: 3 })}
            ${p.minha ? `<button class="btn-texto perigo" data-apagar-pergunta="${i}">Apagar esta nota</button>` : ""}
          </article>`).join("")}
      </section>`).join("")}
    <button class="btn primario" data-acao="nova-pergunta">+ Nova pergunta ou nota</button>`;
}

// ======================= Profissões =======================
// Cada linha é a mesma pessoa nos três eixos (o personagem existe nos três mundos):
// a profissão em cada eixo e o ponto de entrada onde a história dele começa ali.

let eixoProfissoes = "x";

function renderProfissoes() {
  const e = eixoProfissoes;
  const pontos = mundo.pontos[e] || [];
  const opPontos = (eixo) => (mundo.pontos[eixo] || []).map((p) => [p.id, p.nome]);
  const linha = (p, i) => `
    <article class="prof">
      ${["x", "y", "z"].map((ex) => `
        <div class="prof-eixo ${ex === e ? "atual" : ""}">
          <span class="prof-glifo">${EIXOS_NOMES[ex].split(" ")[0]}</span>
          ${campo("Profissão", `profissoes.${i}.${ex}.nome`, { classe: "largo" })}
          ${campo("Começa em", `profissoes.${i}.${ex}.ponto`, { opcoes: [["", "—"], ...opPontos(ex)] })}
        </div>`).join("")}
      <button class="btn-texto perigo" data-apagar-prof="${i}" title="Apagar">Apagar</button>
    </article>`;
  const comPonto = (id) => mundo.profissoes.map((p, i) => ({ p, i })).filter(({ p }) => (p[e] && p[e].ponto) === id);
  const semPonto = comPonto("");
  $("#conteudo").innerHTML = `
    <section class="intro">
      <p>Na criação do personagem, o jogador escolhe a profissão numa lista (ou escreve a sua e escolhe onde ela começa). Cada linha é a mesma pessoa nos três eixos: o que ela faz em cada mundo e o <b>ponto de entrada</b> onde a história dela começa ali. Cada ponto de entrada terá a sua abertura e as suas side quests.</p>
      <p class="sub">${mundo.profissoes.length} profissões</p>
    </section>
    <div class="linha">
      <label class="campo"><span>Ver pelos pontos de entrada do</span>
        <select data-eixo-profissoes>${["x", "y", "z"].map((x) => `<option value="${x}" ${x === e ? "selected" : ""}>${EIXOS_NOMES[x]}</option>`).join("")}</select>
      </label>
    </div>
    ${pontos.map((pt, pi) => `
      <section class="grupo">
        <div class="cartao ponto">
          ${campo("Ponto de entrada", `pontos.${e}.${pi}.nome`, { classe: "titulo-ponto" })}
          ${campo("Como é", `pontos.${e}.${pi}.descricao`, { area: true, linhas: 2 })}
        </div>
        ${comPonto(pt.id).map(({ p, i }) => linha(p, i)).join("") || `<p class="sub">Nenhuma profissão começa aqui ainda.</p>`}
        <button class="btn" data-nova-prof="${esc(pt.id)}">+ Profissão que começa em ${esc(pt.nome)}</button>
      </section>`).join("")}
    ${semPonto.length ? `<section class="grupo"><h2>Sem ponto de entrada neste eixo</h2>${semPonto.map(({ p, i }) => linha(p, i)).join("")}</section>` : ""}
    <button class="btn" data-acao="novo-ponto">+ Novo ponto de entrada em ${esc(EIXOS_NOMES[e])}</button>`;
}

// ======================= NPCs =======================

const opEixos = (com = ["x", "y", "z", "lime", "todos"]) => com.map((e) => [e, EIXOS_NOMES[e]]);

function listaNPCs() {
  return mundo.npcs.map((n) => `
    <button class="item ${n.id === npcAtual ? "ativo" : ""}" data-npc="${esc(n.id)}">
      <b>${esc(n.nome || "(sem nome)")}</b><small>${esc(EIXOS_NOMES[n.eixo] || "")} · ${esc(n.papel || "")}</small>
    </button>`).join("");
}

function renderNPCs() {
  const i = mundo.npcs.findIndex((n) => n.id === npcAtual);
  const n = mundo.npcs[i];
  const c = (k) => `npcs.${i}.${k}`;
  const usos = n ? mundo.storylets.filter((s) => s.npc === n.id || JSON.stringify(s).includes(`npc:${n.id}`) || JSON.stringify(s.opcoes || []).includes(`"${n.id}"`)) : [];
  $("#conteudo").innerHTML = `
    <div class="dividido">
      <aside class="lateral">
        <div class="lateral-acoes">
          <button class="btn primario" data-acao="novo-npc">+ Novo NPC</button>
          <button class="btn" data-acao="ir-gerador">Gerar NPC</button>
        </div>
        <div id="lista-npcs" class="lista">${listaNPCs()}</div>
      </aside>
      <section class="editor">
        ${!n ? `<p class="sub">Nenhum NPC ainda. Crie um ou use o gerador.</p>` : `
        <div class="cartao">
          <div class="linha">
            ${campo("Nome", c("nome"), { classe: "largo" })}
            ${campo("Eixo", c("eixo"), { opcoes: opEixos() })}
          </div>
          <div class="linha">
            ${campo("Papel no mundo", c("papel"), { classe: "largo", exemplo: "Herbalista da aldeia" })}
            ${campo("Código (id)", c("id"), { estrutura: true, ajuda: "Usado nas missões ({npc:id.nome}). Evite mudar depois de usar." })}
          </div>
          ${campo("Aparência", c("aparencia"), { area: true, linhas: 2 })}
          ${campo("Jeito de falar", c("voz"), { area: true, linhas: 2 })}
          <div class="linha tres">
            ${campo("Desejo", c("desejo"), { area: true, linhas: 2 })}
            ${campo("Medo", c("medo"), { area: true, linhas: 2 })}
            ${campo("Segredo", c("segredo"), { area: true, linhas: 2 })}
          </div>
          ${campo("Relação com a Entidade", c("entidade"), { area: true, linhas: 1 })}
        </div>
        <div class="cartao">
          <h3>Ecos nos outros eixos</h3>
          <p class="ajuda">Quem essa pessoa é nos outros mundos. Deixe em branco o eixo dela.</p>
          ${["x", "y", "z"].map((e) => campo(EIXOS_NOMES[e], c(`ecos.${e}`), { area: true, linhas: 1 })).join("")}
        </div>
        <div class="cartao">
          <h3>No jogo</h3>
          <div class="linha">
            ${campo("Onde aparece", c("onde"), { tipo: "lista", classe: "largo", ajuda: "Lugares separados por vírgula: aldeia, taverna" })}
            ${campo("Atitude inicial", c("atitude"), { tipo: "numero", ajuda: "−3 hostil · 0 neutro · +3 aliado" })}
          </div>
          ${campo("Falas típicas (uma por linha)", c("falas"), { tipo: "linhas", area: true, linhas: 3, ajuda: "O marcador {npc.fala} sorteia uma delas." })}
          ${campo("Notas para o autor", c("notas"), { area: true, linhas: 2 })}
        </div>
        <div class="cartao">
          <h3>Missões com ${esc(n.nome)}</h3>
          ${usos.length ? `<ul class="usos">${usos.map((s) => `<li><button class="btn-texto" data-ver-missao="${esc(s.id)}">${esc(s.titulo)}</button></li>`).join("")}</ul>` : `<p class="sub">Nenhuma ainda.</p>`}
          <button class="btn" data-acao="missao-para-npc">+ Nova missão com ${esc(n.nome)}</button>
        </div>
        <div class="rodape-editor">
          <button class="btn" data-acao="duplicar-npc">Duplicar</button>
          <button class="btn perigo" data-acao="apagar-npc">Apagar NPC</button>
        </div>`}
      </section>
    </div>`;
}

// ======================= Missões (storylets) =======================

function listaMissoes() {
  const grupos = {};
  for (const s of mundo.storylets) (grupos[s.eixo || "todos"] = grupos[s.eixo || "todos"] || []).push(s);
  return Object.entries(grupos).map(([e, lista]) => `
    <p class="lista-grupo">${esc(EIXOS_NOMES[e] || e)}</p>
    ${lista.map((s) => `
      <button class="item ${s.id === missaoAtual ? "ativo" : ""}" data-missao="${esc(s.id)}">
        <b>${esc(s.titulo || "(sem título)")}</b><small>${esc(s.tipo || "")}${+(s.peso ?? 1) === 0 ? " · continuação" : ""}${s.npc ? " · " + esc(Motor.npc(mundo, s.npc)?.nome || s.npc) : ""}</small>
      </button>`).join("")}`).join("");
}

const opSituacoes = () => SITUACOES.map((s) => [s.id, `${s.nome} (${s.atributo})`]);
const opItens = () => [["", "—"], ...EQUIPAMENTOS.map((e) => [e.chave, `${e.nomes.x} / ${e.nomes.y} / ${e.nomes.z}`])];
const opHabs = () => [["", "—"], ...HABILIDADES.map((h) => [h.chave, `${h.nomes.x} / ${h.nomes.y} / ${h.nomes.z}`])];
const opDestinos = () => [["", "— volta ao lugar —"], ...mundo.storylets.map((s) => [`storylet:${s.id}`, `→ ${s.titulo}`])];

function blocoResultado(rotulo, base, classe) {
  return `
    <div class="resultado ${classe}">
      <h4>${rotulo}</h4>
      ${campo("O que acontece", `${base}.texto`, { area: true, linhas: 3 })}
      <div class="linha">
        ${campo("Pista no Diário", `${base}.pista`, { classe: "largo" })}
        ${campo("Depois vai para", `${base}.ir`, { opcoes: opDestinos() })}
      </div>
      <details ${ler(base + ".efeitos") ? "open" : ""}>
        <summary>Efeitos</summary>
        <div class="linha efeitos">
          ${campo("Ressonância", `${base}.efeitos.ressonancia`, { tipo: "numero" })}
          ${campo("Dissonância", `${base}.efeitos.dissonancia`, { tipo: "numero" })}
          ${campo("Exposição", `${base}.efeitos.exposicao`, { tipo: "numero" })}
          ${campo("Convergência", `${base}.efeitos.convergencia`, { tipo: "numero", ajuda: "abre um teste (1–3)" })}
        </div>
        <div class="linha">
          ${campo("Marca no mundo (flags)", `${base}.efeitos.flag`, { tipo: "lista", classe: "largo", ajuda: "O mundo lembra: outras missões podem exigir ou evitar essas marcas." })}
          ${campo("Apaga marcas", `${base}.efeitos.tirarFlag`, { tipo: "lista" })}
        </div>
        <div class="linha">
          ${campo("Atitude dos NPCs", `${base}.efeitos.atitude`, { tipo: "atitude", exemplo: "mabel: 2, vasko: -1" })}
          ${campo("Ganha item", `${base}.efeitos.item`, { opcoes: opItens() })}
          ${campo("Aprende (Código Urbano)", `${base}.efeitos.aprenderX`, { tipo: "lista" })}
        </div>
        ${campo("Memória Cruzada", `${base}.efeitos.memoria`, { area: true, linhas: 2, ajuda: "Um vislumbre da vida do personagem em outro eixo." })}
      </details>
    </div>`;
}

function blocoOpcao(si, oi) {
  const op = mundo.storylets[si].opcoes[oi];
  const b = `storylets.${si}.opcoes.${oi}`;
  const tipo = Motor.tipoDeTeste(op);
  return `
    <article class="opcao">
      <div class="opcao-topo">
        <b>Opção ${oi + 1}</b>
        <span>
          <button class="btn-texto" data-mover-opcao="${oi}" data-direcao="-1" title="Subir">↑</button>
          <button class="btn-texto" data-mover-opcao="${oi}" data-direcao="1" title="Descer">↓</button>
          <button class="btn-texto perigo" data-apagar-opcao="${oi}">Apagar</button>
        </span>
      </div>
      ${campo("O que o jogador escolhe", `${b}.texto`, { classe: "largo" })}
      <div class="linha">
        ${campo("Palavras que a resposta livre reconhece", `${b}.palavras`, { tipo: "lista", classe: "largo", ajuda: "Começos de palavras: examin, ver, olhar" })}
      </div>
      <div class="linha">
        <label class="campo"><span>Tipo</span>
          <select data-tipo-opcao="${oi}">
            <option value="nenhum" ${tipo === "nenhum" ? "selected" : ""}>Sem teste</option>
            <option value="teste" ${tipo === "teste" ? "selected" : ""}>Teste de dados</option>
            <option value="convergencia" ${tipo === "convergencia" ? "selected" : ""}>Teste de Convergência</option>
          </select>
        </label>
        ${tipo === "teste" ? campo("Situação (define atributo e dificuldade)", `${b}.situacao`, { opcoes: opSituacoes() }) : ""}
        ${tipo === "convergencia" ? campo("Intensidade", `${b}.convergencia`, { tipo: "numero" }) : ""}
      </div>
      <details ${op.req ? "open" : ""}>
        <summary>Requisitos (opcional)</summary>
        <div class="linha">
          ${campo("Precisa do item", `${b}.req.item`, { opcoes: opItens() })}
          ${campo("Precisa da habilidade", `${b}.req.hab`, { opcoes: opHabs() })}
          ${campo("Precisa da marca", `${b}.req.flag`)}
        </div>
      </details>
      ${tipo === "nenhum"
        ? blocoResultado("Resultado", `${b}.resultado`, "")
        : `<div class="linha resultados">
            ${blocoResultado(tipo === "convergencia" ? "Se ressoar (passou)" : "Se der certo", `${b}.sucesso`, "sucesso")}
            ${blocoResultado(tipo === "convergencia" ? "Se dissoar (falhou)" : "Se der errado", `${b}.falha`, "falha")}
          </div>`}
    </article>`;
}

function renderMissoes() {
  const si = mundo.storylets.findIndex((s) => s.id === missaoAtual);
  const s = mundo.storylets[si];
  const c = (k) => `storylets.${si}.${k}`;
  $("#conteudo").innerHTML = `
    <div class="dividido">
      <aside class="lateral">
        <div class="lateral-acoes">
          <button class="btn primario" data-acao="nova-missao">+ Nova missão</button>
          <button class="btn" data-acao="ir-gerador">Gerar missão</button>
        </div>
        <div id="lista-missoes" class="lista">${listaMissoes()}</div>
      </aside>
      <section class="editor">
        ${!s ? `<p class="sub">Nenhuma missão ainda.</p>` : `
        <div class="cartao">
          <div class="linha">
            ${campo("Título", c("titulo"), { classe: "largo" })}
            ${campo("Eixo", c("eixo"), { opcoes: opEixos() })}
            ${campo("Tipo", c("tipo"), { opcoes: [["side", "Side quest"], ["evento", "Evento do mundo"], ["principal", "Missão principal"]] })}
          </div>
          <div class="linha">
            ${campo("NPC principal", c("npc"), { opcoes: [["", "—"], ...mundo.npcs.map((n) => [n.id, n.nome])] })}
            ${campo("Código (id)", c("id"), { estrutura: true, ajuda: "Usado para ligar uma parte à outra." })}
          </div>
        </div>
        <div class="cartao">
          <h3>Quando e onde aparece</h3>
          <div class="linha">
            ${campo("Lugares", c("onde"), { tipo: "lista", classe: "largo", ajuda: "Separados por vírgula. Vazio = qualquer lugar." })}
            ${campo("Peso", c("peso"), { tipo: "numero", ajuda: "Chance de ser sorteada. 0 = só como continuação." })}
            ${campo("Pode repetir", c("repetivel"), { tipo: "marca", classe: "marca-alinhada" })}
          </div>
          <div class="linha">
            ${campo("Relógio a partir de", c("quando.relogioMin"), { tipo: "numero" })}
            ${campo("Relógio até", c("quando.relogioMax"), { tipo: "numero" })}
            ${campo("Ressonância mínima", c("quando.ressonanciaMin"), { tipo: "numero" })}
            ${campo("Dissonância mínima", c("quando.dissonanciaMin"), { tipo: "numero" })}
          </div>
          <div class="linha">
            ${campo("Precisa das marcas", c("quando.flags"), { tipo: "lista", classe: "largo" })}
            ${campo("Não pode ter as marcas", c("quando.semFlags"), { tipo: "lista", classe: "largo" })}
            ${campo("Atitude mínima", c("quando.atitude"), { tipo: "atitude", exemplo: "mabel: 2" })}
          </div>
        </div>
        <div class="cartao">
          <h3>Texto da cena</h3>
          ${campo("Narração", c("texto"), { area: true, linhas: 6, ajuda: "Marcadores: {p.nome} personagem · {npc.nome} · {npc.fala} (uma fala sorteada) · {npc.papel} · {npc:mabel.nome} (outro NPC) · {npc.eco.y} (o eco dele no Eixo Y)" })}
        </div>
        <div class="cartao">
          <h3>Opções</h3>
          ${(s.opcoes || []).map((_, oi) => blocoOpcao(si, oi)).join("")}
          <button class="btn" data-acao="nova-opcao">+ Nova opção</button>
        </div>
        <div class="cartao">
          ${campo("Notas para o autor", c("notas"), { area: true, linhas: 2 })}
        </div>
        <div class="rodape-editor">
          <button class="btn primario" data-acao="testar-missao">▶ Testar esta missão</button>
          <button class="btn" data-acao="duplicar-missao">Duplicar</button>
          <button class="btn perigo" data-acao="apagar-missao">Apagar missão</button>
        </div>`}
      </section>
    </div>`;
}

// ======================= Geradores =======================

const LISTAS_GERAIS = [
  ["desejos", "Desejos"], ["medos", "Medos"], ["segredos", "Segredos"], ["entidade", "Relação com a Entidade"],
  ["ganchos", "Ganchos (o que inicia a missão)"], ["objetivos", "Objetivos"], ["complicacoes", "Complicações"],
  ["revelacoes", "Revelações cósmicas"], ["recompensas", "Recompensas"],
];

function renderGeradores() {
  const g = gerado;
  $("#conteudo").innerHTML = `
    <section class="intro">
      <p>Os geradores sorteiam uma entrada de cada lista e montam um NPC ou uma side quest. Quanto mais entradas você escrever, mais variado fica. Uma entrada por linha.</p>
    </section>
    <div class="dividido gerador">
      <section class="editor">
        <div class="cartao">
          <div class="linha">
            <label class="campo"><span>Eixo</span>
              <select data-eixo-gerador>${["x", "y", "z"].map((e) => `<option value="${e}" ${e === eixoGerador ? "selected" : ""}>${EIXOS_NOMES[e]}</option>`).join("")}</select>
            </label>
          </div>
          <div class="linha tres">
            ${campo("Nomes", `tabelas.${eixoGerador}.nomes`, { tipo: "linhas", area: true, linhas: 6 })}
            ${campo("Ofícios", `tabelas.${eixoGerador}.oficios`, { tipo: "linhas", area: true, linhas: 6 })}
            ${campo("Lugares", `tabelas.${eixoGerador}.lugares`, { tipo: "linhas", area: true, linhas: 6 })}
          </div>
        </div>
        <div class="cartao">
          <h3>Listas de todos os eixos</h3>
          <div class="linha tres">
            ${LISTAS_GERAIS.map(([k, r]) => campo(r, `tabelas.${k}`, { tipo: "linhas", area: true, linhas: 5 })).join("")}
          </div>
        </div>
      </section>
      <aside class="lateral resultado-gerador">
        <button class="btn primario" data-acao="gerar-npc">🎲 Gerar NPC</button>
        ${g.npc ? `
          <div class="cartao gerado">
            <h3>${esc(g.npc.nome)} <small>${esc(g.npc.papel)}</small></h3>
            <p><b>Desejo:</b> ${esc(g.npc.desejo)}</p>
            <p><b>Medo:</b> ${esc(g.npc.medo)}</p>
            <p><b>Segredo:</b> ${esc(g.npc.segredo)}</p>
            <p><b>Entidade:</b> ${esc(g.npc.entidade)}</p>
            <p><b>Ecos:</b> ${Object.entries(g.npc.ecos).map(([e, v]) => `${EIXOS_NOMES[e]}: ${esc(v)}`).join(" · ")}</p>
            <p><b>Onde:</b> ${esc(g.npc.onde.join(", "))}</p>
            <button class="btn" data-acao="guardar-npc">Guardar nos NPCs</button>
          </div>` : ""}
        <button class="btn primario" data-acao="gerar-missao">🎲 Gerar side quest${g.npc ? " com " + esc(g.npc.nome) : ""}</button>
        ${g.missao ? `
          <div class="cartao gerado">
            <p><b>Gancho:</b> ${esc(g.missao.gancho)}</p>
            <p><b>Objetivo:</b> ${esc(g.missao.objetivo)}</p>
            <p><b>Complicação:</b> ${esc(g.missao.complicacao)}</p>
            <p><b>Revelação:</b> ${esc(g.missao.revelacao)}</p>
            <p><b>Recompensa:</b> ${esc(g.missao.recompensa)}</p>
            <button class="btn" data-acao="guardar-missao">Transformar em missão</button>
            <small class="ajuda">Cria um rascunho com o NPC (guardado antes, se for novo) para você escrever os textos.</small>
          </div>` : ""}
      </aside>
    </div>`;
}

// ======================= Testar =======================

const teste = { eixo: "y", lugar: "aldeia", relogio: 3, flags: [], atitudes: {}, ressonancia: 0, dissonancia: 0, itens: [], habs: [], nome: "Arquivista" };
let jogo = null; // { estado, storylet, fase: "escolha" | "resultado", res, linhas }

function deTextoTeste(el) {
  if (el.type === "number") return +el.value || 0;
  if (el.dataset.lista) return el.value.split(",").map((s) => s.trim()).filter(Boolean);
  return el.value;
}

function estadoDeTeste() {
  const atitudes = {};
  for (const n of mundo.npcs) atitudes[n.id] = +n.atitude || 0;
  for (const par of String(teste.atitudesTexto || "").split(",")) {
    const [k, v] = par.split(":").map((s) => s.trim());
    if (k && v && !isNaN(+v)) atitudes[k] = +v;
  }
  return {
    eixo: teste.eixo, lugar: teste.lugar, relogio: +teste.relogio || 0,
    flags: [...teste.flags], atitudes, feitas: [], pistas: [],
    p: { nome: teste.nome || "Arquivista", ressonancia: +teste.ressonancia, dissonancia: +teste.dissonancia, exposicao: 0, itens: [...teste.itens], habs: [...teste.habs] },
  };
}

function todosLugares() {
  const s = new Set();
  for (const t of Object.values(mundo.tabelas)) if (t && t.lugares) t.lugares.forEach((l) => s.add(l));
  for (const st of mundo.storylets) (st.onde || []).forEach((l) => s.add(l));
  for (const n of mundo.npcs) (n.onde || []).forEach((l) => s.add(l));
  return [...s].sort();
}

function renderTestar() {
  const est = jogo ? jogo.estado : estadoDeTeste();
  $("#conteudo").innerHTML = `
    <section class="intro">
      <p>Monte uma situação e veja o que o motor faria: quais missões podem aparecer, e jogue qualquer uma. Nos testes, é você quem decide se deu certo ou errado, para explorar os dois caminhos.</p>
    </section>
    <div class="dividido testar">
      <aside class="lateral">
        <div class="cartao">
          <h3>Situação</h3>
          <label class="campo"><span>Nome do personagem</span><input data-teste="nome" value="${esc(teste.nome)}"></label>
          <label class="campo"><span>Eixo</span><select data-teste="eixo">${["x", "y", "z", "lime"].map((e) => `<option value="${e}" ${e === teste.eixo ? "selected" : ""}>${EIXOS_NOMES[e]}</option>`).join("")}</select></label>
          <label class="campo"><span>Lugar</span><input data-teste="lugar" list="lugares" value="${esc(teste.lugar)}"><datalist id="lugares">${todosLugares().map((l) => `<option value="${esc(l)}">`).join("")}</datalist></label>
          <div class="linha">
            <label class="campo"><span>Relógio</span><input data-teste="relogio" type="number" value="${teste.relogio}"></label>
            <label class="campo"><span>Resson.</span><input data-teste="ressonancia" type="number" value="${teste.ressonancia}"></label>
            <label class="campo"><span>Disson.</span><input data-teste="dissonancia" type="number" value="${teste.dissonancia}"></label>
          </div>
          <label class="campo"><span>Marcas (flags)</span><input data-teste="flags" data-lista="1" value="${esc(teste.flags.join(", "))}"></label>
          <label class="campo"><span>Itens</span><input data-teste="itens" data-lista="1" value="${esc(teste.itens.join(", "))}"><small>${EQUIPAMENTOS.map((e) => e.chave).join(", ")}</small></label>
          <label class="campo"><span>Habilidades</span><input data-teste="habs" data-lista="1" value="${esc(teste.habs.join(", "))}"><small>${HABILIDADES.map((h) => h.chave).join(", ")}</small></label>
          <label class="campo"><span>Atitudes</span><input data-teste="atitudesTexto" value="${esc(teste.atitudesTexto || "")}" placeholder="mabel: 2"></label>
          <button class="btn primario" data-acao="sortear">🎲 Sortear uma missão aqui</button>
          ${jogo ? `<button class="btn" data-acao="reiniciar-teste">Recomeçar com esta situação</button>` : ""}
        </div>
        ${jogo ? `
        <div class="cartao estado">
          <h3>Estado agora</h3>
          <p><b>Marcas:</b> ${esc(est.flags.join(", ") || "—")}</p>
          <p><b>Atitudes:</b> ${esc(Object.entries(est.atitudes).filter(([, v]) => v).map(([k, v]) => `${Motor.npc(mundo, k)?.nome || k} ${v}`).join(", ") || "—")}</p>
          <p><b>Ressonância</b> ${est.p.ressonancia} · <b>Dissonância</b> ${est.p.dissonancia} · <b>Exposição</b> ${est.p.exposicao}</p>
          <p><b>Pistas:</b> ${est.pistas.length ? est.pistas.map(esc).join(" · ") : "—"}</p>
          <p><b>Já aconteceu:</b> ${esc(est.feitas.join(", ") || "—")}</p>
        </div>` : ""}
      </aside>
      <section class="editor">
        ${jogo && jogo.storylet ? palco() : ""}
        <div class="cartao">
          <h3>Missões neste momento</h3>
          <table class="tabela">
            <thead><tr><th>Missão</th><th>Peso</th><th>Pode aparecer?</th><th></th></tr></thead>
            <tbody>${mundo.storylets.map((s) => {
              const m = Motor.motivo(s, est);
              const pode = !m && +(s.peso ?? 1) > 0;
              return `<tr class="${pode ? "pode" : ""}"><td>${esc(s.titulo)}<small>${esc(EIXOS_NOMES[s.eixo] || "")}</small></td><td>${s.peso ?? 1}</td>
                <td>${pode ? "✓ sim" : esc(m || "só como continuação")}</td>
                <td><button class="btn-texto" data-jogar="${esc(s.id)}">Jogar</button></td></tr>`;
            }).join("")}</tbody>
          </table>
        </div>
      </section>
    </div>`;
}

function palco() {
  const { estado, storylet: s } = jogo;
  const txt = (t) => esc(Motor.preencher(t, mundo, estado, s)).replace(/\n/g, "<br>");
  const nomes = { item: (k) => EQUIPAMENTOS.find((e) => e.chave === k)?.nomes[estado.eixo] || k, hab: (k) => HABILIDADES.find((h) => h.chave === k)?.nomes[estado.eixo] || k };
  let corpo;
  if (jogo.fase === "resultado") {
    corpo = `
      <p class="narracao">${txt(jogo.res.texto || "(sem texto)")}</p>
      ${jogo.res.pista ? `<p class="pista">Pista: ${esc(jogo.res.pista)}</p>` : ""}
      ${jogo.res.efeitos?.memoria ? `<p class="memoria">Memória Cruzada: ${esc(jogo.res.efeitos.memoria)}</p>` : ""}
      ${jogo.linhas.length ? `<p class="efeitos">${jogo.linhas.map(esc).join(" · ")}</p>` : ""}
      <button class="btn primario" data-acao="continuar">${jogo.ir ? "Continuar → " + esc(mundo.storylets.find((x) => x.id === jogo.ir)?.titulo || jogo.ir) : "Fim desta missão"}</button>`;
  } else if (jogo.fase === "teste") {
    const op = s.opcoes[jogo.opcao];
    const conv = Motor.tipoDeTeste(op) === "convergencia";
    const sit = SITUACOES.find((x) => x.id === op.situacao);
    corpo = `
      <p class="narracao">${esc(op.texto)}</p>
      <p class="sub">${conv ? `Teste de Convergência · intensidade ${op.convergencia}` : `Teste: ${esc(sit ? sit.nome : op.situacao)}`}</p>
      <div class="opcoes">
        <button class="btn primario" data-resultado="sucesso">${conv ? "Ressoou" : "✓ Deu certo"}</button>
        <button class="btn" data-resultado="falha">${conv ? "Dissoou" : "✗ Deu errado"}</button>
      </div>`;
  } else {
    corpo = `
      <p class="narracao">${txt(s.texto)}</p>
      <div class="opcoes">${(s.opcoes || []).map((op, i) => {
        const trava = Motor.bloqueio(op, estado, nomes);
        const tipo = Motor.tipoDeTeste(op);
        return `<button class="btn opcao-jogo" data-escolha="${i}" ${trava ? "disabled" : ""}>
          ${esc(op.texto)}<small>${trava ? "🔒 " + esc(trava) : tipo === "teste" ? esc(SITUACOES.find((x) => x.id === op.situacao)?.nome || "") : tipo === "convergencia" ? "Convergência " + op.convergencia : "sem teste"}</small></button>`;
      }).join("")}</div>`;
  }
  return `<div class="cartao palco eixo-${esc(s.eixo)}"><h3>${esc(s.titulo)}</h3>${corpo}</div>`;
}

function jogar(id, estado) {
  const s = mundo.storylets.find((x) => x.id === id);
  if (!s) return;
  jogo = { estado: estado || estadoDeTeste(), storylet: s, fase: "escolha" };
  aba = "testar";
  render();
}

function escolher(i) {
  const op = jogo.storylet.opcoes[i];
  jogo.opcao = i;
  if (Motor.tipoDeTeste(op) === "nenhum") return resolver(op.resultado);
  jogo.fase = "teste";
  render();
}

function resolver(res) {
  const r = Motor.aplicar(res, jogo.estado, mundo);
  Motor.concluir(jogo.storylet, jogo.estado);
  Object.assign(jogo, { fase: "resultado", res: res || {}, linhas: r.linhas, ir: r.ir });
  render();
}

// ======================= Cliques =======================

const novoId = (base) => `${base}-${Date.now().toString(36)}`;

document.addEventListener("click", (ev) => {
  const t = ev.target.closest("button");
  if (!t) return;
  const d = t.dataset;

  if (d.npc || d.missao) {
    if (d.npc) npcAtual = d.npc;
    else missaoAtual = d.missao;
    render();
    // no celular a lista fica em cima: desce até o formulário
    if (innerWidth <= 900) $(".editor")?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  if (d.verMissao) {
    missaoAtual = d.verMissao;
    aba = "missoes";
    return render();
  }
  if (d.apagarPergunta) {
    mundo.perguntas.splice(+d.apagarPergunta, 1);
    mudou();
    return render();
  }
  const si = mundo.storylets.findIndex((s) => s.id === missaoAtual);
  if (d.apagarOpcao) {
    if (!confirm("Apagar esta opção?")) return;
    mundo.storylets[si].opcoes.splice(+d.apagarOpcao, 1);
    mudou();
    return render();
  }
  if (d.moverOpcao) {
    const ops = mundo.storylets[si].opcoes;
    const i = +d.moverOpcao;
    const j = i + +d.direcao;
    if (j < 0 || j >= ops.length) return;
    [ops[i], ops[j]] = [ops[j], ops[i]];
    mudou();
    return render();
  }
  if (d.novaProf) {
    const p = { id: novoId("prof"), x: { nome: "", ponto: "" }, y: { nome: "", ponto: "" }, z: { nome: "", ponto: "" } };
    p[eixoProfissoes].ponto = d.novaProf;
    mundo.profissoes.push(p);
    mudou();
    return render();
  }
  if (d.apagarProf) {
    const p = mundo.profissoes[+d.apagarProf];
    if (!confirm(`Apagar “${p[eixoProfissoes].nome || "esta profissão"}” dos três eixos?`)) return;
    mundo.profissoes.splice(+d.apagarProf, 1);
    mudou();
    return render();
  }
  if (d.jogar) return jogar(d.jogar);
  if (d.escolha) return escolher(+d.escolha);
  if (d.resultado) return resolver(jogo.storylet.opcoes[jogo.opcao][d.resultado]);

  const acoes = {
    "novo-ponto"() {
      (mundo.pontos[eixoProfissoes] = mundo.pontos[eixoProfissoes] || []).push({ id: novoId("ponto"), nome: "Novo ponto de entrada", descricao: "" });
    },
    "nova-pergunta"() {
      mundo.perguntas.push({ id: novoId("nota"), tema: "Minhas notas", pergunta: "", resposta: "", minha: true });
    },
    "novo-npc"() {
      const id = novoId("npc");
      mundo.npcs.push({ id, nome: "Novo NPC", eixo: "y", papel: "", desejo: "", medo: "", segredo: "", entidade: "", ecos: {}, onde: [], atitude: 0, falas: [] });
      npcAtual = id;
    },
    "duplicar-npc"() {
      const n = structuredClone(mundo.npcs.find((x) => x.id === npcAtual));
      n.id = novoId(n.id.split("-")[0]);
      n.nome += " (cópia)";
      mundo.npcs.push(n);
      npcAtual = n.id;
    },
    "apagar-npc"() {
      if (!confirm("Apagar este NPC? As missões que usam ele continuam, mas sem o NPC.")) return false;
      mundo.npcs = mundo.npcs.filter((x) => x.id !== npcAtual);
      npcAtual = mundo.npcs[0]?.id || null;
    },
    "missao-para-npc"() {
      const n = mundo.npcs.find((x) => x.id === npcAtual);
      const id = novoId(`${n.eixo === "todos" ? "x" : n.eixo}-${n.id}`);
      mundo.storylets.push({ id, titulo: `Missão de ${n.nome}`, eixo: n.eixo === "todos" ? "x" : n.eixo, tipo: "side", npc: n.id, onde: [...(n.onde || [])], quando: {}, peso: 1, texto: "{npc.nome}: “{npc.fala}”", opcoes: [] });
      missaoAtual = id;
      aba = "missoes";
    },
    "nova-missao"() {
      const id = novoId("missao");
      mundo.storylets.push({ id, titulo: "Nova missão", eixo: "y", tipo: "side", onde: [], quando: {}, peso: 1, texto: "", opcoes: [] });
      missaoAtual = id;
    },
    "duplicar-missao"() {
      const s = structuredClone(mundo.storylets[si]);
      s.id = novoId(s.id.split("-").slice(0, 2).join("-"));
      s.titulo += " (cópia)";
      mundo.storylets.push(s);
      missaoAtual = s.id;
    },
    "apagar-missao"() {
      if (!confirm("Apagar esta missão?")) return false;
      mundo.storylets.splice(si, 1);
      missaoAtual = mundo.storylets[0]?.id || null;
    },
    "nova-opcao"() {
      const s = mundo.storylets[si];
      (s.opcoes = s.opcoes || []).push({ texto: "", palavras: [], resultado: { texto: "" } });
    },
    "testar-missao"() {
      const s = mundo.storylets[si];
      if (s.eixo && s.eixo !== "todos") teste.eixo = s.eixo;
      if (s.onde && s.onde[0]) teste.lugar = s.onde[0];
      jogar(s.id);
      return false;
    },
    "ir-gerador"() {
      aba = "geradores";
    },
    "gerar-npc"() {
      gerado.npc = Motor.gerarNPC(mundo.tabelas, eixoGerador);
      gerado.missao = null;
      return "sem-salvar";
    },
    "guardar-npc"() {
      if (!mundo.npcs.some((n) => n.id === gerado.npc.id)) mundo.npcs.push(gerado.npc);
      npcAtual = gerado.npc.id;
      aba = "npcs";
    },
    "gerar-missao"() {
      gerado.missao = Motor.gerarMissao(mundo.tabelas, eixoGerador, gerado.npc);
      return "sem-salvar";
    },
    "guardar-missao"() {
      if (gerado.npc && !mundo.npcs.some((n) => n.id === gerado.npc.id)) mundo.npcs.push(gerado.npc);
      const s = Motor.rascunho(gerado.missao, eixoGerador, gerado.npc);
      mundo.storylets.push(s);
      missaoAtual = s.id;
      aba = "missoes";
    },
    sortear() {
      const est = estadoDeTeste();
      const s = Motor.sortear(mundo, est);
      if (!s) {
        alert("Nenhuma missão pode aparecer nesta situação. Veja na tabela o motivo de cada uma.");
        return false;
      }
      jogar(s.id, est);
      return false;
    },
    "reiniciar-teste"() {
      jogo = null;
      return "sem-salvar";
    },
    continuar() {
      if (jogo.ir) jogar(jogo.ir, jogo.estado);
      else {
        jogo.storylet = null;
        render();
      }
      return false;
    },
  };
  const f = acoes[d.acao];
  if (!f) return;
  const r = f();
  if (r === false) return;
  if (r !== "sem-salvar") mudou();
  try {
    sessionStorage.setItem("oficina.aba", aba);
  } catch {}
  render();
});

// tipo da opção (sem teste / teste / convergência): reorganiza os resultados sem perder o texto
document.addEventListener("change", (ev) => {
  const el = ev.target;
  if (el.dataset.eixoProfissoes !== undefined) {
    eixoProfissoes = el.value;
    return render();
  }
  if (el.dataset.eixoGerador !== undefined) {
    eixoGerador = el.value;
    return render();
  }
  if (el.dataset.tipoOpcao === undefined) return;
  const si = mundo.storylets.findIndex((s) => s.id === missaoAtual);
  const op = mundo.storylets[si].opcoes[+el.dataset.tipoOpcao];
  const antes = Motor.tipoDeTeste(op);
  const novo = el.value;
  delete op.situacao;
  delete op.convergencia;
  if (novo === "teste") op.situacao = "investigar";
  if (novo === "convergencia") op.convergencia = 1;
  if (novo === "nenhum" && antes !== "nenhum") {
    op.resultado = op.sucesso || { texto: "" };
    delete op.sucesso;
    delete op.falha;
  }
  if (novo !== "nenhum" && antes === "nenhum") {
    op.sucesso = op.resultado || { texto: "" };
    op.falha = { texto: "" };
    delete op.resultado;
  }
  mudou();
  render();
});

carregar();
