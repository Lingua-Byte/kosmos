// Lista as artes que podem entrar na Coleção do jogo e grava site/dados/artes.json.
// Uso:  node ferramentas/indice_artes.js   (rodar sempre que chegar arte nova em site/imagens/)
// Entra: imagens/x|y|z/*.webp|mp4 (lugares, cenas, aberturas) e imagens/npcs/*.webp (retratos).
// Fica de fora: caminho-* (vídeos de viagem entre lugares).
// O id é "<pasta>/<nome sem extensão>", o mesmo que o palco (js/palco.js) usa ao mostrar a arte.

const fs = require("fs");
const path = require("path");

const SITE = path.join(__dirname, "..", "site");
const artes = new Map();
for (const pasta of ["x", "y", "z", "npcs"]) {
  const dir = path.join(SITE, "imagens", pasta);
  if (!fs.existsSync(dir)) continue;
  for (const arq of fs.readdirSync(dir).sort()) {
    const m = arq.match(/^(.+)\.(webp|mp4)$/);
    if (!m || m[1].startsWith("caminho")) continue;
    const id = `${pasta}/${m[1]}`;
    const a = artes.get(id) || { id, eixo: pasta };
    if (m[2] === "webp") a.imagem = `imagens/${pasta}/${arq}`;
    else a.video = `imagens/${pasta}/${arq}`;
    artes.set(id, a);
  }
}
const lista = [...artes.values()];
fs.writeFileSync(path.join(SITE, "dados", "artes.json"), JSON.stringify(lista, null, 1) + "\n");
console.log(`site/dados/artes.json: ${lista.length} artes.`);
