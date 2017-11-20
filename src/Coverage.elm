module Coverage exposing (..)

import Native.Coverage


type alias Identifier =
    { startPos : ( Int, Int )
    , endPos : ( Int, Int )
    }


expression : String -> Int -> a -> a
expression =
    Native.Coverage.expression


declaration : String -> Int -> a -> a
declaration =
    Native.Coverage.declaration


caseBranch : String -> Int -> a -> a
caseBranch =
    Native.Coverage.caseBranch


ifElseBranch : String -> Int -> a -> a
ifElseBranch =
    Native.Coverage.ifElseBranch


init :
    String
    -> { expressions : List Identifier
       , declarations : List Identifier
       , caseBranches : List Identifier
       , ifElseBranches : List Identifier
       }
    -> Never
    -> a
init =
    Native.Coverage.init
