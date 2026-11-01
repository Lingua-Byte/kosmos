// Personagens prontos: três de cada classe, moradores de Port Halden, para jogar sem criar ficha.
// O retrato de cada um fica em imagens/prontos/<id>.webp (sem a arte, aparecem as iniciais).
// Escolher um cria a ficha dele (uma vez só: escolher de novo abre a mesma ficha).

const PRONTOS = [
  // ---------- Tank ----------
  { id: "frank-brennan", nome: "Frank Brennan", idade: "52", sexo: "homem", profissao: "bombeiro", papel: "tank",
    resumo: "Bombeiro da Estação 9, a dois anos da aposentadoria. Conhece por dentro cada prédio que já pegou fogo no Eastside.",
    tracos: ["Protetor", "Teimosia"], atributos: { corpo: 2, mente: 1, essencia: 1 },
    habs: ["vigor", "combate"], itens: ["protecao", "luz", "ferramentas"] },
  { id: "rosa-delgado", nome: "Rosa Delgado", idade: "34", sexo: "mulher", profissao: "policial", papel: "tank",
    resumo: "Patrulheira do 4º Distrito, turno da noite. Já viu de tudo nas docas, e não acredita em nada que não possa algemar.",
    tracos: ["Coragem", "Desconfiança"], atributos: { corpo: 2, mente: 1, essencia: 1 },
    habs: ["combate", "conducao"], itens: ["arma_leve", "protecao", "comunicador", "luz"] },
  { id: "marcus-bell", nome: "Marcus Bell", idade: "27", sexo: "homem", profissao: "entregador", papel: "tank",
    resumo: "Entregador de moto, doze horas por dia cortando o trânsito do centro. Sabe todos os atalhos da cidade, e todas as saídas.",
    tracos: ["Instinto de sobrevivência", "Proatividade"], atributos: { corpo: 2, mente: 0, essencia: 2 },
    habs: ["conducao", "vigor", "conversa"], itens: ["veiculo", "comunicador"] },

  // ---------- Healer ----------
  { id: "denise-carter", nome: "Denise Carter", idade: "41", sexo: "mulher", profissao: "medico", papel: "healer",
    resumo: "Médica do pronto-socorro do St. Luke's. Mãos firmes, voz calma, e um plantão que já devia ter acabado há seis horas.",
    tracos: ["Empatia", "Frieza"], atributos: { corpo: 1, mente: 2, essencia: 1 },
    habs: ["cuidado", "investigacao"], itens: ["kit_medico", "luz", "comunicador"] },
  { id: "michael-doyle", nome: "Michael Doyle", idade: "63", sexo: "homem", profissao: "padre-pastor", papel: "healer",
    resumo: "Padre da St. Brendan's, na beira do porto. Ouve confissões há trinta anos; ultimamente, elas têm sido estranhas.",
    tracos: ["Fé", "Empatia"], atributos: { corpo: 0, mente: 1, essencia: 3 },
    habs: ["ancora", "conversa"], itens: ["objeto_pessoal", "luz"] },
  { id: "june-albright", nome: "June Albright", idade: "71", sexo: "mulher", profissao: "aposentado", papel: "healer",
    resumo: "Enfermeira aposentada, viúva, mora sozinha na Maple Street. Os vizinhos ainda batem na porta dela quando alguém se machuca.",
    tracos: ["Sensibilidade", "Liderança"], atributos: { corpo: 0, mente: 2, essencia: 2 },
    habs: ["cuidado", "conversa"], itens: ["kit_medico", "objeto_pessoal", "comunicador"] },

  // ---------- Support ----------
  { id: "eli-navarro", nome: "Eli Navarro", idade: "29", sexo: "homem", profissao: "tecnico", papel: "support",
    resumo: "Técnico de radiação da universidade. Foi o primeiro a ver os números subirem, e ninguém quis ouvir.",
    tracos: ["Busca conhecimento", "Mãos habilidosas"], atributos: { corpo: 1, mente: 2, essencia: 1 },
    habs: ["simbolos", "investigacao"], itens: ["detector", "ferramentas", "comunicador", "luz"] },
  { id: "tess-monroe", nome: "Tess Monroe", idade: "38", sexo: "mulher", profissao: "jornalista", papel: "support",
    resumo: "Apresenta o programa da madrugada na rádio WPHN. As ligações dos ouvintes começaram a repetir as mesmas palavras.",
    tracos: ["Desconfiança", "Busca conhecimento"], atributos: { corpo: 1, mente: 2, essencia: 1 },
    habs: ["investigacao", "conversa", "conducao"], itens: ["comunicador", "luz", "objeto_pessoal"] },
  { id: "ray-okafor", nome: "Ray Okafor", idade: "45", sexo: "homem", profissao: "motorista-de-aplicativo", papel: "support",
    resumo: "Taxista há vinte anos, agora de aplicativo. O carro é a casa dele, e esta noite pode ser a de muita gente.",
    tracos: ["Instinto de sobrevivência", "Liderança"], atributos: { corpo: 1, mente: 1, essencia: 2 },
    habs: ["conducao", "conversa", "vigor"], itens: ["veiculo", "comunicador"] },
];

const Prontos = (() => {
  let escolhido = null;

  const iniciais = (nome) => nome.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const retrato = (pr) => `<span class="pronto-retrato" data-iniciais="${iniciais(pr.nome)}">
    <img src="imagens/prontos/${pr.id}.webp" alt="" loading="lazy" onerror="this.remove()"></span>`;
  const ja = (pr) => Armazem.todos().find((p) => p.pronto === pr.id);

  function render() {
    const tela = document.getElementById("prontos");
    const pr = PRONTOS.find((x) => x.id === escolhido);
    tela.innerHTML = `
      <header class="prontos-topo">
        <button class="btn-texto" data-pronto-voltar aria-label="Voltar">‹</button>
        <h2>Personagens prontos</h2>
      </header>
      <div class="prontos-grade">
        ${Object.keys(PAPEIS).map((papel) => `
          <section class="prontos-classe"><h3>${PAPEIS[papel]}</h3>
            ${PRONTOS.filter((x) => x.papel === papel).map((x) => `
              <button class="pronto-card ${x.id === escolhido ? "escolhida" : ""}" data-pronto="${x.id}">
                ${retrato(x)}
                <b>${esc(x.nome.split(" ")[0])}</b>
                <small>${esc(profissaoDe(x, "x").nome)}</small>
              </button>`).join("")}
          </section>`).join("")}
      </div>
      <div class="pronto-detalhe">
        ${pr ? `
          <p class="pronto-nome"><b>${esc(pr.nome)}</b>, ${pr.idade} · ${esc(profissaoDe(pr, "x").nome)} · ${PAPEIS[pr.papel]}</p>
          <p class="pronto-resumo">${esc(pr.resumo)}</p>
          <p class="pronto-ficha">${pr.tracos.map(esc).join(" · ")} — ${Object.entries(pr.atributos).map(([k, v]) => `${EIXOS.x.atributos[k].nome} ${v}`).join(", ")}</p>
          <p class="pronto-ficha">${[...pr.habs, ...pr.itens].map((k) => esc(Regras.item(k).nomes.x)).join(" · ")}</p>
          <button class="btn-primario" data-pronto-usar>${ja(pr) ? "Abrir a ficha" : `Jogar com ${esc(pr.nome.split(" ")[0])}`}</button>`
        : `<p class="sub">Toque num personagem para conhecer. Todos moram em Port Halden e começam no Urbano.</p>`}
      </div>`;
  }

  function abrir() {
    escolhido = null;
    definirTema(null);
    render();
    mostrarTela("tela-prontos");
  }

  // a ficha completa, como se tivesse passado por todos os passos da criação
  function usar(pr) {
    const existente = ja(pr);
    if (existente) return abrirFicha(Regras.migrar(existente));
    const p = Object.assign(novoPersonagem(), JSON.parse(JSON.stringify({
      nome: pr.nome, idade: pr.idade, sexo: pr.sexo, profissao: pr.profissao, papel: pr.papel,
      tracos: pr.tracos, atributos: pr.atributos, habs: pr.habs, itens: pr.itens,
    })), { origem: "x", pronto: pr.id });
    p.revelados.x = true;
    p.cartasRunas = RUNAS_CARTAS.iniciais(p.atributos.mente);
    Regras.aplicarAlfabetoDaClasse(p);
    p.criadoEm = new Date().toISOString();
    Armazem.salvar(p);
    abrirFicha(p, true);
  }

  document.getElementById("prontos").addEventListener("click", (ev) => {
    const t = ev.target.closest("button");
    if (!t) return;
    if (t.hasAttribute("data-pronto-voltar")) return abrirPersonagens();
    if (t.dataset.pronto) {
      escolhido = t.dataset.pronto;
      if (typeof Som !== "undefined") Som.tocar("clique");
      return render();
    }
    if (t.hasAttribute("data-pronto-usar")) usar(PRONTOS.find((x) => x.id === escolhido));
  });

  document.getElementById("btn-prontos").addEventListener("click", abrir);

  return { abrir };
})();
