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

## A conta, passo a passo

**Passo 1. O tamanho do nó (física real)**
- Raio de referência: r_g = GM/c² = 4,297·10⁶ × 1,4766 km = **6.345.058 km**
- Bordas de Kerr: r± = r_g · (1 ± √(1 − a²)), com a = 0,9998
- a² = 0,99960004 → 1 − a² = 0,00039996 → √ = **0,019999**
- r₊ = 1,019999 × r_g = **6.471.953 km** · r₋ = 0,980001 × r_g = **6.218.163 km**
- **r₊/r₋ = 1,040814**

**Passo 2. A viagem (física real)**
- γ = Δt_Terra / Δt_bordo = 26.000 / 75 = **346,67**
- v/c = √(1 − 1/γ²) = √(1 − 0,0000083210) = **0,9999958** (99,99958% da luz)

**Passo 3. As duas respostas (ficção)**
- t_X = −26.000 − 75 (construção) = **−26.075**
- t_Y = t_X × r₊/r₋ = −26.075 × 1,040814 = **−27.139,2**
- t_X − t_Y = **1.064 anos**

**Passo 4. O centro deslocou-se (física real)**
- d = v_Sol × Δt = 230 km/s × 1.064 anos × 3,15576·10⁷ s/ano = 7,72·10¹² km = **0,816 ano-luz** (de Y até X)
- Do lançamento ao Lime: 230 × 26.000 anos = 1,89·10¹⁴ km = **19,95 anos-luz**
- Eixo da Terra: 26.075 / 25.772 = 1,0118 → **uma volta inteira + 1,2%** (X) · 27.139 / 25.772 = 1,0530 → **+5,3%** (Y)

**Passo 5. A posição do alvo (física real)**
x(t) = x_Sol(t) + x_órbita(t) + x_giro(t), com
- x_Sol(t) = R₀ · (cos θ, sen θ, 0), θ = v_Sol·t / R₀, R₀ = 8,178 kpc = 2,5235·10¹⁷ km
- x_órbita(t) = 1 UA · (cos φ, sen φ, 0), φ = 2π·t / 365,25636 dias
- x_giro(t) = R_Terra · (cos λ_lat cos ω, cos λ_lat sen ω, sen λ_lat), ω = 2π·t / 23h56m04s + longitude,
  inclinado 23,44° e girado pela precessão 2π·t / 25.772 anos

**Passo 6. A precisão da mira (física real, aplicada à ficção)**
- Velocidade do chão na latitude 51,6°: 2π × 6.371 km / 86.164 s × cos 51,6° = 0,4646 × 0,6212 = **0,289 km/s** → **17,3 km por minuto**
- Velocidade total do alvo: 230 + 29,78 + 0,29 ≈ **260 km/s**
- Tempo para errar 1 km: 1 / 260 = **0,0038 s** (3,8 milésimos de segundo)
- Ângulo: 1 km / 2,5235·10¹⁷ km = **3,96·10⁻¹⁸ radiano**

**Passo 7. A condição de mira (ficção)**
| x_sinal(t±) − x(latitude, longitude, t±) | < 1 km, para t± ∈ {−26.075 ; −27.139}
Duas raízes satisfazem a mesma condição, no mesmo chão. A equação não diz qual delas é a origem.

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

## Como a IA escreveria (o registro cru, sem explicação)
**Aprovado pelo autor para usar no jogo (06/11/2026).** Documento para um terminal da Domus. A linha "INCONSISTÊNCIA 673 a · IGNORADA" é de propósito: a própria IA
percebe o furo da distância e segue. Sai se o autor trocar o buraco negro ou o número.
```
DOMUS/NAV · ROTINA DE MIRA · CICLO ∮(t)
T_BORDO 21:47:00.000 · ITER 1

─ GEOMETRIA ─────────────────────────────────────────────
M      = 4.297000E+06 M☉
r_g    = GM/c² = 6.345058E+06 km
a      = 0.999800
√(1−a²)= 1.999900E-02
r₊     = 1.019999 r_g = 6.471953E+06 km
r₋     = 0.980001 r_g = 6.218163E+06 km
ρ      = r₊/r₋ = 1.040814

─ TRAJETO ───────────────────────────────────────────────
Δτ     = 75.00 a          (bordo)
Δt     = 26000.00 a       (origem)
γ      = 346.667
β      = 0.99999584
D      = 26673 al         ⚠ Δt < D/c · INCONSISTÊNCIA 673 a · IGNORADA

─ ALVO ──────────────────────────────────────────────────
φ      = +51.5960°
λ      = −55.5330°
x(t)   = R₀(cos v☉t/R₀, sen v☉t/R₀, 0)
       + UA(cos 2πt/P⊕, sen 2πt/P⊕, 0)
       + R⊕ Rz(2πt/Pₚ) Rx(ε⊕) (cos φ cos(ωt+λ), cos φ sen(ωt+λ), sen φ)
R₀     = 2.523485E+17 km
v☉     = 230.00 km/s
P⊕     = 365.25636 d
ω      = 2π/86164.0905 s
ε⊕     = 23.44°
Pₚ     = 25772 a

─ CONDIÇÃO ──────────────────────────────────────────────
f(t)   = |x_s(t) − x(φ,λ,t)| − ε  ,  ε = 1.000 km
t±     = t₀·ρ^(0,1)  ,  t₀ = −(Δt + 75.00)

─ NEWTON · RAIZ r₋ ───────────────────────────────────────
k   t (a)              f (km)          f′
0   −26075.000000000   +4.218E+03      2.600E+02
1   −26075.000000513   +1.107E+01      2.600E+02
2   −26075.000000514   +3.702E-02      2.600E+02
3   −26075.000000514   +8.114E-07      —
t₋  = −26075.000000514   ✓   |f| < ε

─ NEWTON · RAIZ r₊ ───────────────────────────────────────
k   t (a)              f (km)          f′
0   −27139.225050000   +6.902E+03      2.600E+02
1   −27139.225050842   +2.315E+01      2.600E+02
2   −27139.225050845   +7.640E-02      2.600E+02
3   −27139.225050845   +1.392E-06      —
t₊  = −27139.225050845   ✓   |f| < ε

─ DESLOCAMENTO ──────────────────────────────────────────
|x(t₊) − x(t₋)|        = 0.816 al
|x(t₋) − x(−26000)|    = 0.0575 al
|x(−26000) − x(0)|     = 19.95 al
θₚ(t₋) = 1.0118 · θₚ(t₊) = 1.0530
δt_máx = 3.85E-03 s
δα     = 3.96E-18 rad

─ RESULTADO ─────────────────────────────────────────────
∃ t₋ ∧ ∃ t₊ : f = 0
t₋ ≅ t₊  em (φ,λ)
¬∃ critério : origem ∈ {t₋, t₊}
→ EMITIR AMBAS
∮(t)
```
