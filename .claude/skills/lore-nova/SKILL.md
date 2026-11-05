---
name: lore-nova
description: Como registrar uma decisão ou ideia nova de lore do KOSMOS no lugar certo e com o selo certo. Use quando o autor decidir, propor ou perguntar algo sobre a história, os eixos, o fenômeno, a Domus, o Lime ou os personagens.
---

# Lore nova

1. **Entender o que o autor disse.** É decisão ("vai ser assim"), ideia para pensar ("e se...") ou dúvida?
   Na dúvida, perguntar. Nunca transformar sugestão do Claude em decisão sem o autor dizer que sim.
2. **Conferir conflito.** Ler `CLAUDE.md` (seção Lore) e `site/js/historia.js`. Se a novidade contradiz algo
   decidido, mostrar ao autor as duas versões e perguntar qual vale.
3. **Registrar em `site/js/historia.js`** (aparece na aba História da Oficina):
   - `estado: "decidido"` — o autor confirmou;
   - `estado: "considerar"` — proposta aceita para pensar;
   - `estado: "aberto"` — pergunta sem resposta.
   Atualizar a seção existente quando for o mesmo assunto; criar seção nova só para assunto novo.
   Texto em HTML simples (`<p>`, `<b>`, `<ul>`), no estilo das seções que já existem.
4. **Se for decisão que muda o jeito de escrever ou de jogar**, acrescentar uma linha curta no `CLAUDE.md`
   (seção Lore ou "Jeito de fazer"). O `CLAUDE.md` guarda só o essencial; o detalhe fica no `historia.js`.
5. **Ver o que já está no jogo.** Procurar nas missões (`site/missoes/*.json`, `site/js/missoes/`) textos que
   ficaram errados com a decisão nova e listar para o autor; corrigir só o que ele aprovar.
6. **Salvar.** Commit em português e push.
