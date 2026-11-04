// Fluxo do site: tela inicial → transição → personagens → criação de ficha → ficha.

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Armazenamento (local, por enquanto; depois vai para o servidor) ----------

const Armazem = {
  chave: "kosmos.personagens",
  todos() {
    try {
      return JSON.parse(localStorage.getItem(this.chave)) || [];
    } catch {
      return [];
    }
  },
  salvar(p) {
    const lista = this.todos().filter((x) => x.id !== p.id);
    lista.unshift(p);
    try {
      localStorage.setItem(this.chave, JSON.stringify(lista));
    } catch {}
  },
  remover(id) {
    try {
      localStorage.setItem(this.chave, JSON.stringify(this.todos().filter((x) => x.id !== id)));
    } catch {}
  },
};

// "Enfermeiro(a)" → Enfermeiro ou Enfermeira; "Escrivão(ã)" → Escrivão ou Escrivã; "Ator ou atriz" → um dos dois
function noGenero(nome, sexo) {
  if (!sexo) return nome;
  const mulher = sexo === "mulher";
  let n = nome
    .replace(/(\p{L}*?)o\(a\)/gu, (_, base) => base + (mulher ? "a" : "o"))
    .replace(/(\p{L}*?)ão\(ã\)/gu, (_, base) => base + (mulher ? "ã" : "ão"))
    .replace(/(\p{L}+)\(a\)/gu, (_, base) => base + (mulher ? "a" : ""))
    .replace(/\(ões\)|\(ãs\)/g, "");
  const par = n.match(/^(\p{L}+) ou (\p{L}+)$/u);
  if (par && ["Ator ou atriz", "Monge ou monja"].includes(n)) n = mulher ? par[2][0].toUpperCase() + par[2].slice(1) : par[1];
  return n;
}

// Profissão em dois passos: qual grupo (ponto de entrada) está aberto; "" = a lista de lugares
let grupoOficio = "";
let detalheEscolha = ""; // o efeito do último traço/habilidade/item tocado (um quadro só, no lugar de textos em todas as cartas)

function oficioEscolhidoHtml(e) {
  const of = rascunho.profissao && profissaoDe(rascunho, e.id);
  if (!of || !of.nome) return "";
  return `<p class="oficio-escolhido">Escolhida: <b>${esc(of.nome)}</b>${rascunho.papel ? ` · ${PAPEIS[rascunho.papel]}` : ""}</p>`;
}

// Profissão do personagem num eixo: { nome, ponto } (ponto = id em PONTOS_ENTRADA[eixo]) ou null.
// A profissão escrita pelo jogador ("Outra") só existe no eixo de origem.
function profissaoDe(p, eixo) {
  if (!p.profissao) return null;
  if (p.profissao === "outra") return eixo === p.origem && p.profissaoLivre ? { ...p.profissaoLivre } : null;
  const pr = PROFISSOES.find((x) => x.id === p.profissao);
  return pr ? { ...pr[eixo], nome: noGenero(pr[eixo].nome, p.sexo) } : null;
}

function novoPersonagem() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    origem: null,
    nome: "",
    idade: "",
    descricao: "",
    tracos: [],
    papel: null,
    sexo: null, // "homem" ou "mulher"
    profissao: null, // id em PROFISSOES, ou "outra" (profissaoLivre: { nome, ponto })
    atributos: { corpo: 0, mente: 0, essencia: 0 },
    habs: [],
    itens: [],
    usos: {},
    runas: [],
    cartasRunas: 0,
    linguas: { x: [], z: [] }, // elementos do Código Urbano e da Interface que o personagem conhece
    vocabY: [], // palavras-runa do Yudur aprendidas (guardadas pelas runas: "ᛚᛁ" = neve)
    exposicao: { x: 0, y: 0, z: 0 },
    ressonancia: 0,
    dissonancia: 0,
    dinheiro: { ...DINHEIRO_INICIAL },
    pertences: {},
    condicoes: [],
    memorias: "",
    revelados: { x: false, y: false, z: false },
  };
}

// Personagem de teste que conhece as três línguas inteiras. Criado ao abrir o site com ?teste
function criarArquivista() {
  const tudo = Lingua.tudo();
  const p = Object.assign(novoPersonagem(), {
    id: "arquivista-teste",
    nome: "Arquivista (teste)",
    idade: "60",
    descricao: "Personagem de teste: decifrou todas as línguas da Convergência.",
    origem: "y",
    papel: "support",
    tracos: ["Busca conhecimento", "Frieza"],
    atributos: { corpo: 1, mente: 2, essencia: 1 },
    habs: ["simbolos", "investigacao"],
    itens: ["luz", "comunicador"],
    runas: tudo.y,
    cartasRunas: tudo.y.length,
    linguas: { x: tudo.x, z: tudo.z },
    vocabTotal: true,
    alfabetoPorClasse: true,
    revelados: { x: true, y: true, z: true },
    criadoEm: new Date().toISOString(),
  });
  Armazem.salvar(p);
  return p;
}
{
  // O Arquivista sempre conhece o dicionário inteiro, mesmo depois que ele cresce
  const arquivista = Armazem.todos().find((p) => p.id === "arquivista-teste");
  if (arquivista) {
    const tudo = Lingua.tudo();
    Object.assign(arquivista, { runas: tudo.y, cartasRunas: tudo.y.length, linguas: { x: tudo.x, z: tudo.z }, vocabTotal: true, alfabetoPorClasse: true });
    Armazem.salvar(arquivista);
  } else if (new URLSearchParams(location.search).has("teste")) criarArquivista();
}

// ---------- Telas ----------

function mostrarTela(id) {
  document.querySelectorAll(".tela").forEach((t) => t.classList.toggle("ativa", t.id === id));
  $("#btn-tradutor").hidden = ["tela-inicio", "tela-transicao", "tela-tradutor", "tela-cena", "tela-mesa", "tela-criacao", "tela-ficha", "tela-personagens", "tela-prontos"].includes(id);
  window.scrollTo(0, 0);
  if (id !== "tela-cena" && typeof Narrador !== "undefined") Narrador.parar();
  if (id !== "tela-cena" && typeof Palco !== "undefined") Palco.pausar();
  if (id !== "tela-cena" && typeof Vozes !== "undefined") Vozes.parar();
  atualizarTrilha();
}

function definirTema(eixo) {
  document.body.classList.remove("tema-x", "tema-y", "tema-z");
  if (eixo) document.body.classList.add("tema-" + eixo);
  atualizarTrilha();
}

// Trilha: dentro de uma missão, as músicas do eixo dela (medieval → Y, espacial → Z…).
// Fora de missão (abertura, personagens, criação, ficha, tradutor, Mesa): a trilha inicial, com Solar Wind.
// Abrir a ficha ou o tradutor no meio de uma missão não tira o jogador da missão: a trilha continua.
function atualizarTrilha() {
  if (typeof Cenas === "undefined" || typeof Musica === "undefined") return;
  const tela = document.querySelector(".tela.ativa")?.id;
  if (["tela-inicio", "tela-transicao", "tela-personagens", "tela-prontos", "tela-mesa", "tela-criacao"].includes(tela)) Cenas.sair();
  const m = Cenas.emJogo() ? Cenas.missaoAtual() : null;
  Musica.contexto(m ? m.eixo : "inicio");
}

// Mensagens rápidas no topo da tela (efeitos que ligaram, usos, etc.)
function avisar(mensagens) {
  const lista = [].concat(mensagens).filter(Boolean);
  const caixa = $("#avisos");
  for (const m of lista) {
    const el = document.createElement("div");
    el.className = "aviso-toast";
    el.textContent = m;
    caixa.appendChild(el);
    setTimeout(() => el.classList.add("saindo"), 5200);
    setTimeout(() => el.remove(), 5800);
  }
}

// ---------- Entrada: botão → transição ----------

let transicaoTimers = [];

$("#btn-entrar").addEventListener("click", () => {
  Musica.tocar();
  Galaxia.dobra(true);
  mostrarTela("tela-transicao");

  const frase = $("#frase-transicao");
  const eixos = $("#eixos-transicao");
  const frases = [fraseAleatoria(), fraseAleatoria(), "A separação foi apenas percepção."];
  const passo = reduzirMovimento ? 900 : 2600; // tempo para ler cada frase
  const agendar = (fn, ms) => transicaoTimers.push(setTimeout(fn, ms));

  frases.forEach((f, i) => {
    agendar(() => {
      frase.classList.remove("visivel");
      agendar(() => {
        frase.textContent = f;
        frase.classList.add("visivel");
      }, 250);
    }, i * passo);
  });
  agendar(() => {
    frase.classList.remove("visivel");
    Galaxia.repouso(1.4);
    eixos.classList.add("visivel");
  }, frases.length * passo);
  agendar(() => eixos.classList.add("convergir"), frases.length * passo + 2600);
  agendar(concluirTransicao, frases.length * passo + 3600);
});

$("#btn-pular").addEventListener("click", concluirTransicao);

function concluirTransicao() {
  transicaoTimers.forEach(clearTimeout);
  transicaoTimers = [];
  Galaxia.repouso(1.4);
  $("#eixos-transicao").classList.remove("visivel", "convergir");
  if (Armazem.todos().length) abrirPersonagens();
  else Prontos.abrir(); // por enquanto, só personagens prontos (a criação própria está desligada)
}

// Volta à tela inicial (menu ⚙). A partida em andamento fica gravada: é só continuar pela Mesa.
function voltarAoMenu() {
  transicaoTimers.forEach(clearTimeout);
  transicaoTimers = [];
  definirTema(null);
  Galaxia.repouso(1.4);
  mostrarTela("tela-inicio");
  mostrarCarregarInicio();
}

// "Carregar jogo" na tela inicial, quando há saves
function mostrarCarregarInicio() {
  const b = $("#btn-carregar-inicio");
  if (b) b.hidden = !(typeof Saves !== "undefined" && Saves.todos().length);
  // conta na nuvem: aparece quando está configurada e o jogador ainda não entrou
  const c = $("#btn-conta-inicio");
  if (c) c.hidden = !(typeof Conta !== "undefined" && Conta.configurada() && !Conta.usuario());
}
$("#btn-conta-inicio").addEventListener("click", () => Opcoes.abrir());
$("#btn-carregar-inicio").addEventListener("click", () => {
  Musica.tocar();
  Saves.abrir();
});

// ---------- Lista de personagens ----------

function abrirPersonagens() {
  definirTema(null);
  const lista = Armazem.todos();
  $("#lista-personagens").innerHTML = lista
    .map((p) => {
      const e = EIXOS[p.origem];
      return `<li><button class="personagem-item" data-id="${p.id}">
        <b>${esc(p.nome)}</b>
        <span>${e.glifo} ${esc((profissaoDe(p, p.origem) || { nome: e.papeis[p.papel].nome }).nome)} · ${e.nome} ${e.mundo}</span>
      </button></li>`;
    })
    .join("");
  mostrarTela("tela-personagens");
}

$("#lista-personagens").addEventListener("click", (ev) => {
  const item = ev.target.closest("[data-id]");
  if (!item) return;
  const p = Armazem.todos().find((x) => x.id === item.dataset.id);
  if (p) abrirFicha(Regras.migrar(p));
});

$("#btn-novo").addEventListener("click", iniciarCriacao);
$("#btn-jogar").addEventListener("click", () => Cenas.abrirMesa());

// ---------- Criação de ficha ----------

const PASSOS = [
  { id: "origem", titulo: "Origem" },
  { id: "identidade", titulo: "Identidade" },
  { id: "oficio", titulo: "Profissão" },
  { id: "tracos", titulo: "Traço central" },
  { id: "atributos", titulo: "Atributos" },
  { id: "habilidades", titulo: "Habilidades" },
  { id: "equipamento", titulo: "Equipamento" },
  { id: "selar", titulo: "Selar" },
];

let rascunho = null;
let passoAtual = 0;

function iniciarCriacao() {
  rascunho = novoPersonagem();
  grupoOficio = "";
  passoAtual = 0;
  definirTema(null);
  mostrarTela("tela-criacao");
  renderPasso();
}

function pontosUsados() {
  const a = rascunho.atributos;
  return a.corpo + a.mente + a.essencia;
}

function validarPasso() {
  const p = PASSOS[passoAtual].id;
  if (p === "origem" && !rascunho.origem) return "Escolha o mundo onde você desperta.";
  if (p === "identidade" && !rascunho.nome.trim()) return "Seu personagem precisa de um nome.";
  if (p === "identidade" && !rascunho.idade) return "Escolha a idade.";
  if (p === "identidade" && !rascunho.sexo) return "Escolha: homem ou mulher.";
  if (p === "oficio" && !rascunho.profissao) return "Escolha o que você faz da vida.";
  if (p === "oficio" && rascunho.profissao === "outra" && !(rascunho.profissaoLivre.nome || "").trim()) return "Escreva a sua profissão.";
  if (p === "oficio" && rascunho.profissao === "outra" && !rascunho.profissaoLivre.ponto) return "Escolha onde a sua história começa.";
  if (p === "oficio" && !rascunho.papel) return "Escolha a classe da sua profissão.";
  if (p === "tracos" && (rascunho.tracos.length < REGRAS.tracosMin || rascunho.tracos.length > REGRAS.tracosMax))
    return `Escolha de ${REGRAS.tracosMin} a ${REGRAS.tracosMax} traços.`;
  if (p === "atributos" && pontosUsados() !== REGRAS.pontosIniciais)
    return `Distribua exatamente ${REGRAS.pontosIniciais} pontos.`;
  return "";
}

function renderPasso() {
  const eixo = rascunho.origem ? EIXOS[rascunho.origem] : null;
  $("#passos").innerHTML = PASSOS.map(
    (p, i) => `<li class="${i === passoAtual ? "atual" : i < passoAtual ? "feito" : ""}"><span>${p.titulo}</span></li>`
  ).join("");
  $("#btn-voltar").style.visibility = passoAtual === 0 && !Armazem.todos().length ? "hidden" : "visible";
  $("#btn-avancar").textContent = PASSOS[passoAtual].id === "selar" ? "Selar ficha" : "Continuar";
  $("#aviso").textContent = "";

  const alvo = $("#passo");
  alvo.classList.remove("entrar");
  void alvo.offsetWidth;
  alvo.classList.add("entrar");
  if (alvo.dataset.passo !== PASSOS[passoAtual].id) detalheEscolha = "";
  alvo.dataset.passo = PASSOS[passoAtual].id;
  alvo.innerHTML = RENDER_PASSO[PASSOS[passoAtual].id](eixo);
  const primeiroCampo = alvo.querySelector("input, textarea");
  if (primeiroCampo && !("ontouchstart" in window)) primeiroCampo.focus();
}

const RENDER_PASSO = {
  origem: () => `
    <h2>Onde você desperta?</h2>
    <p class="sub">Seu personagem acredita que este é o único mundo que existe.</p>
    <div class="cartas cartas-eixos">
      ${ORDEM_EIXOS.map((id) => {
        const e = EIXOS[id];
        return `<button class="carta carta-eixo carta-${id} ${rascunho.origem === id ? "escolhida" : ""}" data-origem="${id}">
          <b class="carta-glifo">${e.glifo}</b>
          <span class="carta-rotulo">${e.nome}</span>
          <strong>${e.mundo}</strong>
          <span class="carta-desc">${e.descricao}</span>
          <em>“${e.lema}”</em>
        </button>`;
      }).join("")}
    </div>`,

  identidade: (e) => `
    <h2>Quem é você ${e.id === "y" ? "neste reino" : e.id === "z" ? "nesta missão" : "nesta cidade"}?</h2>
    <label class="campo"><span>Nome</span>
      <input id="f-nome" maxlength="60" value="${esc(rascunho.nome)}" autocomplete="off"></label>
    <div class="runas-preview" id="nome-runas">${esc(paraRunas(rascunho.nome))}</div>
    <label class="campo campo-curto"><span>Idade</span>
      <select id="f-idade">
        <option value="">—</option>
        ${Array.from({ length: IDADE.max - IDADE.min + 1 }, (_, i) => IDADE.min + i)
          .map((n) => `<option value="${n}" ${+rascunho.idade === n ? "selected" : ""}>${n} anos</option>`).join("")}
      </select></label>
    <div class="campo"><span>Sexo</span>
      <div class="chips">${Object.entries(SEXOS).map(([k, n]) => `<button class="chip ${rascunho.sexo === k ? "escolhida" : ""}" data-sexo="${k}">${n}</button>`).join("")}</div></div>`,

  oficio: (e) => {
    const pontos = PONTOS_ENTRADA[e.id];
    const livre = rascunho.profissaoLivre || {};
    return `
    <h2>Profissão</h2>
    ${oficioEscolhidoHtml(e)}
    ${!grupoOficio ? `
      <p class="sub">Onde você trabalha? Escolha o lugar e depois a profissão.</p>
      <div class="grade-lugares">
        ${pontos.map((pt) => {
          const n = PROFISSOES.filter((pr) => pr[e.id].ponto === pt.id).length;
          return n ? `<button class="tile-lugar" data-grupo-oficio="${pt.id}"><strong>${esc(pt.nome)}</strong><small>${n} profiss${n > 1 ? "ões" : "ão"}</small></button>` : "";
        }).join("")}
        <button class="tile-lugar" data-grupo-oficio="outra"><strong>Outra</strong><small>escrever a minha</small></button>
      </div>` : grupoOficio !== "outra" ? `
      <button class="btn-texto voltar-lugares" data-grupo-oficio="">‹ Outros lugares</button>
      <h3 class="titulo-grupo">${esc(pontos.find((pt) => pt.id === grupoOficio).nome)}</h3>
      <div class="chips">${PROFISSOES.filter((pr) => pr[e.id].ponto === grupoOficio).map((pr) => `<button class="chip chip-oficio ${rascunho.profissao === pr.id ? "escolhida" : ""}" data-profissao="${pr.id}">${esc(noGenero(pr[e.id].nome, rascunho.sexo))}<small>${PAPEIS[pr.papel]}</small></button>`).join("")}</div>` : `
      <button class="btn-texto voltar-lugares" data-grupo-oficio="">‹ Outros lugares</button>
      ${rascunho.profissao === "outra" ? `
        <label class="campo"><span>Sua profissão</span><input id="f-oficio-nome" maxlength="60" value="${esc(livre.nome || "")}" autocomplete="off"></label>
        <label class="campo"><span>Onde a sua história começa</span>
          <select id="f-oficio-ponto"><option value="">—</option>${pontos.map((pt) => `<option value="${pt.id}" ${livre.ponto === pt.id ? "selected" : ""}>${esc(pt.nome)}</option>`).join("")}</select></label>
        <div class="campo"><span>Classe</span><div class="chips">${Object.entries(PAPEIS).map(([k, n]) => `<button class="chip ${rascunho.papel === k ? "escolhida" : ""}" data-classe="${k}" title="${esc(e.papeis[k].desc)}">${n}</button>`).join("")}</div></div>` : ""}`}`;
  },

  tracos: () => `
    <h2>Traço central</h2>
    <p class="sub">Como você age sob pressão? Escolha de ${REGRAS.tracosMin} a ${REGRAS.tracosMax}.</p>
    <div class="grade-compacta">
      ${TRACOS.map((t) => `<button class="tile-compacto ${rascunho.tracos.includes(t.nome) ? "escolhida" : ""}" data-traco="${esc(t.nome)}">${esc(t.nome)}</button>`).join("")}
    </div>
    <p class="detalhe-escolha" id="detalhe-escolha">${esc(detalheEscolha || "Toque num traço para ver o que ele faz.")}</p>`,

  papel: (e) => `
    <h2>${e.papelRotulo}</h2>
    <p class="sub">${e.nome} · ${e.mundo}</p>
    <div class="cartas">
      ${Object.keys(PAPEIS).map((k) => `
        <button class="carta carta-papel ${rascunho.papel === k ? "escolhida" : ""}" data-papel="${k}">
          <span class="tag">${PAPEIS[k]}</span>
          <strong>${e.papeis[k].nome}</strong>
          <span class="carta-desc">${e.papeis[k].desc}</span>
        </button>`).join("")}
    </div>`,

  atributos: (e) => `
    <h2>Atributos</h2>
    <p class="sub">Distribua <b id="pontos-restantes">${REGRAS.pontosIniciais - pontosUsados()}</b> de ${REGRAS.pontosIniciais} pontos.</p>
    <div class="atributos">
      ${Object.entries(e.atributos).map(([k, a]) => `
        <div class="atributo">
          <div class="atributo-nome"><strong>${a.nome}</strong><span>${a.desc}</span></div>
          ${trilha(REGRAS.atributoMax, rascunho.atributos[k], `attr:${k}`)}
        </div>`).join("")}
    </div>`,

  habilidades: (e) => `
    <h2>Habilidades</h2>
    <p class="sub">Cada habilidade custa pontos e tem usos limitados. Ela existe nos três mundos com outro nome.</p>
    <p class="sugestao">${sugestaoHtml(e.id)}</p>
    ${catalogoHtml(rascunho, "hab", e.id)}`,

  equipamento: (e) => `
    <h2>Equipamento</h2>
    <p class="sub">Cada item tem peso. Sua carga é ${LIMITES.cargaBase} + ${e.atributos.corpo.nome}.</p>
    ${catalogoHtml(rascunho, "item", e.id)}`,

  selar: (e) => `
    <h2>Selar a ficha</h2>
    <div class="resumo">
      <p class="resumo-nome">${esc(rascunho.nome)}${rascunho.idade ? `, ${esc(rascunho.idade)}` : ""}</p>
      <p class="runas-preview">${esc(paraRunas(rascunho.nome))}</p>
      <p><b>${esc((profissaoDe(rascunho, rascunho.origem) || { nome: e.papeis[rascunho.papel].nome }).nome)}</b> · ${e.nome} ${e.mundo}</p>
      <p>${Object.entries(e.atributos).map(([k, a]) => `${a.nome} <b>${rascunho.atributos[k]}</b>`).join(" · ")}</p>
      <p>${[...rascunho.habs.map((c) => Regras.hab(c).nomes[e.id]), ...rascunho.itens.map((c) => Regras.equip(c).nomes[e.id])].map(esc).join(" · ") || "Sem habilidades nem equipamento"}</p>
      <p class="resumo-tracos">${rascunho.tracos.map(esc).join(" · ")}</p>
    </div>
    <p class="presagio">“${esc(fraseAleatoria())}”</p>
    <p class="sub">Ao selar, a ficha será traduzida para os outros dois eixos. Seu personagem ainda não sabe disso.</p>`,
};

function gruposRunas() {
  const grupos = new Map();
  for (const [letra, runa] of Object.entries(RUNAS)) grupos.set(runa, (grupos.get(runa) || "") + (grupos.has(runa) ? "/" : "") + letra);
  return [...grupos.entries()];
}

function sugestaoHtml(eixo) {
  const of = profissaoDe(rascunho, eixo);
  const sug = Regras.sugestoes([rascunho.descricao, of && of.nome].filter(Boolean).join(" "));
  if (!sug.length) return "";
  return `Sua profissão sugere: <b>${sug.map((c) => esc(Regras.hab(c).nomes[eixo])).join(", ")}</b>`;
}

// Catálogo de habilidades ("hab") ou equipamentos ("item"), com orçamento visível
function catalogoHtml(p, tipo, eixo) {
  const of = typeof profissaoDe === "function" ? profissaoDe(p, eixo) : null;
  const sugeridas = tipo === "hab" ? Regras.sugestoes([p.descricao, of && of.nome].filter(Boolean).join(" ")) : [];
  const ehHab = tipo === "hab";
  const lista = ehHab ? HABILIDADES : EQUIPAMENTOS;
  const escolhidos = ehHab ? p.habs : p.itens;
  const usado = ehHab ? Regras.pontosGastos(p) : Regras.carga(p);
  const max = ehHab ? LIMITES.pontosHabilidade : Regras.cargaMax(p);
  return `
    <div class="orcamento">
      <span>${ehHab ? "Pontos de habilidade" : "Carga"}</span>
      <span class="orcamento-barra">${Array.from({ length: max }, (_, i) => `<i class="${i < usado ? "cheio" : ""}"></i>`).join("")}</span>
      <b>${usado}/${max}</b>
    </div>
    <div class="catalogo">
      ${lista.map((it) => {
        const sel = escolhidos.includes(it.chave);
        const preco = ehHab ? it.custo : it.peso;
        const cabe = sel || usado + preco <= max;
        return `<button class="item-catalogo ${sel ? "escolhida" : ""} ${cabe ? "" : "nao-cabe"}" data-catalogo="${tipo}:${it.chave}">
          ${ehHab ? "" : Vida.arte(it.chave, eixo, it.nomes[eixo])}
          <span class="item-texto"><strong>${esc(it.nomes[eixo])}</strong>
          <span class="item-preco">${ehHab ? `${preco} pt${preco > 1 ? "s" : ""}` : `peso ${preco}`}${sugeridas.includes(it.chave) ? " · combina com você" : ""}</span></span>
        </button>`;
      }).join("")}
    </div>
    <p class="detalhe-escolha" id="detalhe-escolha">${esc(detalheEscolha || `Toque ${ehHab ? "numa habilidade" : "num item"} para escolher e ver o que faz.`)}</p>`;
}

// Trilha de caixinhas clicáveis (atributos, exposição, ressonância…)
function trilha(total, valor, chave, opts = {}) {
  let html = `<div class="trilha ${opts.classe || ""}" data-trilha="${chave}" role="group">`;
  for (let i = 1; i <= total; i++) {
    const alem = opts.limite && i > opts.limite ? " alem" : "";
    html += opts.somenteLeitura
      ? `<span class="caixa${i <= valor ? " cheia" : ""}"></span>`
      : `<button class="caixa${i <= valor ? " cheia" : ""}${alem}" data-valor="${i}" aria-label="${i}"></button>`;
    if (opts.limite && i === opts.limite) html += `<span class="marca-limite" title="Limite: ${opts.limite}"></span>`;
  }
  return html + `<span class="trilha-valor">${valor}/${total}</span></div>`;
}

function novoValorTrilha(atual, clicado) {
  return clicado === atual ? clicado - 1 : clicado;
}

// Eventos da criação (delegação)
$("#passo").addEventListener("click", (ev) => {
  const t = ev.target.closest("button");
  if (!t) return;
  if (t.dataset.origem) {
    rascunho.origem = t.dataset.origem;
    definirTema(rascunho.origem);
    renderPasso();
  } else if (t.dataset.traco) {
    const nome = t.dataset.traco;
    const i = rascunho.tracos.indexOf(nome);
    if (i >= 0) rascunho.tracos.splice(i, 1);
    else if (rascunho.tracos.length < REGRAS.tracosMax) rascunho.tracos.push(nome);
    else $("#aviso").textContent = `No máximo ${REGRAS.tracosMax} traços.`;
    t.classList.toggle("escolhida", rascunho.tracos.includes(nome));
    const tr = TRACOS.find((x) => x.nome === nome);
    detalheEscolha = `${nome}: ${tr.efeito}`;
    $("#detalhe-escolha").textContent = detalheEscolha;
  } else if (t.dataset.sexo) {
    rascunho.sexo = t.dataset.sexo;
    document.querySelectorAll("[data-sexo]").forEach((b) => b.classList.toggle("escolhida", b === t));
  } else if (t.dataset.classe) {
    rascunho.papel = t.dataset.classe;
    renderPasso();
  } else if (t.dataset.grupoOficio !== undefined) {
    grupoOficio = t.dataset.grupoOficio;
    if (grupoOficio === "outra") {
      rascunho.profissao = "outra";
      rascunho.profissaoLivre = rascunho.profissaoLivre || { nome: "", ponto: "" };
      rascunho.papel = null;
    }
    renderPasso();
  } else if (t.dataset.profissao) {
    rascunho.profissao = t.dataset.profissao;
    if (rascunho.profissao === "outra") {
      rascunho.profissaoLivre = rascunho.profissaoLivre || { nome: "", ponto: "" };
      rascunho.papel = null;
    } else rascunho.papel = PROFISSOES.find((x) => x.id === rascunho.profissao).papel;
    renderPasso();
  } else if (t.dataset.papel) {
    rascunho.papel = t.dataset.papel;
    document.querySelectorAll("[data-papel]").forEach((b) => b.classList.toggle("escolhida", b === t));
  } else if (t.dataset.catalogo) {
    const [tipo, chave] = t.dataset.catalogo.split(":");
    const erro = Regras.alternar(rascunho, tipo, chave);
    const it = Regras.item(chave);
    detalheEscolha = `${it.nomes[rascunho.origem]}: ${it.efeito} (${Regras.textoUsos(it)})`;
    const rolagem = $("#passo").scrollTop;
    renderPasso();
    $("#passo").scrollTop = rolagem;
    $("#aviso").textContent = erro;
  } else if (t.dataset.valor) {
    const k = t.closest("[data-trilha]").dataset.trilha.split(":")[1];
    const outros = pontosUsados() - rascunho.atributos[k];
    let v = novoValorTrilha(rascunho.atributos[k], +t.dataset.valor);
    if (outros + v > REGRAS.pontosIniciais) {
      v = REGRAS.pontosIniciais - outros;
      $("#aviso").textContent = "Pontos esgotados.";
    } else $("#aviso").textContent = "";
    rascunho.atributos[k] = v;
    t.closest(".trilha").outerHTML = trilha(REGRAS.atributoMax, v, `attr:${k}`);
    $("#pontos-restantes").textContent = REGRAS.pontosIniciais - pontosUsados();
  }
});

$("#passo").addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.id === "f-nome") {
    rascunho.nome = t.value;
    $("#nome-runas").textContent = paraRunas(t.value);
  } else if (t.id === "f-idade") rascunho.idade = t.value;
  else if (t.id === "f-oficio-nome") rascunho.profissaoLivre.nome = t.value;
  else if (t.id === "f-oficio-ponto") rascunho.profissaoLivre.ponto = t.value;

});

$("#btn-avancar").addEventListener("click", () => {
  const erro = validarPasso();
  if (erro) {
    $("#aviso").textContent = erro;
    $("#aviso").classList.remove("tremer");
    void $("#aviso").offsetWidth;
    $("#aviso").classList.add("tremer");
    return;
  }
  if (PASSOS[passoAtual].id === "atributos") {
    // Menos Corpo pode não comportar a carga escolhida antes
    while (Regras.carga(rascunho) > Regras.cargaMax(rascunho)) rascunho.itens.pop();
  }
  if (PASSOS[passoAtual].id === "selar") {
    rascunho.revelados[rascunho.origem] = true;
    rascunho.cartasRunas = RUNAS_CARTAS.iniciais(rascunho.atributos.mente);
    Regras.aplicarAlfabetoDaClasse(rascunho);
    rascunho.criadoEm = new Date().toISOString();
    Armazem.salvar(rascunho);
    abrirFicha(rascunho, true);
    return;
  }
  passoAtual++;
  renderPasso();
});

$("#btn-voltar").addEventListener("click", () => {
  if (passoAtual === 0) return abrirPersonagens();
  passoAtual--;
  renderPasso();
});

// ---------- Ficha (traduzida para os 3 eixos) ----------

let fichaAtual = null;
let abaAtual = null;

function abrirFicha(p, recemCriada = false) {
  fichaAtual = Regras.migrar(p);
  editando = null;
  abaAtual = p.origem;
  mostrarTela("tela-ficha");
  renderFicha(recemCriada);
}

function glifoEstado(p, id) {
  const ex = p.exposicao[id];
  if (id === "x") return `∃ ψ(t) ⇒ 𝒪(S) → ${ex > 0 ? "Δ" : "⌀"}`;
  if (id === "y") return paraRunas(p.nome);
  const estado = ex >= REGRAS.exposicaoMax ? "⊚" : ex > EIXOS.z.exposicao.limite ? "≈" : ex > 0 ? "↑" : "~";
  return `◌ ⟜ ◉ | ${estado}`;
}

let editando = null; // "hab" | "item" quando o catálogo está aberto na ficha

function letrasDaRuna(runa) {
  return Object.entries(RUNAS).filter(([, r]) => r === runa).map(([l]) => l).join("/") || RUNAS_EXTRAS[runa] || "";
}

function recursosHtml(p, tipo, eixo) {
  const ehHab = tipo === "hab";
  const titulo = ehHab ? "Habilidades" : "Equipamento";
  if (editando === tipo) {
    return `<div class="bloco"><h3>${titulo}</h3>
      ${catalogoHtml(p, tipo, eixo)}
      <button class="btn-secundario" data-acao="editar-fim">Pronto</button></div>`;
  }
  const chaves = ehHab ? p.habs : p.itens;
  const resumo = ehHab
    ? `${Regras.pontosGastos(p)}/${LIMITES.pontosHabilidade} pts`
    : `carga ${Regras.carga(p)}/${Regras.cargaMax(p)}`;
  const linhas = chaves.map((c) => {
    const it = Regras.item(c);
    const bloq = Regras.bloqueado(p, c);
    let usos = "";
    if (it.usos !== "passiva") {
      const max = it.usos.cena || it.usos.sessao;
      const resta = Regras.usosRestantes(p, c);
      usos = `<span class="pips" title="${Regras.textoUsos(it)}">${Array.from({ length: max }, (_, i) => `<i class="${i < resta ? "cheio" : ""}"></i>`).join("")}</span>`;
    }
    const usar = it.acao
      ? `<button class="btn-rolar" data-usar="${c}" ${Regras.usosRestantes(p, c) <= 0 || bloq ? "disabled" : ""}>Usar</button>`
      : "";
    return `<li class="${bloq ? "bloqueado" : ""} ${ehHab ? "" : "com-arte"}">
      ${ehHab ? "" : Vida.arte(c, eixo, it.nomes[eixo])}
      <div><strong>${esc(it.nomes[eixo])}</strong> ${usos} ${bloq ? `<em class="tag-bloqueio">bloqueada</em>` : ""}
        <span class="item-efeito">${esc(it.efeito)} <i>${Regras.textoUsos(it)}</i></span></div>
      ${usar}
    </li>`;
  });
  return `<div class="bloco">
    <h3>${titulo} <small>${resumo}</small> <button class="btn-texto ajustar" data-acao="editar" data-tipo="${tipo}">Ajustar</button></h3>
    ${linhas.length ? `<ul class="recursos">${linhas.join("")}</ul>` : `<p class="sub">Nada ainda.</p>`}
  </div>`;
}

function runasHtml(p) {
  const cartas = [
    ...p.runas.map((r) => `<div class="carta-runa revelada"><span class="face frente"><b>${r}</b><small>${letrasDaRuna(r)}</small></span></div>`),
    ...Array.from({ length: Regras.cartasViradas(p) }, () =>
      `<button class="carta-runa" data-virar title="Virar carta"><span class="carta-miolo">
        <span class="face verso"><b>ᛉ</b></span><span class="face frente"></span>
      </span></button>`),
  ];
  const resta = Regras.usosRestantes(p, "estudo");
  return `<div class="bloco"><h3>Runas Conhecidas <small>${p.runas.length}/${p.cartasRunas}</small></h3>
    <div class="cartas-runas">${cartas.join("") || `<p class="sub">Nenhuma carta.</p>`}</div>
    ${Regras.podeAprenderRuna(p)
      ? `<button class="btn-secundario" data-acao="estudar" ${resta <= 0 ? "disabled" : ""}>⚄ Estudar uma runa · Mente, ${RUNAS_CARTAS.estudo.dificuldade} sucessos ${resta <= 0 ? "(já tentou nesta cena)" : ""}</button>`
      : ""}
  </div>`;
}

function marcasHtml(limiares, valor) {
  return `<div class="marcas">${limiares
    .map((l) => `<span class="marca ${valor >= l.em ? "ativa" : ""}" title="${esc(l.efeito)}"><b>${l.em}</b> ${l.nome}</span>`)
    .join("")}</div>`;
}

function renderEixo(p, id) {
  const e = EIXOS[id];
  if (!p.revelados[id]) {
    return `<div class="eixo-oculto">
      <b class="glifo-grande">${e.glifo}</b>
      <p class="presagio">“${esc(fraseAleatoria())}”</p>
      <p class="sub">${esc(p.nome)} ainda não sabe que existe no ${e.nome} — ${e.mundo}.</p>
      <p class="dica">Este eixo se revela sozinho quando a Ressonância chegar a ${RESSONANCIA_LIMIARES.find((l) => l.revela).em} (Memória Cruzada).</p>
    </div>`;
  }
  const ex = e.exposicao;
  const valorEx = p.exposicao[id];
  const alerta = valorEx >= REGRAS.exposicaoMax ? "fim" : ex.limite && valorEx > ex.limite ? "alerta" : "";
  return `
    <div class="eixo-ficha">
      <p class="glifo-linha" data-sub="personagem" title="Assinatura no ${e.nome}">${esc(glifoEstado(p, id))}</p>
      <div class="bloco papel-bloco" data-sub="personagem">
        ${(() => {
          const of = profissaoDe(p, id);
          const pt = of && PONTOS_ENTRADA[id].find((x) => x.id === of.ponto);
          return `<span class="rotulo">Profissão</span>
            <strong>${esc(of ? of.nome : e.papeis[p.papel].nome)}</strong>
            ${pt ? `<span class="sub">começa em ${esc(pt.nome)}</span>` : ""}`;
        })()}
      </div>
      <div class="bloco" data-sub="personagem"><h3>Atributos</h3>
        ${Object.entries(e.atributos).map(([k, a]) => {
          const mods = Regras.modificadores(p, k);
          const total = Math.max(1, p.atributos[k] + DADOS.dadosExtras + mods.reduce((s, m) => s + m.dados, 0));
          return `
          <div class="atributo">
            <div class="atributo-nome">
              <button class="btn-rolar" data-rolar="${k}" title="Rolar ${a.nome}">⚄ ${total}d6</button>
              <strong>${a.nome}</strong><span>${a.desc}</span>
              ${mods.map((m) => `<em class="mod mod-${m.trilha}">${m.dados > 0 ? "+" : ""}${m.dados} ${m.fonte}</em>`).join("")}
            </div>
            ${trilha(REGRAS.atributoMax, p.atributos[k], `attr:${k}`, { somenteLeitura: true })}
          </div>`;
        }).join("")}
      </div>
      <div data-sub="recursos">${recursosHtml(p, "hab", id)}${recursosHtml(p, "item", id)}</div>
      <div data-sub="bolsa">${vidaHtml(p, id)}</div>
      ${id === "y" ? `<div data-sub="linguas">${runasHtml(p)}</div>` : ""}
      <div class="bloco exposicao ${alerta}" data-sub="convergencia"><h3>${ex.nome}</h3>
        <p class="sub">${ex.desc}</p>
        ${trilha(REGRAS.exposicaoMax, valorEx, `exp:${id}`, { limite: ex.limite, classe: "trilha-longa" })}
        <p class="efeitos">${ex.efeitos}</p>
      </div>
    </div>`;
}

function renderFicha(recemCriada = false) {
  const p = fichaAtual;
  definirTema(abaAtual);
  const fim = Regras.fimDeJogo(p);
  $("#ficha").innerHTML = `
    <header class="ficha-topo">
      <div class="ficha-navegacao">
        <button class="btn-texto" data-acao="personagens" aria-label="Personagens">‹</button>
        <h2>${esc(p.nome)}${p.idade ? `<small>, ${esc(p.idade)}</small>` : ""}</h2>
        <button class="btn-primario" data-acao="jogar">${Cenas.emAndamento(p.id) ? "▶ Voltar" : "▶ Jogar"}</button>
      </div>
      <div class="ficha-id">
        <p class="resumo-tracos">${p.tracos.map((nome) => {
          const t = TRACOS.find((x) => x.nome === nome);
          return `<span class="traco-ficha" title="${esc(t ? t.efeito : "Traço antigo, sem efeito nas regras")}">${esc(nome)}</span>`;
        }).join(" · ")}</p>
      </div>
    </header>
    ${fim ? `<p class="fim-de-jogo"><b>${fim.nome}.</b> ${fim.efeito}</p>` : ""}
    ${recemCriada ? `<p class="selada">Ficha selada. ${esc(p.nome)} desperta no ${EIXOS[p.origem].nome} — ${EIXOS[p.origem].mundo}.</p>` : ""}
    <nav class="abas" role="tablist">
      ${ORDEM_EIXOS.map((id) => {
        const e = EIXOS[id];
        return `<button role="tab" class="aba aba-${id} ${abaAtual === id ? "atual" : ""} ${p.revelados[id] ? "" : "velada"}" data-aba="${id}" aria-selected="${abaAtual === id}">
          <b>${e.glifo}</b> ${p.revelados[id] ? e.mundo : "???"}${id === p.origem ? " <i>origem</i>" : ""}
        </button>`;
      }).join("")}
    </nav>
    ${p.revelados[abaAtual] ? `<nav class="ficha-subabas" role="tablist">${FICHA_ABAS.map(([k, n]) => `<button role="tab" data-sub-aba="${k}" aria-selected="${subAtual === k}" class="${subAtual === k ? "atual" : ""}">${n}</button>`).join("")}</nav>` : ""}
    <div class="ficha-corpo" id="ficha-corpo">
    <div class="aba-conteudo">${renderEixo(p, abaAtual)}</div>
    <section class="convergencia" data-sub="convergencia">
      <h3>Convergência</h3>
      <p class="sub">Passou no teste: + Ressonância. Falhou: + Dissonância.</p>
      <button class="btn-secundario btn-convergencia" data-acao="convergencia">◉ Teste de Convergência · ${Regras.dificuldadeConvergencia(p)} sucesso${Regras.dificuldadeConvergencia(p) > 1 ? "s" : ""}</button>
      <div class="atributo"><div class="atributo-nome"><strong>Ressonância</strong><span>alinhamento com a Convergência</span></div>
        ${trilha(REGRAS.ressonanciaMax, p.ressonancia, "res", { classe: "trilha-longa trilha-res" })}
        ${marcasHtml(RESSONANCIA_LIMIARES, p.ressonancia)}</div>
      <div class="atributo"><div class="atributo-nome"><strong>Dissonância</strong><span>resistência caótica ao fenômeno</span></div>
        ${trilha(REGRAS.ressonanciaMax, p.dissonancia, "dis", { classe: "trilha-longa trilha-dis" })}
        ${marcasHtml(DISSONANCIA_LIMIARES, p.dissonancia)}</div>
    </section>
    <section data-sub="linguas">
      <div class="bloco"><h3>Memórias Cruzadas</h3>
        <textarea data-campo="memorias" rows="3" maxlength="2000" placeholder="Visões de outros mundos…">${esc(p.memorias)}</textarea>
      </div>
      <div class="bloco"><h3>Línguas</h3>
        <div class="linguas-resumo">
          ${ORDEM_EIXOS.map((l) => {
            const total = l === "y" ? Lingua.tudo().y.length : Lingua.elementos(l).length;
            const sabe = l === "y" ? p.runas.length : (p.linguas[l] || []).length;
            const palavrasY = l === "y" ? ` · ${p.vocabTotal ? Lingua.Yudur.PALAVRAS.length : Lingua.Yudur.PALAVRAS.filter((w) => Lingua.Yudur.sabePalavra(p, w.runas)).length} palavras` : "";
            const nome = { x: "Código Urbano", y: "Runas Yudur", z: "Interface" }[l];
            return `<div class="lingua-barra"><span>${EIXOS[l].glifo} ${nome}</span>
              <span class="lingua-progresso"><i style="width:${Math.round((sabe / total) * 100)}%"></i></span><b>${sabe}/${total}${palavrasY}</b></div>`;
          }).join("")}
        </div>
        <button class="btn-secundario" data-acao="dicionario">Abrir dicionário</button>
      </div>
    </section>
    <section data-sub="mapa">${mapaFichaHtml(p)}</section>
    <section data-sub="rolagens">
      <div class="mesa-barra">
        <button class="btn-texto" data-acao="nova-cena" title="Renova usos por cena">↻ Nova cena</button>
        <button class="btn-texto" data-acao="nova-sessao" title="Renova todos os usos">↻ Nova sessão</button>
      </div>
      <div class="bloco"><h3>Rolagens recentes</h3>${Dados.historicoHtml(p)}</div>
      <footer class="ficha-rodape">
        <button class="btn-texto perigo" data-acao="excluir">Excluir personagem</button>
      </footer>
    </section>
    </div>`;
  mostrarSubAba();
}

// O mapa de Port Halden que o personagem conhece (cidade-x.js)
function mapaFichaHtml(p) {
  if (typeof Cidade === "undefined") return "";
  const m = Cidade.mapaDaFicha(p);
  return `<div class="bloco"><h3>${esc(Cidade.dados.nome)} <small>${m.conhecidos} de ${m.total} lugares</small></h3>
    ${m.html}
    <p class="dica">O resto da cidade se descobre jogando: chegando lá, ou quando alguém conta.</p></div>`;
}

// A ficha em abas: cada uma cabe na tela (sem rolar a página)
const FICHA_ABAS = [
  ["personagem", "Ficha"], ["recursos", "Habilid."], ["bolsa", "Bolsa"],
  ["convergencia", "Converg."], ["linguas", "Memórias"], ["rolagens", "Dados"], ["mapa", "Mapa"],
];
let subAtual = "personagem";

function mostrarSubAba() {
  const corpo = document.getElementById("ficha-corpo");
  if (!corpo) return;
  corpo.querySelectorAll("[data-sub]").forEach((el) => (el.hidden = el.dataset.sub !== subAtual));
  // a moldura do eixo some quando a aba não tem nada dele (mapa, dados, memórias)
  const moldura = corpo.querySelector(".aba-conteudo");
  if (moldura) moldura.hidden = ![...moldura.querySelectorAll("[data-sub]")].some((el) => !el.hidden);
  document.querySelectorAll("[data-sub-aba]").forEach((b) => {
    b.classList.toggle("atual", b.dataset.subAba === subAtual);
    b.setAttribute("aria-selected", String(b.dataset.subAba === subAtual));
  });
}

// Salva, aplica as marcas que ligaram e redesenha mantendo a rolagem da página
function fichaMudou(p, avisos = []) {
  avisar([...avisos, ...Regras.aplicarLimiares(p)]);
  Armazem.salvar(p);
  atualizarFichaAberta();
}

// Dinheiro do eixo, pertences (a bolsa se traduz entre os eixos) e condições do corpo
function vidaHtml(p, eixo) {
  Vida.garantir(p);
  const itens = Object.entries(p.pertences);
  return `<div class="bloco vida"><h3>Dinheiro e pertences</h3>
    <p class="carteira"><strong>${esc(Vida.dinheiroTexto(eixo, p.dinheiro[eixo]))}</strong> <span class="sub">· bolsa ${Vida.naBolsa(p)}/${BOLSA_MAX}</span></p>
    ${itens.length ? `<ul class="pertences">${itens.map(([k, n]) => `
      <li class="com-arte">${Vida.arte(k, eixo, Vida.nome(k, eixo))}<span>${esc(Vida.nome(k, eixo))}${n > 1 ? ` <b>×${n}</b>` : ""}</span><small>${esc(Vida.pertence(k).efeito)}</small>
        <button class="btn-rolar" data-usar-pertence="${k}">Usar</button></li>`).join("")}</ul>` : `<p class="sub">Nada na bolsa.</p>`}
    ${p.condicoes.length ? `<p class="condicoes">${p.condicoes.map((c) => `<span class="condicao" title="Resolve com: ${esc(CONDICOES[c].resolve)}">${esc(CONDICOES[c].nome)}</span>`).join("")}</p>` : ""}
  </div>`;
}

function virarCarta(botao) {
  const p = fichaAtual;
  const runa = Regras.virarRuna(p);
  if (!runa) return;
  botao.disabled = true;
  botao.querySelector(".frente").innerHTML = `<b>${runa}</b><small>${letrasDaRuna(runa)}</small>`;
  botao.classList.add("virando");
  Armazem.salvar(p);
  setTimeout(atualizarFichaAberta, reduzirMovimento ? 50 : 1100);
}

$("#ficha").addEventListener("click", (ev) => {
  const t = ev.target.closest("button");
  if (!t || t.disabled) return;
  const p = fichaAtual;
  if (t.dataset.subAba) {
    subAtual = t.dataset.subAba;
    mostrarSubAba();
    document.getElementById("ficha-corpo").scrollTop = 0;
  } else if (t.dataset.aba) {
    abaAtual = t.dataset.aba;
    editando = null;
    renderFicha();
  } else if (t.hasAttribute("data-virar")) {
    virarCarta(t);
  } else if (t.dataset.catalogo) {
    const [tipo, chave] = t.dataset.catalogo.split(":");
    const erro = Regras.alternar(p, tipo, chave);
    fichaMudou(p, erro ? [erro] : []);
  } else if (t.dataset.usarPertence) {
    fichaMudou(p, Vida.usar(p, t.dataset.usarPertence, abaAtual));
  } else if (t.dataset.usar) {
    const it = Regras.item(t.dataset.usar);
    if (Regras.usosRestantes(p, it.chave) <= 0) return;
    Regras.consumir(p, it.chave);
    const { reduz, qtd } = it.acao;
    if (reduz === "exposicao") p.exposicao[abaAtual] = Math.max(0, p.exposicao[abaAtual] - qtd);
    else p[reduz] = Math.max(0, p[reduz] - qtd);
    fichaMudou(p, [`${it.nomes[abaAtual]}: ${it.efeito}`]);
  } else if (t.dataset.valor) {
    const [tipo, k] = t.closest("[data-trilha]").dataset.trilha.split(":");
    const clicado = +t.dataset.valor;
    // Marcar é livre; apagar só por regra (habilidade, item)
    if (tipo === "exp") p.exposicao[k] = Math.max(p.exposicao[k], clicado);
    else if (tipo === "res") p.ressonancia = Math.max(p.ressonancia, clicado);
    else if (tipo === "dis") p.dissonancia = Math.max(p.dissonancia, clicado);
    fichaMudou(p);
  } else if (t.dataset.rolar) {
    Dados.abrirTeste(p, abaAtual, t.dataset.rolar);
  } else if (t.dataset.acao === "convergencia") {
    Dados.abrirConvergencia(p, p.revelados[abaAtual] ? abaAtual : p.origem);
  } else if (t.dataset.acao === "dicionario") {
    Tradutor.abrir(abaAtual, "dicionario");
  } else if (t.dataset.acao === "estudar") {
    Dados.abrirTeste(p, "y", "mente", { estudo: true });
  } else if (t.dataset.acao === "nova-cena" || t.dataset.acao === "nova-sessao") {
    const periodo = t.dataset.acao === "nova-cena" ? "cena" : "sessao";
    Regras.renovar(p, periodo);
    fichaMudou(p, [periodo === "cena" ? "Nova cena: usos por cena renovados." : "Nova sessão: todos os usos renovados."]);
  } else if (t.dataset.acao === "editar") {
    editando = t.dataset.tipo;
    renderFicha();
  } else if (t.dataset.acao === "editar-fim") {
    editando = null;
    renderFicha();
  } else if (t.dataset.acao === "jogar") {
    Cenas.jogarCom(p.id);
  } else if (t.dataset.acao === "personagens") {
    abrirPersonagens();
  } else if (t.dataset.acao === "excluir") {
    if (confirm(`Excluir ${p.nome}? Isso não pode ser desfeito.`)) {
      Armazem.remover(p.id);
      if (Armazem.todos().length) abrirPersonagens();
      else iniciarCriacao();
    }
  }
});

// Chamado quando algo fora da ficha (ex.: uma rolagem) muda o personagem aberto
function atualizarFichaAberta() {
  if (!fichaAtual || !$("#tela-ficha").classList.contains("ativa")) return;
  const rolagem = document.getElementById("ficha-corpo")?.scrollTop || 0;
  renderFicha();
  const corpo = document.getElementById("ficha-corpo");
  if (corpo) corpo.scrollTop = rolagem;
}

$("#ficha").addEventListener("input", (ev) => {
  if (ev.target.dataset.campo !== "memorias") return;
  fichaAtual.memorias = ev.target.value;
  Armazem.salvar(fichaAtual);
});
