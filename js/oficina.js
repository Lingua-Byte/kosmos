// Oficina do Autor: a história do KOSMOS (historia.js), as tabelas dos geradores e o teste das missões.
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
let aba = "historia";
const ABAS = ["historia", "geradores", "testar"];
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
    const salva = sessionStorage.getItem("oficina.aba");
    if (ABAS.includes(salva)) aba = salva;
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
  if (el.dataset.estrutura || el.tagName === "SELECT" || el.type === "checkbox") {
    mudou();
    render();
  }
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
  const r = { historia: renderHistoria, geradores: renderGeradores, testar: renderTestar }[aba];
  r();
  document.querySelectorAll("#conteudo textarea").forEach(ajustarAltura);
}

// ======================= História =======================
// Só leitura: o conteúdo fica em js/historia.js.

function renderHistoria() {
  const ROT = { decidido: "Decidido", considerar: "Para considerar", aberto: "Em aberto" };
  $("#conteudo").innerHTML = `
    <section class="intro"><p>${HISTORIA.intro}</p></section>
    <div class="historia">
      ${HISTORIA.secoes.map((x) => `
        <section class="cartao secao-historia">
          <h3>${x.titulo} <span class="selo ${x.estado}">${ROT[x.estado]}</span></h3>
          ${x.html}
        </section>`).join("")}
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
            <button class="btn" data-acao="guardar-npc">Guardar NPC</button>
          </div>` : ""}
        <button class="btn primario" data-acao="gerar-missao">🎲 Gerar side quest${g.npc ? " com " + esc(g.npc.nome) : ""}</button>
        ${g.missao ? `
          <div class="cartao gerado">
            <p><b>Gancho:</b> ${esc(g.missao.gancho)}</p>
            <p><b>Objetivo:</b> ${esc(g.missao.objetivo)}</p>
            <p><b>Complicação:</b> ${esc(g.missao.complicacao)}</p>
            <p><b>Revelação:</b> ${esc(g.missao.revelacao)}</p>
            <p><b>Recompensa:</b> ${esc(g.missao.recompensa)}</p>
            <button class="btn" data-acao="guardar-missao">Guardar e testar</button>
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

  if (d.jogar) return jogar(d.jogar);
  if (d.escolha) return escolher(+d.escolha);
  if (d.resultado) return resolver(jogo.storylet.opcoes[jogo.opcao][d.resultado]);

  const acoes = {
    "gerar-npc"() {
      gerado.npc = Motor.gerarNPC(mundo.tabelas, eixoGerador);
      gerado.missao = null;
      return "sem-salvar";
    },
    "guardar-npc"() {
      if (!mundo.npcs.some((n) => n.id === gerado.npc.id)) mundo.npcs.push(gerado.npc);
    },
    "gerar-missao"() {
      gerado.missao = Motor.gerarMissao(mundo.tabelas, eixoGerador, gerado.npc);
      return "sem-salvar";
    },
    "guardar-missao"() {
      if (gerado.npc && !mundo.npcs.some((n) => n.id === gerado.npc.id)) mundo.npcs.push(gerado.npc);
      const s = Motor.rascunho(gerado.missao, eixoGerador, gerado.npc);
      mundo.storylets.push(s);
      mudou();
      jogar(s.id);
      return false;
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
  if (el.dataset.eixoGerador !== undefined) {
    eixoGerador = el.value;
    return render();
  }
  });

carregar();
