module Coverage exposing (..)

import Native.Coverage


type alias Identifier =
    { startPos : ( Int, Int )
    , endPos : ( Int, Int )
    }


expression : Int -> Int -> a -> a
expression =
    Native.Coverage.expression


declaration : Int -> Int -> a -> a
declaration =
    Native.Coverage.declaration


caseBranch : Int -> Int -> a -> a
caseBranch =
    Native.Coverage.caseBranch


ifElseBranch : Int -> Int -> a -> a
ifElseBranch =
    Native.Coverage.ifElseBranch


init :
    String
    -> Int
    ->
        { expressions : List Identifier
        , declarations : List Identifier
        , caseBranches : List Identifier
        , ifElseBranches : List Identifier
        }
    -> Never
    -> a
init =
    Native.Coverage.init
