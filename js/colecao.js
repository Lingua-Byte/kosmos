// =====================================================================
// COLEÇÃO: as artes que o jogador já viu e os textos de lore que ele achou.
// ---------------------------------------------------------------------
// · Artes: entram sozinhas quando o palco mostra uma arte pela primeira vez (lugares, cenas,
//   retratos de NPC). A lista completa vem de dados/artes.json (node ferramentas/indice_artes.js),
//   para o jogo mostrar "12 de 40" e as que faltam como "?".
// · Textos: documentos escritos pelo autor em dados/documentos.json. Entram quando uma ação da
//   missão tem o efeito  "documento": "<id>"  (no Criador: + efeito → documento de lore).
//   Ao achar, o texto abre na hora, um parágrafo por vez, e depois fica na Coleção.
// · A coleção é do JOGADOR (vale para todos os personagens) e vai para a nuvem com a conta.
// =====================================================================

const Colecao = (() => {
  const CHAVE = "kosmos.colecao";
  const POR_PAGINA = 6;
  const escC = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function dados() {
    let d = {};
    try {
      d = JSON.parse(localStorage.getItem(CHAVE)) || {};
    } catch {}
    d.artes = d.artes || {};
    d.docs = d.docs || {};
    return d;
  }
  function gravar(d) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(d));
    } catch {}
  }

  let catalogo = { artes: [], documentos: {} };
  Promise.all([
    fetch("dados/artes.json").then((r) => r.json()).catch(() => []),
    fetch("dados/documentos.json").then((r) => r.json()).catch(() => ({})),
  ]).then(([artes, documentos]) => (catalogo = { artes, documentos }));

  // ---------- aviso discreto no topo ----------
  function aviso(texto) {
    const el = document.createElement("div");
    el.className = "colecao-aviso";
    el.textContent = texto;
    document.body.append(el);
    setTimeout(() => el.classList.add("sumindo"), 2200);
    setTimeout(() => el.remove(), 2900);
  }

  // ---------- registrar ----------
  function arte(eixo, chave, titulo) {
    if (!eixo || !chave || /^caminho/.test(chave)) return false;
    const id = `${eixo}/${chave}`;
    const d = dados();
    if (d.artes[id]) return false;
    d.artes[id] = { titulo: titulo || "", em: Date.now() };
    gravar(d);
    aviso("◈ Nova arte na Coleção");
    return true;
  }

  // → { doc, novo }  (doc = null se o id não existe em dados/documentos.json)
  function documento(id) {
    const doc = catalogo.documentos[id] || null;
    if (!doc) return { doc: null, novo: false };
    const d = dados();
    const novo = !d.docs[id];
    if (novo) {
      d.docs[id] = { em: Date.now() };
      gravar(d);
    }
    return { doc, novo };
  }

  // ---------- tela ----------
  const raiz = document.createElement("div");
  raiz.id = "colecao";
  raiz.className = "colecao";
  raiz.hidden = true;
  raiz.setAttribute("role", "dialog");
  raiz.setAttribute("aria-modal", "true");
  document.body.append(raiz);

  let vista = { aba: "artes", pagina: 0, arte: null, doc: null, par: 0 };

  const nomeArte = (a, salvo) => {
    if (salvo.titulo) return salvo.titulo;
    const n = a.id.split("/")[1].replace(/^(lugar|npc|cena|abertura)-/, "").replace(/-/g, " ");
    return n.charAt(0).toUpperCase() + n.slice(1);
  };

  function htmlArtes(d) {
    // as achadas primeiro (da mais recente para a mais antiga), depois as que faltam
    const lista = [...catalogo.artes].sort((a, b) => ((d.artes[b.id] || {}).em || 0) - ((d.artes[a.id] || {}).em || 0));
    const total = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    vista.pagina = Math.min(vista.pagina, total - 1);
    const pag = lista.slice(vista.pagina * POR_PAGINA, (vista.pagina + 1) * POR_PAGINA);
    const cartas = pag.map((a) => {
      const s = d.artes[a.id];
      if (!s) return `<div class="col-carta col-trancada" aria-label="Arte ainda não encontrada"><b>?</b></div>`;
      const mini = a.imagem ? `<img src="${escC(a.imagem)}" alt="" loading="lazy">` : `<video src="${escC(a.video)}" muted preload="metadata" playsinline></video>`;
      return `<button class="col-carta" data-col-arte="${escC(a.id)}">${mini}<span>${escC(nomeArte(a, s))}</span></button>`;
    });
    return `<div class="col-grade">${cartas.join("")}</div>${paginas(total)}`;
  }

  function htmlTextos(d) {
    const ids = Object.keys(catalogo.documentos);
    const total = Math.max(1, Math.ceil(ids.length / POR_PAGINA));
    vista.pagina = Math.min(vista.pagina, total - 1);
    const pag = ids.slice(vista.pagina * POR_PAGINA, (vista.pagina + 1) * POR_PAGINA);
    const itens = pag.map((id) => {
      if (!d.docs[id]) return `<li class="col-texto col-trancada">— ainda não encontrado —</li>`;
      const doc = catalogo.documentos[id];
      return `<li><button class="col-texto" data-col-doc="${escC(id)}"><b>${escC(doc.titulo)}</b><small>${escC(doc.autor || "")}</small></button></li>`;
    });
    return `<ul class="col-lista">${itens.join("")}</ul>${paginas(total)}`;
  }

  const paginas = (total) => total > 1
    ? `<div class="col-paginas"><button data-col-pag="-1" ${vista.pagina === 0 ? "disabled" : ""}>‹</button><span>${vista.pagina + 1} / ${total}</span><button data-col-pag="1" ${vista.pagina >= total - 1 ? "disabled" : ""}>›</button></div>`
    : "";

  function htmlVerArte(d) {
    const a = catalogo.artes.find((x) => x.id === vista.arte);
    if (!a) return "";
    const midia = a.video ? `<video src="${escC(a.video)}" autoplay loop muted playsinline></video>` : `<img src="${escC(a.imagem)}" alt="">`;
    return `<div class="col-ver">${midia}<p>${escC(nomeArte(a, d.artes[a.id] || {}))}</p><button class="btn-secundario" data-col-voltar>‹ Voltar</button></div>`;
  }

  function htmlLer() {
    const doc = catalogo.documentos[vista.doc];
    if (!doc) return "";
    const pars = [].concat(doc.texto || []);
    const i = Math.min(vista.par, pars.length - 1);
    const ultimo = i >= pars.length - 1;
    return `<div class="col-ler">
      <header><b>${escC(doc.titulo)}</b><small>${escC(doc.autor || "")}</small></header>
      <p class="col-paragrafo">${escC(pars[i])}</p>
      <div class="col-ler-acoes">
        <button class="btn-secundario" data-col-par="-1" ${i === 0 ? "disabled" : ""}>‹</button>
        <span>${i + 1} / ${pars.length}</span>
        ${ultimo ? `<button class="btn-primario" data-col-fim>Guardar ✓</button>` : `<button class="btn-primario" data-col-par="1">Continuar ▸</button>`}
      </div></div>`;
  }

  function render() {
    const d = dados();
    const nArtes = catalogo.artes.filter((a) => d.artes[a.id]).length;
    const nDocs = Object.keys(catalogo.documentos).filter((id) => d.docs[id]).length;
    let corpo;
    if (vista.doc) corpo = htmlLer();
    else if (vista.arte) corpo = htmlVerArte(d);
    else corpo = vista.aba === "artes" ? htmlArtes(d) : htmlTextos(d);
    raiz.innerHTML = `<div class="col-caixa">
      <header class="col-topo">
        <h2>◈ Coleção</h2>
        <button class="col-fechar" data-col-fechar aria-label="Fechar">✕</button>
      </header>
      ${vista.doc && vista.soLeitura ? "" : `<nav class="col-abas">
        <button data-col-aba="artes" class="${vista.aba === "artes" ? "ativa" : ""}">Artes ${nArtes}/${catalogo.artes.length}</button>
        <button data-col-aba="textos" class="${vista.aba === "textos" ? "ativa" : ""}">Textos ${nDocs}/${Object.keys(catalogo.documentos).length}</button>
      </nav>`}
      <div class="col-corpo">${corpo}</div></div>`;
  }

  function abrir(aba = "artes") {
    vista = { aba, pagina: 0, arte: null, doc: null, par: 0 };
    raiz.hidden = false;
    render();
  }
  // abre um documento direto (ao ser achado numa missão): fechar volta para o jogo
  function ler(id) {
    vista = { aba: "textos", pagina: 0, arte: null, doc: id, par: 0, soLeitura: true };
    raiz.hidden = false;
    render();
  }
  function fechar() {
    raiz.hidden = true;
    raiz.innerHTML = "";
  }

  raiz.addEventListener("click", (ev) => {
    const b = ev.target.closest("button");
    if (!b) return;
    if (b.dataset.colFechar !== undefined) return fechar();
    if (b.dataset.colAba) Object.assign(vista, { aba: b.dataset.colAba, pagina: 0, arte: null, doc: null });
    if (b.dataset.colPag) vista.pagina += +b.dataset.colPag;
    if (b.dataset.colArte) vista.arte = b.dataset.colArte;
    if (b.dataset.colDoc) Object.assign(vista, { doc: b.dataset.colDoc, par: 0 });
    if (b.dataset.colPar) vista.par += +b.dataset.colPar;
    if (b.dataset.colVoltar !== undefined) vista.arte = null;
    if (b.dataset.colFim !== undefined) {
      if (vista.soLeitura) return fechar();
      Object.assign(vista, { doc: null, par: 0 });
    }
    render();
  });
  document.addEventListener("keydown", (ev) => {
    if (!raiz.hidden && ev.key === "Escape") fechar();
  });

  return { arte, documento, abrir, ler, fechar, dados };
})();
