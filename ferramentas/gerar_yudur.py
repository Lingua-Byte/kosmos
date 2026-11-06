"""
Gera os léxicos Yudur (Eixo Y) para qualquer palavra real em 5 idiomas.

As palavras feitas à mão em site/js/yudur.js são as âncoras. Para uma palavra que não está lá:
  cabeça      = runas da âncora mais próxima na família da palavra (WordNet)
  complemento = a primeira runa da âncora de um substantivo da definição
  resultado   = no máximo 3 runas

  "nevasca" → família: neve (ᛚ၁) · definição: "...com vento forte" → ᛚᛁᚡ

Uso:   python ferramentas/gerar_yudur.py            (gera tudo)
       python ferramentas/gerar_yudur.py --testar snow blizzard bakery
Saída: site/dados/yudur-<lingua>.json   { "palavra": "runas" }
"""

import json
import os
import re
import sys
import unicodedata
from collections import deque

AQUI = os.path.dirname(os.path.abspath(__file__))
os.environ.setdefault("NLTK_DATA", os.path.join(AQUI, "nltk_data"))

from nltk.corpus import wordnet as wn  # noqa: E402

RAIZ = os.path.join(AQUI, "..", "site")
LINGUAS = {"pt": "por", "en": "eng", "es": "spa", "fr": "fra", "it": "ita"}
PARADAS = set(
    "a an the of and or to in on at by for from with as is are be been being that which who whom whose this these those "
    "it its into out up down over under than then so such usually especially often used one some any each other e.g "
    "something someone somebody more most less very much many not no without member members part parts kind kinds type "
    "types form forms piece pieces set sets unit units instance act process state quality condition way ways thing things "
    "person people individual object objects genus family order class species variety amount number item items group groups "
    "male female sex".split()
)

# O Eixo Y não tem nada religioso (decisão do autor): estas palavras não entram no Yudur.
FORA_DO_Y = {"temple.n.01", "priest.n.01", "heresy.n.01", "heretic.n.01"}
PALAVRAS_FORA_DO_Y = set(
    "templo templos sacerdote sacerdotes sacerdotisa heresia heresias herege hereges "
    "temple temples priest priests priestess heresy heresies heretic heretics "
    "herejia hereje herejes tempio tempi sacerdoti eresia eresie eretico eretici "
    "pretre pretres pretresse heresie heresies heretique heretiques "
    "heretico hereticos heretica heretical sacerdotal sacerdotais sacerdotale sacerdotessa priestly priestlike "
    "priestcraft sacerdotalism sacerdotalismo".split()
)


def normalizar(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def carregar_vocabulario():
    with open(os.path.join(RAIZ, "js", "yudur.js"), encoding="utf-8") as arq:
        texto = arq.read()
    bloco = re.search(r"/\*JSON-INICIO\*/(.*)/\*JSON-FIM\*/", texto, re.S).group(1)
    return json.loads(bloco)


VOCAB = carregar_vocabulario()
RUNAS_VALIDAS = set(VOCAB["runas"]) | {"᛫"}
ANCORA = {}
ERROS = []
for palavra, runas, _leitura, _cat, _pt, synsets in VOCAB["palavras"]:
    if set(runas) - RUNAS_VALIDAS:
        ERROS.append(f"runa inválida em {palavra}: {runas}")
    for nome in synsets.split():
        try:
            s = wn.synset(nome)
        except Exception:
            ERROS.append(f"synset inexistente em {palavra}: {nome}")
            continue
        ANCORA.setdefault(s, runas)

CACHE = {}


def runas_da_familia(synset, profundidade=10):
    """Runas da âncora mais próxima subindo pelos hiperônimos."""
    if synset in CACHE:
        return CACHE[synset]
    fila = deque([(synset, 0)])
    vistos = {synset}
    achado = None
    while fila:
        s, d = fila.popleft()
        if s in ANCORA:
            achado = ANCORA[s]
            break
        if d >= profundidade:
            continue
        for h in s.hypernyms() + s.instance_hypernyms():
            if h not in vistos:
                vistos.add(h)
                fila.append((h, d + 1))
    CACHE[synset] = achado
    return achado


def frequencia(palavra, pos):
    return sum(l.count() for s in wn.synsets(palavra, pos=pos) for l in s.lemmas() if l.name().lower() == palavra)


CACHE_DEF = {}


def runas_de_palavra_da_definicao(palavra):
    if palavra in CACHE_DEF:
        return CACHE_DEF[palavra]
    resultado = None
    base = wn.morphy(palavra, wn.NOUN)
    if base:
        n = frequencia(base, wn.NOUN)
        outras = max(frequencia(base, wn.VERB), frequencia(base, wn.ADJ))
        if n >= outras or not (wn.synsets(base, pos=wn.VERB) or wn.synsets(base, pos=wn.ADJ)):
            sins = wn.synsets(base, pos=wn.NOUN)
            if sins:
                resultado = runas_da_familia(sins[0], 6)
    CACHE_DEF[palavra] = resultado
    return resultado


def complemento(synset, cabeca):
    """Primeira runa de um substantivo da definição que acrescente sentido."""
    usadas = set(cabeca or "")
    for palavra in re.findall(r"[A-Za-z]+", synset.definition()):
        minuscula = palavra.lower()
        if palavra[0].isupper() or minuscula in PARADAS or len(minuscula) < 3 or re.search(r"(ing|ed|ly)$", minuscula):
            continue
        r = runas_de_palavra_da_definicao(minuscula)
        if r and r[0] not in usadas and r[0] != "᛫":
            return r[0]
    return ""


def parente_de_adjetivo(synset):
    # o parente que já é palavra do Yudur ganha de qualquer família
    for lema in synset.lemmas():
        for d in lema.derivationally_related_forms() + lema.pertainyms():
            if d.synset() in ANCORA:
                return ANCORA[d.synset()]
    parentes = list(synset.attributes())
    for lema in synset.lemmas():
        parentes += [d.synset() for d in lema.derivationally_related_forms() + lema.pertainyms()]
    for s in synset.similar_tos():
        if s in ANCORA:
            return ANCORA[s]
        parentes += list(s.attributes())
        for lema in s.lemmas():
            parentes += [d.synset() for d in lema.derivationally_related_forms() + lema.pertainyms()]
    for p in parentes:
        r = runas_da_familia(p, 6)
        if r:
            return r
    return None


# Yudur só tem palavras que façam sentido num mundo medieval de fantasia.
# Conceitos modernos ficam sem palavra-runa (o jogo escreve letra a letra, como nome estrangeiro).
MODERNOS_RAIZ = [
    "electrical_device.n.01", "electronic_equipment.n.01", "electronic_device.n.01", "computer.n.01",
    "motor_vehicle.n.01", "aircraft.n.01", "spacecraft.n.01", "firearm.n.01", "gun.n.01",
    "telephone.n.01", "telecommunication.n.01", "broadcasting.n.02", "electricity.n.01", "electricity.n.02",
    "software.n.01", "computer_science.n.01", "medium.n.01", "photography.n.01", "film.n.01",
    "nuclear_weapon.n.01", "explosive_device.n.01", "plastic.n.01", "vaccine.n.01", "drug.n.01",
    "subatomic_particle.n.01", "radiation.n.01", "engine.n.01", "motor.n.01", "railway.n.01", "train.n.01",
    "camera.n.01", "medium_of_exchange.n.01", "corporation.n.01", "political_party.n.01", "sport.n.01",
]
MODERNO_TEXTO = re.compile(
    r"\b(electric|electrical|electronic|electron|computer|digital|software|internet|online|radio|television|"
    r"telephone|motor|engine|automobile|aircraft|airplane|nuclear|atomic|plastic|chemical|vitamin|bacteri|"
    r"virus|gasoline|petroleum|rocket|satellite|laser|photograph|camera|film|movie|cinema|industrial|factory|"
    r"railway|railroad|locomotive|automatic|vaccine|antibiotic|transistor|battery|microscop|telescop|"
    r"bicycle|tennis|football|baseball|basketball|golf|soccer|corporation|stock|bank|capitalis|socialis|"
    r"communis|democra|united states|american|canada|australia|africa|asia|20th|19th|18th)",
    re.I,
)
MODERNOS = set()
for _nome in MODERNOS_RAIZ:
    try:
        MODERNOS.add(wn.synset(_nome))
    except Exception:
        pass


def moderno(synset):
    if MODERNO_TEXTO.search(synset.definition()):
        return True
    for caminho in synset.hypernym_paths():
        if any(s in MODERNOS for s in caminho):
            return True
    return False


def runas_para(synset):
    if synset in ANCORA:
        return ANCORA[synset]
    if moderno(synset):
        return None
    if synset.pos() in ("a", "s", "r"):
        r = parente_de_adjetivo(synset)
        if r:
            return r
        extra = complemento(synset, "")
        return extra or None
    cabeca = runas_da_familia(synset)
    if not cabeca:
        return None
    extra = complemento(synset, cabeca)
    if not extra:
        return cabeca
    return (cabeca[:2] if len(cabeca) >= 3 else cabeca) + extra


def pontuacao(synset, lema_ingles=None):
    peso = 1.5 if synset.pos() == "n" else 1.0
    if lema_ingles:
        return peso * (sum(l.count() for l in synset.lemmas() if l.name().lower() == lema_ingles) + 0.001)
    return peso * (sum(l.count() for l in synset.lemmas()) + 0.001)


def gerar(curto, longo):
    lexico = {}
    for lema in wn.all_lemma_names(lang=longo):
        if "_" in lema or " " in lema or "-" in lema:
            continue
        chave = normalizar(lema)
        if not re.fullmatch(r"[a-z]+", chave) or len(chave) < 2 or chave in lexico or chave in PALAVRAS_FORA_DO_Y:
            continue
        sins = wn.synsets(lema, lang=longo)
        if not sins:
            continue
        ingles = lema.lower() if longo == "eng" else None
        ordem = {"n": 0, "v": 1, "a": 2, "s": 2, "r": 3}
        # nomes próprios (Charles, Paris…) não viram palavra-runa: são escritos letra a letra
        sins = [s for s in sins if not s.instance_hypernyms()]
        if not sins:
            continue
        melhor = max(sins, key=lambda s: (pontuacao(s, ingles), -ordem.get(s.pos(), 4)))
        if melhor.name() in FORA_DO_Y:
            continue
        r = runas_para(melhor)
        if r:
            lexico[chave] = r
    caminho = os.path.join(RAIZ, "dados", f"yudur-{curto}.json")
    with open(caminho, "w", encoding="utf-8") as arq:
        json.dump(lexico, arq, ensure_ascii=False, separators=(",", ":"))
    print(f"  {curto}: {len(lexico)} palavras → {os.path.relpath(caminho)} ({os.path.getsize(caminho) // 1024} KB)")


def main():
    print(f"Vocabulário feito à mão: {len(VOCAB['palavras'])} palavras · {len(ANCORA)} âncoras no WordNet")
    for e in ERROS:
        print("  !", e)
    if len(sys.argv) > 1 and sys.argv[1] == "--testar":
        for w in sys.argv[2:]:
            s = max(wn.synsets(w), key=lambda x: pontuacao(x, w))
            print(f"  {w}: {s.name()} → {runas_para(s)}   ({s.definition()})")
        return
    for curto, longo in LINGUAS.items():
        gerar(curto, longo)


if __name__ == "__main__":
    main()
