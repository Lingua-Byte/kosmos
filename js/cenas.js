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
  function abrirMesa(preSelecionados) {
    painel = null;
    definirTema(null);
    const lista = todos();
    if (preSelecionados) selecionados = new Set(preSelecionados);
    selecionados = new Set([...selecionados].filter((id) => lista.some((p) => p.id === id)));
    if (!selecionados.size && lista.length) selecionados = new Set([lista[0].id]);
    const nomeDe = (id) => esc(lista.find((p) => p.id === id)?.nome || "?");
    const andamento = partidas();
    $("#mesa").innerHTML = `
      <div class="mesa-topo"><button class="btn-texto" data-acao="personagens" aria-label="Personagens">‹</button><h2>A Mesa</h2>${Saves.todos().length ? `<button class="btn-secundario mesa-carregar" data-acao="carregar-jogo">Carregar jogo</button>` : ""}</div>
      ${andamento.length ? `<h3>Partidas em andamento</h3>${andamento.map((c) => `
        <div class="mesa-continuar">
          <div><strong>${esc(MISSOES[c.missao].titulo)}</strong><span>${esc(MISSOES[c.missao].subtitulo)} · ${c.personagens.map(nomeDe).join(", ")}</span></div>
          <button class="btn-primario" data-continuar="${c.id}">Continuar</button>
        </div>`).join("")}` : ""}
      ${lista.length ? `
        <h3>Quem joga <small class="sub">· sozinho ou em grupo, cada um na sua vez</small></h3>
        <div class="mesa-jogadores">${lista.map((p) => `
          <button class="mesa-jogador ${selecionados.has(p.id) ? "escolhida" : ""}" data-jogador="${p.id}">
            <b>${EIXOS[p.origem].glifo}</b><strong>${esc(p.nome)}</strong>
            <span>${esc((profissaoDe(p, p.origem) || { nome: EIXOS[p.origem].papeis[p.papel].nome }).nome)}</span>
          </button>`).join("")}</div>
        <h3>Missão</h3>
        <div class="mesa-missoes">${Object.values(MISSOES).map((m) => `
          <div class="mesa-missao">
            <span class="tag">${esc(m.subtitulo)}</span>
            <strong>${esc(m.titulo)}</strong>
            <p class="sub">${esc(m.resumo)}</p>
            <button class="btn-primario" data-comecar="${m.id}">Começar</button>
          </div>`).join("")}
        </div>
        <p class="dica">Os prólogos do Medieval e do Espacial ainda não foram escritos: por enquanto, todos começam no Urbano.</p>`
      : `<p class="sub">Ainda não há personagens.</p><button class="btn-primario" data-acao="criar">Escolher personagem</button>`}`;
    mostrarTela("tela-mesa");
  }

  function comecar(missaoId) {
    if (!selecionados.size) return avisar("Escolha pelo menos um personagem.");
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
    for (const p of grupo()) {
      Regras.renovar(p, "sessao");
      Armazem.salvar(p);
    }
    salvar();
    Saves.auto(); // salvamento automático: começo da missão
    resultado = null;
    abrir();
  }

  // ======================= Tela de jogo =======================

  function abrir(id) {
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
      return { eixo: m.eixo, chave: `cena-${camp.cena}`, titulo: cena.titulo, icone: EIXOS[m.eixo].glifo };
    }
    const lugar = m.lugares[camp.lugar];
    const titulo = texto(lugar.nome, contexto());
    if (camp.lugar === "trabalho" && m.trabalho) {
      const t = m.trabalho(grupo()[0]);
      return { eixo: m.eixo, chave: `abertura-${t.arte || t.ponto}`, titulo, icone: lugar.icone };
    }
    return { eixo: m.eixo, chave: `lugar-${camp.lugar}`, titulo, icone: lugar.icone };
  }

  function palcoNpc(id) {
    const nome = (missao().npcs || {})[id] || id;
    return { eixo: "npcs", chave: `npc-${id}`, titulo: nome, icone: nome.replace(/^(Dra?\.|Sr\.|Sra\.|Agente|Professora|O|A|Um)\s+/, "").charAt(0), rotulo: nome };
  }

  // Ir a outro lugar: o relógio anda, o palco toca a transição e o jogador chega
  function irPara(destino) {
    const m = missao();
    const linhas = avancarRelogio(custoViagem());
    const daqui = camp.lugar;
    camp.lugar = destino;
    painel = null;
    salvar();
    const chegada = palcoAtual();
    const temVeiculo = grupo().some((p) => p.itens.includes("veiculo"));
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
        ${cena.final ? finalHtml() : opcoesHtml(cena.opcoes, false)}`;
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
          ${camp.pistas.length >= m.pistasParaMarco ? `<button class="btn-primario" data-acao="chamado">${esc(m.marcoTexto || `Seguir a multidão até a ${m.centroMapa ? m.centroMapa.nome : "Praça Central"}`)}</button>` : ""}
        </div>`;
    }

    const livre = !viagem && !resultado && !(cena && (cena.final || camp.flags.pedirSom));
    $("#cena").innerHTML = `
      <header class="cena-topo">
        <span class="cena-onde"><b>${EIXOS[m.eixo].glifo}</b> ${esc(m.subtitulo)} · ${esc(nomeLugar)}</span>
        <span class="relogio" title="Relógio de Convergência">${Array.from({ length: m.relogioMax }, (_, i) => `<i class="${i < camp.relogio ? "cheio" : ""}"></i>`).join("")}</span>
        <span class="tag">${esc(m.faseTag || `Fase 1 · ${m.fase}`)}</span>
        <button class="btn-texto narrador-ligar" data-acao="saves">⛃ Salvar</button>
        <button class="btn-texto narrador-ligar" data-acao="opcoes">⚙ Opções</button>
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
    lidos = Math.min(Math.max(1, lidos), ps.length);
    ps.forEach((p, i) => (p.hidden = i !== lidos - 1)); // um pedaço de cada vez: só o atual fica na tela
    const resto = [...corpo.querySelectorAll(".opcoes, .livre, .acoes-lugar, .pergunta-vez, .efeitos-resultado, .tutorial, .ameaca, .pendente, .livre-resposta, .cena-grupo, [data-acao='seguir']")];
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
    };
    const chaveP = `${chave}#${lidos}`;
    if (chaveP === digitadoChave || reduzirMovimento) return fim();
    digitadoChave = chaveP;
    mais.hidden = true;
    resto.forEach((e) => (e.hidden = true));
    digitar(ps[lidos - 1], fim);
  }

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
    return true;
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

  // ---------- Opções ----------

  function bloqueio(op, p) {
    const r = op.req || {};
    if (r.item && !p.itens.includes(r.item)) return `requer ${Regras.equip(r.item).nomes[missao().eixo]}`;
    if (r.semItem && p.itens.includes(r.semItem)) return "você tem um jeito melhor";
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
    const visiveis = lista.filter((op) => !(op.req && op.req.semItem && p.itens.includes(op.req.semItem)));
    if (!visiveis.length) return `<p class="sub">Não há mais nada a fazer aqui por enquanto.</p>`;
    return `<div class="opcoes">${visiveis.map((op) => {
      const motivo = bloqueio(op, p);
      const indice = lista.indexOf(op);
      const tempo = doLugar ? (op.tempo ?? (op.comum ? 0 : 1)) : 0;
      return `<button class="opcao ${motivo ? "travada" : ""}" data-opcao="${indice}" data-lugar="${doLugar ? 1 : 0}" ${motivo ? "disabled" : ""}>
        <span class="op-texto">${motivo ? "🔒 " : ""}${esc(op.texto)}</span>
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
    return `<div class="opcoes">
      <button class="btn-primario" data-acao="ficha-final">Ver a ficha</button>
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
      <form class="livre" id="form-livre">
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
    if (painel === "bolsa") return bolsaHtml();
    if (painel === "loja") return lojaHtml();
    const custo = custoViagem();
    // mapa ilustrado (desenhado pelo jogo) quando o eixo e os lugares têm posição; senão, a lista
    const ilustrado = m.centroMapa && Object.values(m.lugares).every((l) => l.mapa) && Mapas.html({
      eixo: m.eixo,
      centro: { ...m.centroMapa, nome: esc(m.centroMapa.nome) },
      tensao: camp.relogio / m.relogioMax,
      lugares: lugaresVisiveis().map(([id, l]) => ({
        id, icone: esc(l.icone), nome: esc(texto(l.nome, ctx)), ...l.mapa,
        atual: id === camp.lugar, pendentes: acoesDoLugar(id).filter((a) => !a.comum).length,
      })),
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
      ${itens.length ? `<ul class="pertences">${itens.map(([k, n]) => `
        <li class="com-arte">${Vida.arte(k, e, Vida.nome(k, e))}<span>${esc(Vida.nome(k, e))}${n > 1 ? ` <b>×${n}</b>` : ""}</span><small>${esc(Vida.pertence(k).efeito)}</small>
          <button class="btn-secundario" data-usar-pertence="${k}">Usar</button></li>`).join("")}</ul>` : `<p class="sub">Nada na bolsa. Compre em lojas ou procure pelos lugares.</p>`}
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

  function custoViagem() {
    const base = grupo().some((p) => p.itens.includes("veiculo")) ? 0 : 1;
    return base + (camp.flags.multidoes ? 1 : 0); // ruas cheias: tudo demora mais
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
    res = res || {};
    const m = missao();
    const p = ativo(); // recarregado: já inclui o que o teste de dados mudou
    const efeitos = res.efeitos || {};
    const linhas = [];
    const exp = EIXOS[m.eixo].exposicao.nome;

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
    if (efeitos.renovarItens) for (const k of Object.keys(p.usos)) if (EQUIPAMENTOS.some((e) => e.chave === k)) delete p.usos[k];
    if (efeitos.exposicao) {
      p.exposicao[m.eixo] = Math.max(0, Math.min(REGRAS.exposicaoMax, p.exposicao[m.eixo] + efeitos.exposicao));
      linhas.push(`${efeitos.exposicao > 0 ? "+" : ""}${efeitos.exposicao} ${exp}`);
    }
    for (const [chave, nome] of [["ressonancia", "Ressonância"], ["dissonancia", "Dissonância"]]) {
      if (!efeitos[chave]) continue;
      p[chave] = Math.max(0, Math.min(REGRAS.ressonanciaMax, p[chave] + efeitos[chave]));
      linhas.push(`${efeitos[chave] > 0 ? "+" : ""}${efeitos[chave]} ${nome}`);
    }
    if (efeitos.item && !p.itens.includes(efeitos.item)) {
      const erro = Regras.alternar(p, "item", efeitos.item);
      linhas.push(erro ? `Sem espaço para ${Regras.equip(efeitos.item).nomes[m.eixo]}` : `Ganhou: ${Regras.equip(efeitos.item).nomes[m.eixo]}`);
    }
    if (efeitos.aprenderX) {
      const novos = efeitos.aprenderX.filter((id) => !p.linguas.x.includes(id));
      p.linguas.x.push(...novos);
      if (novos.length) {
        const nomes = Lingua.elementos("x").filter((e) => novos.includes(e.id)).map((e) => `${e.s} ${e.nome}`);
        linhas.push(`Aprendeu no Código Urbano: ${nomes.join(", ")}`);
      }
    }
    if (efeitos.memoria) {
      // Memórias Cruzadas só chegam com Ressonância suficiente
      if (p.ressonancia >= (efeitos.memoriaMin || 0)) {
        p.memorias = (p.memorias ? p.memorias + "\n" : "") + efeitos.memoria;
        linhas.push("Nova Memória Cruzada");
      } else linhas.push("Uma sensação de já ter vivido isso, mas a lembrança não vem (precisa de mais Ressonância)");
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
        Dados.abrirConvergencia(alvo, m.eixo, { intensidade: efeitos.convergencia, aoTerminar: () => ir_(ir) });
      } else ir_(ir);
    };
    const t = texto(res.texto, contexto());
    if (t || linhas.length) {
      const npc = res.npc || op.npc;
      const campo = res === op.sucesso ? "sucesso" : res === op.falha ? "falha" : "resultado";
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

  function entrarCena(id) {
    const m = missao();
    const cena = m.cenas[id];
    camp.cena = id;
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
    const lista = cena ? cena.opcoes : acoesDoLugar();
    const p = ativo();
    let melhor = null;
    let pontos = 0;
    lista.forEach((op, i) => {
      if (bloqueio(op, p) || (op.req && op.req.semItem && p.itens.includes(op.req.semItem))) return;
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
        const id = t.dataset.jogador;
        if (selecionados.has(id)) selecionados.delete(id);
        else selecionados.add(id);
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
    if (t.dataset.painel === undefined && !t.dataset.ir) Som.tocar(["ficha", "tradutor", "mesa"].includes(t.dataset.acao) ? "abrir" : "clique");
    if (t.dataset.opcao !== undefined) {
      const doLugar = t.dataset.lugar === "1";
      const lista = doLugar ? acoesDoLugar() : m.cenas[camp.cena].opcoes;
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
    if (acao === "chamado") return entrarCena("chamado");
    if (acao === "opcoes") return Opcoes.abrir();
    if (acao === "saves") return Saves.abrir();
    if (acao === "seguir" && resultado) return resultado.depois();
    if (acao === "confirmar" && pendente) {
      const p = pendente;
      pendente = null;
      if (p.tipo === "ir") return irPara(p.lugar);
      const lista = p.doLugar ? acoesDoLugar() : m.cenas[camp.cena].opcoes;
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
    if (acao === "ficha-final") {
      const p = grupo()[0];
      abrirFicha(p);
      abaAtual = camp.flags.revelado || p.origem;
      return renderFicha();
    }
    if (acao === "tradutor") return Tradutor.abrir(missao().eixo);
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
