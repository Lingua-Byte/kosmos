// Saves, como nos RPGs: cada save é uma cópia da partida e dos personagens dela naquele momento.
//   · Manual: o jogador salva quando quiser, com o nome que quiser (dá para renomear e sobrescrever).
//   · Automático: ao começar uma missão, ao chegar num lugar e ao entrar numa cena da história.
//     Ficam os últimos AUTOS_MAX; o mais velho é substituído.
//   · Rápido: F5 salva, F9 carrega (no PC). Um espaço só.
// Carregar volta a partida e os personagens exatamente como estavam.

const Saves = (() => {
  const CHAVE = "kosmos.saves";
  const PARTIDAS = "kosmos.campanhas";
  const ATUAL = "kosmos.campanhaAtual";
  const AUTOS_MAX = 5;
  const MANUAIS_MAX = 50;
  const TIPOS = { manual: "Manual", auto: "Automático", rapido: "Rápido" };

  const ler = (k, padrao) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? padrao;
    } catch {
      return padrao;
    }
  };
  const gravar = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  };

  const todos = () => ler(CHAVE, []);
  const partidaAberta = () => {
    let id = null;
    try {
      id = localStorage.getItem(ATUAL);
    } catch {}
    const c = ler(PARTIDAS, {})[id];
    return c && !c.fim ? c : null;
  };

  // o que aparece na lista: missão, lugar, quem joga
  function resumo(camp, personagens) {
    const m = MISSOES[camp.missao];
    let onde = "";
    try {
      if (camp.cena) onde = m.cenas[camp.cena].titulo;
      else {
        const l = m.lugares[camp.lugar];
        const p = personagens[0];
        onde = typeof l.nome === "function" ? l.nome({ p, camp, trabalho: m.trabalho(p) }) : l.nome;
      }
    } catch {}
    return {
      missao: m ? m.titulo : camp.missao, eixo: m ? m.eixo : "x", onde,
      relogio: camp.relogio, relogioMax: m ? m.relogioMax : 0,
      quem: personagens.map((p) => p.nome).join(", "),
    };
  }

  function nomePadrao(r) {
    return `${r.missao}${r.onde ? " · " + r.onde : ""}`;
  }

  // tira a "foto" da partida aberta. Devolve o save, ou null se não há partida
  function fotografar(tipo, nome) {
    const camp = partidaAberta();
    if (!camp) return null;
    const lista = Armazem.todos();
    const personagens = camp.personagens.map((id) => lista.find((p) => p.id === id)).filter(Boolean);
    const r = resumo(camp, personagens);
    return {
      id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      tipo, nome: nome || nomePadrao(r), quando: new Date().toISOString(), resumo: r,
      camp: JSON.parse(JSON.stringify(camp)), personagens: JSON.parse(JSON.stringify(personagens)),
    };
  }

  function guardar(lista) {
    if (gravar(CHAVE, lista)) return true;
    // sem espaço: abre lugar apagando os automáticos mais velhos
    const autos = lista.filter((s) => s.tipo === "auto");
    while (autos.length) {
      const velho = autos.pop();
      lista = lista.filter((s) => s !== velho);
      if (gravar(CHAVE, lista)) return true;
    }
    return false;
  }

  function salvar(tipo = "manual", nome = "", substituir = null) {
    const s = fotografar(tipo, nome);
    if (!s) return null;
    let lista = todos();
    if (substituir) {
      const antigo = lista.find((x) => x.id === substituir);
      if (antigo) {
        s.id = antigo.id;
        s.nome = nome || antigo.nome;
      }
      lista = lista.filter((x) => x.id !== substituir);
    }
    if (tipo === "rapido") lista = lista.filter((x) => x.tipo !== "rapido");
    lista.unshift(s);
    const autos = lista.filter((x) => x.tipo === "auto");
    if (autos.length > AUTOS_MAX) lista = lista.filter((x) => !autos.slice(AUTOS_MAX).includes(x));
    const manuais = lista.filter((x) => x.tipo === "manual");
    if (manuais.length > MANUAIS_MAX) lista = lista.filter((x) => !manuais.slice(MANUAIS_MAX).includes(x));
    return guardar(lista) ? s : null;
  }

  // automático: não grava duas vezes seguidas no mesmo ponto
  let ultimoAuto = "";
  function auto() {
    const c = partidaAberta();
    if (!c) return;
    const ponto = `${c.id}|${c.cena || c.lugar}|${c.relogio}`;
    if (ponto === ultimoAuto) return;
    ultimoAuto = ponto;
    salvar("auto");
  }

  // volta tudo como estava: os personagens e a partida
  function carregar(id) {
    const s = todos().find((x) => x.id === id);
    if (!s || !MISSOES[s.camp.missao]) return false;
    for (const p of s.personagens) Armazem.salvar(JSON.parse(JSON.stringify(p)));
    const partidas = ler(PARTIDAS, {});
    // um personagem só joga uma partida por vez: as outras partidas dele saem
    for (const [cid, c] of Object.entries(partidas))
      if (cid !== s.camp.id && c.personagens.some((pid) => s.camp.personagens.includes(pid))) delete partidas[cid];
    partidas[s.camp.id] = JSON.parse(JSON.stringify(s.camp));
    gravar(PARTIDAS, partidas);
    try {
      localStorage.setItem(ATUAL, s.camp.id);
    } catch {}
    ultimoAuto = "";
    fechar();
    Cenas.abrir(s.camp.id);
    avisar(`Carregado: ${s.nome}`);
    return true;
  }

  function renomear(id, nome) {
    const lista = todos();
    const s = lista.find((x) => x.id === id);
    if (!s || !nome.trim()) return;
    s.nome = nome.trim().slice(0, 60);
    if (s.tipo !== "manual") s.tipo = "manual"; // renomeado = o jogador quis guardar: não some na rotação
    guardar(lista);
  }

  function apagar(id) {
    guardar(todos().filter((x) => x.id !== id));
  }

  // ---------- A tela de salvar e carregar ----------

  let dialogo = null;
  let editando = null;

  const quando = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  function html() {
    const aberta = Cenas.emJogo() && partidaAberta();
    const lista = todos();
    const sugestao = aberta ? nomePadrao(resumo(aberta, aberta.personagens.map((id) => Armazem.todos().find((p) => p.id === id)).filter(Boolean))) : "";
    return `
      <div class="op-topo"><h2>${aberta ? "Salvar e carregar" : "Carregar jogo"}</h2><button class="op-fechar" data-sv-fechar>Fechar</button></div>
      ${aberta ? `
        <form class="sv-novo" data-sv-form>
          <input id="sv-nome" maxlength="60" value="${esc(sugestao)}" aria-label="Nome do save">
          <button class="btn-primario" type="submit">Salvar</button>
        </form>` : ""}
      <div class="sv-lista">
        ${lista.length ? lista.map((s) => `
          <div class="sv-item sv-${s.tipo}">
            ${editando === s.id
              ? `<form class="sv-renomear" data-sv-renomear="${s.id}"><input id="sv-renomear" maxlength="60" value="${esc(s.nome)}" aria-label="Novo nome"><button class="btn-secundario" type="submit">OK</button></form>`
              : `<strong>${esc(s.nome)}</strong>`}
            <span class="sv-info"><b class="sv-tipo">${TIPOS[s.tipo]}</b> ${EIXOS[s.resumo.eixo] ? EIXOS[s.resumo.eixo].glifo : ""} ${esc(s.resumo.quem)} · ${quando(s.quando)}</span>
            <span class="sv-acoes">
              <button class="btn-secundario" data-sv-carregar="${s.id}">Carregar</button>
              ${aberta ? `<button class="btn-texto" data-sv-sobrescrever="${s.id}">Sobrescrever</button>` : ""}
              <button class="btn-texto" data-sv-editar="${s.id}">Renomear</button>
              <button class="btn-texto perigo" data-sv-apagar="${s.id}">Apagar</button>
            </span>
          </div>`).join("") : `<p class="op-desc">Nenhum save ainda. ${aberta ? "Dê um nome e toque em Salvar." : "Os saves aparecem aqui depois que você jogar."}</p>`}
      </div>
      <p class="op-desc pequeno">O jogo também salva sozinho ao começar uma missão, ao chegar num lugar e a cada cena da história (os ${AUTOS_MAX} últimos ficam guardados). No PC: F5 salva rápido, F9 carrega o rápido.</p>`;
  }

  function abrir() {
    if (!dialogo) {
      dialogo = document.createElement("dialog");
      dialogo.className = "dialogo-opcoes dialogo-saves";
      document.body.append(dialogo);
      dialogo.addEventListener("click", clique);
      dialogo.addEventListener("submit", enviar);
    }
    editando = null;
    dialogo.innerHTML = html();
    if (typeof Som !== "undefined") Som.tocar("abrir");
    if (!dialogo.open) dialogo.showModal();
  }

  function fechar() {
    if (dialogo && dialogo.open) {
      if (typeof Som !== "undefined") Som.tocar("fechar");
      dialogo.close();
    }
  }

  const redesenhar = () => (dialogo.innerHTML = html());
  const emPartida = () => Cenas.emJogo() && partidaAberta();

  function clique(ev) {
    const t = ev.target.closest("button");
    if (!t) {
      if (ev.target === dialogo) fechar();
      return;
    }
    if (t.hasAttribute("data-sv-fechar")) return fechar();
    const d = t.dataset;
    if (d.svCarregar) {
      if (emPartida() && !confirm("Carregar este save? O que não foi salvo desde então se perde.")) return;
      if (!carregar(d.svCarregar)) avisar("Este save não pode ser carregado (a missão dele não existe mais).");
      return;
    }
    if (d.svSobrescrever) {
      const s = todos().find((x) => x.id === d.svSobrescrever);
      if (!s || !confirm(`Sobrescrever “${s.nome}” com o jogo de agora?`)) return;
      salvar("manual", s.nome, s.id);
      avisar(`Salvo: ${s.nome}`);
      return redesenhar();
    }
    if (d.svEditar) {
      editando = d.svEditar;
      redesenhar();
      const campo = dialogo.querySelector("#sv-renomear");
      campo.focus();
      campo.select();
      return;
    }
    if (d.svApagar) {
      const s = todos().find((x) => x.id === d.svApagar);
      if (!s || !confirm(`Apagar “${s.nome}”? Não dá para desfazer.`)) return;
      apagar(s.id);
      return redesenhar();
    }
  }

  function enviar(ev) {
    ev.preventDefault();
    const f = ev.target;
    if (f.hasAttribute("data-sv-form")) {
      const s = salvar("manual", dialogo.querySelector("#sv-nome").value.trim());
      if (s) {
        if (typeof Som !== "undefined") Som.tocar("clique");
        avisar(`Salvo: ${s.nome}`);
      } else avisar("Não deu para salvar: o armazenamento do aparelho está cheio. Apague alguns saves.");
      return redesenhar();
    }
    if (f.dataset.svRenomear) {
      renomear(f.dataset.svRenomear, dialogo.querySelector("#sv-renomear").value);
      editando = null;
      return redesenhar();
    }
  }

  // F5 salva rápido, F9 carrega o rápido (só dentro de uma missão)
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "F5" && ev.key !== "F9") return;
    if (!document.querySelector("#tela-cena.ativa") || !partidaAberta()) return;
    ev.preventDefault();
    if (ev.key === "F5") {
      const s = salvar("rapido", "Save rápido");
      avisar(s ? "Save rápido feito (F9 para carregar)" : "Não deu para salvar");
    } else {
      const s = todos().find((x) => x.tipo === "rapido");
      if (!s) return avisar("Ainda não há save rápido (F5 para salvar)");
      carregar(s.id);
    }
  });

  return { abrir, fechar, salvar, auto, carregar, todos, renomear, apagar };
})();

// a tela inicial mostra "Carregar jogo" quando já há saves
if (typeof mostrarCarregarInicio === "function") mostrarCarregarInicio();
