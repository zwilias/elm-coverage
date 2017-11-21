#!/bin/bash
FILE="$1"
mkdir -p .coverage
mv "${FILE}" "${FILE}.orig"
~/.local/bin/elm-coverage "${FILE}.orig" --output "${FILE}"
elm test
mv "${FILE}.orig" "${FILE}"

