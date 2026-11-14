# Editor de Vídeo com Claude

Editor de vídeo não linear no estilo do Premiere, que roda no navegador, com o Claude embutido como assistente de edição. É uma ferramenta à parte do jogo: não depende de nada do KOSMOS.

## Como abrir

```bash
pip install anthropic                     # uma vez
export ANTHROPIC_API_KEY=sk-ant-...       # sua chave (ou: ant auth login)
python editor-video/servidor.py           # abre em http://127.0.0.1:8765
```

Abra o endereço no Chrome ou no Edge. Sem chave, o editor funciona do mesmo jeito; só o painel do Claude fica desligado.
O servidor atende apenas este computador (127.0.0.1), e a chave fica nele, nunca no navegador.

Para usar outro modelo: `EDITOR_MODELO=claude-sonnet-5-5 python editor-video/servidor.py`.

## O que tem

- **Mídia:** importe vídeo, áudio e imagem (botão ou arrastando). Os arquivos ficam guardados no navegador (IndexedDB), então o projeto reabre como estava.
- **Linha do tempo:** faixas de vídeo em camadas (Títulos, V2, V1) e de áudio (A1, A2), com mais faixas no **+V** / **+A**. Arraste clipes para mover (também entre faixas), puxe as bordas para aparar, e o ímã gruda nas emendas, no cursor e nos marcadores. Ctrl + roda do mouse dá zoom.
- **Edição:** dividir, apagar, apagar fechando a lacuna (ripple), fade de entrada e de saída, volume, opacidade, títulos e legendas, marcadores. Desfazer e refazer sem limite prático.
- **Monitor:** prévia em tempo real com o som mixado.
- **Formatos:** 1920×1080, 4K, vertical 1080×1920 (Reels, Shorts, TikTok), quadrado e 4:5.
- **Exportar:** grava o vídeo final em tempo real. O Chrome com H.264 gera MP4 direto. Quando sai WebM, o botão **Converter para MP4** usa o ffmpeg do servidor, se ele estiver instalado.

## O que o Claude consegue fazer

O Claude não só conversa: ele age no projeto com ferramentas.

| Ferramenta | O que faz |
|---|---|
| `ver_projeto` | Lê faixas, clipes, mídias, cursor e seleção |
| `ver_quadros` | **Vê o vídeo**: renderiza os instantes pedidos numa folha de quadros |
| `adicionar_clipe`, `mover_clipe`, `aparar_clipe`, `dividir_clipe`, `remover_clipes` | Monta e corta |
| `adicionar_texto`, `ajustar_clipe` | Títulos, legendas, fades, volume, opacidade |
| `adicionar_marcador`, `posicionar_cursor` | Aponta momentos para você |
| `configurar_projeto`, `adicionar_faixa` | Formato, fps, faixas novas |

Exemplos de pedido: "analise meu vídeo e sugira cortes", "monte uma versão de 30 segundos", "põe um título de abertura com tarja", "fades de meio segundo em todas as emendas", "converte para vertical".
Tudo o que ele faz numa resposta se desfaz com um **Ctrl+Z**. O seletor *rápido / equilibrado / caprichado* define quanto ele pensa antes de responder.

**Limite:** o Claude vê os quadros, mas não ouve o áudio. Para cortes baseados em fala, diga a ele o que acontece em cada trecho.

## Atalhos

| Tecla | Ação |
|---|---|
| Espaço / K | Tocar e pausar |
| ← / → | Quadro anterior / próximo |
| Home / End | Início / fim |
| S | Dividir no cursor (seleção, ou tudo sob o cursor) |
| Delete | Apagar seleção (Shift+Delete fecha a lacuna) |
| M | Marcador |
| I | Importar |
| Ctrl+Z / Ctrl+Shift+Z | Desfazer / refazer |
| Ctrl+A / Esc | Selecionar tudo / limpar seleção |
| \ , + , − | Mostrar tudo, zoom |

## Arquivos

- `servidor.py`: serve a página, repassa a conversa para a API do Claude (SDK oficial `anthropic`, com fallback automático se o modelo recusar) e converte para MP4.
- `js/projeto.js`: estado do projeto, operações de edição, histórico e gravação local.
- `js/motor.js`: renderização no canvas, reprodução, mixagem de áudio, quadros para o Claude e exportação.
- `js/linha-do-tempo.js`: régua, faixas, arrastar, aparar e ímã.
- `js/assistente.js`: painel do Claude, definição e execução das ferramentas.
- `js/interface.js`: painel de mídia, monitor, inspetor, atalhos e diálogo de exportação.

## Limitações atuais

- A exportação acontece em tempo real: um vídeo de 3 minutos leva 3 minutos, e a aba precisa ficar visível.
- Ainda não tem velocidade de clipe, efeitos de cor, keyframes, nem transições além do fade.
- O WebM gravado pelo navegador sai sem a duração no cabeçalho, e alguns players não mostram a barra de progresso. Converter para MP4 resolve.
