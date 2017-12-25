module Coverage
    exposing
        ( Annotation(..)
        , AnnotationInfo
        , Complexity
        , Index
        , Map
        , Name
        , Position
        , Region
        , annotationType
        , caseBranch
        , complexity
        , declaration
        , fromAnnotation
        , ifElseBranch
        , index
        , lambdaBody
        , letDeclaration
        , line
        , positionToOffset
        , regionsDecoder
        , totalComplexity
        )

import Array.Hamt as Array exposing (Array)
import Dict.LLRB as Dict exposing (Dict)
import Json.Decode as Decode exposing (Decoder)


-- Types


type alias Position =
    ( Int, Int )


type alias Region =
    { from : Position
    , to : Position
    }


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


type alias AnnotationInfo =
    ( Region, Annotation, Int )



-- Extracting information from types


complexity : Annotation -> Maybe Int
complexity annotation =
    case annotation of
        Declaration _ c ->
            Just c

        LetDeclaration c ->
            Just c

        LambdaBody c ->
            Just c

        _ ->
            Nothing


totalComplexity : List AnnotationInfo -> Complexity
totalComplexity annotations =
    let
        allComplexities : List Complexity
        allComplexities =
            List.filterMap
                (\( _, annotation, _ ) ->
                    case annotation of
                        Declaration _ c ->
                            Just c

                        _ ->
                            Nothing
                )
                annotations
    in
    List.sum allComplexities - List.length allComplexities + 1


line : Position -> Int
line =
    Tuple.first


column : Position -> Int
column =
    Tuple.second


position : Decoder Position
position =
    Decode.map2 (,)
        (Decode.field "line" Decode.int)
        (Decode.field "column" Decode.int)


regionDecoder : Decoder Region
regionDecoder =
    Decode.map2 Region
        (Decode.field "from" position)
        (Decode.field "to" position)


annotationInfoDecoder : Decoder AnnotationInfo
annotationInfoDecoder =
    Decode.map3 (,,)
        regionDecoder
        annotationDecoder
        evaluationCountDecoder


evaluationCountDecoder : Decoder Int
evaluationCountDecoder =
    Decode.oneOf [ Decode.field "count" Decode.int, Decode.succeed 0 ]


typeIs : String -> Decoder a -> Decoder a
typeIs expectedValue decoder =
    Decode.field "type" Decode.string
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
        [ typeIs declaration declarationDecoder
        , typeIs letDeclaration (withComplexity LetDeclaration)
        , typeIs lambdaBody (withComplexity LambdaBody)
        , typeIs caseBranch (Decode.succeed CaseBranch)
        , typeIs ifElseBranch (Decode.succeed IfElseBranch)
        ]


withComplexity : (Complexity -> a) -> Decoder a
withComplexity tag =
    Decode.map tag (Decode.field "complexity" Decode.int)


declarationDecoder : Decoder Annotation
declarationDecoder =
    Decode.map2 Declaration
        (Decode.field "name" Decode.string)
        (Decode.field "complexity" Decode.int)


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
