"""
Gera o áudio das falas dos personagens (cada um com uma voz única, que nenhum outro usa).

Lê as falas das missões (o trecho entre aspas “ ” de cada resultado de uma ação com npc)
e grava site/audio/falas/<acao>-<campo>.mp3. Só gera o que ainda não existe ou mudou.

Vozes: Microsoft Edge (edge-tts). Uso:  python ferramentas/gerar_vozes.py
Precisa do Node (para ler as missões) e de: pip install edge-tts
"""

import asyncio
import hashlib
import json
import os
import re
import subprocess
import sys

import edge_tts

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SAIDA = os.path.join(RAIZ, "site", "audio", "falas")
INDICE = os.path.join(SAIDA, "indice.json")

# Uma voz por personagem, sem repetir. rate/pitch dão o jeito de falar de cada um.
VOZES = {
    "helen": ("en-US-AvaMultilingualNeural", "+4%", "+0Hz"),        # médica cansada, rápida, objetiva
    "martha": ("pt-BR-FranciscaNeural", "-4%", "-2Hz"),              # farmacêutica firme, maternal
    "ouvinte-x": ("pt-BR-ThalitaMultilingualNeural", "-14%", "-6Hz"),  # calma, como quem ouve outra coisa
    "petrakis": ("fr-FR-VivienneMultilingualNeural", "+2%", "+4Hz"),   # vizinha idosa, desconfiada
    "hilde": ("de-DE-SeraphinaMultilingualNeural", "-6%", "-2Hz"),     # física assustada, precisa
    "moore": ("en-US-AndrewMultilingualNeural", "-2%", "-4Hz"),        # voz de nota oficial
    "abe": ("it-IT-GiuseppeMultilingualNeural", "-6%", "-6Hz"),        # dono de loja, quarenta anos de balcão
    "sal": ("pt-BR-AntonioNeural", "-10%", "-10Hz"),                  # porteiro velho, sem pressa
    "danny": ("en-US-BrianMultilingualNeural", "+12%", "+4Hz"),        # rapaz assustado, fala atropelado
    "hollis": ("en-AU-WilliamMultilingualNeural", "-16%", "-4Hz"),     # senhor confuso, de pijama
    "oswald": ("fr-FR-RemyMultilingualNeural", "-18%", "-8Hz"),        # vigia educado, preciso demais
    "teddy": ("pt-PT-DuarteNeural", "-8%", "-6Hz"),                   # o irmão que conta números
    "homem-terno": ("de-DE-FlorianMultilingualNeural", "-12%", "-12Hz"),  # calmo demais
    "riscador": ("ko-KR-HyunsuMultilingualNeural", "+0%", "-8Hz"),     # longe, rouco, apressado
}


def falas_das_missoes():
    """Usa o Node para carregar as missões e devolver [{arquivo, npc, texto}]."""
    js = r"""
    global.window = { MISSOES: {} }; global.MISSOES = window.MISSOES;
    global.fraseAleatoria = () => ""; global.profissaoDe = () => null;
    const fs = require("fs"), path = require("path");
    const pasta = path.join(process.argv[1], "site", "js", "missoes");
    for (const f of fs.readdirSync(pasta)) eval(fs.readFileSync(path.join(pasta, f), "utf8"));
    const saida = [];
    for (const m of Object.values(MISSOES)) {
      const acoes = [...Object.values(m.lugares || {}).flatMap((l) => l.acoes), ...(m.emTodaParte || [])];
      for (const a of acoes) {
        if (!a.npc) continue;
        for (const campo of ["resultado", "sucesso", "falha"]) {
          const r = a[campo];
          if (r && typeof r.texto === "string") saida.push({ arquivo: `${a.id}-${campo}`, npc: r.npc || a.npc, texto: r.texto });
        }
      }
    }
    console.log(JSON.stringify(saida));
    """
    out = subprocess.run(["node", "-e", js, RAIZ], capture_output=True, text=True, encoding="utf-8", check=True)
    return json.loads(out.stdout)


def so_a_fala(texto):
    """O que a voz lê: só o que está entre aspas “ ”."""
    partes = re.findall(r"“([^”]+)”", texto)
    return " ".join(p.strip() for p in partes)


async def gerar():
    os.makedirs(SAIDA, exist_ok=True)
    indice = {}
    if os.path.exists(INDICE):
        with open(INDICE, encoding="utf-8") as f:
            indice = json.load(f)
    novo_indice = {}
    feitos = 0
    for item in falas_das_missoes():
        fala = so_a_fala(item["texto"])
        if not fala or item["npc"] not in VOZES:
            continue
        voz, rate, pitch = VOZES[item["npc"]]
        assinatura = hashlib.sha1(f"{voz}|{rate}|{pitch}|{fala}".encode()).hexdigest()[:12]
        destino = os.path.join(SAIDA, item["arquivo"] + ".mp3")
        novo_indice[item["arquivo"]] = {"npc": item["npc"], "assinatura": assinatura}
        if indice.get(item["arquivo"], {}).get("assinatura") == assinatura and os.path.exists(destino):
            continue
        # o serviço às vezes falha sem motivo: tenta de novo, com uma pausa crescente
        for tentativa in range(5):
            try:
                await edge_tts.Communicate(fala, voz, rate=rate, pitch=pitch).save(destino)
                break
            except edge_tts.exceptions.NoAudioReceived:
                if tentativa == 4:
                    print("falhou", item["arquivo"], voz)
                    novo_indice.pop(item["arquivo"], None)
                await asyncio.sleep(2 * (tentativa + 1))
        feitos += 1
        print("gerado", item["arquivo"], "·", item["npc"])
    with open(INDICE, "w", encoding="utf-8") as f:
        json.dump(novo_indice, f, ensure_ascii=False, indent=1)
    print(f"{feitos} áudios novos, {len(novo_indice)} falas no total")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    asyncio.run(gerar())
