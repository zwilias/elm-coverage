module Coverage exposing (..)

import Native.Coverage


type alias Identifier =
    { startPos : ( Int, Int )
    , endPos : ( Int, Int )
    }


type alias IdentifierC =
    { complexity : Int
    , startPos : ( Int, Int )
    , endPos : ( Int, Int )
    }


type alias IdentifierD =
    { name : String
    , complexity : Int
    , startPos : ( Int, Int )
    , endPos : ( Int, Int )
    }


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
    Int
    -> String
    ->
        { declarations : List IdentifierD
        , caseBranches : List Identifier
        , ifElseBranches : List Identifier
        , lambdaBodies : List IdentifierC
        , letDeclarations : List IdentifierC
        }
    -> Never
    -> a
init _ =
    Native.Coverage.init
