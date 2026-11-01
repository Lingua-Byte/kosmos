"""
Gera os léxicos do KOSMOS a partir do WordNet multilíngue.

Cada palavra real (português, inglês, espanhol, francês, italiano) vira uma fórmula
feita com os conceitos do dicionário do jogo (site/js/lingua.js):

  cabeça     = o conceito-âncora mais próximo na "família" da palavra (hiperônimos)
  modificador = o primeiro conceito que aparece na definição da palavra

  hospital → família: prédio (casa) · definição: "onde pacientes (doentes) recebem tratamento"
           → casa(doente) → Λ(Δ(ψσ))

Uso:  python ferramentas/gerar_lexico.py
Saída: site/dados/lexico-<lingua>.json   { "palavra": "n:cabeca>modificador", ... }
       n = substantivo, v = verbo, a = adjetivo; "!" antes do modificador = negação.

Fontes: Princeton WordNet 3.0 e Open Multilingual Wordnet (créditos em site/dados/CREDITOS.txt).
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

SAIDA = os.path.join(AQUI, "..", "site", "dados")
LINGUAS = {"pt": "por", "en": "eng", "es": "spa", "fr": "fra", "it": "ita"}

# ---------------------------------------------------------------------------
# Âncoras: synset do WordNet → conceito (ou raiz) do KOSMOS
# ---------------------------------------------------------------------------
ANCORAS = {
    # genéricos (servem de cabeça quando nada mais específico aparece)
    "entity.n.01": "objeto", "physical_entity.n.01": "objeto", "object.n.01": "objeto", "whole.n.02": "objeto",
    "artifact.n.01": "objeto", "thing.n.12": "objeto", "instrumentality.n.03": "objeto", "container.n.01": "objeto",
    "abstraction.n.06": "conhecimento", "attribute.n.02": "padrao", "shape.n.02": "padrao", "relation.n.01": "ordem",
    "measure.n.02": "ordem", "state.n.02": "evento", "event.n.01": "evento", "act.n.02": "evento",
    "psychological_feature.n.01": "mente", "group.n.01": "multidao", "matter.n.03": "materia",
    # pessoas
    "person.n.01": "pessoa", "sick_person.n.01": "doente", "patient.n.01": "doente", "child.n.01": "crianca",
    "juvenile.n.01": "crianca", "old_person.n.01": "velho", "friend.n.01": "amigo", "enemy.n.02": "inimigo",
    "relative.n.01": "familia", "family.n.01": "familia", "crowd.n.01": "multidao", "people.n.01": "multidao",
    "social_group.n.01": "multidao", "organization.n.01": "governo", "medical_practitioner.n.01": "medico",
    "health_professional.n.01": "medico", "soldier.n.01": "soldado", "serviceman.n.01": "soldado",
    "policeman.n.01": "soldado", "warrior.n.01": "soldado", "cleric.n.01": "sacerdote", "religious_person.n.01": "sacerdote",
    "leader.n.01": "lider", "ruler.n.01": "lider", "stranger.n.01": "estranho", "crew.n.01": "tripulacao",
    "astronaut.n.01": "astronauta", "scientist.n.01": "cientista", "scholar.n.01": "cientista",
    # corpo e mente
    "organism.n.01": "vida", "animal.n.01": "animal", "plant.n.02": "planta", "body.n.01": "corpo",
    "body_part.n.01": "corpo", "head.n.01": "cabeca", "brain.n.01": "cabeca", "eye.n.01": "olho", "hand.n.01": "mao",
    "mouth.n.01": "boca", "blood.n.01": "sangue", "heart.n.02": "coracao", "mind.n.01": "mente", "psyche.n.01": "mente",
    "dream.n.01": "sonho", "memory.n.01": "memoria", "thought.n.01": "pensamento", "idea.n.01": "pensamento",
    "sleep.n.01": "sono", "illness.n.01": "doenca", "disease.n.01": "doenca", "injury.n.01": "doenca",
    "insanity.n.01": "loucura", "pain.n.01": "dor", "cure.n.01": "cura", "medical_care.n.01": "cura",
    # lugares
    "location.n.01": "lugar", "region.n.03": "lugar", "area.n.01": "lugar", "geographical_area.n.01": "lugar",
    "world.n.01": "mundo", "universe.n.01": "mundo", "structure.n.01": "casa", "building.n.01": "casa",
    "housing.n.01": "casa", "dwelling.n.01": "casa", "house.n.01": "casa", "city.n.01": "cidade",
    "municipality.n.01": "cidade", "road.n.01": "rua", "path.n.02": "rua", "way.n.06": "rua", "passage.n.03": "rua",
    "hospital.n.01": "hospital", "medical_building.n.01": "hospital", "place_of_worship.n.01": "templo",
    "church.n.02": "templo", "temple.n.01": "templo", "monastery.n.01": "templo", "castle.n.02": "castelo",
    "fortification.n.01": "castelo", "subway.n.01": "metro", "tunnel.n.01": "metro", "door.n.01": "porta",
    "doorway.n.01": "porta", "gate.n.01": "porta", "tomb.n.01": "cripta", "cemetery.n.01": "cripta",
    "forest.n.01": "floresta", "sky.n.01": "ceu", "outer_space.n.01": "ceu", "planet.n.01": "planeta",
    "celestial_body.n.01": "estrela", "star.n.01": "estrela", "sun.n.01": "estrela", "spacecraft.n.01": "nave",
    "school.n.02": "escola", "educational_institution.n.01": "escola", "library.n.01": "biblioteca",
    "shop.n.01": "mercado", "mercantile_establishment.n.01": "mercado", "marketplace.n.01": "mercado",
    "prison.n.01": "prisao", "police_station.n.01": "delegacia", "court.n.02": "delegacia",
    # natureza
    "water.n.01": "agua", "body_of_water.n.01": "mar", "fire.n.01": "fogo", "heat.n.01": "fogo",
    "coldness.n.03": "frio", "ice.n.01": "frio", "light.n.01": "luz", "darkness.n.01": "escuridao",
    "sound.n.01": "som", "noise.n.01": "som", "music.n.01": "musica", "song.n.01": "musica", "silence.n.01": "silencio",
    "air.n.01": "ar", "wind.n.01": "ar", "rock.n.01": "pedra", "stone.n.02": "pedra", "metal.n.01": "pedra",
    "life.n.01": "vida", "death.n.01": "morte", "corpse.n.01": "morte", "substance.n.01": "materia",
    "material.n.01": "materia",
    # tempo
    "time_period.n.01": "tempo", "time_unit.n.01": "tempo", "moment.n.01": "tempo", "day.n.01": "dia",
    "night.n.01": "noite", "year.n.01": "ciclo", "cycle.n.01": "ciclo", "beginning.n.01": "inicio",
    "past.n.01": "passado", "future.n.01": "futuro", "present.n.01": "agora",
    # objetos
    "device.n.01": "maquina", "machine.n.01": "maquina", "weapon.n.01": "arma", "armor.n.01": "armadura",
    "protective_covering.n.01": "armadura", "book.n.01": "livro", "document.n.01": "livro",
    "written_communication.n.01": "livro", "key.n.01": "chave", "telephone.n.01": "telefone",
    "radio_receiver.n.01": "telefone", "television_receiver.n.01": "tela", "display.n.06": "tela",
    "vehicle.n.01": "carro", "car.n.01": "carro", "conveyance.n.03": "carro", "money.n.01": "dinheiro",
    "wealth.n.01": "dinheiro", "candle.n.01": "vela", "lamp.n.01": "vela", "computer.n.01": "computador",
    "data.n.01": "computador", "measuring_instrument.n.01": "medidor", "food.n.01": "comida", "food.n.02": "comida",
    "nutriment.n.01": "comida", "clothing.n.01": "roupa", "tool.n.01": "ferramenta",
    "musical_instrument.n.01": "instrumento", "color.n.01": "cor",
    # sociedade e sentimentos
    "work.n.01": "trabalho", "occupation.n.01": "trabalho", "war.n.01": "guerra", "battle.n.01": "guerra",
    "conflict.n.01": "conflito", "feeling.n.01": "mente", "emotion.n.01": "mente", "fear.n.01": "medo",
    "love.n.01": "amor", "anger.n.01": "raiva", "hate.n.01": "raiva", "happiness.n.01": "alegria",
    "sadness.n.01": "tristeza", "hope.n.01": "esperanca", "loneliness.n.01": "solidao", "distrust.n.01": "desconfianca",
    "courage.n.01": "coragem", "cognition.n.01": "conhecimento", "science.n.01": "conhecimento",
    "communication.n.02": "linguagem", "language.n.01": "linguagem", "word.n.01": "linguagem",
    "message.n.02": "noticia", "news.n.01": "noticia", "signal.n.01": "sinal", "symbol.n.01": "runa",
    "secret.n.01": "segredo", "heresy.n.01": "heresia", "ritual.n.02": "ritual", "religion.n.01": "deus",
    "god.n.01": "deus", "deity.n.01": "deus", "spiritual_being.n.01": "deus", "magic.n.01": "magia",
    "law.n.01": "lei", "government.n.01": "governo", "danger.n.01": "perigo", "truth.n.01": "verdade",
    "falsehood.n.01": "mentira", "disorder.n.03": "caos", "change.n.01": "mudanca", "radiation.n.01": "radiacao",
    "pattern.n.01": "padrao", "pulse.n.01": "pulso", "observer.n.02": "observador", "interface.n.01": "interface",
    "nothing.n.01": "vazio", "existence.n.01": "existir",
    # verbos
    "travel.v.01": "andar", "move.v.01": "andar", "go.v.01": "andar", "run.v.01": "andar", "walk.v.01": "andar",
    "flee.v.01": "fugir", "arrive.v.01": "aproximar", "approach.v.01": "aproximar", "come.v.01": "aproximar",
    "perceive.v.01": "observar", "see.v.01": "observar", "look.v.01": "observar", "hear.v.01": "ouvir",
    "feel.v.01": "sentir", "think.v.01": "compreender", "understand.v.01": "compreender", "know.v.01": "compreender",
    "learn.v.01": "compreender", "remember.v.01": "lembrar", "forget.v.01": "esquecer", "change.v.01": "transformar",
    "change.v.02": "transformar", "make.v.03": "gerar", "create.v.02": "gerar", "produce.v.02": "gerar",
    "communicate.v.02": "falar", "say.v.01": "falar", "talk.v.02": "falar", "read.v.01": "ler", "write.v.01": "escrever",
    "sing.v.02": "cantar", "kill.v.01": "matar", "die.v.01": "morte", "attack.v.01": "lutar", "fight.v.02": "lutar",
    "protect.v.01": "proteger", "defend.v.01": "proteger", "help.v.01": "ajudar", "have.v.01": "conter",
    "contain.v.01": "conter", "hold.v.02": "conter", "stop.v.01": "fixar", "fasten.v.01": "fixar",
    "appear.v.01": "emergir", "emerge.v.01": "emergir", "connect.v.01": "sincronizar", "join.v.04": "sincronizar",
    "oppose.v.01": "resistir", "resist.v.01": "resistir", "open.v.01": "abrir", "close.v.01": "fechar",
    "return.v.01": "voltar", "wait.v.01": "esperar", "search.v.01": "procurar", "investigate.v.01": "procurar",
    "call.v.02": "chamar", "sleep.v.01": "sono", "eat.v.01": "comer", "drink.v.01": "beber", "love.v.01": "amor",
    "fear.v.01": "medo", "hate.v.01": "raiva", "need.v.01": "necessario", "want.v.01": "necessario",
    "exist.v.01": "existir", "be.v.01": "existir", "work.v.01": "trabalho", "destroy.v.01": "destruir",
}

# Conceitos amplos demais para servir de modificador
GENERICOS = {"objeto", "evento", "conhecimento", "lugar", "ordem", "padrao", "mente", "materia", "existir", "multidao"}
PARADAS = set(
    "a an the of and or to in on at by for from with as is are be been being that which who whom whose this these those "
    "it its into out up down over under than then so such usually especially often used one some any each other e.g "
    "something someone somebody more most less very much many not no without "
    # palavras que só descrevem a categoria, não o sentido
    "member members part parts kind kinds type types form forms piece pieces set sets unit units instance instances "
    "act acts process state quality condition way ways thing things person people individual object objects "
    "genus family order class species variety amount number item items group groups male female sex".split()
)
GRANDE = {"large", "big", "great", "huge", "giant", "enormous", "vast", "immense", "important", "major"}
PEQUENO = {"small", "little", "tiny", "miniature", "minor", "short"}
NEGACAO = re.compile(r"^(not |lacking|without|devoid|free from|having no |deficient)")


def normalizar(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def verificar_ancoras():
    validas = {}
    for nome, conceito in ANCORAS.items():
        try:
            validas[wn.synset(nome)] = conceito
        except Exception:
            print("  âncora inexistente (ignorada):", nome)
    return validas


ANC = {}
# conceitos que só existem como verbo (não servem de modificador de substantivo)
VERBOS = {c for nome, c in ANCORAS.items() if ".v." in nome} - {c for nome, c in ANCORAS.items() if ".n." in nome}
CACHE_CABECA = {}


def cabeca(synset):
    """Conceito-âncora mais próximo subindo pela família (hiperônimos)."""
    if synset in CACHE_CABECA:
        return CACHE_CABECA[synset]
    fila = deque([(synset, 0)])
    vistos = {synset}
    achado = None
    while fila:
        s, d = fila.popleft()
        if s in ANC:
            achado = ANC[s]
            break
        if d > 12:
            continue
        for h in s.hypernyms() + s.instance_hypernyms():
            if h not in vistos:
                vistos.add(h)
                fila.append((h, d + 1))
    CACHE_CABECA[synset] = achado
    return achado


def frequencia(palavra, pos):
    return sum(l.count() for s in wn.synsets(palavra, pos=pos) for l in s.lemmas() if l.name().lower() == palavra)


CACHE_SUBST = {}


def substantivo_da_definicao(palavra):
    """Conceito de uma palavra da definição, só se ela for usada principalmente como substantivo."""
    if palavra in CACHE_SUBST:
        return CACHE_SUBST[palavra]
    resultado = None
    base = wn.morphy(palavra, wn.NOUN)
    if base:
        n = frequencia(base, wn.NOUN)
        outras = max(frequencia(base, wn.VERB), frequencia(base, wn.ADJ))
        # "young", "long", "cook": mais adjetivo/verbo do que substantivo → não serve
        if n >= outras or not (wn.synsets(base, pos=wn.VERB) or wn.synsets(base, pos=wn.ADJ)):
            sins = wn.synsets(base, pos=wn.NOUN)
            if sins:
                resultado = cabeca(sins[0])
    CACHE_SUBST[palavra] = resultado
    return resultado


CACHE_MOD = {}


def modificador(synset, cab):
    """Primeiro conceito específico (substantivo) que aparece na definição, e se ela fala de grande/pequeno."""
    chave = (synset, cab)
    if chave in CACHE_MOD:
        return CACHE_MOD[chave]
    original = synset.definition()
    definicao = original.lower()
    neg = bool(NEGACAO.search(definicao))
    tamanho = None
    achado = None
    for palavra in re.findall(r"[A-Za-z]+", original):
        minuscula = palavra.lower()
        if tamanho is None and minuscula in GRANDE:
            tamanho = "muito"
        if tamanho is None and minuscula in PEQUENO:
            tamanho = "pouco"
        if achado or palavra[0].isupper() or minuscula in PARADAS or len(minuscula) < 3:
            continue
        if re.search(r"(ing|ed|ly)$", minuscula):
            continue
        c = substantivo_da_definicao(minuscula)
        if c and c not in GENERICOS and c not in VERBOS and c != cab:
            achado = c
    CACHE_MOD[chave] = (achado, neg, tamanho)
    return achado, neg, tamanho


def adjetivo_pelo_parente(synset):
    """Adjetivo sem conceito na definição: usa o substantivo parente (natural → nature, hot → temperature)."""
    parentes = list(synset.attributes())
    for lema in synset.lemmas():
        parentes += [d.synset() for d in lema.derivationally_related_forms() + lema.pertainyms()]
    for s in synset.similar_tos():
        parentes += list(s.attributes())
        for lema in s.lemmas():
            parentes += [d.synset() for d in lema.derivationally_related_forms() + lema.pertainyms()]
    for p in parentes:
        c = cabeca(p)
        if c and c not in VERBOS:
            return c
    return "padrao"


def formula(synset):
    pos = synset.pos()
    if synset in ANC:
        return f"{'v' if pos == 'v' else 'n'}:{ANC[synset]}"
    if pos in ("a", "s", "r"):
        mod, neg, tamanho = modificador(synset, None)
        if not mod:
            mod = adjetivo_pelo_parente(synset)
        return f"a:{'!' if neg else ''}{mod}" + (f"|{tamanho}" if tamanho else "")
    cab = cabeca(synset) or ("gerar" if pos == "v" else "objeto")
    mod, _, tamanho = modificador(synset, cab)
    tipo = "v" if pos == "v" else "n"
    return f"{tipo}:{cab}" + (f">{mod}" if mod else "") + (f"|{tamanho}" if tamanho and tipo == "n" else "")


def pontuacao(synset, lema_ingles=None):
    # sentido mais usado primeiro (frequência no corpus do WordNet); substantivo ganha leve vantagem
    peso = 1.5 if synset.pos() == "n" else 1.0
    if lema_ingles:
        return peso * (sum(l.count() for l in synset.lemmas() if l.name().lower() == lema_ingles) + 0.001)
    return peso * (sum(l.count() for l in synset.lemmas()) + 0.001)


def gerar(lang_curto, lang_wn):
    lexico = {}
    nomes = wn.all_lemma_names(lang=lang_wn)
    for lema in nomes:
        if "_" in lema or " " in lema or "-" in lema:
            continue
        chave = normalizar(lema)
        if not re.fullmatch(r"[a-z]+", chave) or len(chave) < 2 or chave in lexico:
            continue
        sins = wn.synsets(lema, lang=lang_wn)
        if not sins:
            continue
        ingles = lema.lower() if lang_wn == "eng" else None
        ordem = {"n": 0, "v": 1, "a": 2, "s": 2, "r": 3}
        # nomes próprios (Charles, Paris…) ficam de fora: são escritos letra a letra
        sins = [s for s in sins if not s.instance_hypernyms()]
        if not sins:
            continue
        melhor = max(sins, key=lambda s: (pontuacao(s, ingles), -ordem.get(s.pos(), 4)))
        f = formula(melhor)
        if f:
            lexico[chave] = f
    os.makedirs(SAIDA, exist_ok=True)
    caminho = os.path.join(SAIDA, f"lexico-{lang_curto}.json")
    with open(caminho, "w", encoding="utf-8") as arq:
        json.dump(lexico, arq, ensure_ascii=False, separators=(",", ":"))
    print(f"  {lang_curto}: {len(lexico)} palavras → {os.path.relpath(caminho)} ({os.path.getsize(caminho) // 1024} KB)")


def main():
    global ANC
    print("Verificando âncoras…")
    ANC = verificar_ancoras()
    print(f"  {len(ANC)} âncoras válidas")
    if len(sys.argv) > 1 and sys.argv[1] == "--testar":
        for w in sys.argv[2:]:
            s = max(wn.synsets(w), key=lambda x: pontuacao(x, w))
            print(f"  {w}: {s.name()} → {formula(s)}   ({s.definition()})")
        return
    for curto, longo in LINGUAS.items():
        gerar(curto, longo)


if __name__ == "__main__":
    main()
