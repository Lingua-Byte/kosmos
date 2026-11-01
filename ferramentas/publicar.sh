#!/bin/sh
# Publica a versão atual do jogo no GitHub Pages (https://lingua-byte.github.io/kosmos/).
#   1. envia o projeto para a branch main
#   2. copia só a pasta site/ para a branch gh-pages, que é o que o GitHub Pages serve
# Uso (Git Bash, na pasta do projeto):  sh ferramentas/publicar.sh
set -e
GIT="/c/Program Files/Git/cmd/git.exe"
cd "$(dirname "$0")/.."
"$GIT" push origin main
"$GIT" subtree split --prefix site -b gh-pages >/dev/null
"$GIT" push -f origin gh-pages
echo "Publicado. Em cerca de 1 minuto: https://lingua-byte.github.io/kosmos/"
