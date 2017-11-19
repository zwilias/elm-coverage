module Coverage exposing (..)

import Native.Coverage


expression : Int -> a -> a
expression =
    Native.Coverage.expression


declaration : Int -> a -> a
declaration =
    Native.Coverage.declaration


caseBranch : Int -> a -> a
caseBranch =
    Native.Coverage.caseBranch


ifBranch : Int -> a -> a
ifBranch =
    Native.Coverage.ifBranch


init : List Int -> List Int -> List Int -> Int -> Never -> a
init =
    Native.Coverage.init
