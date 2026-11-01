// Rolagens: testes de atributo (parada de d6), estudo de runas e Teste de Convergência.
// O resultado é aplicado na ficha pelas regras, sem depender de mestre.

const Dados = (() => {
  const dialogo = $("#dialogo-dados");
  const corpo = $("#dados-corpo");
  // { p, eixo, tipo: "teste" | "estudo" | "convergencia", atributo, dificuldade, intensidade,
  //   recursos: Set de chaves usadas, ajuda, resultado, aplicados }
  let contexto = null;

  function rolarParada(n) {
    return Array.from({ length: Math.max(1, n) }, () => 1 + Math.floor(Math.random() * DADOS.faces));
  }

  function avaliar(dados, dificuldade) {
    const sucessos = dados.filter((d) => d >= DADOS.sucessoMin).length;
    const sinais = dados.filter((d) => d === DADOS.sinal).length;
    return { dados, sucessos, sinais, passou: sucessos >= dificuldade };
  }

  // Habilidades e itens do personagem que servem para esta situação (pelas tags)
  function recursosDaSituacao(p, tags) {
    return [...p.habs, ...p.itens]
      .map(Regras.item)
      .filter((it) => it.dados && it.tags.some((t) => tags.includes(t)))
      .map((it) => ({
        it,
        passiva: it.usos === "passiva",
        livre: Regras.usosRestantes(p, it.chave) > 0 && !Regras.bloqueado(p, it.chave),
      }));
  }

  // Tudo que entra na parada de dados. Passivas, traços e marcas entram sozinhos;
  // habilidades e itens com usos entram só se o jogador escolher gastar o uso.
  function composicaoPara(p, eixo, atributo, tags, recursos = new Set(), ajuda = false) {
    const partes = [{ fonte: "atributo", dados: p.atributos[atributo] + DADOS.dadosExtras }];
    for (const m of Regras.modificadores(p, atributo)) partes.push(m);
    for (const m of Regras.modTracos(p, tags)) partes.push(m);
    for (const { it, passiva, livre } of recursosDaSituacao(p, tags)) {
      if ((passiva && livre) || recursos.has(it.chave)) partes.push({ fonte: it.nomes[eixo], dados: it.dados });
    }
    if (ajuda) partes.push({ fonte: "ajuda de aliado", dados: 1 });
    return partes;
  }

  const somaDados = (partes) => Math.max(1, partes.reduce((s, x) => s + x.dados, 0));

  function composicao() {
    const { p, eixo, atributo, tags, recursos, ajuda } = contexto;
    return composicaoPara(p, eixo, atributo, tags, recursos, ajuda);
  }

  function quantidade() {
    return somaDados(composicao());
  }

  function chanceHtml(n, k, nome) {
    const c = Regras.chance(n, k);
    return `<span class="chance chance-${Regras.rotuloChance(c).toLowerCase().replace(/\s+/g, "-")}">${Regras.rotuloChance(c)} para ${esc(nome)} · ${Math.round(c * 100)}%</span>`;
  }

  // ---------- Abrir ----------

  // opts.aoTerminar(resultado): quem abriu (uma cena) recebe o resultado quando o jogador continua
  // opts.podeAjudar: mostra "Aliado ajuda +1" (só faz sentido em grupo)
  function abrir(dados, opts = {}) {
    contexto = {
      recursos: new Set(), ajuda: false, resultado: null, aplicados: null,
      aoTerminar: opts.aoTerminar || null, podeAjudar: opts.podeAjudar !== false, avisado: false,
      ...dados,
    };
    render();
    if (!dialogo.open) dialogo.showModal();
  }

  function abrirTeste(p, eixo, atributo, opts = {}) {
    if (opts.estudo) {
      if (Regras.usosRestantes(p, "estudo") <= 0) return avisar("Você já estudou runas nesta cena.");
      return abrir({ p, eixo, tipo: "estudo", atributo: "mente", dificuldade: RUNAS_CARTAS.estudo.dificuldade, tags: RUNAS_CARTAS.estudo.tags }, opts);
    }
    // Numa cena a situação já vem definida; fora dela, o jogador diz o que tenta fazer
    const s = opts.situacao ? SITUACOES.find((x) => x.id === opts.situacao) : null;
    abrir(s
      ? { p, eixo, tipo: "teste", situacao: s, atributo: s.atributo, dificuldade: s.dificuldade, tags: s.tags }
      : { p, eixo, tipo: "teste", atributo, situacao: null, dificuldade: null, tags: [] }, opts);
  }

  // opts.intensidade fixa a intensidade (a cena decide, o jogador não escolhe)
  function abrirConvergencia(p, eixo, opts = {}) {
    abrir({
      p, eixo, tipo: "convergencia", atributo: CONVERGENCIA.atributo, dificuldade: Regras.dificuldadeConvergencia(p),
      tags: CONVERGENCIA.tags, intensidade: opts.intensidade || 1, intensidadeFixa: Boolean(opts.intensidade),
    }, opts);
  }

  // Entrega o resultado a quem abriu (uma vez só), mesmo se o jogador fechar a janela
  function avisarFim() {
    if (!contexto || !contexto.resultado || !contexto.aoTerminar || contexto.avisado) return;
    contexto.avisado = true;
    const fn = contexto.aoTerminar;
    const r = { ...contexto.resultado, aplicados: contexto.aplicados, tipo: contexto.tipo };
    setTimeout(() => fn(r), 0);
  }
  dialogo.addEventListener("close", avisarFim);

  function escolherSituacao(id) {
    const s = SITUACOES.find((x) => x.id === id);
    Object.assign(contexto, { situacao: s, atributo: s.atributo, dificuldade: s.dificuldade, tags: s.tags });
  }

  function renderSituacoes() {
    const { p, eixo, atributo } = contexto;
    const e = EIXOS[eixo];
    const lista = SITUACOES.filter((s) => s.atributo === atributo);
    corpo.innerHTML = `
      <header class="dados-topo">
        <h2>O que ${esc(p.nome)} tenta fazer?</h2>
        <p class="sub">${e.atributos[atributo].nome} · ${e.glifo} ${e.mundo}. O jogo define a dificuldade.</p>
      </header>
      <div class="situacoes">
        ${lista.map((s) => {
          const n = somaDados(composicaoPara(p, eixo, s.atributo, s.tags));
          return `<button class="situacao" data-situacao="${s.id}">
            <strong>${esc(s.nome)}</strong>
            <span>${s.dificuldade} sucesso${s.dificuldade > 1 ? "s" : ""} · ${n}d6</span>
            ${chanceHtml(n, s.dificuldade, p.nome)}
          </button>`;
        }).join("")}
      </div>
      <footer class="dados-rodape"><button class="btn-texto" data-fechar>Fechar</button></footer>`;
  }

  // ---------- Render ----------

  function render() {
    if (contexto.tipo === "teste" && !contexto.situacao) return renderSituacoes();
    const { p, eixo, tipo, atributo, dificuldade, resultado, situacao } = contexto;
    const e = EIXOS[eixo];
    const attr = e.atributos[atributo];
    const n = quantidade();
    const travado = resultado ? "disabled" : "";
    const titulos = { teste: situacao ? situacao.nome : "", estudo: "Estudar uma runa", convergencia: "Teste de Convergência" };
    const recursos = recursosDaSituacao(p, contexto.tags).filter((r) => !r.passiva);

    corpo.innerHTML = `
      <header class="dados-topo">
        <h2>${titulos[tipo]}</h2>
        <p class="sub">${esc(p.nome)} · ${e.glifo} ${e.mundo} · ${attr.nome} ${p.atributos[atributo]}</p>
        ${tipo === "convergencia" ? `<p class="sub">Passou: + Ressonância. Falhou: + Dissonância. ${e.exposicao.nome} sobe sempre. Precisa de ${dificuldade} sucesso${dificuldade > 1 ? "s" : ""}.</p>` : ""}
        ${tipo === "estudo" ? `<p class="sub">Precisa de ${dificuldade} sucessos. Passou: ganha uma carta de runa para virar. Uma tentativa por cena.</p>` : ""}
      </header>

      ${tipo === "convergencia" ? `
        <div class="dados-opcao"><span>Intensidade da exposição</span>
          <div class="chips">${Object.entries(CONVERGENCIA.intensidades).map(([k, nome]) =>
            `<button class="chip ${contexto.intensidade === +k ? "escolhida" : ""}" data-intensidade="${k}" ${travado || (contexto.intensidadeFixa && contexto.intensidade !== +k) ? "disabled" : ""}>${nome} (${k})</button>`).join("")}</div>
        </div>` : ""}
      <p class="dificuldade-jogo">Precisa de <b>${dificuldade} sucesso${dificuldade > 1 ? "s" : ""}</b> ${resultado ? "" : chanceHtml(n, dificuldade, p.nome)}</p>

      ${recursos.length ? `
        <div class="dados-opcao"><span>Gastar um uso para ajudar?</span>
          <div class="chips">${recursos.map(({ it, livre }) => {
            const sel = contexto.recursos.has(it.chave);
            const resta = Regras.usosRestantes(p, it.chave);
            const usos = it.usos === "passiva" ? "passiva" : `${resta} uso${resta === 1 ? "" : "s"}`;
            return `<button class="chip ${sel ? "escolhida" : ""}" data-recurso="${it.chave}" ${!livre || resultado ? "disabled" : ""}>
              ${esc(it.nomes[eixo])} +${it.dados} <small>${Regras.bloqueado(p, it.chave) ? "bloqueada" : usos}</small></button>`;
          }).join("")}</div>
        </div>` : ""}

      ${contexto.podeAjudar ? `<div class="dados-opcao"><span>Grupo</span>
        <div class="chips"><button class="chip ${contexto.ajuda ? "escolhida" : ""}" data-ajuda ${travado}>Aliado ajuda +1</button></div>
      </div>` : ""}

      <p class="composicao">${composicao().map((x) => `<span class="${x.trilha ? "mod-" + x.trilha : ""}">${x.dados > 0 && x.fonte !== "atributo" ? "+" : ""}${x.dados} ${esc(x.fonte)}</span>`).join("")} = <b>${n}d6</b></p>

      <div class="mesa-dados" id="mesa-dados">
        ${(resultado ? resultado.dados : Array(n).fill(0)).map((d) => dadoHtml(d)).join("")}
      </div>
      <div id="dados-resultado" class="dados-resultado">${resultado ? resultadoHtml() : ""}</div>

      <footer class="dados-rodape">
        ${resultado && contexto.aoTerminar
          ? `<span></span><button class="btn-primario" data-fechar>Continuar</button>`
          : `<button class="btn-texto" data-fechar>${contexto.aoTerminar ? "Voltar à cena" : "Fechar"}</button>`}
        ${resultado ? "" : `<button class="btn-primario" data-rolar-agora>Rolar ${n}d6</button>`}
      </footer>`;
  }

  function dadoHtml(valor, rolando = false) {
    let classe = "dado";
    if (rolando) classe += " rolando";
    else if (valor >= DADOS.sucessoMin) classe += " sucesso";
    else if (valor === DADOS.sinal) classe += " sinal";
    else if (!valor) classe += " vazio";
    const face = valor === DADOS.sinal && !rolando ? "◉" : valor || "";
    return `<span class="${classe}">${face}</span>`;
  }

  function resultadoHtml() {
    const { resultado, tipo, dificuldade, eixo, aplicados, p } = contexto;
    const e = EIXOS[eixo];
    const contagem = `${resultado.sucessos} ${resultado.sucessos === 1 ? "sucesso" : "sucessos"} de ${dificuldade} necessário${dificuldade > 1 ? "s" : ""}.`;
    const linhas = [];
    if (aplicados.res) linhas.push(`+${aplicados.res} Ressonância`);
    if (aplicados.dis) linhas.push(`+${aplicados.dis} Dissonância`);
    if (aplicados.exp) linhas.push(`+${aplicados.exp} ${e.exposicao.nome}`);
    if (aplicados.carta) linhas.push("+1 carta de runa para virar");
    const sinais = resultado.sinais
      ? `<p class="sinais">${resultado.sinais} ${resultado.sinais > 1 ? "sinais" : "sinal"} ◉ da Entidade: cada um marca +1 de ${e.exposicao.nome}${Regras.sinaisDaoDissonancia(p) ? " e +1 Dissonância (Perda de Controle)" : ""}.</p>`
      : "";
    const ancora = tipo === "convergencia"
      ? p.habs.map(Regras.hab).find((h) => h.rerrolar === "convergencia" && Regras.usosRestantes(p, h.chave) > 0)
      : null;

    const veredito = {
      teste: resultado.passou ? "Sucesso" : "Falha",
      estudo: resultado.passou ? "Aprendeu" : "Não compreendeu",
      convergencia: resultado.passou ? "Ressoa" : "Dissoa",
    }[tipo];

    return `
      <p class="veredito ${resultado.passou ? "passou" : "falhou"}">${veredito}</p>
      <p>${contagem}</p>
      ${sinais}
      ${linhas.length ? `<p class="aplicado-lista">Marcado na ficha: <b>${linhas.join(" · ")}</b></p>` : ""}
      ${ancora ? `<button class="btn-secundario" data-ancora="${ancora.chave}">${esc(ancora.nomes[eixo])}: rolar de novo</button>` : ""}
      ${tipo === "convergencia" ? `<p class="presagio">“${esc(fraseAleatoria())}”</p>` : ""}`;
  }

  // ---------- Rolar e aplicar ----------

  function rolar() {
    const { p, recursos, tipo } = contexto;
    const n = quantidade();
    const mesa = $("#mesa-dados");
    const final = rolarParada(n);
    corpo.querySelectorAll("[data-rolar-agora]").forEach((b) => (b.disabled = true));

    // Usar um recurso gasta o uso na hora da rolagem
    for (const c of recursos) if (Regras.item(c).usos !== "passiva") Regras.consumir(p, c);
    if (tipo === "estudo") Regras.consumir(p, "estudo");

    let quadros = reduzirMovimento ? 0 : 10;
    const girar = () => {
      if (quadros-- > 0) {
        mesa.innerHTML = rolarParada(n).map((d) => dadoHtml(d, true)).join("");
        setTimeout(girar, 55);
        return;
      }
      contexto.resultado = avaliar(final, contexto.dificuldade);
      aplicar();
      registrar();
      render();
      if (contexto.resultado.sinais && navigator.vibrate) navigator.vibrate([40, 60, 40]);
    };
    girar();
  }

  const somar = (valor, quanto, max) => Math.min(max, valor + quanto);

  // Aplica o resultado na ficha e guarda o que mudou (para a Âncora poder desfazer)
  function aplicar() {
    const { p, eixo, tipo, intensidade, resultado } = contexto;
    const a = { res: 0, dis: 0, exp: 0, carta: 0 };
    if (tipo === "convergencia") {
      if (resultado.passou) a.res += intensidade;
      else a.dis += intensidade;
      a.exp += intensidade;
    }
    if (tipo === "estudo" && resultado.passou) a.carta = 1;
    a.exp += resultado.sinais;
    if (Regras.sinaisDaoDissonancia(p)) a.dis += resultado.sinais;

    const antes = { res: p.ressonancia, dis: p.dissonancia, exp: p.exposicao[eixo] };
    p.ressonancia = somar(p.ressonancia, a.res, REGRAS.ressonanciaMax);
    p.dissonancia = somar(p.dissonancia, a.dis, REGRAS.ressonanciaMax);
    p.exposicao[eixo] = somar(p.exposicao[eixo], a.exp, REGRAS.exposicaoMax);
    p.cartasRunas += a.carta;
    // guarda o quanto realmente subiu (respeitando os máximos)
    contexto.aplicados = { res: p.ressonancia - antes.res, dis: p.dissonancia - antes.dis, exp: p.exposicao[eixo] - antes.exp, carta: a.carta };
  }

  function desfazer() {
    const { p, eixo, aplicados } = contexto;
    p.ressonancia -= aplicados.res;
    p.dissonancia -= aplicados.dis;
    p.exposicao[eixo] -= aplicados.exp;
    p.cartasRunas -= aplicados.carta;
    p.rolagens.shift();
  }

  function registrar() {
    const { p, eixo, tipo, atributo, dificuldade, resultado, intensidade } = contexto;
    p.rolagens = p.rolagens || [];
    p.rolagens.unshift({
      quando: new Date().toISOString(),
      tipo,
      eixo,
      atributo,
      situacao: contexto.situacao ? contexto.situacao.nome : undefined,
      dificuldade,
      intensidade: tipo === "convergencia" ? intensidade : undefined,
      dados: resultado.dados,
      sucessos: resultado.sucessos,
      sinais: resultado.sinais,
      passou: resultado.passou,
    });
    p.rolagens.length = Math.min(p.rolagens.length, DADOS.historico);
    fichaMudou(p);
  }

  // ---------- Eventos ----------

  corpo.addEventListener("click", (ev) => {
    const t = ev.target.closest("button");
    if (!t || t.disabled) return;
    if (t.dataset.situacao) escolherSituacao(t.dataset.situacao);
    else if (t.dataset.intensidade) contexto.intensidade = +t.dataset.intensidade;
    else if (t.dataset.recurso) {
      const c = t.dataset.recurso;
      if (contexto.recursos.has(c)) contexto.recursos.delete(c);
      else contexto.recursos.add(c);
    } else if (t.hasAttribute("data-ajuda")) contexto.ajuda = !contexto.ajuda;
    else if (t.hasAttribute("data-rolar-agora")) return rolar();
    else if (t.dataset.ancora) {
      Regras.consumir(contexto.p, t.dataset.ancora);
      desfazer();
      contexto.resultado = null;
      contexto.recursos = new Set();
      render();
      return rolar();
    } else if (t.hasAttribute("data-fechar")) return dialogo.close();
    render();
  });

  // Clicar fora da janela fecha
  dialogo.addEventListener("click", (ev) => {
    if (ev.target === dialogo) dialogo.close();
  });

  // ---------- Histórico (usado pela ficha) ----------

  function historicoHtml(p) {
    const lista = (p.rolagens || []).slice(0, 6);
    if (!lista.length) return `<p class="sub">Nenhuma rolagem ainda.</p>`;
    const nomes = { convergencia: "Convergência", estudo: "Estudo de runa" };
    const vereditos = { convergencia: ["Ressoa", "Dissoa"], estudo: ["Aprendeu", "Falhou"], teste: ["Sucesso", "Falha"] };
    return `<ul class="historico">${lista
      .map((r) => {
        const e = EIXOS[r.eixo];
        const nome = nomes[r.tipo] || r.situacao || e.atributos[r.atributo].nome;
        const veredito = vereditos[r.tipo][r.passou ? 0 : 1];
        const hora = new Date(r.quando).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return `<li class="${r.passou ? "passou" : "falhou"}">
          <span class="h-nome">${e.glifo} ${nome}</span>
          <span class="h-dados">${r.dados.map((d) => (d === DADOS.sinal ? "◉" : d)).join(" ")}</span>
          <b>${veredito}</b>
          <time>${hora}</time>
        </li>`;
      })
      .join("")}</ul>`;
  }

  // Para a cena mostrar a chance antes de o jogador escolher
  function chanceDe(p, eixo, situacaoId) {
    const s = SITUACOES.find((x) => x.id === situacaoId);
    const n = somaDados(composicaoPara(p, eixo, s.atributo, s.tags));
    const c = Regras.chance(n, s.dificuldade);
    return { n, dificuldade: s.dificuldade, chance: c, rotulo: Regras.rotuloChance(c), situacao: s };
  }

  return { abrirTeste, abrirConvergencia, historicoHtml, chanceDe };
})();
