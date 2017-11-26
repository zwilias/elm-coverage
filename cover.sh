#!/bin/bash

# COMPILER="/Users/ilias/src/truqu/site/elm/.bin/elm-make"
COMPILER=$(which elm-make)
FILE="$1"
shift
mkdir -p .coverage

(cd tests &&
    cp elm-package.json elm-package.json.bak &&
    jq '. + {"source-directories": (."source-directories" + ["/Users/ilias/Src/elm/elm-coverage/src"])} + {"native-modules": true, "repository": "https://github.com/user/project.git"}' elm-package.json | sponge elm-package.json
)

if [[ -d "${FILE}" ]]; then
    find "${FILE}" -type f -name "*.elm" -not -path "${FILE}/tests/*" -not -path "${FILE}/elm-stuff/*" -exec cp "{}" "{}.bak" \;
    find "${FILE}" -type f -name "*.elm" -not -path "${FILE}/tests/*" -not -path "${FILE}/elm-stuff/*" -exec ~/.local/bin/elm-coverage --yes "{}" \;
else
    mv "${FILE}" "${FILE}.orig"
    ~/.local/bin/elm-coverage "${FILE}.orig" --output "${FILE}"
fi

elm-test --compiler "$COMPILER" "$@"

if [[ -d "${FILE}" ]]; then
    find "${FILE}" -type f -name "*.elm" -not -path "${FILE}/tests/*" -not -path "${FILE}/elm-stuff/*" -exec mv "{}.bak" "{}" \;
else
    mv "${FILE}.orig" "${FILE}"
fi

(cd tests && mv elm-package.json.bak elm-package.json)
node /Users/ilias/Src/elm/elm-coverage/analyze.js "$FILE"
