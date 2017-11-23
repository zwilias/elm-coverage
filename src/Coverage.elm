module Coverage exposing (..)

import Native.Coverage


type alias Identifier =
    { startPos : ( Int, Int )
    , endPos : ( Int, Int )
    }


expression : String -> Int -> Never -> a
expression =
    Native.Coverage.expression


declaration : String -> Int -> Never -> a
declaration =
    Native.Coverage.declaration


caseBranch : String -> Int -> Never -> a
caseBranch =
    Native.Coverage.caseBranch


ifElseBranch : String -> Int -> Never -> a
ifElseBranch =
    Native.Coverage.ifElseBranch


lambdaBody : String -> Int -> Never -> a
lambdaBody =
    Native.Coverage.lambdaBody


letDeclaration : String -> Int -> Never -> a
letDeclaration =
    Native.Coverage.letDeclaration


init :
    String
    -> { expressions : List Identifier
       , declarations : List Identifier
       , caseBranches : List Identifier
       , ifElseBranches : List Identifier
       , lambdaBodies : List Identifier
       , letDeclarations : List Identifier
       }
    -> Never
    -> a
init =
    Native.Coverage.init
