# KOSMOS — A conta da IA da Domus (simulação)

> **Proposta, para o autor decidir.** É ficção científica: a conta não manda nada pelo tempo de verdade. Mas cada peça
> que pode ser física real é física real, com números reais. Rode `python3 ferramentas/calculo_da_ia.py` para ver a
> saída abaixo, e mude os números no começo do arquivo para testar outras versões.

## O problema da IA
Do Lime, a IA precisa mandar os códigos para **um ponto da Terra num instante exato**. Não basta acertar o ano: a Terra
gira, dá a volta no Sol, o eixo dela bambeia, e o Sol inteiro anda pela galáxia. Mirar a Terra no passado é como acertar
um carro que já passou, a 26 mil anos-luz de distância.

## As peças da conta
1. **O nó (física real).** As duas bordas de um buraco negro que gira: **r± = M · (1 ± √(1 − a²))**. A mesma equação
   sempre dá duas respostas.
2. **A viagem (física real).** Dilatação do tempo: **Δt_Terra = γ · Δt_bordo**. 26.000 anos lá fora em 75 a bordo
   pedem γ ≈ 347, a 99,99958% da velocidade da luz.
3. **As duas respostas (ficção).** A IA usa as duas bordas como "quanto voltar": **Δt± = Δt_X · r±/r₋**. Uma cai em
   Port Halden; a outra, mais longe, em Yudur.
4. **O alvo se move (física real).** A posição do lugar visto de Sagitário A* é a soma de quatro movimentos:
   **x(t) = x_Sol(t) + x_órbita(t) + x_giro(t; latitude, longitude, precessão)**.
5. **A mira (ficção com números reais).** A mensagem tem de cair a menos de 1 km do alvo:
   **| x_sinal − x(latitude, longitude, t) | < ε**.

## A saída da simulação (registro de mira)
```
DOMUS · NÚCLEO DE NAVEGAÇÃO · REGISTRO DE MIRA
1. GEOMETRIA DO NÓ  (Kerr: r± = M·(1 ± √(1 − a²)))
   massa            4.297e+06 M☉   →  GM/c² = 6,345,058 km
   giro a           0.9998
   borda de fora r₊ 1.019999 M  = 6,471,953 km
   borda de dentro  0.980001 M  = 6,218,163 km
   razão r₊/r₋      1.040814   ← as duas respostas da mesma equação
2. TEMPO DA VIAGEM  (dilatação: Δt_terra = γ · Δt_bordo)
   Terra 26,000 anos · bordo 75 anos · γ 346.7 · velocidade 99.99958 % da luz
   distância        26,673 anos-luz até Sagitário A*
3. AS DUAS RESPOSTAS  (Δt± = Δt_X · r±/r₋)
   ponto zero 0 (o Lime) · lançamento −26,000
   resposta r₋ (X)  −26,075   ← Port Halden: o Instituto recebe os códigos
   resposta r₊ (Y)  −27,139   ← Yudur
   distância X–Y    1,064 anos
4. O CENTRO DESLOCOU-SE  (alvo visto de Sagitário A*)
   de Y até X       o alvo andou 0.816 anos-luz
   do lançamento ao Lime        19.9 anos-luz (o Sistema Solar inteiro)
   eixo da Terra    X: 1.2% da volta · Y: 5.3% da volta  (uma volta = 25,772 anos)
5. PRECISÃO DA MIRA
   o alvo corre a   ~260 km/s  (galáxia + Sol + giro da Terra)
   errar o instante 3.8 milissegundos = errar o alvo
   errar 1 minuto   = o chão andou 17.3 km só com o giro da Terra
   ângulo de mira   3.96e-18 radianos  (um fio de cabelo visto de 3 anos-luz)
6. CARIMBO
   a IA marca cada mensagem com o tempo de bordo dela: 21:47
   laço ∮(t): as duas chegadas saem do mesmo instante, no Lime
ESTADO: MIRA FECHADA EM DUAS RAÍZES. A EQUAÇÃO NÃO DISTINGUE QUAL É A ORIGEM.
```

## O que a conta mostra (e serve para a história)
- **"O centro deslocou-se" vira literal.** Entre Yudur e Port Halden, o alvo andou 0,8 ano-luz; do lançamento ao Lime,
  o Sistema Solar inteiro andou uns 20 anos-luz. A IA precisa corrigir a mira por isso.
- **Port Halden fica quase exatamente uma volta do eixo da Terra antes do Lime** (só 1,2% de diferença). Uma volta do
  eixo leva 25.772 anos: é a régua natural da conta, e explica por que o número 26.000 aparece.
- **Só uma máquina faria essa conta.** Errar o instante por 4 milésimos de segundo é errar o alvo; a mira precisa de um
  ângulo menor que um fio de cabelo visto a 3 anos-luz.
- **A última linha é a pista do jogo inteiro:** a equação dá duas raízes e não diz qual é a origem.

## O que é real e o que é ficção
| Peça | Nível |
|---|---|
| Fórmula das duas bordas (Kerr), massa e distância de Sagitário A* | real |
| Dilatação do tempo, γ, velocidade | real (a energia para isso, não: ver abaixo) |
| Giro e órbita da Terra, precessão de 25.772 anos, o Sol a 230 km/s na galáxia | real |
| O giro 0,9998 de Sagitário A* | escolha da história (o giro real ainda é discutido pelos astrônomos) |
| Usar as bordas como "quanto voltar no tempo" e mandar a mensagem pelo nó | ficção |

## Dois furos que a simulação achou (para o autor)
1. **A viagem não pode ser mais curta que a distância.** Sagitário A* fica a **26.673 anos-luz**. Mesmo quase na
   velocidade da luz, a viagem leva **pelo menos uns 26.700 anos** para quem ficou. Com 26.000, ou o buraco negro é
   outro (inventado, um pouco mais perto), ou o número sobe para uns 26.700.
2. **O lugar do alvo está em aberto.** A latitude e a longitude da simulação são só um exemplo: um ponto nórdico do outro
   lado do mar (a ambientação B, em aberto). Trocar o lugar muda pouco a conta, só os números da seção 5.

## Uso possível no jogo
O registro de mira pode aparecer **como um documento num terminal da Domus**, achado no Z: o jogador que leu o Código X
em Port Halden reconhece o 21:47, o ψ(t₀) e o ∮(t), e entende de onde vinham os códigos.
