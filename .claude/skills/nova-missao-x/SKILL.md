---
name: nova-missao-x
description: Passo a passo para criar ou ampliar uma missão do Eixo X (Port Halden) no KOSMOS. Use sempre que o autor pedir uma missão nova do X, um ato novo, ou novos lugares e cenas numa missão do X.
---

> Antes de tudo, leia o `GUIA_MISSOES.md` (esqueleto de missão, três pistas, soluções alternativas, checklist).


# Nova missão do Eixo X

Siga na ordem. Pule só o que não se aplica e diga ao autor o que ficou pulado.

1. **Conversar antes de escrever.** Confirmar com o autor: objetivo da missão, onde ela entra na história
   (depois de qual missão), quais dos 9 prontos têm algo pessoal nela. Não inventar lore nem a tendência dos
   personagens: perguntar.
2. **Ler as regras.** `CLAUDE.md` (lore e "Jeito de fazer") e `GUIA_ESCRITA.md`. Eixo X é sobrevivência
   (comida, abrigo, gente para proteger, chegar vivo ao fim). Toda missão tem **slow burn**: começa na rotina,
   o estranho entra aos poucos, o pesado vem com o relógio (`se.relogioMin`) ou com a investigação.
3. **Formato do Criador.** A missão vive em `site/missoes/<id>.json`, no formato que `Criador.exportar` gera e
   `MissoesDados.adaptar` lê (veja `site/js/missoes-dados.js` e uma missão existente, como `prologo-x.json`).
   Não criar missão nova em `site/js/missoes/*.js`. Acrescentar o id em `site/missoes/indice.json`.
   Ligar a missão na história com `desbloqueio` / `proxima`.
4. **Mapa.** Cada lugar da missão precisa de um ponto em `CIDADE_X.lugares` (`site/js/cidade-x.js`) e de uma
   entrada em `LIGACOES_X["<id da missão>"]`. Lugar novo no mapa: bairro certo e posição coerente com o mapa
   de referência do autor (comentário no topo do arquivo).
5. **NPCs novos.** Para cada um, seguir a skill `novo-npc` (voz, fala breve, balbucio, retrato).
6. **Escrita.** Pedir ao agente `editor-de-texto` para revisar as cenas e ao `guardiao-da-lore` para conferir
   a lore. Aplicar o que o autor aprovar.
7. **Testar.** `node ferramentas/testar.js` sem nenhum ERRO, e `node ferramentas/continuidade.js` para atualizar o índice de continuidade. Se a missão for grande, pedir ao agente
   `testador` para jogá-la no navegador.
8. **Avisar sobre o Criador.** Dizer ao autor, em uma frase, que no Criador ele deve abrir a missão a partir da
   versão do jogo antes de editar, para não sobrescrever com uma cópia antiga.
9. **Salvar.** Commit em português e push, como manda o `CLAUDE.md`.
