"""
Protótipo de Diagrama de Ramificação Narrativa: Prólogo do Eixo X, "O Pulso".
Gera Diagramas/prologo-x-ramificacao.png (Pillow + fontes do Windows).
Uso: python ferramentas/diagrama_prologo_x.py
"""

import os

from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SAIDA = os.path.join(RAIZ, "Diagramas", "prologo-x-ramificacao.png")
F = "C:/Windows/Fonts/"

W, H = 3400, 1830
img = Image.new("RGB", (W, H), "#0b100d")
d = ImageDraw.Draw(img)


def fonte(nome, tam):
    return ImageFont.truetype(F + nome, tam)


TIT = fonte("georgiab.ttf", 46)
SUB = fonte("segoeui.ttf", 22)
H2 = fonte("segoeuib.ttf", 26)
NO = fonte("segoeuib.ttf", 21)
TX = fonte("segoeui.ttf", 17)
PQ = fonte("segoeui.ttf", 15)
PQB = fonte("segoeuib.ttf", 15)

# cores por tipo de nó
COR = {
    "entrada": ("#3a2a0c", "#f2b33d"),   # abertura / origens
    "cena": ("#1c2420", "#9fb5a8"),      # cena fixa da história
    "hub": ("#0f2233", "#5aa9e6"),       # exploração livre
    "teste": ("#2a1838", "#c38bf0"),     # teste / decisão
    "final": ("#3a1414", "#ff6b5b"),     # salto / fim
    "lugar": ("#121a16", "#3c5c4a"),     # cartão de lugar
}
VERDE = "#5be38f"
OURO = "#f2c94c"
TEXTO = "#e8efe9"
SUAVE = "#93a79a"
VERM = "#ff7d6e"


SIMB = "✓✗★ψ∃⇒𝒪"


def escrever(xy, texto, font, fill):
    """Escreve trocando para a Segoe UI Symbol nos símbolos (senão viram quadrados)."""
    x, y = xy
    tam = font.size
    sym = ImageFont.truetype(F + "seguisym.ttf", tam)
    run, simb = "", False
    def solta(run, simb, x):
        f = sym if simb else font
        d.text((x, y + (2 if simb else 0)), run, font=f, fill=fill)
        return x + d.textlength(run, font=f)
    for c in texto:
        e = c in SIMB
        if run and e != simb:
            x = solta(run, simb, x)
            run = ""
        run += c
        simb = e
    if run:
        solta(run, simb, x)


def quebrar(texto, f, largura):
    linhas = []
    for par in texto.split("\n"):
        atual = ""
        for p in par.split(" "):
            teste = (atual + " " + p).strip()
            if d.textlength(teste, font=f) <= largura:
                atual = teste
            else:
                linhas.append(atual)
                atual = p
        linhas.append(atual)
    return linhas


def caixa(x, y, w, h, tipo, titulo, corpo="", raio=14):
    fundo, borda = COR[tipo]
    d.rounded_rectangle([x, y, x + w, y + h], raio, fill=fundo, outline=borda, width=3)
    ty = y + 12
    for l in quebrar(titulo, NO, w - 28):
        d.text((x + 14, ty), l, font=NO, fill=borda if tipo != "lugar" else TEXTO)
        ty += 27
    for l in quebrar(corpo, TX, w - 28):
        d.text((x + 14, ty), l, font=TX, fill=TEXTO)
        ty += 22
    return (x, y, w, h)


def losango(cx, cy, w, h, titulo, corpo=""):
    fundo, borda = COR["teste"]
    d.polygon([(cx, cy - h // 2), (cx + w // 2, cy), (cx, cy + h // 2), (cx - w // 2, cy)], fill=fundo, outline=borda, width=3)
    ls = quebrar(titulo, NO, w * 0.55)
    cs = quebrar(corpo, PQ, w * 0.6)
    total = len(ls) * 26 + len(cs) * 19
    ty = cy - total / 2
    for l in ls:
        d.text((cx - d.textlength(l, font=NO) / 2, ty), l, font=NO, fill=borda)
        ty += 26
    for l in cs:
        d.text((cx - d.textlength(l, font=PQ) / 2, ty), l, font=PQ, fill=TEXTO)
        ty += 19


def seta(x1, y1, x2, y2, cor=SUAVE, larg=3, rotulo=None, tracejada=False):
    if tracejada:
        n = int(max(abs(x2 - x1), abs(y2 - y1)) // 14)
        for i in range(0, n, 2):
            a, b = i / n, min(1, (i + 1) / n)
            d.line([(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a), (x1 + (x2 - x1) * b, y1 + (y2 - y1) * b)], fill=cor, width=larg)
    else:
        d.line([(x1, y1), (x2, y2)], fill=cor, width=larg)
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    p = 14
    d.polygon([(x2, y2), (x2 - p * math.cos(ang - 0.45), y2 - p * math.sin(ang - 0.45)), (x2 - p * math.cos(ang + 0.45), y2 - p * math.sin(ang + 0.45))], fill=cor)
    if rotulo:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        tw = d.textlength(rotulo, font=PQ)
        d.rectangle([mx - tw / 2 - 5, my - 12, mx + tw / 2 + 5, my + 10], fill="#0b100d")
        d.text((mx - tw / 2, my - 11), rotulo, font=PQ, fill=cor)


def etiqueta(x, y, texto, cor=OURO):
    tw = d.textlength(texto, font=PQB)
    d.rounded_rectangle([x, y, x + tw + 16, y + 24], 12, outline=cor, width=2)
    escrever((x + 8, y + 3), texto, PQB, cor)
    return x + tw + 24


# ---------------- Título ----------------
d.text((60, 40), "O Pulso — Prólogo do Eixo X (Port Halden)", font=TIT, fill=TEXTO)
d.text((62, 104), "Diagrama de ramificação narrativa · protótipo · a noite de terça, 21h47, até o salto para Yudur", font=SUB, fill=SUAVE)

# ---------------- Espinha da história ----------------
Y = 190
d.text((60, Y - 8), "A HISTÓRIA PRINCIPAL", font=H2, fill=VERDE)
Y += 40
caixa(60, Y, 290, 150, "entrada", "1 · Abertura", "9 origens (uma por personagem). Cada uma abre o fio pessoal no Diário.")
seta(350, Y + 75, 410, Y + 75)
caixa(410, Y, 320, 150, "hub", "2 · A noite em Port Halden", "Exploração livre: 11 lugares, side quests. Cada ação gasta tempo no relógio (0–16).")
seta(730, Y + 75, 800, Y + 75)
losango(940, Y + 75, 270, 190, "3 · Marco", "5 pistas = pode ir; relógio cheio = vai")
seta(1075, Y + 75, 1140, Y + 75)
caixa(1140, Y, 260, 150, "cena", "4 · O chamado", "Rádio, foto ou medidor (pela classe). A pé ou de carro [veículo].")
seta(1400, Y + 75, 1460, Y + 75)
caixa(1460, Y, 270, 150, "teste", "5 · A borda", "Teste de Convergência 1 (tutorial). Passa ou falha: segue igual, muda o texto e a ficha.")
seta(1730, Y + 75, 1790, Y + 75)
# 6 · o meio: três caminhos
caixa(1790, Y - 30, 300, 210, "cena", "6 · O meio da multidão", "")
for i, (op, info) in enumerate([("Abrir caminho à força", "Força · falha: +2 exposição"), ("Passar devagar", "Mente · falha: +1 exposição"), ("Andar no ritmo das luzes", "só com Ressonância 5")]):
    yy = Y + 12 + i * 52
    d.rounded_rectangle([1806, yy, 2074, yy + 44], 8, outline=COR["teste"][1], width=2)
    d.text((1816, yy + 2), op, font=PQB, fill=TEXTO)
    d.text((1816, yy + 21), info, font=PQ, fill=SUAVE)
seta(2090, Y + 75, 2150, Y + 75)
caixa(2150, Y, 280, 150, "teste", "7 · O olho do furacão", "Rádio toca Every Breath You Take (só 1 vez). Convergência 3: ouvir ou resistir.")
seta(2430, Y + 75, 2490, Y + 75)
caixa(2490, Y - 30, 330, 210, "teste", "8 · Todos olham para você", "Ameaça 6, até 2 rodadas: lutar, fugir, acalmar. Ou parar de resistir (+2 Ressonância, direto ao salto).")
seta(2820, Y + 75, 2880, Y + 75)
caixa(2880, Y, 460, 150, "final", "9 · O salto → Eixo Y", "Revela Yudur na ficha. Memória Cruzada: pedra, velas, sino (3 curtas, 1 longa).")

# ecos do salto
ey = Y + 175
d.text((2880, ey), "Ecos no salto (o texto muda por):", font=PQB, fill=VERM)
for i, t in enumerate(["salvou alguém → um rosto conhecido em Yudur", "ouviu/gravou a rádio → a melodia no mosteiro", "Dissonância 5+ → mãos sujas de carvão", "Ressonância 5+ → um corredor de metal (a Domus)"]):
    d.text((2895, ey + 24 + i * 22), "· " + t, font=PQ, fill=TEXTO)

# ---------------- Origens ----------------
OY = 500
d.text((60, OY), "AS 9 ORIGENS (ABERTURA PRÓPRIA + FIO PESSOAL, que continua nos próximos atos)", font=H2, fill=COR["entrada"][1])
origens = [
    ("Frank", "Estação 9", "O fogo da Delancey St."), ("Rosa", "Viatura 4-12", "O parceiro que foi embora"),
    ("Marcus", "Harbor Street", "A entrega para si mesmo"), ("Denise", "Pronto-socorro", "O menino do leito 9"),
    ("Michael", "St. Brendan's", "A confissão do amanhã"), ("June", "Centro comunitário", "A carta do Harold"),
    ("Eli", "Laboratório", "Os números que ninguém ouviu"), ("Tess", "Rádio KPHN", "A ligação da linha 3"),
    ("Ray", "Táxi, Linha 9", "O passageiro da Linha 9"),
]
cw = 356
for i, (nome, onde, fio) in enumerate(origens):
    x = 60 + i * (cw + 14)
    d.rounded_rectangle([x, OY + 42, x + cw, OY + 140], 10, fill=COR["entrada"][0], outline=COR["entrada"][1], width=2)
    d.text((x + 12, OY + 50), f"{nome} · {onde}", font=NO, fill=COR["entrada"][1])
    d.text((x + 12, OY + 80), fio, font=TX, fill=TEXTO)
    d.text((x + 12, OY + 106), "2 ações só dele  →  Ato 1", font=PQ, fill=VERDE)

# ---------------- Relógio ----------------
RY = 690
d.text((60, RY), "O RELÓGIO DA NOITE (eventos que acontecem sozinhos)", font=H2, fill=COR["hub"][1])
bx, bw = 60, 3280
by = RY + 60
d.rounded_rectangle([bx, by, bx + bw, by + 18], 9, fill="#10202c", outline=COR["hub"][1], width=2)
for t in range(17):
    x = bx + bw * t / 16
    d.line([(x, by - 6), (x, by + 24)], fill=COR["hub"][1], width=2)
    d.text((x - 6, by + 28), str(t), font=PQ, fill=SUAVE)
for t, txt, cor in [(4, "Apagão: abre o Viaduto Leste", OURO), (5, "fome (−1 dado)", VERM), (10, "Multidões: viajar custa +1 · cansaço", VERM), (12, "Riscadores cercam alguém: socorrer (Danny)", OURO), (16, "Relógio cheio: o chamado", VERDE)]:
    x = bx + bw * t / 16
    yy = by - 34 if t in (4, 10, 16) else by + 52
    tw = d.textlength(txt, font=PQB)
    xx = min(max(x - tw / 2, bx), bx + bw - tw)
    d.text((xx, yy), txt, font=PQB, fill=cor)

# ---------------- Lugares e side quests ----------------
LY = 880
escrever((60, LY), "A NOITE EM PORT HALDEN: LUGARES E SIDE QUESTS (✓ sucesso · ✗ falha · ★ marca que passa para a X1 e adiante)", H2, VERDE)

lugares = [
    ("Lugar inicial (a origem)", [
        "Símbolos no vidro → pista ∃ ψ(t)",
        "Seguir o Homem de Terno → abre: Revistar a picape",
        "   ✓ ★ crachá da Contenção",
        "Ação da profissão (8 pontos de entrada)",
        "Rastrear a rádio pirata → abre: Edifício Aurora",
        "Ações da origem → ★ fio pessoal",
    ]),
    ("Sua casa", [
        "Rádio da cozinha (relógio ≥ 2)",
        "   sintonizar ou gravar → abre: Edifício Aurora",
        "   gravar ✓ ★ gravou a Ouvinte",
        "Vizinho do 302 (relógio ≥ 1)",
        "   ✓ ★ salvou o Sr. Hollis   ✗ ele vai para o centro",
    ]),
    ("St. Luke's Memorial", [
        "Ala de isolamento → aula de símbolos",
        "Dra. Helen → pede padrões",
        "   ala + Helen → abre: O caderno",
        "   ✓ ★ caderno da Helen (aliada)",
    ]),
    ("Delegacia do 9º Distrito", [
        "Agente Moore → abre: A pasta 21:47",
        "   ✓ ★ arquivo de 1987",
        "   ✗ ★ Moore anota o seu nome",
    ]),
    ("Estação Rua 9", [
        "Descer no escuro / com luz → memória",
        "A catraca → abre: Passar pela catraca",
        "   ✓ memória: o trem de 1987",
        "   ✗ ferido, +1 Dissonância",
    ]),
    ("Instituto de Física", [
        "A equação no quadro → aprende símbolos",
        "Professora Hilde → aliada",
    ]),
    ("Edifício Aurora (telhado)", [
        "só aparece depois da rádio pirata",
        "Falar com a Ouvinte → ★ fita PARTE 2",
        "Ouvir com ela → +1 Ressonância",
        "Avisar do perigo → ★ frequência 94.7",
    ]),
    ("Atlantic Tower", [
        "Oswald, o vigia → abre: O livro de ponto",
        "   ✓ ★ 412 dias sem sair (desenhou uma nave)",
    ]),
    ("Viaduto Leste", [
        "só depois do apagão (relógio 4)",
        "O Riscador: acalmar",
        "   ✓ ★ “Não deixa eles te contarem”",
        "   ✗ ferido · ou afastar (sem marca)",
    ]),
    ("Drogaria Goodwell", [
        "A porta com corrente (Martha)",
        "   → abre: Acalmar o Teddy",
        "   ✓ ★ salvou o Teddy   ✗ Teddy fica",
    ]),
    ("Conveniência do Abe", [
        "Loja: comida, café, bebida, bateria",
        "Vida comum (não gasta tempo)",
    ]),
    ("Em toda parte", [
        "Relógio 12: socorrer o cercado",
        "   ✓ ★ salvou o Danny",
        "   ✗ ferido, o rapaz some",
    ]),
]
cols, gw, gh = 4, 812, 215
for i, (nome, linhas) in enumerate(lugares):
    x = 60 + (i % cols) * (gw + 20)
    y = LY + 50 + (i // cols) * (gh + 22)
    d.rounded_rectangle([x, y, x + gw, y + gh], 12, fill=COR["lugar"][0], outline=COR["lugar"][1], width=2)
    d.text((x + 16, y + 12), nome, font=NO, fill=TEXTO)
    for j, l in enumerate(linhas):
        cor = OURO if "★" in l else VERM if l.strip().startswith("✗") else VERDE if "abre:" in l else TEXTO
        if l.strip().startswith("só ") or "(relógio" in l:
            cor = SUAVE
        escrever((x + 18, y + 46 + j * 27), l, TX, cor)

# ---------------- Legenda ----------------
LG = H - 120
d.text((60, LG), "LEGENDA", font=H2, fill=SUAVE)
x = 60
for tipo, nome in [("entrada", "Abertura / origem"), ("hub", "Exploração livre"), ("cena", "Cena fixa"), ("teste", "Teste / escolha"), ("final", "Salto / fim")]:
    fundo, borda = COR[tipo]
    d.rounded_rectangle([x, LG + 44, x + 34, LG + 70], 6, fill=fundo, outline=borda, width=2)
    d.text((x + 44, LG + 44), nome, font=TX, fill=TEXTO)
    x += 70 + d.textlength(nome, font=TX)
x = etiqueta(x + 10, LG + 44, "★ marca que passa adiante")
d.text((x + 10, LG + 44), "abre: = destrava outra ação ou lugar", font=TX, fill=VERDE)
d.text((x + 380, LG + 44), "(cinza) = condição para aparecer", font=TX, fill=SUAVE)

os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
img.save(SAIDA, optimize=True)
print(SAIDA)
