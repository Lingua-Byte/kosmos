# Blender + Claude (só no PC)

Com o **Blender MCP** (gratuito, de código aberto: https://github.com/ahujasid/blender-mcp), o Claude Code do PC
consegue **controlar o Blender**: criar e mexer em objetos, materiais e luz, posicionar a câmera, renderizar e
salvar imagens. É o caminho para as artes 2.5D dos lugares (o jeito do Fallout clássico: cena 3D fotografada
de um ângulo fixo).

Não funciona no Android/web: precisa do Blender aberto no mesmo computador.

## Ligar (uma vez só)

1. **Instalar o Blender** (grátis): https://www.blender.org/download/
2. **Instalar o `uv`** (o programa que roda o servidor do Blender MCP). No Windows, no PowerShell:
   `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
3. **Pôr o complemento no Blender:** baixar o arquivo `addon.py` da página do projeto; no Blender,
   *Edit → Preferences → Add-ons → Install*, escolher o `addon.py` e marcar **Blender MCP**.
4. **Ligar no Claude Code**, na pasta do KOSMOS: `claude mcp add blender uvx blender-mcp`
5. **Conectar:** no Blender, apertar `N`, abrir a aba **BlenderMCP** e clicar em conectar/iniciar o servidor.
   Depois abrir (ou reabrir) o Claude Code.

Dica: no PC você pode só pedir "Claude, segue o ferramentas/BLENDER.md e liga o Blender pra mim" — ele faz os
passos 2 e 4 sozinho; os passos 1, 3 e 5 são cliques seus no Blender.
Os passos e nomes dos botões podem mudar com versões novas: se algo não bater, vale o que diz a página do projeto.

## Usar

Exemplos de pedido:
- "Monta no Blender a Conveniência do Abe vista de cima, em ângulo isométrico, de noite, com luz amarela."
- "Renderiza a mesma cena com as prateleiras vazias e a porta meio fechada" (versão para mais tarde na noite).
- "Salva em `site/imagens/x/` em webp, 1280 de largura."

Cuidados:
- O complemento deixa o Claude rodar comandos dentro do Blender: **salve seu arquivo antes** de pedir mudanças grandes.
- Modelos e texturas de fora: usar só os de licença livre (Poly Haven, Kenney, Quaternius — ver `FERRAMENTAS.md`).
- As artes vão para dentro das missões, mapas e retratos; os menus continuam com a galáxia animada.
