// Vozes dos personagens: cada NPC tem uma voz só dele, que nenhum outro usa.
// As falas (o que está entre aspas) são gravadas antes, por ferramentas/gerar_vozes.py,
// em audio/falas/<acao>-<campo>.mp3. Aqui o jogo só toca o arquivo.
// Ligadas por padrão; liga, desliga e volume ficam no menu de opções (⚙).

const Vozes = (() => {
  let audio = null;
  let tocada = null; // a fala que já tocou (redesenhar a tela não repete)

  const ligadas = () => Opcoes.get("vozes").ligadas;
  const volume = () => Opcoes.get("vozes").volume / 100;

  function alternar() {
    Opcoes.mudar("vozes", { ligadas: !ligadas() });
    if (!ligadas()) parar();
    return ligadas();
  }

  // o botão Testar do menu de opções: uma fala do Sal
  function testar() {
    parar();
    audio = new Audio("audio/falas/porteiro-resultado.mp3");
    audio.volume = volume();
    audio.play().catch(() => {});
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
    audio.volume = volume();
    audio.onerror = () => (audio = null); // fala sem áudio gravado: segue em silêncio
    audio.play().catch(() => {});
  }

  // Saiu da fala (Continuar): a voz para e a próxima fala pode tocar
  function encerrar() {
    tocada = null;
    parar();
  }

  return { ligadas, alternar, falar, encerrar, parar, testar };
})();
