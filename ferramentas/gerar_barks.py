"""
Gera as "falas breves" dos personagens, como nos RPGs antigos: quando alguém começa a falar,
toca uma palavra curta na voz dele ("Ei.", "Hm.", "Escuta."). O resto da fala é o balbucio
sintetizado no jogo (site/js/vozes.js).

Grava site/audio/barks/<npc>-<n>.mp3 e site/audio/barks/indice.json ({ npc: quantas }).
Só gera o que ainda não existe. Uso:  python ferramentas/gerar_barks.py   (pip install edge-tts)
"""

import asyncio
import json
import os

import edge_tts

from gerar_vozes import VOZES

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SAIDA = os.path.join(RAIZ, "site", "audio", "barks")

# Vozes de quem apareceu depois (a X1); o resto vem do gerar_vozes.py
VOZES = {
    **VOZES,
    "rita": ("en-US-EmmaMultilingualNeural", "+6%", "+2Hz"),        # vizinha prática, decidida
    "guarda": ("pt-BR-AntonioNeural", "+8%", "+6Hz"),               # guarda da Contenção, seco
    "saqueador": ("es-MX-JorgeNeural", "+14%", "+0Hz"),             # nervoso, rápido
    "walt": ("en-US-GuyNeural", "-12%", "-6Hz"),                    # velho desconfiado, poucas palavras
}

# Duas a três falas breves por personagem: o jeito de cada um abrir a boca
BARKS = {
    "helen": ["Hm.", "Escuta.", "Certo."],
    "martha": ["Ei.", "Olha só.", "Entra, rápido."],
    "ouvinte-x": ["Shh…", "Tá ouvindo?", "Hm-hm."],
    "petrakis": ["Hmpf.", "Quem é?", "Ora essa…"],
    "hilde": ["Ah!", "Espera…", "Não, não…"],
    "moore": ["Cidadão.", "Atenção.", "Hm."],
    "abe": ["Opa.", "Diga lá.", "Ahh…"],
    "sal": ["Ô, meu chapa.", "Hehe.", "Hm."],
    "danny": ["Ei! Ei!", "Cara…", "Ah, valeu."],
    "hollis": ["Oh…", "Hã?", "Ora, ora."],
    "oswald": ["Boa noite.", "Pois não.", "Hm."],
    "teddy": ["Quatro…", "Sete…", "Um, dois…"],
    "homem-terno": ["Hm.", "Calma.", "Sim."],
    "riscador": ["Não…", "Risca…", "Hhh…"],
    "rita": ["Ei.", "Vem.", "Rápido."],
    "guarda": ["Alto!", "Documento.", "Circulando."],
    "saqueador": ["Ei, ei!", "Para trás!", "Hah."],
    "walt": ["Hm.", "É…", "Olha…"],
}


async def gerar():
    os.makedirs(SAIDA, exist_ok=True)
    indice = {}
    for npc, falas in BARKS.items():
        voz, rate, pitch = VOZES[npc]
        indice[npc] = len(falas)
        for n, texto in enumerate(falas, 1):
            destino = os.path.join(SAIDA, f"{npc}-{n}.mp3")
            if os.path.exists(destino):
                continue
            for tentativa in range(4):
                try:
                    await edge_tts.Communicate(texto, voz, rate=rate, pitch=pitch).save(destino)
                    print("ok", npc, n, texto)
                    break
                except Exception as e:  # o serviço às vezes não responde: tenta de novo
                    print("de novo", npc, n, e)
                    await asyncio.sleep(1.5)
    with open(os.path.join(SAIDA, "indice.json"), "w", encoding="utf-8") as f:
        json.dump(indice, f, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    asyncio.run(gerar())
