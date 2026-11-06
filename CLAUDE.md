# KOSMOS — combinados do projeto

RPG de texto (site em `site/`, servidor do PC em `ferramentas/servidor.py`). Referências: Fallout 1 e 2, TES antes de Morrowind, Neverwinter Nights.
Este arquivo vale para qualquer conta ou aparelho que abra o projeto. Decisões novas do autor entram aqui.

## Salvar é automático (o autor não mexe com git)
O autor trabalha por duas contas: no PC (pasta local) e no Android (Claude Code na web). Ele não usa git: salvar e sincronizar é tarefa do Claude, sem pedir.
- **Ao terminar cada pedido que mudou arquivos, faça commit e push na hora, sem perguntar.** Mensagem de commit em português.
- **Na web (Android):** envie para o branch da sessão. Um robô do GitHub (`.github/workflows/juntar.yml`) junta esse branch na `main` sozinho. Não precisa abrir nem aprovar pull request.
- **No PC:** trabalhe na `main`; ao abrir a sessão, `ferramentas/sincronizar.sh` puxa as novidades e avisa se algum branch ficou fora da main (gancho local em `.claude/settings.json`, fora do git). O `publicar.sh` junta com merge, nunca com rebase. Para publicar o site, use `sh ferramentas/publicar.sh`.
- Se a junção der conflito, o robô falha: resolva na próxima sessão e avise o autor em uma frase simples, sem termos técnicos.

## Onde está cada coisa
- Ferramentas gratuitas, IA e mecânicas planejadas: `FERRAMENTAS.md`.
- Bíblia narrativa (**rascunho do Claude, sem participação do autor: não vale até ele aprovar parte por parte**): `NARRATIVA.md` (ordem dos eixos, Travessias entre eixos, arco das 17 missões principais), `PERSONAGENS.md` (os 9 e os NPCs), `LUGARES.md` (Port Halden, Yudur, Domus), `YUDUR.md` (o vale por dentro). O `ATO_1.md` antigo vale só como banco de ideias.
- A conta da IA (simulação fictícia e verossímil de como ela mira os códigos no tempo e no espaço), proposta: `CALCULO_DA_IA.md` e `ferramentas/calculo_da_ia.py`.
- A frase universal (o que o fenômeno "diz" nas telas), revista pelo autor, com as cortadas e as guardadas para depois: `FRASES.md`.
- Como escrever (técnicas de Fallout, TES e Resident Evil; o que soa como IA): `GUIA_ESCRITA.md`. O agente `editor-de-texto` segue esse guia.
- **Agentes e skills** (`.claude/agents/`, `.claude/skills/`): `editor-de-texto`, `guardiao-da-lore`, `designer-de-mecanicas` (números, simulação e equilíbrio das regras), `linguista` (as três línguas: palavras, frases do Decifrar, traduções e regras), `testador`; skills `nova-missao-x`, `novo-npc`, `lore-nova`, `prompt-de-arte` (prompts de imagem e vídeo no estilo de cada eixo). Antes de enviar mudança em missão, rodar `node ferramentas/testar.js` (o robô `.github/workflows/testes.yml` roda a cada envio).
- Mecânicas (o que existe, propostas e o que o autor decidiu): `MECANICAS.md`.
- Índice de continuidade (o que o jogador já viu: NPCs, datas, horários, nomes): `LORE_CONTINUIDADE.md`, gerado por `node ferramentas/continuidade.js` (não editar à mão; o guardião da lore regrava).
- Blender ligado ao Claude (só no PC): `ferramentas/BLENDER.md`.
- **Coleção** (`js/colecao.js`): artes entram sozinhas quando aparecem no palco (lista em `dados/artes.json`, gerada por `node ferramentas/indice_artes.js` — rodar quando chegar arte nova); textos de lore ficam em `dados/documentos.json` e entram pelo efeito `"documento": "<id>"` de uma ação. Documento novo: slow burn, voz de quem escreveu (ver `GUIA_ESCRITA.md`, Resident Evil e TES).
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
- **Só humanos:** não há personagens não humanos no KOSMOS, em nenhum eixo.
- **O Eixo Y é a fundação de Port Halden** (decidido em 05/11/2026). **Port Halden fica no mesmo chão de Yudur.** Não precisa ser nos EUA: o jeito americano foi para ficar jogável; pode ser um ponto nórdico (a ver depois). A IA mandou códigos cruzados para dois pontos do tempo por ambiguidade nos cálculos, causada pela geometria do anel; por isso existem o X e o Y.
- **Por que o Y existe (decidido):** a conta da IA tem duas respostas (as equações do buraco negro que gira dão duas soluções), e sem o Y o Lime não existe (o anel fica no plano XY, que precisa das duas direções). Em algumas missões, uma frase chega partida: metade em cálculo no X, metade em runas no Y; juntar as duas traduzidas é uma Memória Cruzada (mecânica a desenvolver com o designer).
- **No Lime, tudo é um instante:** para a IA, o passado do Y (os acontecimentos que levam à fundação de Port Halden) e o presente do X (o Instituto de Física recebe os códigos) acontecem ao mesmo tempo. **Yudur já existia;** o jogo mostra o que leva à fundação da cidade.
- **Linha do tempo:** de Port Halden (X) ao lançamento da Domus (Z), 50 a 100 anos (o mundo acha que o sinal é alienígena; a confirmar se este intervalo é o mesmo de dentro da nave). **Do lançamento ao Lime, 26.000 anos para quem ficou (quem lançou a nave); dentro da Domus, só 50 a 100 anos** (relatividade, como no Interestelar). A tripulação não sabe.
- **Eixo Y é outro tempo, não outro mundo.** Eles leem runas, a princípio só isso. Nada religioso (sem heresia, igreja ou deuses).
- **Travessia** (missão em outro eixo): liberada tarde no jogo. Custa Ressonância, que vira Dissonância; é para isso que se ganha Ressonância nos dados. A partir de certo ponto de Ressonância, o jogador pode gastá-la para reduzir a Dissonância. Detalhes em `NARRATIVA.md`, seção 4.
- **As três línguas:** Código X (Código Urbano), runas de Yudur e a língua do Eixo Z, **ainda sem nome** ("Interface" é só provisório). **Agora o trabalho é no Código X.** Tempo no Código X: t₀ agora, t₋ passado, t₊ futuro, tᵢ começo, ∮(t) laço (o nó do tempo).
- **Tradução (decidido em 05/11/2026; o enigma se chama Decifrar, e a missão de quem falha de vez, Lição):** a tradução é **chave** sempre (saber ou não a palavra abre ou fecha escolhas) e **enigma** só em momentos marcados, como a frase partida. Juntar uma frase partida dá a Memória Cruzada e, dependendo do caso, também as palavras que faltavam. Quando o jogador não consegue completar a frase de jeito nenhum, nem com as dicas, abre uma **missão secundária (a lição) que necessariamente envolve um salto no tempo**; a penalidade é a Dissonância que o salto traz Vale em qualquer momento do jogo: o jogador não gasta Ressonância, só ganha Dissonância. As tentativas erradas antes disso não custam nada. Fácil (com opções) ou difícil (sem opções) é decidido em cada missão; na lição, quem ensina é uma pessoa ou um objeto sorteado das listas. Proposta completa (como se aprende, a frase partida passo a passo, campos do Criador): `DESIGN.md`, seção 5.
- **Frase decifrada e missão (decidido em 05/11/2026):** nas missões principais, pelo menos, a frase do Decifrar está ligada diretamente à missão do salto: pode ser o título ou o tema. Ela dá o ponto de partida, e a missão seguinte dá a continuidade.
- **O Muro (ideia do autor, a desenvolver):** um texto grande que deve ser traduzido em cada uma das línguas, como um muro só de texto que vai crescendo ao longo do jogo.
- **Falar com a IA (ideia do autor para o endgame):** numa parte do final, o jogador precisa se comunicar com a IA da Domus nessas línguas. Assim o uso das línguas deixa de ser só passivo (ler) e vira ativo (escrever).
- **Itens:** todo item tem um número de usos, de consumível (1 uso por item) a vários usos. Dois tipos: os do personagem (cada um começa com o seu conjunto inicial) e os encontrados nas missões. Um ou outro item é exclusivo de um personagem; via de regra, os itens também se encontram jogando. A Foto da Família é um item.
- **O designer de mecânicas pode mudar os dados e equilibrar o jogo** (números, marcas, itens, regras). História e lore continuam do autor.
- **Eixo X, radiação (decidido em 05/11/2026):** o epicentro da radiação são as **casas dos personagens**. Em algum momento eles passam a ser procurados por isso (ligação possível com o Instituto de Física). A imagem da luz azul com uma espécie de acelerador fica **escondida no subsolo da Atlantic Tower**.
- **Ordem de trabalho da lore:** primeiro o **Eixo Z**; o Y fica para depois.
- **Domus (confirmado em 05/11/2026):** cruzou o horizonte do buraco negro; vista de fora, parece parada; a "estrela que observa" é luz. Ideias do autor sobre a missão, o loop da IA, o sinal e os 26.000 anos: aba História, "A missão da Domus e o nó".
- **21h47 é a hora de bordo em que a Domus cruzou o horizonte.** Por isso tudo em Port Halden acontece às 21h47.
- **Quem fala do Lime é a IA da Domus** (decidido). As mensagens e os códigos são dela.
- **Em aberto:** o objetivo da missão da Domus, o que a IA quer (avisar, chamar ou ambíguo), ancestrais ou ecos.

## Jeito de fazer
- **Lore nova se faz com o autor, aos poucos:** perguntar o que ele já pensou e partir do texto dele; propor pouco de cada vez (uma ideia, duas ou três opções) e esperar a resposta. Nada de documentos grandes de lore inventada de uma vez.
- **Frases importantes das línguas são feitas a dois:** o `linguista` monta a escrita e a tradução, e o `guardiao-da-lore` confere se a frase combina com a lore (e não responde nada em aberto). Só depois vão ao autor.
- **Slow burn em toda missão:** começa na rotina; o estranho entra aos poucos e as pessoas tratam como incômodo do dia a dia ("foi ver a praça", "deve ser gás"), não como apocalipse. O que é pesado chega com o relógio ou com a investigação; sobrevivência total só perto do clímax. Nada de frase de efeito anunciando o perigo.
- **Nada pode lembrar o Brasil, nem um pouco.** Tudo é americanizado (nomes, instituições, costumes, jeito de falar).
- **Sem anos 80 por enquanto:** nenhuma data ou evento passado nos anos 80 (o incêndio da Delancey St. e o "1987" foram tirados).
- **Eixo X é sobrevivência**, não investigação: comida, abrigo, gente para proteger, chegar vivo ao fim da noite.
- **Telas sem rolagem**, texto em pedaços (um parágrafo por vez, digitado, com "Continuar ▸"), no celular e no PC.
- **Menus intocados:** a galáxia animada fica nos menus; artes vão para dentro das missões, mapas e retratos.
- **Vozes à moda antiga:** nada de IA lendo o texto. Fala breve gravada por personagem (`audio/barks/`, `ferramentas/gerar_barks.py`) + balbucio (`js/vozes.js`, PERFIS). NPC novo precisa dos dois.
- **Mapa de Port Halden** (`js/cidade-x.js`): catálogo fixo, conhecimento por personagem. Missão nova do X precisa de entrada em `LIGACOES_X`.
- Não procurar arquivos do autor pelo disco sem pedir.
