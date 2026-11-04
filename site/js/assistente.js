// =====================================================================
// ASSISTENTE DO CRIADOR: a missão feita respondendo perguntas, uma por tela.
// ---------------------------------------------------------------------
// É a porta de entrada do diagramas.html. Monta sozinho os blocos do Criador (n.d no formato
// do criador.js), as ligações (cena → escolha → ✓/✗/segue → cena) e a arrumação do diagrama.
// Os campos técnicos (id, palavras do texto livre, tempo…) são preenchidos com padrões; quem
// quiser mexer neles usa o diagrama (modo avançado).
// Usa as funções do editor (diagramas.js): mundo, missao(), no(), escolherMissao(), mudou(),
// render(), enquadrar(), novoId().
// =====================================================================

const Assistente = (() => {
  const raiz = document.createElement("div");
  raiz.id = "assistente";
  raiz.className = "as";
  raiz.hidden = true;
  document.body.append(raiz);

  let tela = null; // a pergunta da vez: { id, ... }
  let historico = []; // para o "‹ Voltar"
  let rascunho = null; // a cena sendo feita: { cenaId, titulo, texto, escolhas: [...], final, marcaFinal }
  let fila = []; // cenas novas que ainda vão ser perguntadas
  let i = 0; // a escolha da vez

  const esc2 = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const slug = (t, max = 28) => norm(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, max).replace(/-$/, "") || "x";
  // um id que ainda não existe na missão
  function idUnico(base, usados) {
    let id = base, k = 2;
    while (usados.has(id)) id = `${base}-${k++}`;
    usados.add(id);
    return id;
  }
  const idsUsados = (m) => new Set(m.nos.flatMap((n) => [n.d?.chave, n.d?.id].filter(Boolean)));
  // palavras para o texto livre: os pedaços das palavras mais longas do botão
  const palavrasDe = (t) => [...new Set(norm(t).split(/[^a-z]+/).filter((w) => w.length > 3).sort((a, b) => b.length - a.length).slice(0, 3).map((w) => w.slice(0, 6)))];

  // as situações de teste em linguagem simples
  const ATRIB = { corpo: "Força", mente: "Mente", essencia: "Espírito" };
  const situacoes = () => (typeof SITUACOES !== "undefined" ? SITUACOES : []).map((s) => ({ id: s.id, nome: s.nome, atributo: ATRIB[s.atributo] || "" }));

  // ======================= Abrir / fechar =======================
  function abrir(primeira = { id: "inicio" }) {
    historico = [];
    raiz.hidden = false;
    document.body.classList.add("com-assistente");
    ir(primeira, false);
  }
  function fechar() {
    raiz.hidden = true;
    document.body.classList.remove("com-assistente");
    render();
    requestAnimationFrame(() => { renderLigacoes(); enquadrar(); });
  }
  function ir(t, guardar = true) {
    if (guardar && tela) historico.push({ tela, i, rascunho: JSON.parse(JSON.stringify(rascunho)), fila: [...fila] });
    tela = t;
    desenhar();
  }
  function voltar() {
    const h = historico.pop();
    if (!h) return (tela = { id: "inicio" }, desenhar());
    ({ tela, i, fila } = h);
    rascunho = h.rascunho;
    desenhar();
  }

  // ======================= As telas =======================
  function moldura(pergunta, corpo, { ajuda = "", passo = "" } = {}) {
    return `
      <div class="as-caixa">
        <div class="as-topo">
          ${historico.length ? `<button class="as-voltar" data-as="voltar">‹ Voltar</button>` : "<span></span>"}
          <span class="as-passo">${esc2(passo)}</span>
          <button class="as-fechar" data-as="fechar" title="Ver o diagrama">Ver o diagrama</button>
        </div>
        <h2 class="as-pergunta">${pergunta}</h2>
        ${ajuda ? `<p class="as-ajuda">${ajuda}</p>` : ""}
        <div class="as-corpo">${corpo}</div>
      </div>`;
  }
  const botao = (rot, acao, extra = "", cls = "") => `<button class="as-op ${cls}" data-as="${acao}" ${extra}>${rot}</button>`;
  const seguir = (rot = "Continuar ›") => `<button class="as-seguir" data-as="seguir">${rot}</button>`;

  function desenhar() {
    const m = missao();
    const t = tela;
    let html = "";
    const nomeEscolha = () => rascunho?.escolhas[i]?.texto || "";
    const passoEscolha = () => `Cena “${rascunho?.titulo || ""}” · escolha ${i + 1} de ${rascunho?.escolhas.length}`;

    if (t.id === "inicio") {
      const missoes = mundo.missoes;
      html = moldura("O que você quer fazer?", `
        ${botao("✦ Criar uma missão nova", "nova-missao", "", "grande")}
        ${m ? botao(`✎ Continuar “${esc2(m.titulo)}”`, "continuar", "", "grande") : ""}
        ${missoes.length > 1 ? `<p class="as-ajuda">Ou escolha outra missão:</p>${missoes.filter((x) => x !== m).map((x) => botao(esc2(x.titulo), "abrir-missao", `data-id="${x.id}"`)).join("")}` : ""}
        <p class="as-ajuda">O diagrama completo (modo avançado) continua lá: toque em “Ver o diagrama”.</p>`);
    }

    // ---------- missão nova ----------
    if (t.id === "m-nome") html = moldura("Como se chama a missão?", `
      <input class="as-input" id="as-v" value="${esc2(t.valor || "")}" placeholder="Ex.: A Ponte Velha" autocomplete="off">
      ${seguir()}`, { ajuda: "Aparece na Mesa do jogo.", passo: "Missão nova · 1 de 3" });
    if (t.id === "m-mundo") html = moldura("Em qual mundo ela acontece?", `
      ${botao("∃ Urbano (Port Halden)", "mundo", 'data-v="x"', "grande")}
      ${botao("ᛉ Medieval (Yudur)", "mundo", 'data-v="y"', "grande")}
      ${botao("◉ Espacial (Domus)", "mundo", 'data-v="z"', "grande")}`, { passo: "Missão nova · 2 de 3" });
    if (t.id === "m-depois") {
      const ops = new Map();
      for (const j of Object.values(window.MISSOES || {})) if (!j.tutorial) ops.set(j.id, j.titulo);
      for (const x of mundo.missoes) if (x.jogo?.id && !x.jogo.tutorial && x !== m) ops.set(x.jogo.id, x.titulo);
      html = moldura("Ela vem depois de qual missão?", `
        ${botao("Nenhuma: aparece desde o começo", "depois", 'data-v=""', "grande")}
        ${[...ops].map(([id, tit]) => botao(esc2(tit), "depois", `data-v="${esc2(id)}"`)).join("")}`,
      { ajuda: "Ela só aparece na Mesa para quem já terminou a missão escolhida.", passo: "Missão nova · 3 de 3" });
    }

    // ---------- escolher uma cena para editar ----------
    if (t.id === "cenas") {
      const cenas = m.nos.filter((n) => ["entrada", "cena", "final"].includes(n.tipo) && n.d).sort((a, b) => a.x - b.x || a.y - b.y);
      html = moldura(`Qual cena de “${esc2(m.titulo)}”?`, `
        ${cenas.map((c) => botao(`${c.tipo === "entrada" ? "▶ " : c.d.final ? "■ " : ""}${esc2(c.titulo)}`, "cena", `data-id="${c.id}"`)).join("")}
        <div class="as-linha">${botao("⇪ Publicar no jogo", "publicar-tela", "", "destaque")}</div>`, { ajuda: "Toque numa cena para mudar o que acontece nela." });
    }

    // ---------- uma cena ----------
    if (t.id === "c-nome") html = moldura("Como se chama esta cena?", `
      <input class="as-input" id="as-v" value="${esc2(rascunho.titulo)}" placeholder="Ex.: A entrada do túnel" autocomplete="off">
      ${seguir()}`, { ajuda: "Um nome curto, só para você se achar no diagrama.", passo: "Cena" });
    if (t.id === "c-texto") html = moldura("O que o jogador vê nesta cena?", `
      <textarea class="as-input as-texto" id="as-v" rows="8" placeholder="Escreva como num livro. Deixe uma linha em branco para o jogador apertar “Continuar” antes do próximo pedaço.">${esc2(rascunho.texto)}</textarea>
      ${seguir()}`, { ajuda: "Linha em branco = um “Continuar”. O que estiver entre aspas “ ” vira fala com voz. Use {nome} para o nome do personagem.", passo: `Cena “${esc2(rascunho.titulo)}”` });
    if (t.id === "c-escolhas") html = moldura("Quais escolhas o jogador tem?", `
      ${[0, 1, 2, 3].map((k) => `<input class="as-input as-escolha" data-k="${k}" value="${esc2(rascunho.escolhas[k]?.texto || "")}" placeholder="Escolha ${k + 1}${k ? " (opcional)" : ""}, ex.: ${["Entrar no túnel", "Chamar alguém", "Esperar", "Voltar"][k]}" autocomplete="off">`).join("")}
      ${seguir()}
      <div class="as-ou">ou</div>
      ${botao("■ Esta cena é o fim da missão", "e-final", "", "grande")}`,
    { ajuda: "Até 4. O texto é o botão que o jogador aperta. Apague uma escolha deixando o espaço vazio.", passo: `Cena “${esc2(rascunho.titulo)}”` });
    if (t.id === "c-marca-final") html = moldura("Terminar a missão muda algo para depois?", `
      ${botao("Não", "marca-final", 'data-v=""', "grande")}
      <p class="as-ajuda">Ou dê um nome simples para o que o personagem leva desta missão:</p>
      <input class="as-input" id="as-v" value="${esc2(rascunho.marcaFinal || "")}" placeholder="Ex.: conhece o túnel" autocomplete="off">
      ${seguir("Guardar essa marca ›")}`, { ajuda: "Uma marca fica no personagem. Missões seguintes podem perguntar por ela.", passo: `Cena “${esc2(rascunho.titulo)}” · fim` });

    // ---------- uma escolha ----------
    if (t.id === "e-teste") {
      const porAtrib = {};
      for (const s of situacoes()) (porAtrib[s.atributo] = porAtrib[s.atributo] || []).push(s);
      const atual = rascunho.escolhas[i];
      const marcado = (v) => (atual.escolhaId && (atual.teste || "") === v ? "destaque" : "");
      html = moldura(`“${esc2(nomeEscolha())}”: isso é um teste?`, `
        ${atual.escolhaId ? botao("Manter esta escolha como está ›", "manter", "", "grande destaque") + `<p class="as-ajuda">Ou mude a resposta:</p>` : ""}
        ${botao("Não, só acontece", "teste", 'data-v=""', "grande " + marcado(""))}
        ${Object.entries(porAtrib).map(([a, ss]) => `<p class="as-grupo">Teste de ${a}</p>${ss.map((s) => botao(esc2(s.nome), "teste", `data-v="${s.id}"`, marcado(s.id))).join("")}`).join("")}
        <p class="as-grupo">Teste de Convergência</p>${botao("O fenômeno age sobre o personagem", "teste", 'data-v="convergencia"', marcado("convergencia"))}`,
      { ajuda: "Num teste, o jogador rola os dados. Dá certo ou dá errado.", passo: passoEscolha() });
    }
    if (t.id === "e-certo" || t.id === "e-errado" || t.id === "e-acontece") {
      const e = rascunho.escolhas[i];
      const campo = { "e-certo": "certo", "e-errado": "errado", "e-acontece": "acontece" }[t.id];
      const perg = { certo: "O que acontece se der certo?", errado: "E se der errado?", acontece: "O que acontece?" }[campo];
      html = moldura(`“${esc2(e.texto)}”: ${perg}`, `
        <textarea class="as-input as-texto" id="as-v" rows="6" placeholder="O que o jogador lê depois de escolher.">${esc2(e[campo] || "")}</textarea>
        ${seguir()}`, { ajuda: "Linha em branco = um “Continuar”. Aspas “ ” = fala com voz.", passo: passoEscolha() });
    }
    if (t.id === "e-precisa") {
      const equips = (typeof EQUIPAMENTOS !== "undefined" ? EQUIPAMENTOS : []).map((x) => ({ k: "item:" + x.chave, n: x.nomes[m.eixo] || x.nomes.x }));
      const habs = (typeof HABILIDADES !== "undefined" ? HABILIDADES : []).map((x) => ({ k: "hab:" + x.chave, n: x.nomes[m.eixo] || x.nomes.x }));
      html = moldura(`“${esc2(rascunho.escolhas[i].texto)}”: precisa de algo?`, `
        ${botao("Não precisa", "precisa", 'data-v=""', "grande")}
        <p class="as-grupo">Um equipamento</p>${equips.map((x) => botao(esc2(x.n), "precisa", `data-v="${x.k}"`)).join("")}
        <p class="as-grupo">Uma habilidade</p>${habs.map((x) => botao(esc2(x.n), "precisa", `data-v="${x.k}"`)).join("")}`,
      { ajuda: "Sem isso, a escolha aparece trancada para o jogador.", passo: passoEscolha() });
    }
    if (t.id === "e-marca") {
      const e = rascunho.escolhas[i];
      html = moldura(`“${esc2(e.texto)}”: isso muda algo para depois?`, `
        ${botao("Não", "marca", 'data-v=""', "grande")}
        <p class="as-ajuda">Ou dê um nome simples para o que fica marcado no personagem:</p>
        <input class="as-input" id="as-v" value="${esc2(e.marca || "")}" placeholder="Ex.: salvou o guarda" autocomplete="off">
        ${e.teste ? `<div class="as-linha">${botao("Guardar se der certo", "marca-quando", 'data-v="certo"', "destaque")}${botao("Guardar se der errado", "marca-quando", 'data-v="errado"')}${botao("Nos dois casos", "marca-quando", 'data-v="sempre"')}</div>` : seguir("Guardar essa marca ›")}`,
      { ajuda: "Missões seguintes (ou cenas desta) podem perguntar por essa marca.", passo: passoEscolha() });
    }
    if (t.id === "e-destino" || t.id === "e-destino-certo" || t.id === "e-destino-errado") {
      const e = rascunho.escolhas[i];
      const cenas = m.nos.filter((n) => ["entrada", "cena", "final"].includes(n.tipo) && n.d && n.id !== rascunho.cenaId);
      const qual = { "e-destino": "", "e-destino-certo": " (se der certo)", "e-destino-errado": " (se der errado)" }[t.id];
      html = moldura(`“${esc2(e.texto)}”: para onde vai depois${qual}?`, `
        ${botao("✦ Uma cena nova", "destino", 'data-v="nova"', "grande destaque")}
        ${botao("Fica aqui (volta às escolhas desta cena)", "destino", 'data-v="fica"', "grande")}
        ${t.id === "e-destino" && e.teste ? botao("Caminhos diferentes para certo e errado", "destino", 'data-v="separar"', "grande") : ""}
        ${pendentes().length ? `<p class="as-grupo">Uma cena nova que você já pediu</p>${pendentes().map((nm) => botao(esc2(nm), "destino", `data-v="nova:${esc2(nm)}"`)).join("")}` : ""}
        ${cenas.length ? `<p class="as-grupo">Uma cena que já existe</p>${cenas.map((c) => botao(esc2(c.titulo), "destino", `data-v="${c.id}"`)).join("")}` : ""}`,
      { passo: passoEscolha() });
    }
    if (t.id === "e-nova-nome") html = moldura("Como se chama a cena nova?", `
      <input class="as-input" id="as-v" placeholder="Ex.: Dentro do túnel" autocomplete="off">
      ${seguir()}`, { ajuda: "Você escreve o que acontece nela logo em seguida.", passo: passoEscolha() });

    // ---------- pronto ----------
    if (t.id === "pronto") {
      const { erros, avisos } = Criador.validar(m);
      const cenas = m.nos.filter((n) => ["entrada", "cena", "final"].includes(n.tipo) && n.d).length;
      html = moldura("Pronto! O que agora?", `
        <p class="as-ajuda">“${esc2(m.titulo)}” tem ${cenas} cena${cenas > 1 ? "s" : ""}.</p>
        ${erros.length ? `<ul class="as-erros">${erros.map((x) => `<li>${esc2(x)}</li>`).join("")}</ul>` : ""}
        ${avisos.length ? `<ul class="as-avisos">${avisos.map((x) => `<li>${esc2(x)}</li>`).join("")}</ul>` : ""}
        ${botao("⇪ Publicar no jogo", "publicar", erros.length ? "disabled" : "", "grande destaque")}
        ${botao("✎ Mudar uma cena", "editar", "", "grande")}
        ${botao("Ver o diagrama", "fechar", "", "grande")}
        <p class="as-ajuda" id="as-estado">${erros.length ? "Corrija os erros acima (toque em “Mudar uma cena”)." : "Depois de publicar, a missão aparece na Mesa do jogo."}</p>`);
    }
    raiz.innerHTML = html;
    const campo = raiz.querySelector("#as-v, .as-escolha");
    if (campo && matchMedia("(min-width: 761px)").matches) campo.focus();
  }

  // ======================= Respostas =======================
  raiz.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && ev.target.matches("input.as-input")) {
      ev.preventDefault();
      raiz.querySelector('[data-as="seguir"]')?.click();
    }
  });
  raiz.addEventListener("click", (ev) => {
    const b = ev.target.closest("[data-as]");
    if (!b || b.disabled) return;
    responder(b.dataset.as, b.dataset.v, b);
  });

  const valor = () => (raiz.querySelector("#as-v")?.value || "").trim();

  function responder(acao, v, b) {
    const m = missao();
    const t = tela;
    if (acao === "voltar") return voltar();
    if (acao === "fechar") return fechar();

    if (acao === "nova-missao") return ir({ id: "m-nome" });
    if (acao === "continuar") return ir({ id: "cenas" });
    if (acao === "abrir-missao") { escolherMissao(b.dataset.id); render(); return ir({ id: "cenas" }); }
    if (acao === "editar") return ir({ id: "cenas" });
    if (acao === "publicar-tela") return ir({ id: "pronto" });

    if (t.id === "m-nome" && acao === "seguir") {
      if (!valor()) return aviso("Escreva um nome.");
      return ir({ id: "m-mundo", nome: valor() });
    }
    if (acao === "mundo") return ir({ id: "m-depois", nome: t.nome, eixo: v });
    if (acao === "depois") return criarMissao(t, v);

    if (acao === "cena") return comecarCena(b.dataset.id);
    if (t.id === "c-nome" && acao === "seguir") { rascunho.titulo = valor() || rascunho.titulo; return ir({ id: "c-texto" }); }
    if (t.id === "c-texto" && acao === "seguir") {
      if (!valor()) return aviso("Escreva o que o jogador vê.");
      rascunho.texto = raiz.querySelector("#as-v").value.trim();
      return ir({ id: "c-escolhas" });
    }
    if (t.id === "c-escolhas" && acao === "seguir") {
      const textos = [...raiz.querySelectorAll(".as-escolha")].map((x) => x.value.trim());
      if (!textos.some(Boolean)) return aviso("Escreva pelo menos uma escolha (ou toque em “fim da missão”).");
      // mantém o que já tinha sido respondido para cada escolha que continua
      rascunho.escolhas = textos.map((tx, k) => (tx ? { ...(rascunho.escolhas[k] || {}), texto: tx } : null)).filter(Boolean);
      rascunho.final = false;
      i = 0;
      return ir({ id: "e-teste" });
    }
    if (acao === "e-final") {
      rascunho.final = true;
      rascunho.escolhas = [];
      return ir({ id: "c-marca-final" });
    }
    if (acao === "marca-final" || (t.id === "c-marca-final" && acao === "seguir")) {
      rascunho.marcaFinal = acao === "marca-final" ? "" : valor();
      return salvarCena();
    }

    const e = rascunho?.escolhas[i];
    if (acao === "manter") { e.manter = true; return proximaEscolha(); }
    if (acao === "teste") {
      e.teste = v || "";
      return ir({ id: e.teste ? "e-certo" : "e-acontece" });
    }
    if (acao === "seguir" && ["e-certo", "e-errado", "e-acontece"].includes(t.id)) {
      const campo = { "e-certo": "certo", "e-errado": "errado", "e-acontece": "acontece" }[t.id];
      e[campo] = raiz.querySelector("#as-v").value.trim();
      if (!e[campo]) return aviso("Escreva o que acontece.");
      return ir({ id: t.id === "e-certo" ? "e-errado" : "e-precisa" });
    }
    if (acao === "precisa") {
      e.precisa = v || "";
      return ir({ id: "e-marca" });
    }
    if (acao === "marca" || acao === "marca-quando" || (t.id === "e-marca" && acao === "seguir")) {
      e.marca = acao === "marca" ? "" : valor();
      e.marcaQuando = acao === "marca-quando" ? v : "sempre";
      if (acao !== "marca" && !e.marca) return aviso("Escreva o nome da marca (ou toque em “Não”).");
      return ir({ id: "e-destino" });
    }
    if (acao === "destino") {
      const qual = t.id === "e-destino-certo" ? "destinoCerto" : t.id === "e-destino-errado" ? "destinoErrado" : "destino";
      if (v === "separar") return ir({ id: "e-destino-certo" });
      if (v === "nova") return ir({ id: "e-nova-nome", qual });
      e[qual] = v;
      if (qual === "destino") { delete e.destinoCerto; delete e.destinoErrado; }
      if (qual === "destinoCerto") return ir({ id: "e-destino-errado" });
      return proximaEscolha();
    }
    if (t.id === "e-nova-nome" && acao === "seguir") {
      if (!valor()) return aviso("Dê um nome para a cena nova.");
      e[t.qual] = "nova:" + valor();
      if (t.qual === "destino") { delete e.destinoCerto; delete e.destinoErrado; }
      if (t.qual === "destinoCerto") return ir({ id: "e-destino-errado" });
      return proximaEscolha();
    }
    if (acao === "publicar") return publicar(b);
  }

  // cenas novas pedidas nesta cena (ainda não criadas): também podem ser destino de outras escolhas
  function pendentes() {
    const nomes = new Set();
    for (const e of rascunho?.escolhas || []) for (const k of ["destino", "destinoCerto", "destinoErrado"]) if (String(e[k] || "").startsWith("nova:")) nomes.add(e[k].slice(5));
    return [...nomes];
  }

  function aviso(texto) {
    let el = raiz.querySelector(".as-aviso");
    if (!el) {
      el = document.createElement("p");
      el.className = "as-aviso";
      raiz.querySelector(".as-corpo").prepend(el);
    }
    el.textContent = texto;
  }

  function proximaEscolha() {
    i++;
    if (i < rascunho.escolhas.length) return ir({ id: "e-teste" });
    return salvarCena();
  }

  // ======================= Missão nova =======================
  function criarMissao(t, anterior) {
    const nome = t.nome || "Nova missão";
    const eixo = t.eixo || "x";
    const ids = new Set([...Object.keys(window.MISSOES || {}), ...mundo.missoes.map((x) => x.jogo?.id).filter(Boolean)]);
    const m = novaMissao(nome, eixo);
    m.assistente = true;
    m.jogo = { id: idUnico(slug(nome), ids), subtitulo: { x: "Eixo X — Urbano", y: "Eixo Y — Medieval", z: "Eixo Z — Espacial" }[eixo], fase: "", npcs: {}, anterior: anterior || "", proxima: "", desbloqueio: {} };
    // a primeira cena (a abertura)
    const ab = criarNo("entrada", 0, 0, { titulo: "Começo", d: { chave: "inicio", texto: "" } });
    mudou();
    render();
    rascunho = { cenaId: ab.id, titulo: "Começo", texto: "", escolhas: [], final: false, marcaFinal: "" };
    fila = [];
    return ir({ id: "c-texto" });
  }

  // ======================= Uma cena: ler, perguntar, gravar =======================
  const TIPO_LIG = { certo: "sucesso", errado: "falha", acontece: "segue" };

  function comecarCena(cenaId) {
    const m = missao();
    const c = no(cenaId);
    const escolhas = m.ligacoes.filter((l) => l.de === c.id).map((l) => no(l.para)).filter((n) => n && n.tipo === "escolha").sort((a, b) => a.y - b.y);
    const destinoDe = (e, tipo) => {
      const l = m.ligacoes.find((x) => x.de === e.id && x.tipo === tipo && no(x.para) && no(x.para).tipo !== "escolha");
      return l ? l.para : "fica";
    };
    rascunho = {
      cenaId: c.id, titulo: c.titulo, texto: c.d.texto || "", final: !!c.d.final, marcaFinal: [].concat(c.d.marca || [])[0] || "",
      escolhas: escolhas.map((e) => {
        const d = e.d || {};
        const teste = d.teste?.tipo === "convergencia" ? "convergencia" : d.teste?.tipo === "situacao" ? d.teste.situacao : "";
        const r = d.res || {};
        const marcaS = [].concat(r.sucesso?.efeitos?.marca || r.resultado?.efeitos?.marca || [])[0];
        const marcaF = [].concat(r.falha?.efeitos?.marca || [])[0];
        const dc = destinoDe(e, teste ? "sucesso" : "segue"), de = teste ? destinoDe(e, "falha") : dc;
        return {
          escolhaId: e.id, texto: e.titulo, teste, certo: r.sucesso?.texto || "", errado: r.falha?.texto || "", acontece: r.resultado?.texto || "",
          precisa: d.req?.item ? "item:" + d.req.item : d.req?.hab ? "hab:" + d.req.hab : "",
          marca: e.d?.marcaNome || marcaS || marcaF || "", marcaQuando: marcaS && marcaF ? "sempre" : marcaF ? "errado" : "certo",
          ...(teste && dc !== de ? { destinoCerto: dc, destinoErrado: de } : { destino: dc }),
        };
      }),
    };
    fila = [];
    return ir({ id: "c-nome" });
  }

  function salvarCena() {
    const m = missao();
    const c = no(rascunho.cenaId);
    const usados = idsUsados(m);
    c.titulo = rascunho.titulo || c.titulo;
    c.d = { ...(c.d || {}), texto: rascunho.texto };
    if (rascunho.final) {
      c.tipo = c.tipo === "entrada" ? "entrada" : "final";
      c.d.final = true;
      c.d.marca = rascunho.marcaFinal ? [idUnico("m-" + slug(rascunho.marcaFinal), new Set())] : undefined;
      c.d.marcaNome = rascunho.marcaFinal || undefined;
      c.d.textoFinal = c.d.textoFinal || "Fim da missão.";
    } else {
      if (c.tipo === "final") c.tipo = "cena";
      delete c.d.final;
    }
    // escolhas: as que saíram somem; as que ficaram são atualizadas; as novas nascem
    const antigas = m.ligacoes.filter((l) => l.de === c.id).map((l) => no(l.para)).filter((n) => n && n.tipo === "escolha");
    const ficam = new Set(rascunho.escolhas.map((e) => e.escolhaId).filter(Boolean));
    for (const a of antigas) if (!ficam.has(a.id)) apagarBloco(a.id);
    const novasCenas = [];
    const criadas = {};
    const cenaDe = (dest) => {
      if (!dest || dest === "fica") return null;
      if (criadas[dest]) return criadas[dest];
      if (dest.startsWith("nova:")) {
        const n = criarNo("cena", c.x + 620, c.y, { titulo: dest.slice(5), d: { chave: idUnico(slug(dest.slice(5)), usados), texto: "" } });
        novasCenas.push(n.id);
        return (criadas[dest] = n.id);
      }
      return dest;
    };
    rascunho.escolhas.forEach((e, k) => {
      let n = e.escolhaId && no(e.escolhaId);
      if (!n) {
        n = criarNo("escolha", c.x + 300, c.y + k * 180, { titulo: e.texto, d: { id: idUnico(slug(e.texto), usados) } });
        m.ligacoes.push({ id: novoId("l"), de: c.id, para: n.id, rotulo: "", tipo: "segue" });
      }
      n.titulo = e.texto;
      n.y = c.y + k * 180 + 1; // a ordem do jogo é a de cima para baixo
      if (e.manter) return;
      const d = n.d && n.d.id ? n.d : (n.d = { id: idUnico(slug(e.texto), usados) });
      d.palavras = palavrasDe(e.texto);
      d.teste = !e.teste ? { tipo: "nenhum" } : e.teste === "convergencia" ? { tipo: "convergencia", intensidade: 1 } : { tipo: "situacao", situacao: e.teste };
      const marcaId = e.marca ? "m-" + slug(e.marca) : "";
      d.marcaNome = e.marca || undefined;
      const efeitos = (quando) => (marcaId && (e.marcaQuando === "sempre" || e.marcaQuando === quando) ? { marca: [marcaId] } : undefined);
      const manter = (r, texto, ef) => ({ ...(r || {}), texto, efeitos: { ...((r && r.efeitos) || {}), marca: undefined, ...(ef || {}) } });
      const r = d.res || {};
      d.res = e.teste
        ? { sucesso: manter(r.sucesso, e.certo, efeitos("certo")), falha: manter(r.falha, e.errado, efeitos("errado")) }
        : { resultado: manter(r.resultado, e.acontece, efeitos("certo")) };
      for (const x of Object.values(d.res)) if (x.efeitos && !Object.values(x.efeitos).some((v) => v !== undefined)) delete x.efeitos;
      const [tipoP, chaveP] = (e.precisa || ":").split(":");
      d.req = { ...(d.req || {}) };
      delete d.req.item; delete d.req.hab;
      if (tipoP === "item" || tipoP === "hab") d.req[tipoP] = chaveP;
      if (!Object.keys(d.req).length) delete d.req;
      // para onde vai: as ligações de saída da escolha são refeitas
      m.ligacoes = m.ligacoes.filter((l) => !(l.de === n.id && ["sucesso", "falha", "segue"].includes(l.tipo)));
      const destinos = e.teste
        ? [["sucesso", e.destinoCerto ?? e.destino], ["falha", e.destinoErrado ?? e.destino]]
        : [["segue", e.destino]];
      const feitas = {};
      for (const [tipo, dest] of destinos) {
        const alvo = feitas[dest] || cenaDe(dest);
        if (dest) feitas[dest] = alvo;
        if (alvo) m.ligacoes.push({ id: novoId("l"), de: n.id, para: alvo, rotulo: "", tipo });
      }
    });
    if (m.assistente) arrumar(m);
    selecao = null;
    mudou();
    render();
    requestAnimationFrame(() => { renderLigacoes(); enquadrar(); });
    fila.push(...novasCenas);
    const prox = fila.shift();
    if (prox) {
      const nc = no(prox);
      rascunho = { cenaId: nc.id, titulo: nc.titulo, texto: "", escolhas: [], final: false, marcaFinal: "" };
      return ir({ id: "c-texto" });
    }
    return ir({ id: "pronto" });
  }

  function apagarBloco(id) {
    const m = missao();
    m.nos = m.nos.filter((x) => x.id !== id);
    m.ligacoes = m.ligacoes.filter((l) => l.de !== id && l.para !== id);
  }

  // ======================= Arrumar o diagrama =======================
  // cenas em colunas pela distância da abertura; as escolhas de cada cena ao lado dela
  function arrumar(m) {
    const cenas = m.nos.filter((n) => ["entrada", "cena", "final"].includes(n.tipo));
    const ini = cenas.find((n) => n.tipo === "entrada") || cenas[0];
    if (!ini) return;
    const escolhasDe = (c) => m.ligacoes.filter((l) => l.de === c.id).map((l) => no(l.para)).filter((n) => n && n.tipo === "escolha").sort((a, b) => a.y - b.y);
    const prof = new Map([[ini.id, 0]]);
    const fila2 = [ini];
    while (fila2.length) {
      const c = fila2.shift();
      for (const e of escolhasDe(c))
        for (const l of m.ligacoes.filter((x) => x.de === e.id)) {
          const alvo = no(l.para);
          if (alvo && cenas.includes(alvo) && !prof.has(alvo.id)) { prof.set(alvo.id, prof.get(c.id) + 1); fila2.push(alvo); }
        }
    }
    let maxP = Math.max(0, ...prof.values());
    for (const c of cenas) if (!prof.has(c.id)) prof.set(c.id, ++maxP);
    const ys = {};
    for (const c of cenas.sort((a, b) => prof.get(a.id) - prof.get(b.id) || a.y - b.y)) {
      const p = prof.get(c.id);
      const y = ys[p] || 0;
      c.x = p * 640;
      c.y = y;
      const es = escolhasDe(c);
      es.forEach((e, k) => { e.x = c.x + 290; e.y = y + k * 190; });
      ys[p] = y + Math.max(220, es.length * 190) + 60;
    }
  }

  // ======================= Publicar =======================
  function publicar(b) {
    const m = missao();
    const caixa = raiz.querySelector("#as-estado");
    b.disabled = true;
    caixa.textContent = "Publicando…";
    Criador.publicar(m, { aviso: (t) => (caixa.textContent = t), tendencias: mundo.personagens?.tendencias || {} })
      .then((r) => {
        m.jogo = { ...(m.jogo || {}), publicadoEm: new Date().toISOString() };
        mudou();
        caixa.innerHTML = r.onde === "pc"
          ? "✓ Gravada no projeto. Para ir para o site, peça ao Claude para publicar."
          : "✓ Publicada! Em 1 ou 2 minutos ela aparece na Mesa do jogo.";
      })
      .catch((e) => {
        caixa.innerHTML = `✗ Não publicou: ${esc2(e.message)}.${[403, 404].includes(e.status) ? "<br>O seu token do GitHub precisa ter acesso também ao repositório <b>kosmos</b> (Contents: Read and write)." : ""}`;
      })
      .finally(() => (b.disabled = false));
  }

  return { abrir, fechar, arrumar };
})();

// o Assistente é a porta de entrada do Criador
document.getElementById("btn-assistente")?.addEventListener("click", () => Assistente.abrir());
Assistente.abrir();
