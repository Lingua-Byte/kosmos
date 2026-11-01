// Recarga automática durante o desenvolvimento: quando algo muda em site/, a página recarrega
// e volta para a mesma tela (ficha, tradutor, criação…), sem passar pela abertura de novo.
// Só funciona com ferramentas/servidor.py (que responde /__versao); em qualquer outro lugar, desliga sozinho.

(() => {
  const CHAVE = "kosmos.retomar";

  function guardarOndeEstou() {
    const tela = document.querySelector(".tela.ativa")?.id;
    const estado = { tela, rolagem: window.scrollY };
    if (tela === "tela-ficha" && fichaAtual) Object.assign(estado, { ficha: fichaAtual.id, aba: abaAtual });
    if (tela === "tela-criacao" && rascunho) Object.assign(estado, { rascunho, passo: passoAtual });
    try {
      sessionStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {}
  }

  function voltarParaOndeEstava() {
    let estado = null;
    try {
      estado = JSON.parse(sessionStorage.getItem(CHAVE));
      sessionStorage.removeItem(CHAVE);
    } catch {}
    if (!estado || !estado.tela || estado.tela === "tela-inicio") return;
    Galaxia.repouso(1.4);
    if (estado.tela === "tela-ficha") {
      const p = Armazem.todos().find((x) => x.id === estado.ficha);
      if (p) {
        abrirFicha(p);
        if (estado.aba) {
          abaAtual = estado.aba;
          renderFicha();
        }
      } else abrirPersonagens();
    } else if (estado.tela === "tela-criacao" && estado.rascunho) {
      rascunho = estado.rascunho;
      passoAtual = estado.passo || 0;
      definirTema(rascunho.origem);
      mostrarTela("tela-criacao");
      renderPasso();
    } else if (estado.tela === "tela-tradutor") {
      Tradutor.abrir();
    } else if (estado.tela === "tela-personagens") {
      abrirPersonagens();
    } else if (estado.tela === "tela-cena") {
      Cenas.abrir();
    } else if (estado.tela === "tela-mesa") {
      Cenas.abrirMesa();
    }
    requestAnimationFrame(() => window.scrollTo(0, estado.rolagem || 0));
  }

  let versao = null;
  async function checar() {
    try {
      const r = await fetch("/__versao", { cache: "no-store" });
      if (!r.ok) return; // não é o servidor de desenvolvimento: para de checar
      const { versao: nova } = await r.json();
      if (versao !== null && nova !== versao) {
        // não recarrega no meio de uma rolagem de dados
        if (document.querySelector("#dialogo-dados[open]")) return setTimeout(checar, 1500);
        guardarOndeEstou();
        location.reload();
        return;
      }
      versao = nova;
    } catch {
      // servidor desligado por um instante: tenta de novo
    }
    setTimeout(checar, 1500);
  }

  voltarParaOndeEstava();
  checar();
})();
