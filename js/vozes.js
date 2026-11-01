// Vozes dos personagens: cada NPC tem uma voz só dele, que nenhum outro usa.
// As falas (o que está entre aspas) são gravadas antes, por ferramentas/gerar_vozes.py,
// em audio/falas/<acao>-<campo>.mp3. Aqui o jogo só toca o arquivo.
// Ligadas por padrão; o jogador pode desligar na barra da cena.

const Vozes = (() => {
  const CHAVE = "kosmos.vozes";
  let audio = null;
  let tocada = null; // a fala que já tocou (redesenhar a tela não repete)

  function ligadas() {
    try {
      return localStorage.getItem(CHAVE) !== "0";
    } catch {
      return true;
    }
  }

  function alternar() {
    const sim = !ligadas();
    try {
      localStorage.setItem(CHAVE, sim ? "1" : "0");
    } catch {}
    if (!sim) parar();
    return sim;
  }

  function parar() {
    if (audio) audio.pause();
    audio = null;
  }

  // Toca a fala uma vez; chamado a cada desenho da cena
  function falar(id) {
    if (!id || id === tocada) return;
    tocada = id;
    parar();
    if (!ligadas()) return;
    audio = new Audio(`audio/falas/${id}.mp3`);
    audio.onerror = () => (audio = null); // fala sem áudio gravado: segue em silêncio
    audio.play().catch(() => {});
  }

  // Saiu da fala (Continuar): a voz para e a próxima fala pode tocar
  function encerrar() {
    tocada = null;
    parar();
  }

  return { ligadas, alternar, falar, encerrar, parar };
})();
