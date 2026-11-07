#!/usr/bin/env python3
"""
A CONTA DA IA DA DOMUS — simulação (ficção científica, o mais verossímil possível).

A IA, no Lime, precisa mandar os códigos para um ponto da Terra num instante exato.
Rode:  python3 ferramentas/calculo_da_ia.py
Mude os números em PARAMETROS para ver o que acontece.

O que é física real: as duas bordas de um buraco negro que gira (Kerr), a dilatação do tempo,
o giro e a órbita da Terra, a precessão do eixo, a órbita do Sol na galáxia, a distância até Sagitário A*.
O que é ficção: usar as duas bordas como "quanto voltar no tempo" e mandar a mensagem pelo nó.
Explicação para o autor: CALCULO_DA_IA.md.
"""
import math

# ---------------------------------------------------------------- PARAMETROS
PARAMETROS = {
    "massa_sol": 4.297e6,        # Sagitário A*, em massas do Sol (medida real, GRAVITY 2019)
    "giro": 0.9998,              # a: giro do buraco negro, de 0 a 1 (ficção: quase o máximo, como no Interestelar)
    "viagem_terra": 26675.0,     # anos que passam para quem lançou a Domus, do lançamento ao Lime (pouco mais que os 26.673 anos-luz)
    "viagem_bordo": 75.0,        # anos que passam dentro da Domus na mesma viagem
    "construcao": 75.0,          # anos entre o Instituto receber os códigos e o lançamento (50 a 100)
    "latitude": 51.596,          # EXEMPLO: um ponto nórdico do outro lado do mar (em aberto)
    "longitude": -55.533,
    "margem_km": 1.0,            # quanto a mensagem pode errar o alvo
    "carimbo_bordo": "21:47",    # hora de bordo em que a Domus cruzou a borda de fora (proposta da aba História)
}

# ---------------------------------------------------------------- CONSTANTES REAIS
C = 299_792.458                  # km/s
ANO = 365.25 * 86400             # s (ano juliano)
ANO_SIDERAL = 365.25636 * 86400  # s
DIA_SIDERAL = 86164.0905         # s
UA = 1.495978707e8               # km
ANO_LUZ = C * ANO                # km
R_TERRA = 6371.0                 # km
OBLIQUIDADE = math.radians(23.44)
PRECESSAO = 25772.0              # anos para o eixo da Terra dar uma volta
R0_GAL = 8.178 * 3.0857e16       # km: distância do Sol a Sagitário A* (8,178 kpc)
V_SOL = 230.0                    # km/s: velocidade do Sol na volta pela galáxia
G_M_SOL = 1.32712440018e11       # km³/s² (GM do Sol)


def kerr_bordas(giro):
    """r± = M (1 ± √(1 − a²)), em unidades de GM/c². Física real."""
    s = math.sqrt(1 - giro * giro)
    return 1 + s, 1 - s


def gamma_para(terra, bordo):
    """Fator de dilatação do tempo entre quem ficou e quem viajou."""
    return terra / bordo


def velocidade_para(gamma):
    """v/c a partir do fator γ: v = c √(1 − 1/γ²)."""
    return math.sqrt(1 - 1 / gamma ** 2)


def posicao_alvo(t_anos, lat, lon):
    """Posição do alvo em relação a Sagitário A*, em km, no instante t (anos antes do Lime: negativo).
    Soma de quatro movimentos reais: Sol na galáxia, Terra no Sol, giro da Terra, eixo bambeando."""
    t = t_anos * ANO
    # 1. o Sol dando a volta na galáxia (círculo no plano galáctico)
    th = V_SOL * t / R0_GAL
    sol = (R0_GAL * math.cos(th), R0_GAL * math.sin(th), 0.0)
    # 2. a Terra dando a volta no Sol
    ph = 2 * math.pi * t / ANO_SIDERAL
    terra = (UA * math.cos(ph), UA * math.sin(ph), 0.0)
    # 3 e 4. o ponto na superfície: giro diário, eixo inclinado que precessa
    giro = 2 * math.pi * t / DIA_SIDERAL + math.radians(lon)
    prec = 2 * math.pi * t_anos / PRECESSAO
    la = math.radians(lat)
    x = R_TERRA * math.cos(la) * math.cos(giro)
    y = R_TERRA * math.cos(la) * math.sin(giro)
    z = R_TERRA * math.sin(la)
    # inclina o eixo (obliquidade) e gira a direção da inclinação (precessão)
    y, z = y * math.cos(OBLIQUIDADE) - z * math.sin(OBLIQUIDADE), y * math.sin(OBLIQUIDADE) + z * math.cos(OBLIQUIDADE)
    x, y = x * math.cos(prec) - y * math.sin(prec), x * math.sin(prec) + y * math.cos(prec)
    return tuple(a + b + c for a, b, c in zip(sol, terra, (x, y, z)))


def dist(a, b):
    return math.sqrt(sum((p - q) ** 2 for p, q in zip(a, b)))


def main(P=PARAMETROS):
    linha = "─" * 64
    print("DOMUS · NÚCLEO DE NAVEGAÇÃO · REGISTRO DE MIRA")
    print(linha)

    # 1. o buraco negro
    rmais, rmenos = kerr_bordas(P["giro"])
    rg_km = G_M_SOL * P["massa_sol"] / C ** 2
    print("1. GEOMETRIA DO NÓ  (Kerr: r± = M·(1 ± √(1 − a²)))")
    print(f"   massa            {P['massa_sol']:.3e} M☉   →  GM/c² = {rg_km:,.0f} km")
    print(f"   giro a           {P['giro']}")
    print(f"   borda de fora r₊ {rmais:.6f} M  = {rmais * rg_km:,.0f} km")
    print(f"   borda de dentro  {rmenos:.6f} M  = {rmenos * rg_km:,.0f} km")
    razao = rmais / rmenos
    print(f"   razão r₊/r₋      {razao:.6f}   ← as duas respostas da mesma equação")
    print(linha)

    # 2. o tempo da viagem
    g = gamma_para(P["viagem_terra"], P["viagem_bordo"])
    v = velocidade_para(g)
    print("2. TEMPO DA VIAGEM  (dilatação: Δt_terra = γ · Δt_bordo)")
    print(f"   Terra            {P['viagem_terra']:,.0f} anos")
    print(f"   bordo            {P['viagem_bordo']:,.0f} anos")
    print(f"   γ                {g:,.1f}")
    print(f"   velocidade       {v * 100:.5f} % da luz")
    print(f"   distância        {R0_GAL / ANO_LUZ:,.0f} anos-luz até Sagitário A*")
    print(linha)

    # 3. as duas respostas no tempo (ficção: as bordas viram "quanto voltar")
    lanc = -P["viagem_terra"]
    t_x = lanc - P["construcao"]
    t_y = t_x * razao
    print("3. AS DUAS RESPOSTAS  (Δt± = Δt_X · r±/r₋)")
    print(f"   ponto zero       0          (o Lime)")
    print(f"   lançamento       {lanc:,.0f}")
    print(f"   resposta r₋ (X)  {t_x:,.0f}     ← Port Halden: o Instituto recebe os códigos")
    print(f"   resposta r₊ (Y)  {t_y:,.0f}     ← Yudur")
    print(f"   distância X–Y    {t_x - t_y:,.0f} anos")
    print(linha)

    # 4. o centro deslocou-se: quanto o alvo andou no espaço
    alvo_x = posicao_alvo(t_x, P["latitude"], P["longitude"])
    alvo_y = posicao_alvo(t_y, P["latitude"], P["longitude"])
    alvo_l = posicao_alvo(lanc, P["latitude"], P["longitude"])
    print("4. O CENTRO DESLOCOU-SE  (alvo visto de Sagitário A*)")
    print(f"   alvo: lat {P['latitude']}°, lon {P['longitude']}°  (exemplo; o lugar está em aberto)")
    print(f"   de Y até X       o alvo andou {dist(alvo_y, alvo_x) / ANO_LUZ:.3f} anos-luz")
    print(f"   de X até o lançamento        {dist(alvo_x, alvo_l) / ANO_LUZ:.4f} anos-luz")
    print(f"   do lançamento ao Lime        {V_SOL * P['viagem_terra'] * ANO / ANO_LUZ:.1f} anos-luz (o Sistema Solar inteiro)")
    fase_x = (-t_x / PRECESSAO) % 1
    fase_y = (-t_y / PRECESSAO) % 1
    print(f"   eixo da Terra    X: {fase_x * 100:.1f}% da volta · Y: {fase_y * 100:.1f}% da volta  (uma volta = {PRECESSAO:,.0f} anos)")
    print(linha)

    # 5. a precisão: por que só uma máquina faria essa conta
    vel = V_SOL + 29.78 + 2 * math.pi * R_TERRA / DIA_SIDERAL * math.cos(math.radians(P["latitude"]))
    ang = P["margem_km"] / R0_GAL
    tempo_ms = P["margem_km"] / vel * 1000
    chao_min = 2 * math.pi * R_TERRA / DIA_SIDERAL * math.cos(math.radians(P["latitude"])) * 60
    print("5. PRECISÃO DA MIRA")
    print(f"   margem           {P['margem_km']} km")
    print(f"   o alvo corre a   ~{vel:,.0f} km/s  (galáxia + Sol + giro da Terra)")
    print(f"   errar o instante {tempo_ms:.1f} milissegundos = errar o alvo")
    print(f"   errar 1 minuto   = o chão andou {chao_min:.1f} km só com o giro da Terra")
    print(f"   ângulo de mira   {ang:.2e} radianos  (um fio de cabelo visto de {1e-4 / ang / ANO_LUZ:,.0f} anos-luz)")
    print(linha)

    # 6. o carimbo
    print("6. CARIMBO")
    print(f"   a IA marca cada mensagem com o tempo de bordo dela: {P['carimbo_bordo']}")
    print(f"   chegada X  ψ(t₀)   {P['carimbo_bordo']} no relógio de quem recebe")
    print(f"   chegada Y  ψ(t₋)   {P['carimbo_bordo']} no relógio de quem recebe (se houvesse relógio)")
    print(f"   laço       ∮(t)    as duas chegadas saem do mesmo instante, no Lime")
    print(linha)
    print("ESTADO: MIRA FECHADA EM DUAS RAÍZES. A EQUAÇÃO NÃO DISTINGUE QUAL É A ORIGEM.")


if __name__ == "__main__":
    main()
