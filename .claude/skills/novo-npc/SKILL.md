---
name: novo-npc
description: Checklist para pôr um NPC novo no KOSMOS com tudo que ele precisa (nome na missão, voz gravada, fala breve, balbucio, retrato e personalidade). Use sempre que uma cena ou missão ganhar um personagem que fala.
---

# NPC novo

Pela regra "vozes à moda antiga" do `CLAUDE.md`, NPC que fala precisa de **fala breve gravada** e **balbucio**.

1. **Quem é.** Antes de escrever falas, definir com o autor (ou propor para ele aprovar):
   o que o NPC **quer agora**, o que ele **esconde**, e o **jeito de falar** (tique, assunto que puxa, gíria).
   Ver `GUIA_ESCRITA.md`, parte Fallout.
2. **Na missão.** Acrescentar em `npcs` da missão (`"id": "Nome visível"`) e usar `"npc": "id"` nas ações.
   Id curto, minúsculo, com hífen se precisar (ex.: `sra-petrakis`).
3. **Voz.** Escolher uma voz que nenhum outro NPC usa e acrescentar em `VOZES` de `ferramentas/gerar_vozes.py`
   (ou no `VOZES` extra de `ferramentas/gerar_barks.py`): `"id": ("voz-neural", "velocidade", "tom")`,
   com um comentário curto descrevendo a pessoa.
4. **Fala breve (bark).** Rodar `python ferramentas/gerar_barks.py` (precisa de `pip install edge-tts` e de
   internet). Gera `site/audio/barks/<id>-<n>.mp3` e atualiza `site/audio/barks/indice.json`.
   Se não der para rodar aqui, avisar o autor que falta gerar no PC.
5. **Balbucio.** Acrescentar o NPC em `PERFIS` de `site/js/vozes.js`
   (`id: { f: <frequência>, onda: "triangle" | "sine" | "square" | "sawtooth", ms: <ritmo>, varia: <0 a 0.2> }`).
   Voz grave = `f` baixo; fala rápida = `ms` baixo; pessoa monótona = `varia` perto de 0.
6. **Retrato.** Se o autor tiver arte, `site/imagens/npcs/npc-<id>.webp`. Se não, registrar em
   `ARTES_FALTANDO.md` com um briefing curto no estilo do `BRIEFING_ARTE.md`.
7. **Conferir.** `node ferramentas/testar.js`: o NPC não pode aparecer em "sem balbucio" nem "sem fala breve".
8. **Salvar.** Commit em português e push.
