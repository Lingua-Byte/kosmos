---
name: prompt-de-arte
description: Como escrever prompts de imagem (e de vídeo curto) para as artes do KOSMOS: lugares, cenas, retratos de NPC, personagens prontos, itens e transições, no estilo de cada eixo. Use sempre que o autor pedir "prompt de imagem", "prompt de arte", uma arte nova, uma prancha, ou quando uma missão, lugar, NPC ou item novo precisar de arte.
---

# Prompts de arte do KOSMOS

O autor gera as imagens fora daqui (ChatGPT e outras IAs de imagem/vídeo) e cola o prompt pronto.
Seu trabalho é entregar **prompts prontos para colar**, um por arte, coerentes entre si e com a lore.

## 0. Antes de escrever
1. Ver se a arte já está pedida em `ARTES_FALTANDO.md` (nome do arquivo, tamanho, prioridade) ou em
   `BRIEFING_ARTE.md` (pranchas antigas). Usar **o mesmo nome de arquivo**.
2. Se a arte é de uma missão, ler a cena em `site/missoes/<id>.json` (ou `js/missoes/*.js`) para tirar
   **detalhes concretos** do texto: hora, clima, objetos, placas. O prompt mostra o que o jogador lê.
3. Se é um NPC, ler `PERSONAGENS.md`; se é um lugar, `LUGARES.md`. Não inventar aparência que contradiga o texto.
   Se faltar dado (idade, roupa), propor e marcar como proposta.

## 1. Formato da resposta (sempre igual)
Para cada arte:

```
### <nome-do-arquivo>  ·  <proporção, tamanho>  ·  vai para site/imagens/<pasta>/
O que é: <uma frase em português>

PROMPT (colar):
<prompt em inglês, um parágrafo, na ordem: enquadramento → assunto → detalhes → luz → paleta → estilo → composição>

EVITAR (negative prompt, se a ferramenta aceitar):
<lista curta>

VÍDEO (opcional, só para palco e transições):
<prompt de animação do loop>
```

- Prompt **em inglês** (rende melhor em todas as IAs); explicação em português.
- Se o autor pedir em português (ex.: vai colar no ChatGPT), traduzir mantendo a ordem.
- Várias artes do mesmo lugar ou personagem: repetir o **bloco de estilo** e a **âncora** palavra por palavra
  (consistência vem de repetir, não de "same as before").
- Pedido de prancha (várias artes numa imagem): seguir as regras de grade e nome embaixo do `BRIEFING_ARTE.md`.

## 2. Formatos
| Tipo | Proporção | Tamanho | Pasta |
|---|---|---|---|
| Palco: lugar, cena, abertura | 16:9 | 1920 × 1080 (mín. 1600 × 900) | `site/imagens/x/` (Y e Z: `y/`, `z/` quando existirem) |
| Retrato de NPC | 16:9 | 1600 × 900 | `site/imagens/npcs/npc-<id>.webp` |
| Personagem pronto | 1:1 | 512 × 512 | `site/imagens/prontos/<nome>.webp` |
| Item | 1:1 | 512 × 512 | `site/imagens/itens/<item>-<eixo>.webp` |
| Vídeo do palco | 16:9 | 1280 × 720 | mesmo nome `.mp4`, 5–10 s, loop, sem som, até ~4 MB |
| Transição (caminho) | 16:9 | 1280 × 720 | `caminho-*.mp4`, 2–3 s |

**Composição do palco:** o jogo recorta para preencher. O importante fica no **centro**, com ~10% de margem.
Câmera em altura de olho ou leve plongée (2.5D, à moda de Fallout 1/2), **sem pessoa em primeiro plano**
nos lugares. Retrato 16:9: busto, rosto no terço central, fundo = o lugar onde o NPC está.

## 3. Bíblia visual por eixo (bloco de estilo para colar no fim do prompt)

**Eixo X · Port Halden** (presente do jogador; cidade americana fictícia, atualidade, costa, porto). Estilo das artes já prontas:
> `cinematic digital painting, photorealistic, night, wet asphalt reflections, light rain, sodium-vapor streetlights, green and amber neon, deep shadows, muted desaturated tones with green and amber accents, present-day American port city, 2.5D slightly elevated view, moody, quiet`
- Placas e letreiros **em inglês** (é uma cidade americana) e curtos; melhor pouco texto, porque a IA erra e o jogo corta.
  Cartazes oficiais com ironia seca (ex.: "PANIC IS CONTAGIOUS. STAY HOME, CITIZEN.").
- Tecnologia de hoje, sem retrofuturismo. Carros, celulares e lojas comuns, sem marcas reais.
- Riscadores: gente comum (moletom, giz), nunca monstro, nunca uniforme de grupo.

**Eixo Y · Yudur** (passado; outro tempo, não outro mundo):
> `oil painting, dark medieval realism, candlelight and brazier glow, sepia, old gold and umber palette, heavy brushwork, stone, wood, smoke, soot`
- Só humanos. **Nada religioso**: sem cruz, altar, igreja, santo ou deus; mosteiro é lugar de estudo e runas.
- Runas gravadas em pedra, madeira, metal: angulosas, pequenas, sem brilho mágico exagerado.
- Runático: pessoa comum de olhar fixo, nunca criatura.

**Eixo Z · Domus** (presente real; nave descendo pelo eixo de rotação de um buraco negro):
> `serious hard science fiction, brushed metal, square riveted hull plates, amber and cold blue lighting, cassette futurism devices (chunky physical buttons, phosphor CRT screens in green or amber, cream and grey plastic, coiled cables), lived-in, practical`
- Grande cúpula de vidro com árvores. Lá fora: céu deformado por lente gravitacional, sem "portal" nem criatura.
- A IA da Domus é luz em console/painel âmbar, nunca rosto ou robô humanoide.

**Itens (os três eixos):** `single object centered, plain dark background, painted inventory icon, soft rim light, no text`.
Cada eixo mantém a própria paleta. O detector-z já pronto é a referência de cassette futurism.

## 4. Regras que todo prompt respeita
- **Horror sugerido, nunca explícito:** sem sangue, ferida, cadáver, gore. O estranho é pequeno e cotidiano
  (todo mundo olhando para o mesmo lado, uma luz piscando no ritmo, um número repetido na parede).
- **Sem criatura ou entidade.** O fenômeno aparece como efeito físico: ar tremendo como calor, estática,
  distorção de luz, relógios parados, poeira suspensa.
- **Slow burn também na imagem:** cena de rotina parece rotina. O peso fica para as cenas de clímax.
- Sem logotipo ou marca real; sem imitar personagens, arte ou cenas de jogos existentes (citar o "jeito" Fallout de câmera 2.5D tudo bem; pedir "Vault Boy" ou "Pip-Boy" não).
- Sem rosto de pessoa real ou famosa.

**Evitar padrão (negative prompt):**
`blood, gore, corpse, wounds, monster, creature, tentacles, demon, glowing eyes, religious symbols, logos, brand names, watermark, signature, extra fingers, deformed hands, garbled text, cartoon, anime, oversaturated`
(Tirar "religious symbols" só no Eixo X, onde a igreja St. Brendan's existe.)

## 5. Âncoras de personagem (repetir sempre igual)
Para cada pessoa que aparece em mais de uma arte, montar **uma âncora fixa** (idade, etnia, rosto, cabelo,
roupa, um objeto marcante) e colar idêntica em todos os prompts dela. Base: `BRIEFING_ARTE.md`
(prancha 04c para os 9 prontos, prancha 04 para os NPCs) e as artes já prontas em `site/imagens/`.
Quando possível, sugerir ao autor anexar a arte já pronta como referência ("use this image as character reference").

## 6. Vídeo (loop do palco)
`Animate this image as a seamless 6-second loop, locked-off camera, subtle motion only: <2 ou 3 movimentos do lugar: neon flicker, light rain, steam from a grate, a distant figure crossing>. No cuts, no camera move, no new objects. Last frame matches the first. 16:9, 720p, no audio.`

## 7. Quando a arte chegar
1. Converter para `.webp` no tamanho da tabela (Pillow) e salvar na pasta certa com o nome exato.
2. Ver a imagem (Read) e conferir: sem horror explícito, sem criatura, texto da placa aceitável, centro livre.
   Se algo quebrar a lore, avisar o autor e propor um prompt corrigido.
3. Tirar a arte de `ARTES_FALTANDO.md` (ou marcar como pronta) e fazer commit e push.
4. Arte nova pedida por missão nova: acrescentar a linha em `ARTES_FALTANDO.md` com nome, tamanho e prompt curto.
