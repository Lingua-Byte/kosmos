# KOSMOS — Artes que faltam (com dimensões)

Levantado do código em 04/11/2026 (Prólogo "O Pulso" + X1 "A Manhã Seguinte").
O jogo já funciona sem elas: onde falta arte aparece um cartão com ícone e nome. Basta salvar o
arquivo com o nome certo na pasta certa e a arte aparece sozinha.

**Já prontas (04/11):** os **25 lugares de Port Halden + a Praça Central** (prancha de lugares, em `site/imagens/x/lugar-*.webp`). Enquanto as 9 origens não têm arte própria, a abertura de cada personagem mostra a arte do lugar onde ela fica.

**Também prontas:** 48 itens (16 itens × 3 mundos) e 9 retratos dos personagens prontos.

---

## Formatos

| Tipo | Onde aparece | Proporção | Tamanho | Formato |
|---|---|---|---|---|
| **Palco (imagem)** | em cima do texto da missão | **16:9** | **1920 × 1080** (mínimo 1280 × 720) | `.webp` (ou `.png`/`.jpg`, eu converto) |
| **Palco (vídeo, opcional)** | no lugar da imagem, em loop | 16:9 | 1280 × 720 ou 1920 × 1080 | `.mp4` (H.264), 5–10 s, loop sem corte, **sem som**, até ~4 MB |
| **Retrato de NPC** | no palco, quando o NPC fala | **16:9** | **1600 × 900** | `.webp` |
| **Caminho (transição)** | ao viajar entre lugares | 16:9 | 1280 × 720 | `.mp4`, 2–3 s, sem som |
| Item (já prontos) | Bolsa, ficha, lojas | 1:1 | 512 × 512 | `.webp` |
| Retrato de personagem (já prontos) | escolha de personagem | 1:1 | 512 × 512 | `.webp` |
| Cinemática | tela de carregamento / abertura | 16:9 | 1920 × 1080 | `.mp4`; no celular em pé o jogo recorta para 9:16 |

**Regras de composição do palco (16:9):**
- O jogo **recorta para preencher** o quadro: deixe o que importa no **centro**, longe das bordas (uns 10% de margem).
- Pouco texto na imagem: as placas e letreiros podem cortar.
- Estilo do Eixo X (Port Halden): noite, chuva, néon **verde e âmbar**, realista, sem horror explícito (o mesmo das pranchas 04 e 04c).
- **Retrato de NPC em 16:9:** busto com o rosto no **terço central**, o fundo é o lugar onde ele está. Os 10 retratos atuais são quadrados e pequenos (≈ 290 × 275), por isso aparecem cortados no palco: vale refazer em 1600 × 900 (prioridade 6).

---

## Pastas e nomes

- Palco e caminhos: `site/imagens/x/<nome>.webp` (ou `.mp4`)
- NPCs: `site/imagens/npcs/npc-<id>.webp`

---

## Prioridade 1 — As 9 origens (a primeira tela de cada personagem) · 9 imagens 16:9

| Arquivo | O que mostrar |
|---|---|
| `abertura-estacao-9` | Estação 9 dos bombeiros à noite: caminhão lavado, mangueiras enroladas, placa “EVERYONE GOES HOME”, telefone de parede |
| `abertura-viatura-412` | Dentro da viatura 4-12 parada na frente do 4º Distrito: giroflex sem som, porta do carona aberta, distintivo no painel |
| `abertura-harbor-street` | Harbor Street: moto de entrega parada, bag térmica, semáforos piscando amarelo, gente andando para o mesmo lado |
| `abertura-pronto-socorro` | Pronto-socorro do St. Luke's: macas no corredor, monitor, um leito com um menino de olhos fechados |
| `abertura-st-brendans` | Igreja de St. Brendan's na beira do porto: velas, bancos vazios, confessionário entreaberto, um terço no banco |
| `abertura-centro-comunitario` | Bingo de terça no centro comunitário: cartelas pela metade, chá esfriando, cadeiras empurradas, globo parado |
| `abertura-laboratorio` | Laboratório de radiação: sensores, gráficos impressos, monitor com picos, um pendrive na mesa |
| `abertura-kphn` | Estúdio da rádio KPHN: luz NO AIR acesa, painel de linhas piscando, microfone, fones largados |
| `abertura-taxi` | Táxi visto de dentro: taxímetro aceso, rosário no retrovisor, foto das filhas, banco de trás vazio pelo retrovisor |

## Prioridade 2 — Lugares de Port Halden · 12 imagens 16:9
(cada uma serve para todas as missões que passam pelo lugar)

| Arquivo | Lugar |
|---|---|
| `lugar-casa` | Sua casa (prédio residencial, corredor, cozinha com rádio) |
| `lugar-st-lukes` | Hospital St. Luke's Memorial (fachada ou recepção lotada e silenciosa) |
| `lugar-delegacia-9` | Delegacia do 9º Distrito |
| `lugar-metro` | Estação Rua 9 (metrô, catraca, plataforma) |
| `lugar-abe` | Conveniência do Abe (balcão, letreiro de néon) |
| `lugar-universidade` | Instituto de Física (sala com quadro de equações) |
| `lugar-aurora` | Edifício Aurora, o telhado (antenas, a cidade embaixo) |
| `lugar-atlantico` | Atlantic Tower (portaria, guarita do vigia) |
| `lugar-viaduto` | Viaduto Leste (muros riscados com giz) |
| `lugar-drogaria` | Drogaria Goodwell (porta com corrente, prateleiras) |
| `lugar-ginasio` | Ginásio Lincoln, posto de ração da Contenção (fila, caminhões brancos) |
| `lugar-cerca` | A cerca do centro (grades, guardas da Contenção, holofotes) |

## Prioridade 3 — Cenas da história · 11 imagens 16:9

| Arquivo | Cena |
|---|---|
| `prologo-x-cena-abertura` | Terça, 21h47: a cidade ainda normal, o homem de terno parado ao lado da picape (vista geral) |
| `prologo-x-cena-chamado` | Todos caminhando em silêncio para o mesmo lado |
| `prologo-x-cena-borda` | A borda: multidão de olhos arregalados, postes piscando |
| `prologo-x-cena-meio` | Dentro da multidão, ombro a ombro, alguém escrevendo no chão |
| `prologo-x-cena-centro` | O olho do furacão: praça lotada, um rádio de pilha num banco |
| `prologo-x-cena-ataque` | Centenas de cabeças virando para quem olha |
| `prologo-x-cena-salto` | O clarão: mãos, luz branca, sugestão de pedra e velas |
| `x1-manha-cena-abertura` | Quarta, 6h12: manhã cinzenta, cidade cercada, caminhões brancos |
| `x1-manha-cena-chamado` | O toque de recolher: sirenes, ruas esvaziando |
| `x1-manha-cena-contagem` | Os fundos da drogaria: Teddy de frente para a parede cheia de números |
| `x1-manha-cena-salto` | Sexta-feira, 21:47: o fim da contagem |

## Prioridade 4 — NPCs que ainda não têm retrato · 9 imagens 1600 × 900

| Arquivo | Quem |
|---|---|
| `npc-ouvinte-x` | A Ouvinte: mulher de uns 40, cabelo raspado de um lado, fone num ouvido só, telhado com antenas |
| `npc-hollis` | Sr. Hollis, do 302: idoso de pijama, confuso e educado |
| `npc-petrakis` | Sra. Petrakis: vizinha idosa, desconfiada, torta embrulhada em pano |
| `npc-oswald` | Oswald, o vigia: uniforme impecável, pupilas dilatadas, caderno de ponto |
| `npc-leo` | Leo, do leito 9: menino de 9 anos num leito de hospital, olhos fechados, dedos riscando o lençol |
| `npc-rita` | Rita Alvarez: mãe latina, barrada na fila da ração com uma caixa e o filho pela mão |
| `npc-guarda` | Guarda da Contenção: uniforme branco/cinza, máscara, prancheta |
| `npc-saqueador` | Um saqueador: moletom, mochila cheia, nervoso |
| `npc-walt` | Walt Brody: aposentado do metrô, braços cruzados encarando a cerca; viu a noite de 1987 |

## Prioridade 5 — Transições de viagem (vídeo, opcional) · 4 vídeos 1280 × 720, 2–3 s

| Arquivo | Quando toca |
|---|---|
| `caminho-calcada.mp4` | a pé pela calçada (o mais comum) |
| `caminho-carro.mp4` | de carro (quem tem veículo) |
| `caminho-metro.mp4` | indo ou voltando do metrô |
| `caminho-escada.mp4` | subindo prédios (casa, Aurora, Atlantic Tower) |

Sem esses vídeos, a viagem mostra uma tela de carregamento com a arte do destino.

## Prioridade 6 — Refazer os 10 retratos antigos em 16:9 · 1600 × 900

`npc-helen`, `npc-moore`, `npc-martha`, `npc-teddy`, `npc-abe`, `npc-sal`, `npc-danny`, `npc-hilde`,
`npc-homem-terno`, `npc-riscador` (mesmas pessoas da prancha 04, em quadro largo).

## A definir — a história de contextualização no Eixo Z

A nova abertura do jogo (antes do Prólogo X) ainda não está escrita. Quando estiver, ela vai pedir
cenas 16:9 (1920 × 1080) e talvez uma cinemática curta. As cinemáticas que já existem
(`domus-viagem.mp4`, `yudur-vila.mp4`) seguem o mesmo formato.

---

## Total

| | Quantidade | Formato |
|---|---|---|
| Origens | 9 | 1920 × 1080 |
| Lugares | 12 | 1920 × 1080 |
| Cenas | 11 | 1920 × 1080 |
| NPCs novos | 9 | 1600 × 900 |
| Transições (opcional) | 4 vídeos | 1280 × 720 |
| NPCs a refazer (opcional) | 10 | 1600 × 900 |
| **Essencial** | **41 imagens** | |

> Se a criação de personagem própria voltar um dia, faltam também as 8 aberturas por profissão
> (`abertura-hospital`, `abertura-defesa`, `abertura-universidade`, `abertura-comercio`,
> `abertura-escritorio`, `abertura-rua`, `abertura-arte`, `abertura-casa`).
