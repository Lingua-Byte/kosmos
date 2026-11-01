# KOSMOS — Briefing de arte (para o ChatGPT)

> Como usar: copie a seção **"Contexto do jogo"** uma vez no começo da conversa com o ChatGPT.
> Depois, peça **uma prancha por vez**, colando o bloco "Pedido" de cada prancha.
> Cada prancha é **uma imagem só**, com todas as artes em grade e o **nome de cada arte escrito embaixo dela**.
> Salve cada prancha com o nome indicado (ex.: `prancha-01-itens-urbano.png`) na pasta `Artes/pranchas/` do projeto
> e avise o Claude: ele recorta, converte e coloca cada arte no lugar certo do jogo.

---

## Contexto do jogo (colar uma vez)

```
Estou fazendo um RPG de horror cósmico chamado KOSMOS. Vou te pedir várias pranchas de arte.
Regras para TODAS as pranchas:

1. Cada prancha é UMA imagem, com as artes organizadas numa grade regular (todas as células do mesmo tamanho).
2. Embaixo de cada arte, uma faixa lisa com o NOME exato que eu passar (letra simples, sem serifa, preta sobre faixa clara).
   Escreva o nome exatamente como está, sem acentos novos, sem traduzir. Ele serve para eu recortar depois.
3. Deixe um espaço (margem) entre as células. Nada pode passar da borda da célula.
4. Mesmo estilo, mesma luz e mesmo ângulo em todas as artes de uma prancha.
5. Nada de horror explícito: sem sangue, sem corpos, sem ferimentos à mostra. O horror é sugerido.
6. Sem logotipos ou marcas reais.

O jogo tem três mundos (eixos), e a mesma pessoa existe nos três sem saber:
- EIXO X · URBANO: Port Halden, uma cidade americana fictícia, nos dias de hoje, à noite.
  Clima: noite úmida, néon, postes de sódio, concreto, tom seco e irônico (inspiração: o humor de placas e cartazes dos jogos da Bethesda, mas na atualidade, sem retrofuturismo). Cores puxando para o verde e o âmbar.
- EIXO Y · MEDIEVAL: Yudur, uma região de fantasia sombria. Mosteiros de pedra, vilas, velas, carvão, runas.
  Clima: pintura a óleo, luz de vela e braseiro, tons de sépia, ouro velho e marrom.
- EIXO Z · ESPACIAL: a nave Domus, uma nave enorme com o casco de placas de metal QUADRADAS e rebitadas, luzes âmbar, uma grande cúpula de vidro com árvores dentro.
  Clima: ficção científica séria, metal escovado, luz âmbar e azul. Os APARELHOS (gadgets) e as telas deles são em cassette futurism: botões físicos, teclas grandes, telas de fósforo, plástico creme e cinza, fios em espiral.
```

---

## Pranchas de ITENS (512×512 cada célula; fundo liso, item centralizado, como ícone de inventário pintado)

Os itens existem nos três eixos com outro nome. Cada eixo tem a sua prancha (4 × 4).

### Prancha 01 — Itens do Urbano
Arquivo: `prancha-01-itens-urbano.png`

```
Prancha 01: 16 ícones de inventário do EIXO X (Port Halden, atualidade, noite, verde e âmbar).
Grade 4 x 4. Cada objeto sozinho, centralizado, fundo escuro liso, estilo pintura digital realista.
Nome embaixo de cada um, exatamente assim:

comunicador-x  — um smartphone com a tela rachada acesa
veiculo-x      — chave de carro com chaveiro de motel (ou um sedã americano visto de lado, pequeno)
luz-x          — lanterna de metal pesada
arma_leve-x    — pistola semiautomática (sem sangue)
arma_pesada-x  — espingarda de cano duplo
protecao-x     — colete balístico
kit_medico-x   — maleta de primeiros socorros vermelha
detector-x     — contador Geiger antigo com agulha
ferramentas-x  — caixa de ferramentas aberta
objeto_pessoal-x — foto de família amassada num porta-retrato
comida-x       — sanduíche embrulhado em papel
cafe-x         — copo de café de papel de lanchonete
remedio-x      — frasco de analgésico e rolo de curativo
calmante-x     — frasco de remédio controlado com rótulo
bebida-x       — garrafa long neck de cerveja (sem marca)
bateria-x      — bateria portátil com cabo
```

### Prancha 02 — Itens do Medieval
Arquivo: `prancha-02-itens-medieval.png`

```
Prancha 02: 16 ícones de inventário do EIXO Y (Yudur, fantasia sombria, pintura a óleo, luz de vela, sépia e ouro velho).
Grade 4 x 4. Cada objeto sozinho, centralizado, fundo escuro liso.
Nome embaixo de cada um, exatamente assim:

comunicador-y  — corvo mensageiro com um bilhete preso na pata
veiculo-y      — cavalo de sela (ou só a cabeça com rédeas)
luz-y          — tocha acesa
arma_leve-y    — adaga com cabo de couro
arma_pesada-y  — espada longa
protecao-y     — cota de malha
kit_medico-y   — maço de ervas e ataduras de linho
detector-y     — pêndulo rúnico de pedra numa corrente
ferramentas-y  — conjunto de gazuas num rolo de couro
objeto_pessoal-y — relíquia de casa: um pequeno amuleto de madeira
comida-y       — pão redondo e queijo
cafe-y         — caneca de barro com chá de ervas fumegante
remedio-y      — pote de unguento e ataduras
calmante-y     — frasco de infusão de valeriana
bebida-y       — chifre ou caneca de hidromel
bateria-y      — frasco de óleo de lamparina
```

### Prancha 03 — Itens do Espacial
Arquivo: `prancha-03-itens-espacial.png`

```
Prancha 03: 16 ícones de inventário do EIXO Z (nave Domus; metal escovado, luz âmbar e azul).
Os aparelhos são em cassette futurism (botões físicos, telas de fósforo verdes ou âmbar, plástico creme e cinza).
Grade 4 x 4. Cada objeto sozinho, centralizado, fundo escuro liso.
Nome embaixo de cada um, exatamente assim:

comunicador-z  — comunicador de pulso (cassette futurism, tela pequena de fósforo)
veiculo-z      — módulo de transporte (cápsula pequena de carga, vista de lado)
luz-z          — holofote de capacete
arma_leve-z    — pistola de pulso
arma_pesada-z  — rifle de plasma
protecao-z     — traje pressurizado (só o torso e o capacete)
kit_medico-z   — injetor médico
detector-z     — sensor de campo estelar (aparelho de mão, cassette futurism, com antena)
ferramentas-z  — multiferramenta de bordo
objeto_pessoal-z — holograma de casa (projetor pequeno com a imagem de uma família)
comida-z       — ração de bordo em embalagem metálica
cafe-z         — ampola de estimulante
remedio-z      — kit de sutura de bordo
calmante-z     — cápsula de sedativo leve
bebida-z       — garrafa de destilado feita na hidroponia
bateria-z      — célula de energia
```

---

## Pranchas de RETRATOS (512×640 cada célula; busto, olhando para a câmera ou levemente de lado)

### Prancha 04 — Pessoas de Port Halden (Urbano)
Arquivo: `prancha-04-npcs-urbano.png`

```
Prancha 04: retratos (busto) de pessoas de Port Halden, EIXO X. Grade 4 x 4 (deixe as 2 últimas células vazias).
Estilo: pintura digital realista, noite, luz de néon e de poste, verde e âmbar. Nada de horror explícito.
Nome embaixo de cada um, exatamente assim:

npc-ouvinte-x    — a Ouvinte: mulher de uns 40 anos, cabelo raspado de um lado, fone num ouvido só, num telhado com antenas
npc-helen        — Dra. Helen Vance: psiquiatra, jaleco amassado, óculos presos no cabelo, olheiras, um caderno de desenhos
npc-moore        — Agente Moore: Defesa Civil, colete, rádio no ombro, cara de quem não dorme há dois dias
npc-martha       — Martha Kowalski: farmacêutica de bairro, firme, cardigã, corrente passada na porta atrás dela
npc-teddy        — Teddy: irmão da Martha, olhar perdido, sentado de frente para uma parede, contando
npc-hollis       — Sr. Hollis: vizinho idoso de pijama, confuso e educado
npc-petrakis     — Sra. Petrakis: vizinha idosa, desconfiada, segurando uma torta embrulhada em pano
npc-abe          — Abe: dono da loja de conveniência, idoso, avental, atrás do balcão
npc-danny        — Danny: rapaz de moletom, assustado, mãos sujas de giz
npc-hilde        — professora Hilde Brandt: física, tapando um ouvido, laboratório ao fundo
npc-oswald       — Oswald: vigia noturno, uniforme impecável, pupilas dilatadas, caderno de ponto
npc-sal          — Sal: porteiro velho na guarita, garrafão de café
npc-homem-terno  — o Homem de Terno: parado ao lado de uma picape, rosto calmo demais
npc-riscador     — um Riscador: de costas, moletom, riscando códigos num muro de viaduto com giz
```

### Prancha 05 — Pessoas de Yudur e da Domus
Arquivo: `prancha-05-npcs-yudur-domus.png`

```
Prancha 05: retratos (busto). Grade 3 x 3.
As da primeira fila são do EIXO Y (pintura a óleo, luz de vela, sépia).
As outras são do EIXO Z (nave Domus, metal, luz âmbar e azul).
Nome embaixo de cada um, exatamente assim:

npc-ouvinte-y    — a Ouvinte como bardo itinerante: capuz, alaúde, numa taverna enfumaçada
npc-theodric     — Abade Theodric: velho alto e magro, hábito cinzento, dedos manchados de tinta, olhar que segue algo invisível
npc-mabel        — Irmã Mabel: herbalista baixa e forte, mãos verdes de ervas, avental cheio de bolsos
npc-aldric       — Aldric: irmão da Mabel, de frente para uma parede de pedra, contando números
npc-ouvinte-z    — a Ouvinte como operadora de comunicações da Domus: fone, painel cassette futurism atrás
npc-arasaki      — Comandante Arasaki: comandante da Domus, uniforme, na ponte, cúpula de vidro ao fundo
npc-vasko        — Técnico Oren Vasko: uniforme de manutenção impecável, pele acinzentada, pupilas dilatadas, hidroponia azul ao fundo
npc-domus-ia     — DOMUS, a IA da nave: não é uma pessoa; um painel/olho de luz âmbar num console cassette futurism
(célula vazia)
```

> O Runático já existe (`Artes/runatico.webp`).

### Prancha 04c — Personagens prontos (os 9 jogáveis)
Arquivo: `prancha-04c-prontos.png` · cada retrato vira `site/imagens/prontos/<nome>.webp` (quadrado, 512×512)

```
Prancha 04c: retratos (busto, enquadramento QUADRADO) dos personagens jogáveis de Port Halden, EIXO X.
Grade 3 x 3. Cada coluna é uma classe: TANK (esquerda), HEALER (meio), SUPPORT (direita).
Estilo: o mesmo da Prancha 04 — pintura digital realista, noite, néon e poste, verde e âmbar.
São heróis comuns: gente de verdade, cansada, determinada. Rosto bem visível, olhando para a câmera.
Nome embaixo de cada um, exatamente assim:

frank-brennan  — Frank Brennan, 52: bombeiro veterano, bigode grisalho, casaco de bombeiro aberto, fuligem no rosto, capacete debaixo do braço
denise-carter    — Denise Carter, 41: médica de pronto-socorro, negra, cabelo preso às pressas, jaleco sobre o uniforme verde, estetoscópio
eli-navarro    — Eli Navarro, 29: técnico de radiação, latino, óculos, jaqueta de laboratório, contador Geiger na mão
rosa-delgado   — Rosa Delgado, 34: policial de patrulha, latina, uniforme azul-escuro, rádio no ombro, olhar duro
michael-doyle  — Michael Doyle, 63: padre irlandês-americano, colarinho clerical, casaco preto gasto, terço enrolado na mão
tess-monroe    — Tess Monroe, 38: radialista da madrugada, cabelo curto ruivo, fones no pescoço, microfone de estúdio atrás
marcus-bell    — Marcus Bell, 27: entregador de moto, negro, jaqueta corta-vento, capacete na mão, mochila térmica
june-albright  — June Albright, 71: enfermeira aposentada, cabelo branco preso, cardigã, maleta de primeiros socorros antiga
ray-okafor     — Ray Okafor, 45: taxista nigeriano-americano, boné, camisa de botão, chaves do carro na mão, luzes da rua no vidro
```

---

## LUGARES e CENAS do Eixo X (16:9, 1600×900)

Cenas precisam de resolução grande para aparecer bem no topo da tela. Por isso o ideal é **uma imagem por lugar**.
Se quiser ganhar tempo, dá para pedir em pranchas de 2 × 2 (quatro lugares por imagem, cada um em 16:9), sabendo que vão ficar com menos detalhe.

Estilo comum (colar junto):
```
Ilustração de cenário do EIXO X (Port Halden, cidade americana fictícia, atualidade, noite).
Pintura digital, vista em leve perspectiva isométrica (2.5D), sem personagens em primeiro plano,
espaço livre no centro para o texto do jogo não cobrir nada importante. Verde e âmbar, néon, postes de sódio.
Nome embaixo, exatamente como indicado.
```

### Prancha 06 — Lugares da cidade (1)
Arquivo: `prancha-06-lugares-urbano-1.png` (2 × 2)
```
lugar-casa          — sala de um apartamento pequeno, TV ligada sem ninguém, cortina, janela para a rua cheia
lugar-hospital      — recepção do Hospital St. Luke's Memorial, lotada e silenciosa, luzes piscando
lugar-delegacia     — Delegacia do 9º Distrito, cartaz "PÂNICO É CONTAGIOSO. FIQUE EM CASA, CIDADÃO." no mural
lugar-metro         — Estação da Rua 9 abandonada, catraca, plataforma escura
```

### Prancha 07 — Lugares da cidade (2)
Arquivo: `prancha-07-lugares-urbano-2.png` (2 × 2)
```
lugar-mercado       — Conveniência do Abe, luz amarela, prateleiras de água vazias, placa "ABERTO 24 HORAS. FECHADO SÓ EM CASO DE FIM DO MUNDO."
lugar-farmacia      — Drogaria Goodwell, porta de vidro meio baixada com corrente por dentro
lugar-universidade  — corredor do Instituto de Física, sala 21 acesa, equação no quadro
lugar-aurora        — telhado do Edifício Aurora: antenas improvisadas, cabos, um balde virado, fitas cassete numa mesa
```

### Prancha 08 — Lugares da cidade (3)
Arquivo: `prancha-08-lugares-urbano-3.png` (2 × 2)
```
lugar-atlantico     — saguão de mármore da Atlantic Tower, aquário sem peixes, balcão do vigia
lugar-viaduto       — debaixo do Viaduto Leste, muros cobertos de códigos riscados a giz
lugar-praca         — a Praça Central vista de longe, multidão parada, um rádio no centro
(célula vazia)
```

### Prancha 09 — Onde cada profissão começa (aberturas)
Arquivo: `prancha-09-aberturas-1.png` (2 × 2)
```
abertura-hospital      — ambulatório do St. Luke's no fim do plantão, macas vazias, quadro "SORRIA. VOCÊ ESTÁ SENDO CUIDADO."
abertura-defesa        — posto da Defesa Civil, rádios, cartaz "MANTENHA A CALMA. A DEFESA CIVIL ESTÁ NO CONTROLE."
abertura-universidade  — laboratório de radiação, sensores com pico, cafeteira ligada
abertura-comercio      — loja com letreiro de néon "ABERTO", carrinhos largados, uma moeda girando no balcão
```

### Prancha 10 — Onde cada profissão começa (2)
Arquivo: `prancha-10-aberturas-2.png` (2 × 2)
```
abertura-escritorio    — 14º andar de escritório, baias vazias, todos os monitores com estática
abertura-rua           — esquina à noite, pessoas andando caladas na mesma direção
abertura-arte          — estúdio de rádio KPHN, mesa de som, um técnico tirando os fones
abertura-casa          — calçada em frente a um prédio, uma caixa de encomenda no chão, a rua cheia
```

### Prancha 11 — O olho do furacão (cenas do clímax)
Arquivo: `prancha-11-cenas-climax.png` (2 × 3)
```
cena-chamado   — rua cheia de gente andando em silêncio para o centro, ninguém olha para trás
cena-borda     — a borda da multidão, ar tremendo como calor, luzes piscando
cena-meio      — meio da multidão, alguém escrevendo símbolos no chão com o dedo
cena-centro    — o centro da praça, um rádio antigo tocando, a multidão cantando
cena-ataque    — centenas de cabeças virando ao mesmo tempo para quem olha (sem violência explícita)
cena-salto     — clarão branco que vira teto de pedra de mosteiro, velas, alguém de capuz se inclinando
```

---

## Depois (quando o Medieval e a Domus tiverem missões)

Os pontos de entrada já definidos para cada eixo também vão precisar de cenário (16:9, mesmo esquema de pranchas 2 × 2):

- **Yudur:** `lugar-y-mosteiro`, `lugar-y-castelo`, `lugar-y-vila`, `lugar-y-oficinas`, `lugar-y-campo`, `lugar-y-floresta`, `lugar-y-estrada`, `lugar-y-mina`
- **Domus:** `lugar-z-ponte`, `lugar-z-motores`, `lugar-z-enfermaria`, `lugar-z-hidroponia`, `lugar-z-laboratorio`, `lugar-z-seguranca`, `lugar-z-servicos`, `lugar-z-alojamentos`

---

## Resumo

| Prancha | O quê | Artes |
|---|---|---|
| 01–03 | Itens (Urbano, Medieval, Espacial) | 48 |
| 04–05 | Retratos de NPCs | 22 |
| 06–08 | Lugares de Port Halden | 11 |
| 09–10 | Aberturas por profissão | 8 |
| 11 | Cenas do clímax | 6 |
| **Total agora** | | **95** |
| Depois | Lugares de Yudur e da Domus | 16 |

---

## VÍDEOS do palco (a parte de cima da tela da missão)

A tela da missão agora funciona como as telas dos Fallout clássicos: **a imagem viva do lugar em cima, o texto e as escolhas embaixo**.
Para cada lugar, cena e abertura acima, o jogo procura, nesta ordem:

1. um **vídeo em loop**: `site/imagens/x/<nome>.mp4` (ex.: `lugar-mercado.mp4`)
2. a **imagem**: `site/imagens/x/<nome>.webp` (ex.: `lugar-mercado.webp`)
3. sem nenhum dos dois, um cartão com o ícone e o nome do lugar.

Ou seja: os nomes das pranchas 06 a 11 servem para os dois. Primeiro as imagens; depois, se quiser, anime cada imagem num vídeo com o mesmo nome.

**Como fazer os vídeos:** gere a imagem do lugar (ChatGPT) e anime essa imagem numa IA de vídeo (Sora, ou a ferramenta que você usou para a Domus e a vila).
Pedido sugerido para cada um:
```
Anime esta imagem como um loop de 6 segundos, câmera parada, movimento sutil
(luz de néon piscando, fumaça, chuva fina, gente passando ao fundo). Sem cortes.
O último quadro deve emendar com o primeiro. 16:9, 720p.
```
Formato: **mp4 (H.264), 16:9, 720p, 5 a 8 segundos, até 3 MB.**

### Vídeos de caminho (a transição quando o jogador viaja)
Tocam uma vez, entre um lugar e outro. Sem eles, o jogo mostra uma tela de carregamento com a arte do destino.

| Arquivo | Quando toca | O que mostrar |
|---|---|---|
| `caminho-calcada.mp4` | indo a pé para a maioria dos lugares | calçada de Port Halden à noite, primeira pessoa, gente andando calada para o mesmo lado |
| `caminho-metro.mp4` | indo ou saindo da Estação da Rua 9 | descendo a escada do metrô, luz fluorescente piscando |
| `caminho-carro.mp4` | quando alguém do grupo tem carro | pelo para-brisa, avenida à noite, semáforos piscando no ritmo |
| `caminho-escada.mp4` | indo para casa, para o Edifício Aurora ou para a Atlantic Tower | subindo escada de prédio, porta corta-fogo, eco |

Os quatro também em `site/imagens/x/`, mp4, 3 a 6 segundos.
