#!/bin/sh
# Roda ao abrir uma sessão do Claude no PC (gancho em .claude/settings.json).
#   1. traz as novidades da main (o que veio do Android já junto pelo robô)
#   2. avisa se algum branch tem trabalho fora da main (o robô não conseguiu juntar)
cd "$(dirname "$0")/.." || exit 0
[ "$(git branch --show-current)" = main ] || exit 0
git fetch -q --prune origin 2>/dev/null || exit 0
git pull -q --no-rebase --no-edit --autostash origin main 2>/dev/null
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin | grep -v -e '^origin$' -e '^origin/HEAD$' -e '^origin/main$' -e '^origin/gh-pages$'); do
  n=$(git rev-list --count "main..$b" 2>/dev/null)
  [ "${n:-0}" -gt 0 ] && echo "Aviso para o Claude: o branch ${b#origin/} tem $n mudança(s) fora da main (o robô não juntou). Junte, resolva o conflito e avise o autor em uma frase simples."
done
exit 0
