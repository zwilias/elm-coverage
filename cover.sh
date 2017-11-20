#!/bin/bash
FILE="$1"
mkdir -p .coverage
mv "src/${FILE}.elm" "src/${FILE}.elm.orig"
~/.local/bin/elm-coverage "src/${FILE}.elm.orig" --output "src/${FILE}.elm"
elm test
mv "src/${FILE}.elm.orig" "src/${FILE}.elm"

