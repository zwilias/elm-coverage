elm-make src/Analyzer.elm --output Analyzer.js
jscodeshift -t ../../random/codemods/eliminateRedundantAStar.js Analyzer.js
jscodeshift -t ../../random/codemods/optimizeCharEquality.js Analyzer.js
