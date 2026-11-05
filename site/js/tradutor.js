// Tradutor e Dicionário das três línguas.
// Tudo é filtrado pelo personagem escolhido em "Lendo como": só aparece o que ele conhece.

const Tradutor = (() => {
  const estado = {
    vista: "traduzir",
    eixo: "x",
    modo: "codificar",
    texto: "Existe uma mente no agora observando a estrela, gerando mudança.",
    simbolos: { x: "∃ ψ(t) ⇒ 𝒪(S) → Δ", y: "ᛋ ᛞ ᛗᚢ", z: "◉ ⟜ ⟡ | ↑" },
    forma: "linear",
    escritaY: "sagrada",
    leitorId: null,
    idioma: "auto",
    busca: "",
    categoria: "Todas",
  };
  let telaAnterior = "tela-personagens";
  let temaAnterior = null;
  let textoParaCopiar = "";

  const entrada = $("#tr-entrada");
  const saida = $("#tr-saida");
  const leitura = $("#tr-leitura");
  const NOMES_LINGUA = { x: "Código Urbano", y: "Runas Yudur", z: "Interface" };
  const VAZIO = { nome: "ninguém", runas: [], vocabY: [], linguas: { x: [], z: [] } };

  function leitor() {
    const lista = Armazem.todos();
    return lista.find((p) => p.id === estado.leitorId) || lista[0] || VAZIO;
  }

  // ---------- Runas (formas de escrita) ----------

  function htmlRunas(lista, forma) {
    if (forma === "repetitiva") lista = lista.flatMap((r) => (r === "·" ? [r] : [r, r]));
    if (forma === "circular") {
      const so = lista.filter((r) => r !== "·" && r.trim());
      const n = so.length || 1;
      const raio = Math.min(130, 40 + n * 7);
      return `<div class="runa-circulo" style="--raio:${raio}px">${so
        .map((r, i) => `<span style="--ang:${(i * 360) / n}deg">${r}</span>`)
        .join("")}</div>`;
    }
    const spans = lista
      .map((r, i) => {
        if (r === "·" || !r.trim()) return `<span class="sep">·</span>`;
        const rachada = forma === "incompleta" && i % 3 === 2;
        return `<span class="${rachada ? "rachada" : ""} ${r === "░" ? "oculta" : ""}">${r}</span>`;
      })
      .join("");
    return `<div class="runa-linha ${forma === "espelhada" ? "espelhada" : ""}">${spans}</div>`;
  }

  const EFEITO_FORMA = {
    linear: "Leitura comum, da esquerda para a direita.",
    circular: "Escrita em círculo. A forma altera o efeito narrativo.",
    espelhada: "Escrita espelhada. A forma altera o efeito narrativo.",
    incompleta: "Runas incompletas geram instabilidade.",
    repetitiva: "Runas repetidas amplificam efeitos.",
  };

  // ---------- Codificar ----------

  function frasesEmBlocos(texto, lang) {
    const blocos = Lingua.frase(texto, lang, estado.idioma);
    const frases = [[]];
    for (const b of blocos) {
      if (b.quebra) frases.push([]);
      else frases[frases.length - 1].push(b);
    }
    return frases.filter((f) => f.length);
  }

  function renderCodificar(p) {
    const { eixo } = estado;
    if (!estado.texto.trim()) {
      saida.innerHTML = `<p class="sub">A tradução aparece aqui.</p>`;
      leitura.innerHTML = "";
      textoParaCopiar = "";
      return;
    }
    const frases = frasesEmBlocos(estado.texto, eixo);
    const filtrar = (s) => Lingua.filtrar(s, eixo, p).escrita;

    if (eixo === "y") {
      let linhas;
      if (estado.escritaY === "fonetica") {
        linhas = estado.texto.split("\n").filter((l) => l.trim()).map((l) => Array.from(filtrar(fonetica(l))));
      } else {
        // escrita sagrada: palavra que o personagem conhece vira runas-conceito; o resto, letra a letra
        linhas = frases.map((f) => Array.from(f.map((b) => Lingua.Yudur.escreverPara(b, p).escrita).join("·")));
      }
      saida.innerHTML = linhas.map((l) => htmlRunas(l, estado.forma)).join("");
      textoParaCopiar = linhas.map((l) => l.join("")).join("\n");
      return renderGlosaY(p, frases.flat());
    } else if (eixo === "x") {
      const linhas = frases.map((f) => filtrar(f.map((b) => b.escrita).join(" ")));
      saida.innerHTML = linhas.map((l) => `<div class="codigo-linha">${esc(l)}</div>`).join("");
      textoParaCopiar = linhas.join("\n");
    } else {
      // Z: núcleos e relações em cima, estados embaixo
      const grupos = frases.map((f) => {
        const topo = [];
        const estados = [];
        for (const b of f) {
          const [cima, baixo] = filtrar(b.escrita).split(" | ");
          topo.push(cima);
          if (baixo) estados.push(...baixo.split(" "));
        }
        return { topo, estados };
      });
      saida.innerHTML = grupos
        .map((g) => `<div class="interface-frase">
          <div class="interface-topo">${g.topo.map((s) => `<span>${esc(s)}</span>`).join("")}</div>
          ${g.estados.length ? `<div class="interface-estados">${g.estados.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
        </div>`)
        .join("");
      textoParaCopiar = grupos.map((g) => g.topo.join(" ") + (g.estados.length ? " | " + g.estados.join(" ") : "")).join("\n");
    }
    renderGlosa(p);
  }

  function renderGlosaY(p, blocos) {
    const chips = blocos.map((b) => {
      const w = Lingua.Yudur.escreverPara(b, p);
      if (b.nome) return `<span><b>${esc(w.escrita)}</b> ${esc(b.palavra)} <i>nome, letra a letra</i></span>`;
      if (!b.y) return `<span class="glosa-oculta"><b>${esc(w.escrita)}</b> ${esc(b.palavra)} <i>sem palavra-runa no Yudur: letra a letra</i></span>`;
      return w.conhecida
        ? `<span><b>${esc(b.runas)}</b> ${esc(b.palavra)} <i>${esc(b.y.palavra)} · ${esc(b.y.leitura)}</i></span>`
        : `<span class="glosa-oculta"><b>${esc(w.escrita)}</b> ${esc(b.palavra)} <i>${esc(p.nome)} ainda não conhece esta palavra-runa</i></span>`;
    });
    $("#tr-idioma-status").textContent = !Lingua.lexicosProntos()
      ? "Carregando dicionário…"
      : estado.idioma === "auto" && blocos.length ? `Detectado: ${IDIOMAS[Lingua.detectarIdioma(estado.texto)]}` : "";
    leitura.innerHTML = `
      <p class="efeito-forma">${EFEITO_FORMA[estado.forma]}</p>
      <div class="glosa">${chips.join("")}</div>
      <p class="sub">${estado.escritaY === "sagrada"
        ? "Escrita sagrada: cada grupo de runas é uma palavra. A primeira runa diz o que a coisa é; as outras, como ela é. Palavras que o personagem não conhece saem letra a letra."
        : "Escrita fonética: letra por letra, como se escreve um nome."}</p>`;
  }

  function fonetica(linha) {
    return linha.split(/\s+/).filter(Boolean).map((w) => Lingua.transcrever(w, "y")).join("·");
  }

  function renderGlosa(p) {
    const { eixo } = estado;
    const pecas = Lingua.analisar(estado.texto, estado.idioma);
    $("#tr-idioma-status").textContent = !Lingua.lexicosProntos()
      ? "Carregando dicionário…"
      : estado.idioma === "auto" ? `Detectado: ${IDIOMAS[pecas.idioma]}` : "";
    const conceitos = pecas.filter((x) => x.conceito);
    const nomes = pecas.filter((x) => x.tipo === "nome");
    const semConceito = [...new Set(pecas.filter((x) => x.tipo === "sem-conceito").map((x) => x.palavra.toLowerCase()))];
    const chips = conceitos.map((x) => {
      const escrita = Lingua.escrever(x.conceito, eixo);
      const f = Lingua.filtrar(escrita, eixo, p);
      return `<span class="${f.completo ? "" : "glosa-oculta"}"><b>${esc(f.escrita)}</b> ${esc(x.palavra)} <i>${f.completo ? esc(Lingua.explicar(x.conceito)) : "desconhecido"}</i></span>`;
    });
    nomes.forEach((x) => chips.push(`<span><b>${esc(Lingua.filtrar(Lingua.transcrever(x.palavra, eixo), eixo, p).escrita)}</b> ${esc(x.palavra)} <i>nome</i></span>`));
    leitura.innerHTML = `
      ${eixo === "y" ? `<p class="efeito-forma">${EFEITO_FORMA[estado.forma]}</p>` : ""}
      <div class="glosa">${chips.join("")}</div>
      ${semConceito.length ? `<p class="sem-traducao">Sem conceito em nenhum dicionário, escritas letra a letra: ${semConceito.map(esc).join(", ")}.</p>` : ""}
      <p class="sub">${{
        x: "Lógico e matemático: funções aplicadas a objetos. Tempo entre parênteses, consequência depois da seta.",
        y: estado.escritaY === "sagrada"
          ? "Escrita sagrada: cada grupo de runas é um conceito, lido pelo sentido antigo de cada runa."
          : "Escrita fonética: letra por letra. Usada para nomes e palavras comuns.",
        z: "Sem ordem fixa de leitura. Estados embaixo indicam consequência emergente.",
      }[eixo]}</p>`;
  }

  // ---------- Decodificar ----------

  function renderDecodificar(p) {
    const { eixo } = estado;
    const texto = estado.simbolos[eixo];
    if (!texto.trim()) {
      saida.innerHTML = `<p class="sub">A leitura aparece aqui.</p>`;
      leitura.innerHTML = "";
      textoParaCopiar = "";
      return;
    }
    if (eixo === "y") {
      const lidas = Lingua.Yudur.decodificar(texto, p);
      const lido = lidas.map((x) => x.leitura).join(" · ");
      saida.innerHTML = `<div class="leitura-texto">${esc(lido)}</div>`;
      textoParaCopiar = lido;
      leitura.innerHTML = `<div class="glosa">${lidas.map((x) => `<span class="${x.conhecido ? "" : "glosa-oculta"}"><b>${esc(x.s)}</b> ${esc(x.leitura)} <i>${esc(x.dica)}</i></span>`).join("")}</div>
        <p class="sub">Separe as palavras com espaço ou ·. Palavras desconhecidas mostram a imagem das runas que ${esc(p.nome)} conhece, como pista.</p>`;
      return;
    }
    const pedacos = Lingua.decodificar(texto, eixo, p).filter((x) => !x.sintaxe);
    // palpite do jogador para o que ainda não sabe (ideia do Chants of Sennaar): fica na ficha, o jogo não corrige
    const palpites = (p.palpites && p.palpites[eixo]) || {};
    const lido = pedacos.map((x) => (x.conhecido === false ? (palpites[x.s] ? `${palpites[x.s]}?` : "?") : x.leitura)).join(" · ");
    saida.innerHTML = `<div class="leitura-texto">${esc(lido)}</div>`;
    textoParaCopiar = lido;
    const foneticaY = eixo === "y" ? pedacos.map((x) => (x.letras !== undefined ? (x.conhecido === false ? "?" : x.letras.split("/")[0] || "?") : "")).join("") : "";
    leitura.innerHTML = `
      <div class="glosa">${pedacos.map((x) => `<span class="${x.conhecido === false ? "glosa-oculta" : ""}"><b>${esc(x.s)}</b> <i>${x.conhecido === false ? "desconhecido" : esc(x.leitura)}</i></span>`).join("")}</div>
      ${foneticaY ? `<p class="sub">Lido como letras: <b>${esc(foneticaY)}</b></p>` : ""}
      ${p.id && pedacos.some((x) => x.conhecido === false) ? `<div class="palpites"><p class="sub">Seu palpite (só para você; o jogo não corrige):</p>
        ${[...new Set(pedacos.filter((x) => x.conhecido === false).map((x) => x.s))].map((s) => `<label class="palpite"><b>${esc(s)}</b>
          <input data-palpite="${esc(s)}" value="${esc(palpites[s] || "")}" placeholder="o que você acha que é" autocomplete="off"></label>`).join("")}</div>` : ""}`;
  }

  function simbolosConhecidos(p) {
    const { eixo } = estado;
    if (eixo === "y") return [...(p.runas || [])].sort().concat(["·"]);
    const sabe = new Set((p.linguas && p.linguas[eixo]) || []);
    const lista = Lingua.elementos(eixo).filter((e) => sabe.has(e.id) && e.id !== "nomes").map((e) => e.s);
    return lista.concat(eixo === "x" ? ["(", ")", "[", "]", "⇒", "→"] : ["|", "(", ")"]);
  }

  // ---------- Dicionário ----------

  function renderDicionarioY(p) {
    const Y = Lingua.Yudur;
    const busca = estado.busca.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const categorias = ["Todas", ...new Set(Y.PALAVRAS.map((w) => w.cat))];
    if (!categorias.includes(estado.categoria)) estado.categoria = "Todas";
    $("#dic-categorias").innerHTML = categorias
      .map((c) => `<button class="chip ${estado.categoria === c ? "escolhida" : ""}" data-categoria="${c}">${c}</button>`)
      .join("");
    const conhecidas = Y.PALAVRAS.filter((w) => Y.sabePalavra(p, w.runas)).length;
    $("#dic-contagem").textContent = `${p.nome} conhece ${conhecidas} de ${Y.PALAVRAS.length} palavras-runa do Yudur.`;

    const semAcento = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    let lista = Y.PALAVRAS.filter((w) => {
      if (estado.categoria !== "Todas" && w.cat !== estado.categoria) return false;
      if (!busca) return true;
      return semAcento(w.palavra).includes(busca) || w.pt.some((s) => s.replace("$", "").startsWith(busca)) || w.runas === estado.busca.trim();
    });
    // qualquer palavra real, em qualquer idioma, também é procurada no léxico
    if (busca && /^[a-z]+$/.test(busca)) {
      for (const id of Object.keys(IDIOMAS)) {
        const w = Y.palavraY(busca, id);
        if (w && !lista.some((x) => x.runas === w.runas)) lista.unshift({ ...w, rotuloBusca: `${estado.busca.trim()} (${IDIOMAS[id]})` });
      }
    }
    $("#dic-lista").innerHTML = lista.length
      ? lista.map((w) => {
          const sabe = Y.sabePalavra(p, w.runas);
          const runas = Array.from(w.runas).map((r) => (Y.sabeLetra(p, r) ? r : "░")).join("");
          return `<article class="dic-item ${sabe ? "" : "trancado"}">
            <header><strong>${esc(sabe ? (w.rotuloBusca || w.palavra) : w.rotuloBusca || "?")}</strong><span class="dic-cat">${esc(w.cat)}</span></header>
            <p class="dic-escrita dic-y">${esc(runas)}</p>
            <p class="dic-explica">${sabe ? esc(w.leitura) : "Palavra ainda não aprendida."}</p>
          </article>`;
        }).join("")
      : `<p class="sub">Nenhuma palavra encontrada.</p>`;
  }

  function renderDicionario(p) {
    const { eixo } = estado;
    if (eixo === "y") return renderDicionarioY(p);
    const busca = estado.busca.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const categorias = ["Todas", ...new Set(CONCEITOS.map((c) => c.cat))];
    $("#dic-categorias").innerHTML = categorias
      .map((c) => `<button class="chip ${estado.categoria === c ? "escolhida" : ""}" data-categoria="${c}">${c}</button>`)
      .join("");

    const conhecidos = CONCEITOS.filter((c) => Lingua.conhece(c, eixo, p)).length;
    $("#dic-contagem").textContent = `${p.nome} conhece ${conhecidos} de ${CONCEITOS.length} conceitos em ${NOMES_LINGUA[eixo]}.`;

    const lista = CONCEITOS.filter((c) => {
      if (estado.categoria !== "Todas" && c.cat !== estado.categoria) return false;
      if (!busca) return true;
      return Lingua.rotulo(c).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(busca) ||
        c.pt.some((s) => s.replace("$", "").startsWith(busca) || busca.startsWith(s.replace("$", "")));
    });
    // A palavra buscada também é procurada no léxico de cada idioma
    if (busca && /^[a-z]+$/.test(busca)) {
      for (const id of Object.keys(IDIOMAS)) {
        const c = Lingua.conceitoDaPalavra(busca, id);
        if (c && !lista.includes(c)) {
          lista.unshift(c.lexico ? { ...c, rotuloBusca: `${estado.busca.trim()} (${IDIOMAS[id]})` } : c);
        }
      }
    }

    $("#dic-lista").innerHTML = lista.length
      ? lista.map((c) => {
          const sabe = Lingua.conhece(c, eixo, p);
          const escrita = Lingua.filtrar(Lingua.escrever(c, eixo), eixo, p).escrita;
          const outras = ORDEM_EIXOS.filter((l) => l !== eixo).map((l) => {
            const f = Lingua.filtrar(Lingua.escrever(c, l), l, p);
            return `<span class="dic-outra"><i>${EIXOS[l].glifo}</i> ${esc(f.escrita)}</span>`;
          });
          return `<article class="dic-item ${sabe ? "" : "trancado"}">
            <header><strong>${esc(c.rotuloBusca || Lingua.rotulo(c))}</strong><span class="dic-cat">${c.cat}</span></header>
            <p class="dic-escrita dic-${eixo}">${esc(escrita)}</p>
            <p class="dic-explica">${sabe ? esc(Lingua.explicar(c)) : "Ainda não decifrado."}</p>
            <p class="dic-outras">${outras.join("")}</p>
          </article>`;
        }).join("")
      : `<p class="sub">Nenhuma palavra encontrada. Palavras fora do dicionário podem ser escritas como nome, entre aspas.</p>`;
  }

  // ---------- Raízes ----------

  function renderRaizes(p) {
    const { eixo } = estado;
    const alvo = $("#vista-raizes");
    if (eixo === "y") {
      const todas = Lingua.tudo().y;
      const sabe = new Set(p.runas || []);
      alvo.innerHTML = `
        <p class="sub">${p.nome} conhece ${todas.filter((r) => sabe.has(r)).length} de ${todas.length} runas. Cada runa é uma letra e uma imagem; palavras juntam imagens: a primeira diz o que a coisa é, as outras, como ela é.</p>
        <div class="raizes-grade">${todas.map((r) => {
          const ok = sabe.has(r);
          const [imagemRuna, sentidos] = YUDUR.runas[r] || ["", ""];
          const letras = Object.entries(RUNAS).filter(([, v]) => v === r).map(([l]) => l).join("/") || RUNAS_EXTRAS[r];
          return `<div class="raiz ${ok ? "" : "trancado"}"><b>${ok ? r : "░"}</b><span>${ok ? `${esc(imagemRuna)} · ${esc(letras)}` : "?"}</span><small>${ok ? esc(sentidos) : ""}</small></div>`;
        }).join("")}</div>
        <p class="sub">Exemplos: ᛚᛁ neve (água · gelo) · ᛚᚱ rio (água · caminho) · ᛉᛟ telhado (o que cobre a casa) · ᛗᚷᚠ rei (humano que dá riqueza).</p>`;
      return;
    }
    const sabe = new Set((p.linguas && p.linguas[eixo]) || []);
    const elementos = Lingua.elementos(eixo);
    const rotulos = { nucleo: "Núcleos", relacao: "Relações (verbos)", estado: "Estados", modo: "Modos", tempo: "Tempo", nomes: "Nomes próprios" };
    const grupos = {};
    elementos.forEach((e) => (grupos[e.tipo] ||= []).push(e));
    alvo.innerHTML = `
      <p class="sub">${p.nome} conhece ${elementos.filter((e) => sabe.has(e.id)).length} de ${elementos.length} elementos do ${NOMES_LINGUA[eixo]}.</p>
      ${Object.entries(grupos).map(([tipo, lista]) => `<h4 class="raizes-titulo">${rotulos[tipo]}</h4>
        <div class="raizes-grade">${lista.map((e) => {
          const ok = sabe.has(e.id);
          return `<div class="raiz ${ok ? "" : "trancado"}"><b>${ok ? esc(e.s) : "░"}</b><span>${ok ? esc(e.nome) : "?"}</span></div>`;
        }).join("")}</div>`).join("")}
      <p class="sub">${eixo === "x" ? "Estrutura: ∃ [estado](tempo) ⇒ função(objeto) → resultado" : "Estrutura: [Núcleo] — [Relação] — [Núcleo] | [Estado]"}</p>`;
  }

  // ---------- Render geral ----------

  function render() {
    const { eixo, modo, vista } = estado;
    const p = leitor();
    definirTema(eixo);

    const lista = Armazem.todos();
    $("#tr-leitor").innerHTML = lista.length
      ? lista.map((x) => `<option value="${x.id}" ${x.id === p.id ? "selected" : ""}>${esc(x.nome)}</option>`).join("")
      : `<option>Nenhum personagem</option>`;

    document.querySelectorAll("[data-tr-vista]").forEach((b) => b.classList.toggle("escolhida", b.dataset.trVista === vista));
    document.querySelectorAll("[data-tr-eixo]").forEach((b) => {
      b.classList.toggle("atual", b.dataset.trEixo === eixo);
      b.setAttribute("aria-selected", b.dataset.trEixo === eixo);
    });
    $("#tr-titulo-eixo").textContent = `${EIXOS[eixo].glifo} ${NOMES_LINGUA[eixo]} · ${EIXOS[eixo].nome} ${EIXOS[eixo].mundo}`;
    $("#vista-traduzir").hidden = vista !== "traduzir";
    $("#vista-dicionario").hidden = vista !== "dicionario";
    $("#vista-raizes").hidden = vista !== "raizes";

    if (vista === "dicionario") return renderDicionario(p);
    if (vista === "raizes") return renderRaizes(p);

    document.querySelectorAll("[data-tr-modo]").forEach((b) => b.classList.toggle("escolhida", b.dataset.trModo === modo));
    $("#linha-idioma").hidden = modo !== "codificar";
    $("#tr-idioma").innerHTML = `<option value="auto">Automático</option>` +
      Object.entries(IDIOMAS).map(([id, nome]) => `<option value="${id}" ${estado.idioma === id ? "selected" : ""}>${nome}</option>`).join("");
    const valor = modo === "codificar" ? estado.texto : estado.simbolos[eixo];
    if (entrada.value !== valor) entrada.value = valor;
    entrada.placeholder = modo === "codificar" ? "Escreva em português…" : "Cole ou toque nos símbolos abaixo…";
    entrada.classList.toggle("entrada-simbolos", modo === "decodificar");

    const mostrarFormas = eixo === "y" && modo === "codificar";
    $("#tr-formas").hidden = !mostrarFormas;
    $("#tr-formas").innerHTML = mostrarFormas
      ? `<button class="chip ${estado.escritaY === "sagrada" ? "escolhida" : ""}" data-escrita-y="sagrada">Sagrada (conceitos)</button>
         <button class="chip ${estado.escritaY === "fonetica" ? "escolhida" : ""}" data-escrita-y="fonetica">Fonética (letras)</button>
         <span class="separador"></span>` +
        Object.entries(FORMAS_RUNICAS)
          .map(([k, nome]) => `<button class="chip ${estado.forma === k ? "escolhida" : ""}" data-tr-forma="${k}">${nome}</button>`)
          .join("")
      : "";

    const teclado = $("#tr-teclado");
    teclado.hidden = modo !== "decodificar";
    if (modo === "decodificar") {
      const simbolos = simbolosConhecidos(p);
      teclado.innerHTML =
        simbolos.map((s) => `<button class="tecla" data-tecla="${esc(s)}">${esc(s)}</button>`).join("") +
        `<button class="tecla tecla-larga" data-tecla=" ">espaço</button><button class="tecla tecla-larga" data-apagar>⌫</button>` +
        (simbolos.length <= 6 ? `<p class="sub teclado-vazio">${esc(p.nome)} ainda não conhece símbolos desta língua.</p>` : "");
    }

    if (modo === "codificar") renderCodificar(p);
    else renderDecodificar(p);
  }

  // ---------- Eventos ----------

  entrada.addEventListener("input", () => {
    if (estado.modo === "codificar") estado.texto = entrada.value;
    else estado.simbolos[estado.eixo] = entrada.value;
    const p = leitor();
    if (estado.modo === "codificar") renderCodificar(p);
    else renderDecodificar(p);
  });

  // palpite: guarda ao sair do campo (sem redesenhar enquanto o jogador escreve)
  leitura.addEventListener("change", (ev) => {
    const campo = ev.target.closest("[data-palpite]");
    if (!campo) return;
    const p = leitor();
    if (!p.id) return;
    p.palpites = p.palpites || {};
    const porEixo = (p.palpites[estado.eixo] = p.palpites[estado.eixo] || {});
    const v = campo.value.trim();
    if (v) porEixo[campo.dataset.palpite] = v; else delete porEixo[campo.dataset.palpite];
    Armazem.salvar(p);
    renderDecodificar(p);
  });

  $("#dic-busca").addEventListener("input", (ev) => {
    estado.busca = ev.target.value;
    renderDicionario(leitor());
  });

  $("#tr-idioma").addEventListener("change", (ev) => {
    estado.idioma = ev.target.value;
    render();
  });

  $("#tr-leitor").addEventListener("change", (ev) => {
    estado.leitorId = ev.target.value;
    render();
  });

  $("#tela-tradutor").addEventListener("click", (ev) => {
    const t = ev.target.closest("button");
    if (!t) return;
    if (t.dataset.trEixo) estado.eixo = t.dataset.trEixo;
    else if (t.dataset.trVista) estado.vista = t.dataset.trVista;
    else if (t.dataset.trModo) estado.modo = t.dataset.trModo;
    else if (t.dataset.trForma) estado.forma = t.dataset.trForma;
    else if (t.dataset.escritaY) estado.escritaY = t.dataset.escritaY;
    else if (t.dataset.categoria) estado.categoria = t.dataset.categoria;
    else if (t.dataset.tecla !== undefined) return inserir(t.dataset.tecla);
    else if (t.hasAttribute("data-apagar")) return apagar();
    else if (t.id === "tr-frase") {
      estado.modo = "codificar";
      estado.texto = fraseAleatoria();
    } else if (t.id === "tr-limpar") {
      if (estado.modo === "codificar") estado.texto = "";
      else estado.simbolos[estado.eixo] = "";
    } else if (t.id === "tr-copiar") {
      navigator.clipboard?.writeText(textoParaCopiar).then(
        () => {
          t.textContent = "Copiado";
          setTimeout(() => (t.textContent = "Copiar"), 1400);
        },
        () => {}
      );
      return;
    } else if (t.id === "tr-voltar") return fechar();
    else return;
    render();
  });

  function inserir(simbolo) {
    const ini = entrada.selectionStart ?? entrada.value.length;
    const fim = entrada.selectionEnd ?? entrada.value.length;
    entrada.value = entrada.value.slice(0, ini) + simbolo + entrada.value.slice(fim);
    entrada.selectionStart = entrada.selectionEnd = ini + simbolo.length;
    entrada.dispatchEvent(new Event("input"));
  }

  function apagar() {
    const ini = entrada.selectionStart ?? entrada.value.length;
    const fim = entrada.selectionEnd ?? entrada.value.length;
    if (ini !== fim) {
      entrada.value = entrada.value.slice(0, ini) + entrada.value.slice(fim);
      entrada.selectionStart = entrada.selectionEnd = ini;
    } else if (ini > 0) {
      const antes = Array.from(entrada.value.slice(0, ini));
      antes.pop();
      const novo = antes.join("");
      entrada.value = novo + entrada.value.slice(ini);
      entrada.selectionStart = entrada.selectionEnd = novo.length;
    }
    entrada.dispatchEvent(new Event("input"));
  }

  function abrir(eixo, vista) {
    if (vista) estado.vista = vista;
    const atual = document.querySelector(".tela.ativa");
    if (atual && atual.id !== "tela-tradutor") telaAnterior = atual.id;
    temaAnterior = ["x", "y", "z"].find((k) => document.body.classList.contains("tema-" + k)) || null;
    if (eixo) estado.eixo = eixo;
    else if (temaAnterior) estado.eixo = temaAnterior;
    // Quem está com a ficha aberta é quem lê
    if (typeof fichaAtual !== "undefined" && fichaAtual && atual && atual.id === "tela-ficha") estado.leitorId = fichaAtual.id;
    mostrarTela("tela-tradutor");
    render();
    // o léxico grande chega depois; quando chegar, redesenha
    if (!Lingua.lexicosProntos()) Lingua.carregarLexicos().then(() => {
      if ($("#tela-tradutor").classList.contains("ativa")) render();
    });
  }

  function fechar() {
    definirTema(temaAnterior);
    mostrarTela(telaAnterior);
  }

  $("#btn-tradutor").addEventListener("click", () => abrir());

  return { abrir };
})();
