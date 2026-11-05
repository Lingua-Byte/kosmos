# KOSMOS — Mecânicas

O que já funciona no jogo e o que está proposto. Mantido pelo agente `designer-de-mecanicas`
(ele propõe; o que o autor aprovar entra aqui e depois no código). Os números de verdade estão em
`site/js/data.js` (dados) e `site/js/regras.js` (motor de regras).

---

## 1. O que já existe

### Ficha
- **Três atributos**, que mudam de nome por eixo: Corpo (Força no X), Mente, Essência (Espírito no X). Máximo 10.
- **Classe** (Tank, Healer, Support) vem da profissão. Os 9 prontos têm classe fixa.
- **Traços** (2 ou 3, lista fechada): cada um dá +1 dado num tipo de situação e −1 em outro.
  Ex.: *Protetor* +1 para proteger, −1 para fugir.
- **Habilidades** (3 pontos para gastar) e **equipamentos** (carga = 3 + Corpo). Dão dados extras por *tag*
  de situação; alguns têm usos por cena ou por sessão. Cada item existe nos três eixos com outro nome.
- **Pertences** (bolsa com 10 espaços): comida, café, remédio, calmante, bebida, bateria. Se gastam.
- **Condições**: com fome, cansado, ferido, abalado. Cada uma tira 1 dado de um atributo até ser resolvida.
- **Dinheiro** por eixo (dólares, pratas, créditos).

### Testes (parada de d6)
- Rola **atributo + 1** dados de seis lados; cada **5 ou 6** é um sucesso.
- A **situação** decide o atributo e quantos sucessos precisa (1 Normal, 2 Difícil, 3 Extremo).
- O jogador **vê a chance** antes de escolher (Fácil / Médio / Difícil / Quase impossível + %).
- Cada **1** rolado é um "sinal" ◉, que pode custar exposição.

Chance de passar (cada dado tem 1/3 de chance):

| Dados | 1 sucesso | 2 sucessos | 3 sucessos |
|---|---|---|---|
| 2 | 56% | 11% | — |
| 3 | 70% | 26% | 4% |
| 4 | 80% | 41% | 11% |
| 5 | 87% | 54% | 21% |
| 6 | 91% | 65% | 32% |
| 8 | 96% | 80% | 53% |

### Exposição, Ressonância e Dissonância
- **Exposição** por eixo (máx. 39) sobe com o fenômeno.
- **Teste de Convergência** (Essência): passou → +Ressonância (aceita o fenômeno); falhou → +Dissonância (resiste no caos).
- **Marcas** a cada 5 pontos mudam a ficha. Ressonância: +Mente, memória de outro eixo, atração, lucidez,
  desprendimento, e em 30 "Integração" (vira Interface). Dissonância: adrenalina, fissura, paranoia,
  perda de controle, fúria, e em 30 "Colapso".
- No mundo, quase ninguém fala essas palavras: são nomes de regra.

### Missão do Eixo X (sobrevivência)
- **Relógio da noite** (16 marcas no Prólogo). Ações gastam tempo; o mundo muda por marca
  (ambiente, eventos, ações que só abrem depois). Fome e cansaço chegam sozinhos com o relógio.
- **Pistas**: com 5, o jogador pode ir ao clímax quando quiser; com o relógio cheio, vai de qualquer jeito.
- **Mapa de Port Halden** com névoa: cada personagem conhece uma parte; lugar desconhecido custa tempo.
- **NPCs com atitude** (gostam mais ou menos de cada personagem) e **tendência** do personagem (herói,
  anti-herói, vilão) que as cenas podem consultar.
- **Quests** no Diário, com prazo curto / médio / longo.

### Coleção
- **Artes:** cada lugar, cena ou retrato de NPC que aparece no palco pela primeira vez entra na Coleção (◈ na barra da missão e na tela de personagens). Mostra "achadas / total"; as que faltam aparecem como "?".
- **Textos de lore:** documentos escritos por alguém do mundo (escala, aviso, panfleto, livro de ponto…), achados por ações das missões. Abrem na hora, um parágrafo por vez, e ficam guardados.
- É do jogador (vale para todos os personagens) e vai para a nuvem com a conta.

### Línguas
- Três línguas que traduzem **conceitos** (Código Urbano no X, runas Yudur no Y, Interface no Z).
  Cada personagem conhece uma parte. Runas no Y funcionam como **cartas** viradas, aprendidas com testes de Mente.
- Hoje, "ler símbolos" no jogo é só um teste de Mente; o Tradutor é uma tela à parte.

---

## 2. Propostas (aguardando o autor)

Ideias já conversadas, ainda sem decisão. Detalhes em `FERRAMENTAS.md` §4 e na conversa com o autor.

| Proposta | Em uma linha | Mexe em |
|---|---|---|
| Caderno de decifração | Símbolos vão para um caderno; o jogador chuta o sentido e confirma por contexto; traduzir dá vantagem para sobreviver | línguas, cenas, ficha |
| Reputação por bairro | Port Halden lembra o que você fez; preços, ajuda e portas mudam | NPCs, mapa |
| Companheiros com aprovação | Os prontos reagem às escolhas uns dos outros | grupo, Diário |
| Epílogo em quadros | Uma tela por lugar e pessoa no fim, conforme o que o jogador fez | fim de missão |
| Documentos que pioram | Diários, escalas e mensagens que mudam com o relógio (técnica do Resident Evil) | cenas, relógio |
| Conversa livre com NPC | Jogador escreve; o jogo entende e responde com falas do autor (teste: `teste-abe.html`) | NPCs |
| Combate por pontos de ação | Turnos curtos: mirar, correr, cobrir, usar item | testes, condições |
| Missões secundárias por modelo | Lugar + pessoa + necessidade + complicação, escritas pelo autor | missões |

## 3. Decidido

(vazio: o que o autor aprovar entra aqui, com a data)
