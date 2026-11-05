# KOSMOS — combinados do projeto

RPG de texto (site em `site/`, servidor do PC em `ferramentas/servidor.py`). Referências: Fallout 1 e 2, TES antes de Morrowind, Neverwinter Nights.
Este arquivo vale para qualquer conta ou aparelho que abra o projeto. Decisões novas do autor entram aqui.

## Onde está cada coisa
- Visão geral do jogo: `DESIGN.md` (ainda diz "três mundos": vale o que está abaixo).
- Lore completa, com selos Decidido / Para considerar / Em aberto: `site/js/historia.js`, que aparece na aba **História** da Oficina (`site/oficina.html`). Lore nova: atualizar esse arquivo.
- Missões: feitas no Criador (`site/diagramas.html` + `js/criador.js`), não em `js/missoes/*.js`. "Publicar no jogo" grava `site/missoes/<id>.json` + `indice.json`; a missão publicada substitui a do código com o mesmo id. Mudanças no motor mantêm o formato do Criador (`Criador.exportar` ↔ `MissoesDados.adaptar`). A Mesa é single player.
- Dados da Oficina e do Criador ficam num repositório privado do GitHub (☁ Nuvem, `js/nuvem.js`); cada aparelho conecta com o próprio token.
- `publicar.sh` faz pull antes do push, porque o Criador pode gravar direto no GitHub.

## Lore (decisões do autor)
- **Os eixos são três pontos no tempo, não "três mundos".** Y (Medieval) = passado; X (Port Halden) = presente do jogador; Z (Domus) = presente real da história.
- **Nomes X, Y e Z:** Z é o eixo de rotação do buraco negro, por onde a Domus desce; o anel do centro (o Lime) fica no plano XY; dentro do horizonte, X e Y apontam para tempos. Os nomes foram dados pela tripulação ou pela IA, sem saber que eram épocas (pista). No Lime, o tempo vira lugar: três direções cruzando na origem.
- **Sem criatura ou entidade:** o fenômeno é consequência. Explicações o mais científicas possível, sem travar a ficção.
- **Riscadores (X) e Runáticos (Y) são mobs, nunca facção.** Ressonância e Dissonância são nomes de regra; no mundo quase ninguém usa essas palavras. O equivalente do Z é diferente (a definir pelo autor).
- **Estrutura:** intro curta no Z (Domus) → Prólogo X (Port Halden) → Y e Z liberam depois; Z é o endgame; Lime é o post-game (com "segundo final").
- **9 personagens prontos** (3 Tank, 3 Healer, 3 Support), cada um com origem no Prólogo X (`js/missoes/origens-x.js`) e fio pessoal no Diário. Têm tendência (herói, anti-herói, vilão), ainda não definida: não inventar, perguntar.
- **Em aberto:** quem fala do Lime (candidata forte: a IA da Domus), o objetivo da missão da Domus, ancestrais ou ecos.

## Jeito de fazer
- **Eixo X é sobrevivência**, não investigação: comida, abrigo, gente para proteger, chegar vivo ao fim da noite.
- **Telas sem rolagem**, texto em pedaços (um parágrafo por vez, digitado, com "Continuar ▸"), no celular e no PC.
- **Menus intocados:** a galáxia animada fica nos menus; artes vão para dentro das missões, mapas e retratos.
- **Vozes à moda antiga:** nada de IA lendo o texto. Fala breve gravada por personagem (`audio/barks/`, `ferramentas/gerar_barks.py`) + balbucio (`js/vozes.js`, PERFIS). NPC novo precisa dos dois.
- **Mapa de Port Halden** (`js/cidade-x.js`): catálogo fixo, conhecimento por personagem. Missão nova do X precisa de entrada em `LIGACOES_X`.
- Não procurar arquivos do autor pelo disco sem pedir.
