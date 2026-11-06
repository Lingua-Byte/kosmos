// Modo de cenas: a Mesa (quem joga, qual missão) e a tela de jogo.
// O jogo decide testes, dificuldades e consequências; o jogador escolhe uma opção ou escreve o que faz.

const Cenas = (() => {
  // Cada grupo de personagens tem a sua partida. Todas ficam em "kosmos.campanhas";
  // "kosmos.campanhaAtual" diz qual está aberta na tela.
  const CHAVE = "kosmos.campanhas";
  const ATUAL = "kosmos.campanhaAtual";
  const ANTIGA = "kosmos.campanha"; // formato antigo (uma partida só)
  let camp = null; // a partida aberta
  let painel = null; // "mapa" | "diario" | null
  let pendente = null; // interpretação do texto livre esperando confirmação
  let mensagemLivre = ""; // resposta quando o texto livre não é entendido
  let resultado = null; // { texto, linhas, depois }
  let selecionados = new Set();
  let emJogo = false; // entrou numa missão e ainda não voltou à Mesa/personagens

  const norm = (t) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  function lerTodas() {
    let todas = {};
    try {
      todas = JSON.parse(localStorage.getItem(CHAVE)) || {};
      // traz a partida do formato antigo para o novo
      const antiga = JSON.parse(localStorage.getItem(ANTIGA));
      if (antiga) {
        antiga.id = antiga.id || "c" + Date.now().toString(36);
        todas[antiga.id] = antiga;
        localStorage.setItem(CHAVE, JSON.stringify(todas));
        localStorage.setItem(ATUAL, antiga.id);
        localStorage.removeItem(ANTIGA);
      }
    } catch {}
    return todas;
  }

  function carregar() {
    let id = null;
    try {
      id = localStorage.getItem(ATUAL);
    } catch {}
    camp = (id && lerTodas()[id]) || null;
    return camp;
  }

  function salvar() {
    const todas = lerTodas();
    todas[camp.id] = camp;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(todas));
      localStorage.setItem(ATUAL, camp.id);
    } catch {}
  }

  function escolherPartida(id) {
    try {
      localStorage.setItem(ATUAL, id);
    } catch {}
    return carregar();
  }

  // Partidas em andamento (de personagens que ainda existem)
  function partidas() {
    const ids = new Set(Armazem.todos().map((p) => p.id));
    return Object.values(lerTodas()).filter((c) => !c.fim && MISSOES[c.missao] && c.personagens.some((id) => ids.has(id)));
  }
  const partidaDe = (pid) => partidas().find((c) => c.personagens.includes(pid)) || null;

  const missao = () => MISSOES[camp.missao];
  const todos = () => Armazem.todos();
  const grupo = () => camp.personagens.map((id) => Regras.migrar(todos().find((p) => p.id === id))).filter(Boolean);
  const ativo = () => {
    const g = grupo();
    return g[camp.vez % g.length];
  };
  const contexto = () => ({ p: ativo(), camp, grupo: grupo(), trabalho: missao().trabalho ? missao().trabalho(grupo()[0]) : {} });
  const texto = (v, ctx = contexto()) => (typeof v === "function" ? v(ctx) : v || "");
  const paragrafos = (t) => t.split(/\n\n+/).map((x) => `<p>${esc(x).replace(/\n/g, "<br>")}</p>`).join("");

  // ======================= Mesa =======================

  // preSelecionados: quem já vem escolhido (ex.: abrindo a Mesa pela ficha de um personagem)
  // A Mesa: single player. Um personagem por vez; só aparecem as missões que ele já liberou
  // (a anterior terminou e ele tem as marcas pedidas). As que ele já terminou ficam embaixo.
  let missoesCarregadas = false;
  function abrirMesa(preSelecionados) {
    if (!missoesCarregadas) MissoesDados.pronto.then(() => { missoesCarregadas = true; if (document.querySelector("#tela-mesa.ativa")) abrirMesa(); });
    painel = null;
    definirTema(null);
    const lista = todos();
    if (preSelecionados && preSelecionados.length) selecionados = new Set(preSelecionados.slice(0, 1));
    selecionados = new Set([...selecionados].filter((id) => lista.some((p) => p.id === id)).slice(0, 1));
    if (!selecionados.size && lista.length) selecionados = new Set([lista[0].id]);
    const p = lista.find((x) => selecionados.has(x.id));
    if (p) migrarConcluidas(p);
    const andamento = p ? partidas().filter((c) => c.personagens.includes(p.id)) : [];
    let autor = false;
    try { autor = localStorage.getItem("kosmos.autor") === "1"; } catch {}
    const treinos = autor && p ? Object.values(MISSOES).filter((m) => m.tutorial) : [];
    const missoes = Object.values(MISSOES).filter((m) => !m.tutorial);
    const concluidas = p ? p.concluidas || [] : [];
    const emCurso = new Set(andamento.map((c) => c.missao));
    const abertas = p ? missoes.filter((m) => MissoesDados.liberada(m, p) && !concluidas.includes(m.id) && !emCurso.has(m.id)) : [];
    const feitas = p ? missoes.filter((m) => concluidas.includes(m.id)) : [];
    const cartao = (m, rotulo) => `
          <div class="mesa-missao">
            <span class="tag">${esc(m.subtitulo || "")}</span>
            <strong>${esc(m.titulo)}</strong>
            <p class="sub">${esc(typeof m.resumo === "string" ? m.resumo : "")}</p>
            <button class="btn-primario" data-comecar="${m.id}">${rotulo}</button>
          </div>`;
    $("#mesa").innerHTML = `
      <div class="mesa-topo"><button class="btn-texto" data-acao="personagens" aria-label="Personagens">‹</button><h2>A Mesa</h2>${Saves.todos().length ? `<button class="btn-secundario mesa-carregar" data-acao="carregar-jogo">Carregar jogo</button>` : ""}</div>
      ${lista.length ? `
        <h3>Quem joga</h3>
        <div class="mesa-jogadores">${lista.map((x) => `
          <button class="mesa-jogador ${selecionados.has(x.id) ? "escolhida" : ""}" data-jogador="${x.id}">
            <b>${EIXOS[x.origem].glifo}</b><strong>${esc(x.nome)}</strong>
            <span>${esc((profissaoDe(x, x.origem) || { nome: EIXOS[x.origem].papeis[x.papel].nome }).nome)}</span>
          </button>`).join("")}</div>
        ${andamento.length ? `<h3>Em andamento</h3>${andamento.map((c) => `
          <div class="mesa-continuar">
            <div><strong>${esc(MISSOES[c.missao].titulo)}</strong><span>${esc(MISSOES[c.missao].subtitulo || "")}</span></div>
            <button class="btn-primario" data-continuar="${c.id}">Continuar</button>
          </div>`).join("")}` : ""}
        ${abertas.length || !andamento.length ? `<h3>Missões</h3>
        <div class="mesa-missoes">${abertas.map((m) => cartao(m, "Começar")).join("") || `<p class="sub">Nenhuma missão nova liberada para ${esc(p.nome)}.</p>`}</div>` : ""}
        ${treinos.length ? `<h3>Treino do autor</h3><div class="mesa-missoes">${treinos.map((m) => cartao(m, concluidas.includes(m.id) ? "Jogar de novo" : "Começar")).join("")}</div>` : ""}
        ${feitas.length ? `<h3>Já jogadas</h3><div class="mesa-missoes">${feitas.map((m) => cartao(m, "Jogar de novo")).join("")}</div>` : ""}`
      : `<p class="sub">Ainda não há personagens.</p><button class="btn-primario" data-acao="criar">Escolher personagem</button>`}`;
    mostrarTela("tela-mesa");
  }

  // personagens que terminaram missões antes de existir "concluídas" (pelas partidas encerradas)
  function migrarConcluidas(p) {
    if (p.concluidasMigradas) return;
    const feitas = Object.values(lerTodas()).filter((c) => c.fim && c.personagens.includes(p.id)).map((c) => c.missao);
    p.concluidas = [...new Set([...(p.concluidas || []), ...feitas])];
    p.concluidasMigradas = true;
    Armazem.salvar(p);
  }

  function comecar(missaoId) {
    if (!selecionados.size) return avisar("Escolha quem joga.");
    // um personagem só joga uma partida por vez: a antiga dele é encerrada (com confirmação)
    const conflito = partidas().filter((c) => c.personagens.some((id) => selecionados.has(id)));
    if (conflito.length) {
      const nomes = todos().filter((p) => selecionados.has(p.id) && conflito.some((c) => c.personagens.includes(p.id))).map((p) => p.nome);
      if (!confirm(`${nomes.join(", ")} já está numa partida em andamento. Começar uma nova e encerrar a antiga?`)) return;
      const todas = lerTodas();
      conflito.forEach((c) => delete todas[c.id]);
      try {
        localStorage.setItem(CHAVE, JSON.stringify(todas));
      } catch {}
    }
    const m = MISSOES[missaoId];
    camp = {
      id: "c" + Date.now().toString(36), missao: missaoId, personagens: [...selecionados], vez: 0, relogio: 0, pistas: [], feitas: [],
      lugar: m.lugarInicial, cena: m.inicio, flags: {}, rodada: 0, ameaca: null, fim: false,
    };
    // começo de missão: as habilidades voltam (os itens não: os usos deles acabam)
    for (const p of grupo()) {
      Regras.renovar(p, "sessao");
      p.jaJogou = true;
      Armazem.salvar(p);
    }
    if (temCidade()) conhecerLugares(Cidade.idDe(m, m.lugarInicial, grupo()[0]));
    salvar();
    Saves.auto(); // salvamento automático: começo da missão
    resultado = null;
    abrir();
  }

  // ======================= Tela de jogo =======================

  function abrir(id) {
    if (!missoesCarregadas) return MissoesDados.pronto.then(() => { missoesCarregadas = true; abrir(id); });
    if (id) escolherPartida(id);
    if (!carregar() || !MISSOES[camp.missao]) return abrirMesa();
    resultado = null;
    pendente = null;
    painel = null;
    definirTema(missao().eixo);
    mostrarTela("tela-cena");
    // só depois de a tela da cena estar ativa: trocar de tela antes disso dava o jogador como fora da missão
    emJogo = true;
    atualizarTrilha();
    render();
    // tela de carregamento do eixo (a vila de Yudur, a Domus)
    Cinematica.carregamento(missao().eixo, camp.id);
  }

  let viagem = null; // { titulo, linhas } enquanto o jogador está a caminho
  let rolarTopo = true; // a próxima tela de texto começa do alto
  // O texto aparece um pedaço (parágrafo) de cada vez, digitado; as escolhas só no fim
  let lidos = 1;
  let digitadoChave = "";
  let digitando = null; // { terminar }
  let ultimoTexto = "";

  // Chave da arte do palco: a cena da história, a abertura da profissão ou o lugar
  function palcoAtual() {
    const m = missao();
    if (camp.cena) {
      const cena = m.cenas[camp.cena];
      // cada missão tem as suas cenas: a arte leva o nome da missão (prologo-x-cena-salto.webp)
      return { eixo: m.eixo, chave: `${m.id}-cena-${camp.cena}`, titulo: cena.titulo, icone: EIXOS[m.eixo].glifo };
    }
    const lugar = m.lugares[camp.lugar];
    const titulo = texto(lugar.nome, contexto());
    if (camp.lugar === "trabalho" && m.trabalho) {
      const t = m.trabalho(grupo()[0]);
      // sem a arte própria da origem, mostra a do lugar da cidade onde ela fica
      const cid = temCidade() ? Cidade.idDe(m, "trabalho", grupo()[0]) : null;
      return { eixo: m.eixo, chave: `abertura-${t.arte || t.ponto}`, reserva: cid ? `lugar-${cid}` : null, titulo, icone: lugar.icone };
    }
    // o lugar é o da cidade (cidade-x.js): a mesma arte serve para todas as missões que passam por ele
    const cid = temCidade() ? Cidade.idDe(m, camp.lugar, grupo()[0]) : null;
    return { eixo: m.eixo, chave: `lugar-${cid || camp.lugar}`, titulo, icone: lugar.icone };
  }

  function palcoNpc(id) {
    const nome = (missao().npcs || {})[id] || id;
    return { eixo: "npcs", chave: `npc-${id}`, titulo: nome, icone: nome.replace(/^(Dra?\.|Sr\.|Sra\.|Agente|Professora|O|A|Um)\s+/, "").charAt(0), rotulo: nome };
  }

  // Ir a outro lugar: o relógio anda, o palco toca a transição e o jogador chega
  function irPara(destino) {
    const m = missao();
    const linhas = avancarRelogio(custoViagem(destino));
    const daqui = camp.lugar;
    camp.lugar = destino;
    renovarCena();
    if (temCidade()) linhas.push(...conhecerLugares(Cidade.idDe(m, destino, grupo()[0])));
    painel = null;
    salvar();
    const chegada = palcoAtual();
    const temVeiculo = grupo().some((p) => Regras.funciona(p, "veiculo"));
    const caminho = m.caminho ? m.caminho(daqui, destino, temVeiculo) : null;
    viagem = { titulo: chegada.titulo, linhas };
    render();
    Palco.viajar({ eixo: m.eixo, caminho, destino: chegada }).then(() => {
      viagem = null;
      if (!document.querySelector("#tela-cena.ativa")) return; // saiu da missão no meio do caminho
      if (camp.relogio >= m.relogioMax) return entrarCena("chamado");
      Saves.auto(); // salvamento automático: chegou num lugar
      render();
      if (linhas.length) avisar(linhas);
    });
  }

  function render() {
    const m = missao();
    const chaveTexto = `${camp.cena}|${camp.lugar}|${resultado ? resultado.texto : ""}|${viagem ? 1 : 0}`;
    if (chaveTexto !== ultimoTexto) {
      rolarTopo = true;
      lidos = 1;
    }
    ultimoTexto = chaveTexto;
    const ctx = contexto();
    const cena = camp.cena ? m.cenas[camp.cena] : null;
    const lugar = m.lugares[camp.lugar];
    const nomeLugar = cena ? cena.titulo : texto(lugar.nome, ctx);

    // cena com música que ainda não tocou (ou a página recarregou nela): pede para ligar o som
    if (cena && cena.musica && !camp.flags.radioFoiTocado && !camp.flags.pedirSom && !resultado) camp.flags.pedirSom = true;

    let corpo;
    if (viagem) {
      corpo = `
        <h2 class="cena-titulo">Indo para ${esc(viagem.titulo)}</h2>
        <div class="narracao">${paragrafos(m.ambiente ? m.ambiente(camp.relogio) : "")}</div>
        ${viagem.linhas.length ? `<p class="efeitos-resultado">${viagem.linhas.map(esc).join(" · ")}</p>` : ""}`;
    } else if (resultado) {
      corpo = `
        <div class="narracao">${paragrafos(resultado.texto)}</div>
        ${resultado.linhas.length ? `<p class="efeitos-resultado">${resultado.linhas.map(esc).join(" · ")}</p>` : ""}
        <button class="btn-primario" data-acao="seguir">Continuar</button>`;
    } else if (cena && camp.flags.pedirSom) {
      corpo = `
        <div class="narracao"><p>Esta cena tem música. Ela só toca uma vez.</p></div>
        <div class="opcoes">
          <button class="btn-primario" data-acao="ligar-som">Ligar o som</button>
          <button class="btn-texto" data-acao="sem-som">Seguir sem som</button>
        </div>`;
    } else if (cena) {
      corpo = `
        ${imagemHtml(cena.imagem)}
        <h2 class="cena-titulo">${esc(cena.titulo)}</h2>
        <div class="narracao">${paragrafos(texto(cena.texto, ctx))}</div>
        ${cena.tutorial ? `<p class="tutorial">${esc(cena.tutorial)}</p>` : ""}
        ${camp.ameaca !== null && cena.ameaca ? ameacaHtml(cena.ameaca) : ""}
        ${cena.final ? finalHtml() : cena.decifrar ? decifrarHtml(camp.cena, cena.decifrar) : opcoesHtml(opcoesDaCena(cena), false)}`;
    } else {
      const disponiveis = acoesDoLugar();
      corpo = `
        ${imagemHtml(lugar.imagem)}
        <h2 class="cena-titulo">${esc(texto(lugar.nome, ctx))}</h2>
        <div class="narracao">${paragrafos(texto(lugar.descricao, ctx))}<p class="ambiente">${esc(m.ambiente(camp.relogio))}</p></div>
        <p class="pergunta-vez">O que ${esc(ctx.p.nome)} faz?</p>
        ${opcoesHtml(disponiveis, true)}
        <div class="acoes-lugar">
          ${lugar.loja ? `<button class="btn-secundario" data-painel="loja">Comprar aqui</button>` : ""}
          <button class="btn-secundario" data-painel="mapa">Ir para outro lugar</button>
          <button class="btn-secundario" data-acao="escrever" title="Escrever o que o personagem faz">✎ Escrever</button>
          ${camp.pistas.length >= m.pistasParaMarco ? `<button class="btn-primario" data-acao="chamado">${esc(m.marcoTexto || `Seguir a multidão até a ${m.centroMapa ? m.centroMapa.nome : "Praça Central"}`)}</button>` : ""}
        </div>`;
    }

    const livre = !viagem && !resultado && !(cena && (cena.final || cena.decifrar || camp.flags.pedirSom));
    $("#cena").innerHTML = `
      <header class="cena-topo">
        <span class="cena-onde"><b>${EIXOS[m.eixo].glifo}</b> ${esc(m.subtitulo)} · ${esc(nomeLugar)}</span>
        <span class="relogio" title="Relógio de Convergência">${Array.from({ length: m.relogioMax }, (_, i) => `<i class="${i < camp.relogio ? "cheio" : ""}"></i>`).join("")}</span>
        <span class="tag">${esc(m.faseTag || `Fase 1 · ${m.fase}`)}</span>
        <button class="btn-texto narrador-ligar" data-acao="saves" title="Salvar">⛃<span class="rotulo"> Salvar</span></button>
        <button class="btn-texto narrador-ligar" data-acao="opcoes" title="Opções">⚙<span class="rotulo"> Opções</span></button>
      </header>
      <main class="cena-corpo" id="cena-corpo">
        ${corpo}
        ${livre ? livreHtml() : ""}
        ${grupoHtml()}
      </main>
      <nav class="cena-barra" aria-label="Menu da missão">
        <button data-painel="mapa" ${cena ? "disabled" : ""}><b>◎</b><span>Mapa</span></button>
        <button data-painel="diario"><b>✎</b><span>Diário · ${camp.pistas.length}</span></button>
        <button data-painel="bolsa"><b>⛁</b><span>${esc(Vida.dinheiroTexto(m.eixo, Vida.garantir(ativo()).dinheiro[m.eixo]))}</span></button>
        <button data-acao="ficha"><b>☰</b><span>Ficha</span></button>
        <button data-acao="tradutor"><b>${EIXOS[m.eixo].glifo}</b><span>Tradutor</span></button>
        <button data-acao="colecao"><b>◈</b><span>Coleção</span></button>
        <button data-acao="mesa"><b>‹</b><span>Mesa</span></button>
      </nav>
      ${painel ? `<div class="painel-sobre" role="dialog" aria-modal="true">${painelHtml()}</div>` : ""}`;
    aplicarLeitura(chaveTexto);
    // texto novo começa do topo (a área do texto rola sozinha, a página não)
    const corpoEl = document.getElementById("cena-corpo");
    if (corpoEl && rolarTopo) corpoEl.scrollTop = 0;
    rolarTopo = false;
    // quem fala aparece no palco (o retrato); depois o palco volta para o lugar
    if (!viagem) Palco.mostrar(resultado && resultado.npc ? palcoNpc(resultado.npc) : palcoAtual());
    if (!resultado) Vozes.encerrar();
  }

  // O que o narrador lê: título e narração da cena (sem os botões nem os números), parágrafo a parágrafo
  function textoNarrado() {
    if (resultado && resultado.fala && Vozes.ligadas()) return []; // quem fala é o personagem
    return [...document.querySelectorAll("#cena .cena-titulo, #cena .narracao p")]
      .map((el) => ({
        tipo: el.classList.contains("cena-titulo") ? "titulo" : el.classList.contains("ambiente") ? "ambiente" : "texto",
        texto: el.textContent.trim(),
      }))
      .filter((p) => p.texto)
      .map((p) => (p.tipo === "titulo" && !/[.!?…]$/.test(p.texto) ? { ...p, texto: p.texto + "." } : p));
  }

  // Ilustração da cena ou do lugar (campo "imagem": caminho dentro de site/, ex.: "imagens/x/hospital.webp")
  function imagemHtml(src) {
    if (!src) return "";
    if (/\.(mp4|webm)$/i.test(src)) return `<figure class="cena-imagem"><video src="${esc(src)}" autoplay muted loop playsinline></video></figure>`;
    return `<figure class="cena-imagem"><img src="${esc(src)}" alt="" loading="lazy"></figure>`;
  }

  // Mostra um parágrafo por vez; ele é digitado (uma vez). Enquanto houver texto
  // pela frente, no lugar das escolhas aparece um "continuar" dentro do próprio texto.
  function aplicarLeitura(chave) {
    if (digitando) digitando.parar();
    const corpo = document.getElementById("cena-corpo");
    if (!corpo || viagem) return;
    const ps = [...corpo.querySelectorAll(".narracao p")];
    if (!ps.length) return;
    document.getElementById("tela-cena")?.classList.remove("escolhendo");
    lidos = Math.min(Math.max(1, lidos), ps.length);
    ps.forEach((p, i) => (p.hidden = i !== lidos - 1)); // um pedaço de cada vez: só o atual fica na tela
    const resto = [...corpo.querySelectorAll(".opcoes, .decifrar, .livre, .acoes-lugar, .pergunta-vez, .efeitos-resultado, .tutorial, .ameaca, .pendente, .livre-resposta, .cena-grupo, [data-acao='seguir']")];
    const falta = lidos < ps.length;
    const mais = document.createElement("button");
    mais.className = "ler-mais";
    mais.dataset.acao = "ler-mais";
    mais.innerHTML = "Continuar <b>▸</b>";
    ps[ps.length - 1].parentNode.after(mais);
    const fim = () => {
      digitando = null;
      mais.hidden = !falta;
      resto.forEach((e) => (e.hidden = falta));
      // enquanto o jogador escolhe, a imagem do lugar encolhe para as escolhas caberem
      document.getElementById("tela-cena")?.classList.toggle("escolhendo", !falta && !!corpo.querySelector(".opcoes .opcao, .decifrar"));
      if (!falta) paginarOpcoes(chave);
    };
    const chaveP = `${chave}#${lidos}`;
    if (chaveP === digitadoChave || reduzirMovimento) return fim();
    digitadoChave = chaveP;
    mais.hidden = true;
    resto.forEach((e) => (e.hidden = true));
    digitar(ps[lidos - 1], fim);
  }

  // Telas sem rolagem: quando as escolhas não cabem, elas viram páginas ("Mais escolhas ▸").
  let paginaOps = 0, chavePagina = null, tamanhoPagina = 0, alturaVista = 0;
  // quando a área do texto muda de tamanho (o palco encolhe, a janela gira), refaz as páginas
  const observador = typeof ResizeObserver !== "undefined" ? new ResizeObserver((es) => {
    const h = Math.round(es[0].contentRect.height);
    if (h !== alturaVista) { alturaVista = h; paginarOpcoes(); }
  }) : null;
  let observado = null;
  function paginarOpcoes(chave) {
    const corpo = document.getElementById("cena-corpo");
    if (!corpo) return;
    if (observador && observado !== corpo) { if (observado) observador.unobserve(observado); observador.observe(corpo); observado = corpo; alturaVista = corpo.clientHeight; }
    corpo.querySelectorAll(".mais-opcoes").forEach((b) => b.remove());
    const lista = [...corpo.querySelectorAll(".opcoes")].find((l) => l.querySelectorAll(":scope > .opcao").length > 2);
    if (!lista || lista.hidden) return;
    const ops = [...lista.querySelectorAll(":scope > .opcao")];
    if (chave !== undefined && chave !== chavePagina) { chavePagina = chave; paginaOps = 0; }
    ops.forEach((o) => (o.hidden = false));
    const cabe = () => corpo.scrollHeight <= corpo.clientHeight + 1;
    if (cabe()) { tamanhoPagina = ops.length; return; }
    const botao = document.createElement("button");
    botao.className = "btn-secundario mais-opcoes";
    botao.dataset.acao = "mais-opcoes";
    const barra = corpo.querySelector(".acoes-lugar");
    if (barra && !barra.hidden) barra.prepend(botao); else lista.after(botao);
    botao.textContent = "Mais escolhas ▸";
    let n = ops.length;
    while (n > 1) {
      n--;
      ops.forEach((o, i) => (o.hidden = i >= n));
      if (cabe()) break;
    }
    tamanhoPagina = n;
    aplicarPagina();
  }
  function aplicarPagina() {
    const corpo = document.getElementById("cena-corpo");
    const botao = corpo && corpo.querySelector(".mais-opcoes");
    if (!botao) return;
    const lista = [...corpo.querySelectorAll(".opcoes")].find((l) => l.querySelectorAll(":scope > .opcao").length > 2);
    if (!lista) return;
    const ops = [...lista.querySelectorAll(":scope > .opcao")];
    const paginas = Math.ceil(ops.length / tamanhoPagina);
    paginaOps = ((paginaOps % paginas) + paginas) % paginas;
    ops.forEach((o, i) => (o.hidden = Math.floor(i / tamanhoPagina) !== paginaOps));
    botao.innerHTML = `Mais escolhas <b>▸</b> <small>${paginaOps + 1}/${paginas}</small>`;
  }
  window.addEventListener("resize", () => { if (document.querySelector("#cena-corpo .opcoes")) paginarOpcoes(); });

  // escreve o parágrafo letra a letra, com o tique leve a cada poucas letras
  // Fala de personagem (entre aspas): em vez do tique, a voz dele, como nos RPGs antigos
  function digitar(el, fim) {
    const texto = el.textContent;
    el.textContent = "";
    el.classList.add("digitando");
    const npc = resultado && resultado.npc;
    const idFala = resultado && (resultado.fala || resultado.texto.slice(0, 40));
    let dentro = false;
    let i = 0;
    const passo = () => {
      const antes = i;
      i = Math.min(texto.length, i + 2);
      el.textContent = texto.slice(0, i);
      for (const c of texto.slice(antes, i)) {
        if (c === "“") {
          dentro = true;
          if (npc) Vozes.comecar(npc, idFala);
        } else if (c === "”") dentro = false;
      }
      if (dentro && npc) Vozes.silaba(npc);
      else if (i % 6 === 0) Som.tecla();
      if (i >= texto.length) terminar();
    };
    const relogio = setInterval(passo, 28);
    function terminar() {
      clearInterval(relogio);
      el.textContent = texto;
      el.classList.remove("digitando");
      fim();
    }
    digitando = { terminar, parar: () => { clearInterval(relogio); el.textContent = texto; digitando = null; } };
  }

  // Uma ação, ou um lugar, pode aparecer só depois de certas marcas (se: { flag, semFlag, algum, relogioMin })
  function visivel(x) {
    const s = x.se || {};
    const f = camp.flags || {};
    if ([].concat(s.flag || []).some((k) => !f[k])) return false;
    if ([].concat(s.semFlag || []).some((k) => f[k])) return false;
    if (s.algum && ![].concat(s.algum).some((k) => f[k])) return false;
    if (s.relogioMin != null && camp.relogio < s.relogioMin) return false;
    // marcas que o personagem trouxe de missões anteriores (quem salvou, o que levou): vale qualquer um do grupo
    const temMarca = (k) => grupo().some((p) => (p.marcas || []).includes(k));
    if ([].concat(s.marca || []).some((k) => !temMarca(k))) return false;
    if ([].concat(s.semMarca || []).some((k) => temMarca(k))) return false;
    if (s.algumaMarca && ![].concat(s.algumaMarca).some(temMarca)) return false;
    // só para um personagem pronto (a origem dele): vale quem abriu a partida, dono do lugar inicial
    if (s.pronto && grupo()[0].pronto !== s.pronto) return false;
    if (s.semPronto && grupo()[0].pronto) return false; // coisas de escritório que não cabem nas origens
    // só no ponto de entrada da profissão de quem está jogando (as 8 aberturas)
    if (s.ponto && (!missao().trabalho || missao().trabalho(ativo()).ponto !== s.ponto)) return false;
    if ((s.classe || s.rodadaMin != null || s.resMin != null || s.disMin != null || s.tendencia || s.atitudeMin || s.atitudeMax) &&
      !MissoesDados.condicao({ classe: s.classe, rodadaMin: s.rodadaMin, resMin: s.resMin, disMin: s.disMin, tendencia: s.tendencia, atitudeMin: s.atitudeMin, atitudeMax: s.atitudeMax }, { p: ativo(), camp, grupo: grupo() })) return false;
    return true;
  }

  // As escolhas de uma cena que valem agora (as com "Só aparece se…" que não servem somem)
  function opcoesDaCena(cena) {
    return (cena.opcoes || []).filter(visivel);
  }

  // O que dá para fazer neste lugar agora: as ações dele e as que acontecem em toda parte (eventos)
  function acoesDoLugar(id = camp.lugar) {
    const m = missao();
    return [...m.lugares[id].acoes, ...(m.emTodaParte || [])].filter((a) => visivel(a) && !feita(a));
  }

  const lugaresVisiveis = () => Object.entries(missao().lugares).filter(([, l]) => visivel(l));

  // O relógio anda: fome e cansaço chegam, e os eventos da missão acontecem. Devolve as linhas do que mudou.
  function avancarRelogio(n) {
    const m = missao();
    const antes = camp.relogio;
    camp.relogio = Math.min(m.relogioMax, camp.relogio + n);
    const linhas = [];
    // a fome chega com uns 30% da noite; o cansaço, com 60%
    for (const [marca, cond] of [[Math.ceil(m.relogioMax * 0.3), "fome"], [Math.ceil(m.relogioMax * 0.6), "cansaco"]]) {
      if (antes < marca && camp.relogio >= marca) {
        for (const membro of grupo()) if (Vida.condicao(membro, cond)) Armazem.salvar(membro);
        linhas.push(`O tempo passa: todos ${cond === "fome" ? "estão com fome" : "estão cansados"} (−1 dado até resolver)`);
      }
    }
    for (const ev of m.eventosRelogio || []) {
      if (antes < ev.em && camp.relogio >= ev.em) {
        camp.flags[ev.flag] = true;
        linhas.push(ev.texto);
      }
    }
    return linhas;
  }

  function feita(a) {
    return camp.feitas.includes(a.grupo || a.id);
  }

  // ---------- Decifrar (o enigma de tradução) ----------
  // cena.decifrar = { lingua: "x"|"y", modo: "facil"|"dificil", acertou: "cena:…", licao: "cena:…", dissonancia,
  //   palavras: [{ escrita, sentido, id?, respostas?, erradas? }], memoria?, … (outros efeitos ao terminar) }
  // A escrita aparece sempre inteira. A tradução se monta com o que o personagem sabe: palavra sem id (ligação) ou
  // com id conhecido aparece traduzida; as outras viram ▢ e são decifradas uma por vez. O jogador não escreve
  // (decidido pelo autor em 06/11/2026): escolhe entre 4 opções. Fácil: 2 chances; difícil: 1.
  // Errar não custa nada. Acertar ensina a palavra.
  // Falhou de vez numa palavra: Lição (missão com salto no tempo), que traz Dissonância.
  // Abre numa tela própria, por cima da cena (painel "decifrar").
  const DECIFRAR = { opcoes: 4, escolhas: { facil: 2, dificil: 1 } };
  const chancesDe = (d) => DECIFRAR.escolhas[d.modo] || DECIFRAR.escolhas.facil;
  const normal = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  let avisoDecifrar = "";
  let palavraEscolhida = null;

  function sabeId(p, lingua, id) {
    if (!id) return true;
    if (lingua === "y") return (p.vocabY || []).includes(id);
    return (p.linguas?.[lingua || "x"] || []).includes(id);
  }
  function estadoDecifrar(chave) {
    camp.decifrar = camp.decifrar || {};
    return (camp.decifrar[chave] = camp.decifrar[chave] || { palavras: {} });
  }
  // estado de cada palavra: conhecida, resolvida, ou com tentativas
  function aprenderPalavra(p, d, w) {
    if (!w.id) return;
    if (d.lingua === "y") p.vocabY = [...new Set([...(p.vocabY || []), w.id])];
    else { p.linguas = p.linguas || { x: [], z: [] }; p.linguas[d.lingua || "x"] = [...new Set([...(p.linguas[d.lingua || "x"] || []), w.id])]; }
  }
  function situacaoPalavras(chave, d) {
    const p = ativo();
    const e = estadoDecifrar(chave);
    // voltou da Lição: as palavras que faltavam foram aprendidas lá
    if (e.pendente && !resultado) {
      for (const i of e.pendente) {
        const w = (d.palavras || [])[i];
        if (!w) continue;
        e.palavras[i] = { ...(e.palavras[i] || {}), ok: true };
        aprenderPalavra(p, d, w);
      }
      fichaMudou(p, e.pendente.map((i) => d.palavras[i] && `Aprendeu na Lição: ${d.palavras[i].escrita} = ${d.palavras[i].sentido}`).filter(Boolean));
      delete e.pendente;
      salvar();
    }
    return (d.palavras || []).map((w, i) => {
      const s = (e.palavras[i] = e.palavras[i] || { esc: 0, erradas: [] });
      const sabe = sabeId(p, d.lingua, w.id) || s.ok;
      const perdida = !sabe && s.esc >= chancesDe(d);
      return { ...w, i, s, sabe, perdida };
    });
  }
  function opcoesDe(w) {
    const certa = [].concat(w.respostas || [w.sentido])[0] || "";
    const lista = [certa, ...(w.erradas || []).slice(0, DECIFRAR.opcoes - 1)];
    const giro = 1 + ([...String(w.escrita || "")].reduce((s, c) => s + c.charCodeAt(0), 0) % (lista.length - 1 || 1));
    return [...lista.slice(giro), ...lista.slice(0, giro)];
  }
  // na cena: a escrita inteira e o botão que abre a tela do Decifrar
  function decifrarHtml(chave, d) {
    const ps = situacaoPalavras(chave, d);
    const faltam = ps.filter((w) => !w.sabe).length;
    return `<div class="decifrar dec-resumo">
      <p class="dec-frase"><span class="dec-lingua">${{ x: "Código Urbano", y: "Runas", z: "Interface" }[d.lingua || "x"]}</span> ${ps.map((w) => esc(w.escrita)).join(" ")}</p>
      <button class="btn-primario" data-painel="decifrar">${faltam ? `Decifrar <b>▸</b> <small>${faltam} ${faltam === 1 ? "palavra" : "palavras"}</small>` : "Ler <b>▸</b>"}</button>
    </div>`;
  }
  // a tela própria
  function decifrarPainelHtml() {
    const cena = missao().cenas[camp.cena];
    const d = cena && cena.decifrar;
    if (!d) return "";
    const ps = situacaoPalavras(camp.cena, d);
    const faltam = ps.filter((w) => !w.sabe);
    const perdida = ps.find((w) => w.perdida);
    if (!faltam.some((w) => w.i === palavraEscolhida) || perdida) palavraEscolhida = (faltam.find((w) => !w.perdida) || {}).i ?? null;
    let n = 0;
    const numero = {};
    ps.forEach((w) => { if (w.id) numero[w.i] = ++n; }); // número fixo por palavra (não muda quando outra é decifrada)
    const traducao = ps.map((w) => (w.sabe ? `<span class="dec-sabe">${esc(w.sentido)}</span>`
      : `<button class="dec-lacuna ${w.i === palavraEscolhida ? "escolhida" : ""}" data-dec-palavra="${w.i}" ${w.perdida ? "disabled" : ""}>▢${numero[w.i]}</button>`)).join(" ");
    const escrita = ps.map((w) => `<span class="${w.sabe ? "" : w.i === palavraEscolhida ? "dec-alvo" : "dec-falta"}">${esc(w.escrita)}</span>`).join(" ");
    let corpo = "";
    if (perdida) {
      corpo = `<p class="dec-tent">“${esc(perdida.escrita)}” não se abre. Falta aprender essa palavra.</p>
        <button class="btn-primario" data-acao="decifrar-licao">Lição <b>▸</b></button>`;
    } else if (!faltam.length) {
      corpo = `<button class="btn-primario" data-acao="decifrar-ok">Continuar <b>▸</b></button>`;
    } else {
      const w = ps[palavraEscolhida];
      const resta = chancesDe(d) - w.s.esc;
      corpo = `<p class="dec-tent">▢${numero[w.i]} = <b class="dec-alvo">${esc(w.escrita)}</b></p>
           <p class="dec-tent">Escolha (${resta} ${resta === 1 ? "chance" : "chances"}):</p>
           <div class="chips dec-opcoes">${opcoesDe(w).map((o) => `<button class="chip" data-decifrar-op="${esc(o)}" ${w.s.erradas.includes(o) ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
    }
    const aviso = avisoDecifrar;
    avisoDecifrar = "";
    return `<div class="cena-painel dec-painel">
      <h3>Decifrar <button class="btn-texto" data-painel="">Fechar</button></h3>
      <div class="decifrar">
        <p class="dec-frase"><span class="dec-lingua">${{ x: "Código Urbano", y: "Runas", z: "Interface" }[d.lingua || "x"]}</span> ${escrita}</p>
        <p class="dec-trad">${traducao}</p>
        ${aviso ? `<p class="dec-aviso">${esc(aviso)}</p>` : ""}
        ${corpo}
      </div>
      <p class="dica">${faltam.length ? "Toque num ▢ para escolher a palavra. Errar não custa nada." : "Você leu a frase inteira."}</p>
    </div>`;
  }
  function tentarDecifrar(resposta) {
    const cena = missao().cenas[camp.cena];
    const d = cena && cena.decifrar;
    if (!d || palavraEscolhida == null || !normal(resposta)) return;
    const w = d.palavras[palavraEscolhida];
    const s = estadoDecifrar(camp.cena).palavras[palavraEscolhida];
    const ok = [].concat(w.respostas || [w.sentido]).some((r) => normal(r) === normal(resposta));
    if (ok) {
      s.ok = true;
      // acertar ensina a palavra (vale para as próximas frases e para o Tradutor)
      if (w.id) {
        const p = ativo();
        aprenderPalavra(p, d, w);
        fichaMudou(p, []); // a própria tradução mostra o que foi aprendido (sem aviso por cima da tela)
      }
      avisoDecifrar = "";
    } else {
      s.esc++;
      s.erradas.push(resposta);
      avisoDecifrar = `“${resposta}” não fecha a frase.`;
    }
    salvar();
    render();
  }
  function concluirDecifrar(licao) {
    const cena = missao().cenas[camp.cena];
    const d = cena.decifrar;
    const { lingua, palavras, modo, acertou, licao: irLicao, dissonancia, ...efeitos } = d;
    painel = null;
    if (licao) {
      const e = estadoDecifrar(camp.cena);
      e.pendente = situacaoPalavras(camp.cena, d).filter((w) => w.perdida).map((w) => w.i);
      salvar();
      return resolver({ id: "decifrar-licao" }, {
        texto: "Você olha para a frase até as letras perderem o sentido. A palavra está ali, em algum lugar, e você não alcança.",
        efeitos: { dissonancia: dissonancia ?? 1 }, ir: irLicao,
      }, false);
    }
    resolver({ id: "decifrar" }, { texto: (palavras || []).map((w) => w.sentido).join(" "), efeitos, ir: acertou }, false);
  }

  // ---------- Opções ----------

  function bloqueio(op, p) {
    const r = op.req || {};
    if (r.item && !Regras.funciona(p, r.item))
      return p.itens.includes(r.item) ? `${Regras.equip(r.item).nomes[missao().eixo]} ${Regras.equip(r.item).recarga ? "sem carga" : "sem uso"}` : `requer ${Regras.equip(r.item).nomes[missao().eixo]}`;
    if (r.semItem && Regras.funciona(p, r.semItem)) return "você tem um jeito melhor";
    if (r.hab && !p.habs.includes(r.hab)) return `requer ${Regras.hab(r.hab).nomes[missao().eixo]}`;
    if (r.res && p.ressonancia < r.res) return `requer Ressonância ${r.res}`;
    if (r.dis && p.dissonancia < r.dis) return `requer Dissonância ${r.dis}`;
    if (r.dinheiro && Vida.garantir(p).dinheiro[missao().eixo] < r.dinheiro) return `custa ${Vida.dinheiroTexto(missao().eixo, r.dinheiro)}`;
    if (r.pertence && !Vida.tem(p, r.pertence)) return `requer ${Vida.nome(r.pertence, missao().eixo)}`;
    if (r.condicao && !Vida.garantir(p).condicoes.includes(r.condicao)) return `só se estiver ${CONDICOES[r.condicao].nome.toLowerCase()}`;
    if (op.situacao) {
      const s = SITUACOES.find((x) => x.id === op.situacao);
      if (s.tags.includes("social") && Regras.bloqueado(p, "conversa")) return "bloqueada pela Paranoia";
    }
    return "";
  }

  function rotuloTeste(op, p) {
    if (op.convergencia) return `<span class="op-info">Convergência · intensidade ${op.convergencia}</span>`;
    if (op.situacao) {
      const c = Dados.chanceDe(p, missao().eixo, op.situacao);
      const attr = EIXOS[missao().eixo].atributos[c.situacao.atributo].nome;
      return `<span class="op-info">${attr} · ${esc(c.situacao.nome.toLowerCase())}</span>
        <span class="chance chance-${c.rotulo.toLowerCase().replace(/\s+/g, "-")}">${c.rotulo} ${Math.round(c.chance * 100)}%</span>`;
    }
    if (op.req && op.req.dinheiro) return `<span class="op-info">custa ${esc(Vida.dinheiroTexto(missao().eixo, op.req.dinheiro))}</span>`;
    return `<span class="op-info">${op.comum ? "ação comum" : "sem teste"}</span>`;
  }

  function opcoesHtml(lista, doLugar) {
    const p = ativo();
    // opções travadas de "semItem" somem (são alternativas), as outras aparecem com o motivo
    const visiveis = lista.filter((op) => !(op.req && op.req.semItem && Regras.funciona(p, op.req.semItem)));
    if (!visiveis.length) return `<p class="sub">Não há mais nada a fazer aqui por enquanto.</p>`;
    return `<div class="opcoes">${visiveis.map((op) => {
      const motivo = bloqueio(op, p);
      const indice = lista.indexOf(op);
      const tempo = doLugar ? (op.tempo ?? (op.comum ? 0 : 1)) : 0;
      return `<button class="opcao ${motivo ? "travada" : ""}" data-opcao="${indice}" data-lugar="${doLugar ? 1 : 0}" ${motivo ? "disabled" : ""}>
        <span class="op-texto">${motivo ? "🔒 " : ""}${esc(MissoesDados.textoOpcao(op, contexto()))}</span>
        ${motivo ? `<span class="op-info">${esc(motivo)}</span>` : rotuloTeste(op, p)}
        ${tempo ? `<span class="op-tempo" title="Avança o relógio">+${tempo}</span>` : ""}
      </button>`;
    }).join("")}</div>`;
  }

  function ameacaHtml(max) {
    const v = Math.max(0, camp.ameaca);
    return `<p class="ameaca"><span>Ameaça</span>${Array.from({ length: max }, (_, i) => `<i class="${i < v ? "cheio" : ""}"></i>`).join("")}</p>`;
  }

  function finalHtml() {
    const m = missao();
    const prox = m.proxima && MISSOES[m.proxima];
    const p = grupo()[0];
    const podeSeguir = prox && p && MissoesDados.liberada(prox, p);
    return `<div class="opcoes">
      ${podeSeguir ? `<button class="btn-primario" data-comecar-proxima="${prox.id}">Próxima missão: ${esc(prox.titulo)}</button>` : ""}
      <button class="${podeSeguir ? "btn-secundario" : "btn-primario"}" data-acao="ficha-final">Ver a ficha</button>
      <button class="btn-secundario" data-acao="mesa">Voltar à Mesa</button>
    </div>
    <p class="dica">${esc(missao().textoFinal || "Fim do prólogo. O Eixo Y foi revelado na ficha de quem jogou.")}</p>`;
  }

  function grupoHtml() {
    const g = grupo();
    const m = missao();
    return `<footer class="cena-grupo">${g.map((p, i) => `
      <div class="membro ${i === camp.vez % g.length ? "da-vez" : ""}">
        <strong>${esc(p.nome)}${i === camp.vez % g.length && g.length > 1 ? " · vez" : ""}</strong>
        <span>${EIXOS[m.eixo].exposicao.nome} ${p.exposicao[m.eixo]} · Res ${p.ressonancia} · Dis ${p.dissonancia}</span>
        ${(p.condicoes || []).length ? `<span class="condicoes-mini">${p.condicoes.map((c) => esc(CONDICOES[c].nome)).join(" · ")}</span>` : ""}
      </div>`).join("")}</footer>`;
  }

  function livreHtml() {
    return `
      ${pendente ? `<div class="pendente"><span>Entendi: <b>${esc(pendente.rotulo)}</b></span>
          <button class="btn-primario" data-acao="confirmar">Fazer isso</button>
          <button class="btn-texto" data-acao="cancelar">Não era isso</button></div>` : ""}
      ${mensagemLivre ? `<p class="livre-resposta">${esc(mensagemLivre)}</p>` : ""}
      <form class="livre ${camp.lugar && !(camp.cena) && !resultado && !mensagemLivre && !pendente ? "recolhido" : ""}" id="form-livre">
        <input id="texto-livre" placeholder="Ou escreva o que ${esc(ativo().nome)} faz…" autocomplete="off">
        <button class="btn-secundario">Agir</button>
      </form>`;
  }

  // ---------- Painéis ----------

  function painelHtml() {
    const m = missao();
    const ctx = contexto();
    if (painel === "diario") {
      return `<div class="cena-painel">
        <h3>Diário <button class="btn-texto" data-painel="">Fechar</button></h3>
        ${questsHtml()}
        <h4 class="diario-sub">O que você sabe</h4>
        ${camp.pistas.length ? `<ul class="pistas">${camp.pistas.map((x) => `<li>${esc(x.texto)}</li>`).join("")}</ul>` : `<p class="sub">Nenhuma pista ainda.</p>`}
        <p class="dica">${esc(m.marcoDica || `Com ${m.pistasParaMarco} pistas você pode seguir a multidão quando quiser. Com o relógio cheio, não há mais escolha.`)}</p>
      </div>`;
    }
    if (painel === "decifrar") return decifrarPainelHtml();
    if (painel === "bolsa") return bolsaHtml();
    if (painel === "loja") return lojaHtml();
    const custo = custoViagem();
    // a cidade: posição fixa de cada lugar, o que o grupo conhece e o que ainda é "?"
    const cidade = temCidade();
    const conhecidos = cidade ? conhecidosDoGrupo() : [];
    const naMissao = new Set();
    const nosDaMissao = lugaresVisiveis().map(([id, l]) => {
      const cid = cidade ? Cidade.idDe(m, id, grupo()[0]) : null;
      const pos = cid ? Cidade.lugar(cid) : l.mapa;
      if (cid) naMissao.add(cid);
      const novo = !!cid && !conhecidos.includes(cid) && id !== camp.lugar;
      return {
        id, icone: esc(l.icone), nome: esc(texto(l.nome, ctx)), x: pos.x, y: pos.y,
        atual: id === camp.lugar, pendentes: acoesDoLugar(id).filter((a) => !a.comum).length,
        desconhecido: novo, bairro: novo ? esc(Cidade.dados.bairros[Cidade.lugar(cid).bairro].nome) : "",
        dica: novo ? "Você ainda não conhece este lugar: achar o caminho custa +1 no relógio." : "",
      };
    });
    const nosFora = conhecidos.filter((cid) => !naMissao.has(cid)).map((cid) => {
      const l = Cidade.lugar(cid);
      return { id: cid, nome: esc(l.nome), icone: esc(l.icone), x: l.x, y: l.y, fora: true };
    });
    // mapa ilustrado (desenhado pelo jogo) quando o eixo e os lugares têm posição; senão, a lista
    const ilustrado = m.centroMapa && Object.values(m.lugares).every((l) => l.mapa) && Mapas.html({
      eixo: m.eixo,
      centro: { ...m.centroMapa, nome: esc(m.centroMapa.nome) },
      tensao: camp.relogio / m.relogioMax,
      lugares: [...nosFora, ...nosDaMissao],
      bairros: cidade ? Cidade.bairros(conhecidos).map((b) => ({ ...b, nome: esc(b.nome) })) : [],
    });
    if (ilustrado) {
      return `<div class="cena-painel">
        <h3>Mapa <button class="btn-texto" data-painel="">Fechar</button></h3>
        <p class="sub">${custo ? "Ir a outro lugar avança o relógio em 1." : "Com o carro, ir a outro lugar não gasta tempo."} ${esc(m.mapaDica || `Todos parecem ir para a ${m.centroMapa.nome}.`)}</p>
        ${ilustrado}
      </div>`;
    }
    return `<div class="cena-painel">
      <h3>Mapa <button class="btn-texto" data-painel="">Fechar</button></h3>
      <p class="sub">${custo ? "Ir a outro lugar avança o relógio em 1." : "Com o carro, ir a outro lugar não gasta tempo."}</p>
      <div class="mapa">${lugaresVisiveis().map(([id, l]) => `
        <button class="lugar ${id === camp.lugar ? "atual" : ""}" data-ir="${id}" ${id === camp.lugar ? "disabled" : ""}>
          <b>${esc(l.icone)}</b><strong>${esc(texto(l.nome, ctx))}</strong>
          <span>${acoesDoLugar(id).filter((a) => !a.comum).length} coisas a fazer</span>
        </button>`).join("")}
        ${m.centroMapa ? `<button class="lugar trancado" disabled><b>◉</b><strong>${esc(m.centroMapa.nome)}</strong><span>${esc(m.mapaDica || "todos parecem ir para lá")}</span></button>` : ""}
      </div>
    </div>`;
  }

  // Linhas de missão (side quests) abertas e fechadas, com o prazo: curta, média, longa
  function questsHtml() {
    const qs = Object.values(camp.quests || {});
    if (!qs.length) return "";
    const prazo = { curta: "termina no prólogo", media: "continua no Ato 1", longa: "vai longe" };
    const estado = { aberta: "em aberto", concluida: "concluída", perdida: "perdida" };
    return `<h4 class="diario-sub">Linhas</h4><ul class="quests">${qs.map((q) => `
      <li class="quest-${q.estado || "aberta"}"><strong>${esc(q.nome)}</strong>
        <span class="tag">${esc(estado[q.estado || "aberta"])}</span> <span class="sub">${esc(prazo[q.prazo] || "")}</span>
        ${q.nota ? `<small>${esc(q.nota)}</small>` : ""}</li>`).join("")}</ul>`;
  }

  // Bolsa de quem está na vez: dinheiro deste eixo, pertences e condições
  function bolsaHtml() {
    const p = Vida.garantir(ativo());
    const e = missao().eixo;
    const itens = Object.entries(p.pertences);
    return `<div class="cena-painel">
      <h3>Bolsa de ${esc(p.nome)} <button class="btn-texto" data-painel="">Fechar</button></h3>
      <p class="carteira"><strong>${esc(Vida.dinheiroTexto(e, p.dinheiro[e]))}</strong> <span class="sub">· bolsa ${Vida.naBolsa(p)}/${BOLSA_MAX}</span></p>
      <h4 class="diario-sub">Equipamento <small>carga ${Regras.carga(p)}/${Regras.cargaMax(p)}</small></h4>
      ${p.itens.length ? Vida.grade(p.itens.map((k) => {
        const it = Regras.equip(k);
        const resta = Regras.usosRestantes(p, k);
        return { chave: k, eixo: e, nome: it.nomes[e], badge: `${resta}/${it.usos}`, apagado: !resta,
          efeito: `${it.efeito}${resta ? "" : it.recarga ? " · sem carga" : " · sem uso"}` };
      })) : `<p class="sub">Nenhum equipamento.</p>`}
      <h4 class="diario-sub">Pertences</h4>
      ${itens.length ? Vida.grade(itens.map(([k, n]) => ({ chave: k, eixo: e, nome: Vida.nome(k, e), badge: n > 1 ? `×${n}` : "",
        efeito: Vida.pertence(k).efeito, botao: `<button class="btn-secundario" data-usar-pertence="${k}">Usar</button>` })))
        : `<p class="sub">Nada na bolsa. Compre em lojas ou procure pelos lugares.</p>`}
      ${p.condicoes.length ? `<p class="condicoes">${p.condicoes.map((c) => `<span class="condicao">${esc(CONDICOES[c].nome)} · resolve com ${esc(CONDICOES[c].resolve)}</span>`).join("")}</p>` : `<p class="sub">Sem fome, sem cansaço, sem ferimentos.</p>`}
    </div>`;
  }

  function lojaHtml() {
    const p = Vida.garantir(ativo());
    const e = missao().eixo;
    const lugar = missao().lugares[camp.lugar];
    return `<div class="cena-painel">
      <h3>${esc(lugar.loja.nome || "Comprar")} <button class="btn-texto" data-painel="">Fechar</button></h3>
      <p class="carteira">${esc(p.nome)} tem <strong>${esc(Vida.dinheiroTexto(e, p.dinheiro[e]))}</strong> <span class="sub">· bolsa ${Vida.naBolsa(p)}/${BOLSA_MAX}</span></p>
      <ul class="pertences loja">${lugar.loja.itens.map((o, i) => {
        const motivo = Vida.podeComprar(p, o, e);
        const desc = o.pertence ? Vida.pertence(o.pertence).efeito : Regras.equip(o.equip).efeito;
        return `<li class="com-arte">${Vida.arte(o.pertence || o.equip, e, Vida.nomeOferta(o, e))}<span>${esc(Vida.nomeOferta(o, e))}</span><small>${esc(desc)}</small>
          <button class="btn-secundario" data-comprar="${i}" ${motivo ? "disabled" : ""}>${motivo ? esc(motivo) : esc(Vida.dinheiroTexto(e, Vida.preco(o, e)))}</button></li>`;
      }).join("")}</ul>
      <p class="dica">Comprar não gasta tempo.</p>
    </div>`;
  }

  function custoViagem(destino) {
    const base = grupo().some((p) => Regras.funciona(p, "veiculo")) ? 0 : 1;
    // lugar que ninguém do grupo conhece: +1 para achar o caminho
    return base + (camp.flags.multidoes ? 1 : 0) + (destino && desconhecido(destino) ? 1 : 0); // ruas cheias: tudo demora mais
  }

  // ---------- O mapa da cidade (cidade-x.js): o que o grupo conhece ----------
  const temCidade = () => typeof Cidade !== "undefined" && missao().eixo === "x";
  const conhecidosDoGrupo = () => [...new Set(grupo().flatMap((p) => Cidade.garantir(p)))];
  function desconhecido(lugarId) {
    if (!temCidade()) return false;
    const cid = Cidade.idDe(missao(), lugarId, grupo()[0]);
    return !!cid && !conhecidosDoGrupo().includes(cid);
  }
  // todos do grupo passam a conhecer estes lugares da cidade; devolve as linhas para mostrar
  function conhecerLugares(cids) {
    if (!temCidade()) return [];
    const nomes = new Set();
    for (const p of grupo()) {
      Cidade.conhecer(p, cids).forEach((n) => nomes.add(n));
      Armazem.salvar(p);
    }
    return [...nomes].map((n) => `Novo lugar no mapa: ${n}`);
  }

  // ======================= Ações =======================

  function executar(op, doLugar) {
    pendente = null;
    mensagemLivre = "";
    const p = ativo();
    if (bloqueio(op, p)) return;
    const eixo = missao().eixo;
    const g = grupo();
    if (op.convergencia) {
      Dados.abrirConvergencia(p, eixo, {
        intensidade: op.convergencia, podeAjudar: g.length > 1,
        aoTerminar: (r) => resolver(op, r.passou ? op.sucesso : op.falha, doLugar),
      });
    } else if (op.situacao) {
      Dados.abrirTeste(p, eixo, null, {
        situacao: op.situacao, podeAjudar: g.length > 1,
        aoTerminar: (r) => resolver(op, r.passou ? op.sucesso : op.falha, doLugar),
      });
    } else resolver(op, typeof op.resultado === "function" ? op.resultado(contexto()) : op.resultado, doLugar);
  }

  function resolver(op, res, doLugar) {
    carregar();
    const campo = res === op.sucesso ? "sucesso" : res === op.falha ? "falha" : "resultado";
    res = MissoesDados.resultado(res || {}, contexto()) || {};
    const m = missao();
    const p = ativo(); // recarregado: já inclui o que o teste de dados mudou
    const efeitos = res.efeitos || {};
    const linhas = [];
    const exp = EIXOS[m.eixo].exposicao.nome;

    // Escolha que pede um equipamento gasta 1 uso dele (regra dos itens: todo item tem usos).
    const itemPedido = op.req && op.req.item;
    if (itemPedido && p.itens.includes(itemPedido)) {
      const nomeItem = Regras.equip(itemPedido).nomes[m.eixo];
      const fim = Regras.gastarItem(p, itemPedido);
      linhas.push(fim === "acabou" ? `${nomeItem}: acabou.` : fim === "zerou" ? `${nomeItem}: ${Regras.equip(itemPedido).recarga ? "sem carga" : "sem uso"}.` : `${nomeItem}: −1 uso.`);
    }

    if (doLugar) {
      if (!op.repetivel) camp.feitas.push(op.grupo || op.id);
      const tinha = [...(p.condicoes || [])];
      linhas.push(...avancarRelogio(op.tempo ?? (op.comum ? 0 : 1)));
      // quem agiu também sente o tempo (a cópia salva por avancarRelogio é recarregada aqui)
      const salvo = todos().find((x) => x.id === p.id);
      if (salvo) for (const c of salvo.condicoes || []) if (!tinha.includes(c)) Vida.condicao(p, c);
    }
    Vida.garantir(p);
    if (efeitos.dinheiro) {
      Vida.mudarDinheiro(p, m.eixo, efeitos.dinheiro);
      linhas.push(`${efeitos.dinheiro > 0 ? "+" : "−"}${Vida.dinheiroTexto(m.eixo, Math.abs(efeitos.dinheiro))}`);
    }
    for (const [chave, qtd] of Object.entries(efeitos.pertence || {})) {
      const ganhou = Vida.ganhar(p, chave, qtd);
      linhas.push(ganhou ? `Ganhou: ${Vida.nome(chave, m.eixo)}${ganhou > 1 ? " ×" + ganhou : ""}` : `Bolsa cheia: ${Vida.nome(chave, m.eixo)} ficou para trás`);
    }
    if (efeitos.consumir) Vida.tirar(p, efeitos.consumir);
    for (const c of [].concat(efeitos.condicao || [])) {
      const l = Vida.condicao(p, c);
      if (l) linhas.push(l);
    }
    if (efeitos.renovarItens) {
      const feitos = Regras.recarregar(p);
      if (feitos.length) linhas.push(`Recarregado: ${feitos.map((k) => Regras.equip(k).nomes[m.eixo]).join(", ")}`);
    }
    if (efeitos.exposicao) {
      p.exposicao[m.eixo] = Math.max(0, Math.min(REGRAS.exposicaoMax, p.exposicao[m.eixo] + efeitos.exposicao));
      linhas.push(`${efeitos.exposicao > 0 ? "+" : ""}${efeitos.exposicao} ${exp}`);
    }
    // Dormir (e qualquer ação que se repete) baixa a Dissonância só 1 vez por missão
    let disEfeito = +efeitos.dissonancia || 0;
    if (disEfeito < 0 && op.repetivel && (p.dissonancia || 0) > 0 && !Regras.alivio(p, "repetivel", REGRAS.alivioDormirPorMissao)) {
      disEfeito = 0;
      linhas.push("A Dissonância não baixa de novo: o descanso só alivia 1 vez por missão.");
    }
    for (const [chave, nome, n] of [["ressonancia", "Ressonância", +efeitos.ressonancia || 0], ["dissonancia", "Dissonância", disEfeito]]) {
      if (!n) continue;
      const mudou = chave === "ressonancia" ? Regras.mudarRes(p, n) : Regras.mudarDis(p, n);
      if (mudou) linhas.push(`${mudou > 0 ? "+" : ""}${mudou} ${nome}`);
    }
    if (efeitos.item) {
      const nomeItem = Regras.equip(efeitos.item).nomes[m.eixo];
      const r = Regras.darItem(p, efeitos.item);
      linhas.push(r.erro ? `Sem espaço para ${nomeItem}` : r.recarregou ? `${nomeItem}: usos cheios de novo (${Regras.cargas(p, efeitos.item)})` : `Ganhou: ${nomeItem} (${Regras.cargas(p, efeitos.item)} usos)`);
    }
    if (efeitos.aprenderX) {
      const novos = efeitos.aprenderX.filter((id) => !p.linguas.x.includes(id));
      p.linguas.x.push(...novos);
      if (novos.length) {
        const nomes = Lingua.elementos("x").filter((e) => novos.includes(e.id)).map((e) => `${e.s} ${e.nome}`);
        linhas.push(`Aprendeu no Código Urbano: ${nomes.join(", ")}`);
      }
    }
    if (efeitos.aprenderY) {
      // palavras de runa (Yudur): ficam guardadas pelas runas de cada palavra
      const novas = [].concat(efeitos.aprenderY).filter((r) => r && !(p.vocabY || []).includes(r));
      p.vocabY = [...(p.vocabY || []), ...novas];
      if (novas.length) linhas.push(`Aprendeu em runas: ${novas.join(" · ")}`);
    }
    if (efeitos.memoria) {
      // Memórias Cruzadas só chegam com Ressonância suficiente
      if (p.ressonancia >= (efeitos.memoriaMin || 0)) {
        p.memorias = (p.memorias ? p.memorias + "\n" : "") + efeitos.memoria;
        linhas.push("Nova Memória Cruzada");
      } else linhas.push("Uma sensação de já ter vivido isso, mas a lembrança não vem (precisa de mais Ressonância)");
    }
    // documento de lore: entra na Coleção e abre para ler na hora
    for (const id of [].concat(efeitos.documento || [])) {
      const r = typeof Colecao !== "undefined" ? Colecao.documento(id) : { doc: null };
      if (!r.doc) continue;
      linhas.push(r.novo ? `◈ Novo texto na Coleção: ${r.doc.titulo}` : `◈ ${r.doc.titulo} (já está na Coleção)`);
      if (r.novo) setTimeout(() => Colecao.ler(id), 700);
    }
    if (efeitos.revela && temCidade()) {
      linhas.push(...conhecerLugares(efeitos.revela));
      Object.assign(p, { mapa: todos().find((x) => x.id === p.id).mapa }); // p é uma cópia: traz o mapa novo
    }
    // atitude dos NPCs com o personagem: fica na ficha, de missão em missão
    for (const [npc, n] of Object.entries(efeitos.atitude || {})) {
      if (!n) continue;
      p.atitudes = { ...(p.atitudes || {}), [npc]: ((p.atitudes || {})[npc] || 0) + n };
      const quem = (m.npcs || {})[npc] || npc;
      linhas.push(n > 0 ? `${quem} gostou disso (+${n})` : `${quem} não gostou nada disso (${n})`);
    }
    for (const f of [].concat(efeitos.flag || [])) camp.flags[f] = true;
    for (const f of [].concat(efeitos.tirarFlag || [])) delete camp.flags[f];
    // marca no personagem: fica para as próximas missões (quem ele salvou, o que ele levou)
    for (const mc of [].concat(efeitos.marca || [])) {
      p.marcas = [...new Set([...(p.marcas || []), mc])];
    }
    if (efeitos.quest) {
      camp.quests = camp.quests || {};
      const q = efeitos.quest;
      const antes = camp.quests[q.id];
      camp.quests[q.id] = { ...(antes || {}), ...q };
      const st = camp.quests[q.id];
      if (!antes && !q.estado) linhas.push(`Nova linha no Diário: ${st.nome}`);
      else if (q.estado === "concluida") linhas.push(`Concluída: ${st.nome}`);
      else if (q.estado === "perdida") linhas.push(`Perdida: ${st.nome}`);
      else if (q.nota) linhas.push(`Diário: ${st.nome}`);
    }
    if (efeitos.ameaca) camp.ameaca = Math.max(0, (camp.ameaca ?? 0) + efeitos.ameaca);
    if (res.pista && !camp.pistas.some((x) => x.texto === res.pista)) {
      camp.pistas.push({ texto: res.pista });
      linhas.push("Nova pista no Diário");
    }
    fichaMudou(p);

    // próximo destino
    let ir = res.ir || null;
    if (op.rodada) {
      camp.rodada++;
      if (camp.ameaca <= 0 || camp.rodada >= 2) ir = "cena:salto";
    }
    camp.vez = (camp.vez + 1) % grupo().length;
    // com pistas suficientes o jogador PODE seguir para o centro quando quiser; com o relógio cheio, não há escolha
    if (doLugar && !ir && camp.relogio >= m.relogioMax) ir = "cena:chamado";
    salvar();

    const quem = p.id; // o teste de Convergência é de quem agiu, não do próximo da vez
    const depois = () => {
      resultado = null;
      if (efeitos.convergencia) {
        const alvo = grupo().find((x) => x.id === quem);
        Dados.abrirConvergencia(alvo, m.eixo, { intensidade: efeitos.convergencia, podeAjudar: grupo().length > 1, aoTerminar: () => ir_(ir) });
      } else ir_(ir);
    };
    const t = texto(res.texto, contexto());
    if (t || linhas.length) {
      const npc = res.npc || op.npc;
      resultado = { texto: t || "…", linhas, depois, npc, fala: npc && op.id ? `${op.id}-${campo}` : null };
      render();
    } else depois();
  }

  function ir_(destino) {
    carregar();
    if (destino && destino.startsWith("cena:")) return entrarCena(destino.slice(5));
    if (destino && destino.startsWith("lugar:")) {
      camp.cena = null;
      camp.lugar = destino.slice(6);
    }
    salvar();
    render();
  }

  // Habilidades "por cena" voltam a cada cena da história e a cada troca de lugar
  function renovarCena() {
    for (const p of grupo()) {
      Regras.renovar(p, "cena");
      Armazem.salvar(p);
    }
  }

  function entrarCena(id) {
    const m = missao();
    const cena = m.cenas[id];
    camp.cena = id;
    renovarCena();
    if (cena.ameaca && camp.ameaca === null) {
      camp.ameaca = cena.ameaca;
      camp.rodada = 0;
      Musica.pararTrecho(false); // "a música para": silêncio, sem a playlist voltar
      camp.flags.radioTocando = false;
    }
    if (cena.musica && !camp.flags.radioFoiTocado) {
      if (Musica.ativa()) tocarRadio();
      else camp.flags.pedirSom = true;
    }
    if (cena.final && !camp.fim) {
      Musica.pararTrecho(false);
      setTimeout(() => Musica.retomar(), 4000); // depois do salto, a trilha volta
      for (const p of grupo()) {
        if (cena.revela) p.revelados[cena.revela] = true;
        if (cena.memoria) p.memorias = (p.memorias ? p.memorias + "\n" : "") + cena.memoria;
        for (const mc of [].concat(cena.marca || [])) p.marcas = [...new Set([...(p.marcas || []), mc])];
        if (cena.revela) fichaMudou(p, [`${p.nome}: Memória Cruzada. O ${EIXOS[cena.revela].nome} (${EIXOS[cena.revela].mundo}) foi revelado na ficha.`]);
        else fichaMudou(p, cena.memoria ? [`${p.nome}: nova Memória Cruzada.`] : []);
      }
      for (const p of grupo()) {
        p.concluidas = [...new Set([...(p.concluidas || []), camp.missao])];
        Armazem.salvar(p);
      }
      camp.fim = true;
      camp.flags.revelado = cena.revela;
      Cinematica.primeiraVez(grupo(), cena.revela);
    }
    salvar();
    Saves.auto(); // salvamento automático: cena da história
    render();
  }

  function tocarRadio() {
    camp.flags.pedirSom = false;
    camp.flags.radioFoiTocado = true;
    camp.flags.radioTocando = Musica.tocarTrecho({
      ...missao().radio,
      aoTerminar: () => {
        if (!camp) return;
        camp.flags.radioTocando = false;
        salvar();
      },
    });
  }

  // ======================= Texto livre =======================

  function interpretar(entrada) {
    const palavras = norm(entrada).split(/[^a-z]+/).filter((w) => w.length > 1);
    if (!palavras.length) return;
    const m = missao();
    const ctx = contexto();
    const cena = camp.cena ? m.cenas[camp.cena] : null;
    const lista = cena ? opcoesDaCena(cena) : acoesDoLugar();
    const p = ativo();
    let melhor = null;
    let pontos = 0;
    lista.forEach((op, i) => {
      if (bloqueio(op, p) || (op.req && op.req.semItem && Regras.funciona(p, op.req.semItem))) return;
      let s = 0;
      for (const raiz of op.palavras || []) {
        const e = raiz.endsWith("$");
        const r = e ? raiz.slice(0, -1) : raiz;
        if (r.includes(" ") ? norm(entrada).includes(r) : palavras.some((w) => (e ? w === r : w.startsWith(r)))) s += 2;
      }
      for (const w of norm(op.texto).split(/\s+/)) if (w.length > 4 && palavras.includes(w)) s += 1;
      if (s > pontos) {
        pontos = s;
        melhor = { tipo: "opcao", indice: i, doLugar: !cena, rotulo: op.texto };
      }
    });
    // "ir ao hospital", "voltar para casa"
    if (!cena) {
      for (const [id, l] of lugaresVisiveis()) {
        if (id === camp.lugar) continue;
        const nome = norm(texto(l.nome, ctx));
        const chaves = nome.split(/\s+/).filter((w) => w.length > 3).concat([id]);
        if (chaves.some((k) => palavras.some((w) => w.startsWith(k.slice(0, 5))))) {
          const s = 2 + (palavras.some((w) => /^(ir|vou|volt|seguir|andar|dirig)/.test(w)) ? 1 : 0);
          if (s > pontos) {
            pontos = s;
            melhor = { tipo: "ir", lugar: id, rotulo: `Ir para ${texto(l.nome, ctx)}` };
          }
        }
      }
    }
    if (melhor) {
      pendente = melhor;
      mensagemLivre = "";
    } else {
      pendente = null;
      mensagemLivre = `Nada acontece. Só uma frase, no fundo da mente: “${fraseAleatoria()}” Tente outras palavras ou escolha uma opção.`;
    }
    render();
    $("#texto-livre")?.focus();
  }

  // ======================= Eventos =======================

  document.addEventListener("click", (ev) => {
    const t = ev.target.closest("button");
    if (!t || t.disabled) return;
    const naMesa = t.closest("#mesa");
    const naCena = t.closest("#cena");
    if (!naMesa && !naCena) return;

    if (naMesa) {
      if (t.dataset.jogador) {
        selecionados = new Set([t.dataset.jogador]);
        return abrirMesa();
      }
      if (t.dataset.comecar) return comecar(t.dataset.comecar);
      if (t.dataset.continuar) return abrir(t.dataset.continuar);
      if (t.dataset.acao === "criar") return Prontos.abrir();
      if (t.dataset.acao === "personagens") return abrirPersonagens();
      if (t.dataset.acao === "carregar-jogo") return Saves.abrir();
      return;
    }

    const m = missao();
    if (viagem) return;
    // todo botão da missão faz o seu clique; menus têm o som próprio
    if (t.dataset.painel === undefined && !t.dataset.ir && !t.dataset.zoomMapa) Som.tocar(["ficha", "tradutor", "mesa"].includes(t.dataset.acao) ? "abrir" : "clique");
    if (t.dataset.opcao !== undefined) {
      const doLugar = t.dataset.lugar === "1";
      const lista = doLugar ? acoesDoLugar() : opcoesDaCena(m.cenas[camp.cena]);
      return executar(lista[+t.dataset.opcao], doLugar);
    }
    if (t.dataset.painel !== undefined) {
      painel = t.dataset.painel || null;
      Som.tocar(painel ? "abrir" : "fechar");
      return render();
    }
    if (t.dataset.ir) {
      Som.tocar("viajar");
      return irPara(t.dataset.ir);
    }
    if (t.dataset.usarPertence) {
      const p = ativo();
      fichaMudou(p, Vida.usar(p, t.dataset.usarPertence, m.eixo));
      return render();
    }
    if (t.dataset.comprar !== undefined) {
      const p = ativo();
      const r = Vida.comprar(p, m.lugares[camp.lugar].loja.itens[+t.dataset.comprar], m.eixo);
      fichaMudou(p, [r.erro || r.linha]);
      return render();
    }
    const acao = t.dataset.acao;
    if (acao === "ler-mais") {
      if (digitando) return digitando.terminar();
      lidos++;
      return render();
    }
    if (acao === "decifrar-ok") return concluirDecifrar(false);
    if (acao === "decifrar-licao") return concluirDecifrar(true);
    if (t.dataset.decifrarOp !== undefined) return tentarDecifrar(t.dataset.decifrarOp);
    if (t.dataset.decPalavra !== undefined) { palavraEscolhida = +t.dataset.decPalavra; avisoDecifrar = ""; return render(); }
    if (acao === "escrever") {
      const f = document.getElementById("form-livre");
      if (f) { f.classList.remove("recolhido"); t.remove(); paginarOpcoes(); document.getElementById("texto-livre")?.focus(); }
      return;
    }
    if (acao === "mais-opcoes") {
      paginaOps++;
      return aplicarPagina();
    }
    if (acao === "chamado") return entrarCena("chamado");
    if (acao === "opcoes") return Opcoes.abrir();
    if (acao === "saves") return Saves.abrir();
    if (acao === "seguir" && resultado) return resultado.depois();
    if (acao === "confirmar" && pendente) {
      const p = pendente;
      pendente = null;
      if (p.tipo === "ir") return irPara(p.lugar);
      const lista = p.doLugar ? acoesDoLugar() : opcoesDaCena(m.cenas[camp.cena]);
      return executar(lista[p.indice], p.doLugar);
    }
    if (acao === "cancelar") {
      pendente = null;
      return render();
    }
    if (acao === "ligar-som") {
      Musica.ligar();
      // o player precisa de um instante para começar
      setTimeout(() => {
        tocarRadio();
        salvar();
        render();
      }, 600);
      return;
    }
    if (acao === "sem-som") {
      camp.flags.pedirSom = false;
      camp.flags.radioFoiTocado = true;
      camp.flags.radioTocando = false;
      salvar();
      return render();
    }
    if (acao === "narrar") return Narrador.alternar(textoNarrado(), m.eixo);
    if (acao === "narrador-voz") return Narrador.alternarVoz(textoNarrado(), m.eixo);
    if (acao === "narrador") return Narrador.alternarLigado(textoNarrado(), m.eixo);
    if (acao === "ficha") return abrirFicha(ativo());
    if (t.dataset.comecarProxima) {
      selecionados = new Set([grupo()[0].id]);
      return comecar(t.dataset.comecarProxima);
    }
    if (acao === "ficha-final") {
      const p = grupo()[0];
      abrirFicha(p);
      abaAtual = camp.flags.revelado || p.origem;
      return renderFicha();
    }
    if (acao === "tradutor") return Tradutor.abrir(missao().eixo);
    if (acao === "colecao") return Colecao.abrir();
    if (acao === "mesa") return abrirMesa();
  });

  // tocar no texto enquanto ele é digitado mostra ele inteiro
  document.addEventListener("click", (ev) => {
    if (digitando && ev.target.closest && ev.target.closest("#cena-corpo .narracao")) digitando.terminar();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && painel && document.querySelector("#tela-cena.ativa")) {
      painel = null;
      Som.tocar("fechar");
      render();
    }
  });

  document.addEventListener("submit", (ev) => {
    if (ev.target.id !== "form-livre") return;
    ev.preventDefault();
    interpretar($("#texto-livre").value);
  });

  return {
    abrir, abrirMesa,
    missaoAtual: () => (camp && MISSOES[camp.missao]) || null,
    // o jogador está dentro de uma missão (mesmo com a ficha ou o tradutor abertos por cima)?
    emJogo: () => emJogo,
    sair: () => (emJogo = false),
    // este personagem tem uma partida em andamento?
    emAndamento: (pid) => Boolean(partidaDe(pid)),
    // "Jogar" na ficha: volta à partida dele, ou abre a Mesa com ele já escolhido
    jogarCom(pid) {
      const c = partidaDe(pid);
      if (c) abrir(c.id);
      else abrirMesa([pid]);
    },
  };
})();
