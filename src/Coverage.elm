module Coverage exposing (..)

import Array.Hamt as Array exposing (Array)
import Dict.LLRB as Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)


type alias Position =
    ( Int, Int )


line : Position -> Int
line ( l, _ ) =
    l


column : Position -> Int
column ( _, c ) =
    c


type alias Region =
    { from : Position, to : Position }


type alias Map =
    Dict String (List AnnotationInfo)


type alias Name =
    String


type alias Complexity =
    Int


type Annotation
    = Declaration Name Complexity
    | LetDeclaration Complexity
    | LambdaBody Complexity
    | CaseBranch
    | IfElseBranch


declaration : String
declaration =
    "declaration"


letDeclaration : String
letDeclaration =
    "letDeclaration"


lambdaBody : String
lambdaBody =
    "lambdaBody"


caseBranch : String
caseBranch =
    "caseBranch"


ifElseBranch : String
ifElseBranch =
    "ifElseBranch"


annotationType : Annotation -> String
annotationType annotation =
    case annotation of
        Declaration _ _ ->
            declaration

        LetDeclaration _ ->
            letDeclaration

        LambdaBody _ ->
            lambdaBody

        CaseBranch ->
            caseBranch

        IfElseBranch ->
            ifElseBranch


fromAnnotation :
    { declaration : a
    , letDeclaration : a
    , lambdaBody : a
    , caseBranch : a
    , ifElseBranch : a
    , default : a
    }
    -> String
    -> a
fromAnnotation settings annotation =
    case annotation of
        "declaration" ->
            settings.declaration

        "letDeclaration" ->
            settings.letDeclaration

        "lambdaBody" ->
            settings.lambdaBody

        "caseBranch" ->
            settings.caseBranch

        "ifElseBranch" ->
            settings.ifElseBranch

        _ ->
            settings.default


type alias Located a =
    ( Region, a )


type alias AnnotationInfo =
    Located ( Annotation, Int )


regionDecoder : Decoder Region
regionDecoder =
    let
        position : Decoder ( Int, Int )
        position =
            Decode.map2 (,)
                (Decode.field "line" Decode.int)
                (Decode.field "column" Decode.int)
    in
    Decode.map2 Region
        (Decode.field "from" position)
        (Decode.field "to" position)


annotationInfoDecoder : Decoder AnnotationInfo
annotationInfoDecoder =
    Decode.map2 (,)
        regionDecoder
        (Decode.map2 (,) annotationDecoder evaluationCountDecoder)


evaluationCountDecoder : Decoder Int
evaluationCountDecoder =
    Decode.oneOf [ Decode.field "count" Decode.int, Decode.succeed 0 ]


fieldIs : String -> String -> Decoder a -> Decoder a
fieldIs fieldName expectedValue decoder =
    Decode.field fieldName Decode.string
        |> Decode.andThen
            (\actual ->
                if actual == expectedValue then
                    decoder
                else
                    Decode.fail "not this one"
            )


annotationDecoder : Decoder Annotation
annotationDecoder =
    Decode.oneOf
        [ fieldIs "type" "declaration" (Decode.map2 Declaration (Decode.field "name" Decode.string) (Decode.field "complexity" Decode.int))
        , fieldIs "type" "letDeclaration" (Decode.map LetDeclaration (Decode.field "complexity" Decode.int))
        , fieldIs "type" "lambdaBody" (Decode.map LambdaBody (Decode.field "complexity" Decode.int))
        , fieldIs "type" "caseBranch" (Decode.succeed CaseBranch)
        , fieldIs "type" "ifElseBranch" (Decode.succeed IfElseBranch)
        ]


regionsDecoder : Decoder Map
regionsDecoder =
    Decode.keyValuePairs (Decode.list annotationInfoDecoder)
        |> Decode.map Dict.fromList


type alias Index =
    Array Int


index : String -> Index
index input =
    input
        |> String.lines
        |> List.foldl
            (\line ( acc, sum ) ->
                ( Array.push sum acc
                , sum + String.length line + 1
                )
            )
            ( Array.empty, 0 )
        |> Tuple.first


positionToOffset : Position -> Index -> Maybe Int
positionToOffset position idx =
    Array.get (line position - 1) idx
        |> Maybe.map (\offSet -> offSet + column position - 1)
