port module Analyzer exposing (main)

import Array.Hamt as Array exposing (Array)
import Dict.LLRB as Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Json.Decode as Decode exposing (Decoder)
import Platform


port coverage : String -> Cmd msg


{-| Do the heavy lifting: render and stringify
-}
dump : Model -> ( (), Cmd msg )
dump =
    view >> Html.toString 0 >> coverage >> (,) ()


main : Program Flags () msg
main =
    Platform.programWithFlags
        { init = init
        , update = \_ _ -> () ! []
        , subscriptions = always Sub.none
        }


type alias Model =
    { inputs : Dict String String
    , moduleMap : CoverageMap
    }


type alias Flags =
    { coverage : Decode.Value
    , files : List ( String, String )
    }


flagsToModel : Flags -> Model
flagsToModel flags =
    { moduleMap =
        Decode.decodeValue regionsDecoder flags.coverage
            |> Result.withDefault Dict.empty
    , inputs = Dict.fromList flags.files
    }


init : Flags -> ( (), Cmd msg )
init =
    flagsToModel >> dump


type alias Position =
    ( Int, Int )


type alias Region =
    { from : Position, to : Position }


type alias CoverageMap =
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


type alias Located a =
    ( Region, a )


{-| An annotation with an evaluation-count and a location.
-}
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


regionsDecoder : Decoder CoverageMap
regionsDecoder =
    dictDec <| Decode.list annotationInfoDecoder


dictDec : Decoder a -> Decoder (Dict String a)
dictDec =
    Decode.keyValuePairs >> Decode.map Dict.fromList


type Marker
    = Begin Int Annotation
    | End


markup : String -> String -> Dict Int (List Marker) -> Html msg
markup coverageId input markers =
    markupHelper input 0 (Dict.toList markers) { children = [], stack = [] }
        |> (\{ children } ->
                Html.div [ Attr.class "coverage" ]
                    [ Html.div [ Attr.class "source" ] (toHtml children)
                    , Html.div [ Attr.class "lines" ] (lines coverageId input)
                    ]
           )


lines : String -> String -> List (Html msg)
lines coverageId input =
    input
        |> String.lines
        |> List.indexedMap
            (\idx _ ->
                let
                    lineId : String
                    lineId =
                        coverageId ++ "_" ++ toString (idx + 1)
                in
                Html.div
                    [ Attr.class "line", Attr.id lineId ]
                    [ Html.a
                        [ Attr.href <| "#" ++ lineId ]
                        [ Html.text <| toString <| idx + 1 ]
                    ]
            )


type alias Acc msg =
    { children : List (Content msg)
    , stack : List ( Int, Annotation, List (Content msg) )
    }


type Part
    = Part String
    | LineBreak
    | Indent Int
    | Indented Int String


type Content msg
    = Plain (List Part)
    | Content (Html msg -> Html msg) (List (Content msg))


wrap : (List (Html msg) -> Html msg) -> List (Content msg) -> Content msg
wrap wrapper content =
    Content (List.singleton >> wrapper) content


toHtml : List (Content msg) -> List (Html msg)
toHtml content =
    List.concatMap (contentToHtml identity) content
        |> List.reverse


contentToHtml : (Html msg -> Html msg) -> Content msg -> List (Html msg)
contentToHtml tagger content =
    case content of
        Plain parts ->
            List.concatMap (partToHtml tagger) parts

        Content wrapper parts ->
            List.concatMap (contentToHtml (wrapper >> tagger)) parts


partToHtml : (Html msg -> Html msg) -> Part -> List (Html msg)
partToHtml tagger part =
    case part of
        Part s ->
            if String.isEmpty s then
                []
            else
                [ tagger <| Html.text s ]

        LineBreak ->
            [ Html.br [] [] ]

        Indent indent ->
            whitespace indent

        Indented indent content ->
            (tagger <| Html.text content) :: whitespace indent


whitespace : Int -> List (Html msg)
whitespace indent =
    case indent of
        0 ->
            []

        _ ->
            [ Html.span
                [ Attr.class "whitespace" ]
                [ Html.text <| String.repeat indent " " ]
            ]


stringParts : String -> Content msg
stringParts string =
    case String.lines string of
        [] ->
            Plain []

        head :: rest ->
            (Part head :: List.map findIndent rest)
                |> List.intersperse LineBreak
                |> List.reverse
                |> Plain


findIndent : String -> Part
findIndent string =
    let
        countIndentLength : Char -> ( Int, Bool ) -> ( Int, Bool )
        countIndentLength c ( spaces, continue ) =
            if continue && c == ' ' then
                ( spaces + 1, True )
            else
                ( spaces, False )

        toIndentedString : Int -> Part
        toIndentedString spaces =
            if String.length string == spaces then
                Indent spaces
            else if spaces == 0 then
                Part string
            else
                String.slice spaces (String.length string) string
                    |> Indented spaces
    in
    string
        |> String.foldl countIndentLength ( 0, True )
        |> Tuple.first
        |> toIndentedString


markupHelper : String -> Int -> List ( Int, List Marker ) -> Acc msg -> Acc msg
markupHelper original offset markers acc =
    let
        rest : String -> Content msg
        rest input =
            input
                |> String.slice offset (String.length input)
                |> stringParts

        readUntil : Int -> String -> Content msg
        readUntil pos =
            String.slice offset pos >> stringParts
    in
    case markers of
        [] ->
            { acc | children = rest original :: acc.children }

        ( pos, markerList ) :: otherMarkers ->
            { acc | children = readUntil pos original :: acc.children }
                |> consumeMarkers markerList
                |> markupHelper original pos otherMarkers


consumeMarkers : List Marker -> Acc msg -> Acc msg
consumeMarkers markers acc =
    List.foldl consumeMarker acc markers


consumeMarker : Marker -> Acc msg -> Acc msg
consumeMarker marker acc =
    case marker of
        Begin cnt annotation ->
            { children = []
            , stack = ( cnt, annotation, acc.children ) :: acc.stack
            }

        End ->
            case acc.stack of
                [] ->
                    Debug.crash "unexpected end"

                ( cnt, complexity, x ) :: xs ->
                    let
                        content : Content msg
                        content =
                            wrap (wrapper cnt complexity) acc.children
                    in
                    { children = content :: x
                    , stack = xs
                    }


wrapper : Int -> Annotation -> List (Html msg) -> Html msg
wrapper cnt annotation =
    let
        content =
            case annotation of
                Declaration _ c ->
                    "Evaluated " ++ toString cnt ++ " times, complexity " ++ toString c ++ "."

                LetDeclaration c ->
                    "Evaluated " ++ toString cnt ++ " times, complexity " ++ toString c ++ "."

                LambdaBody c ->
                    "Evaluated " ++ toString cnt ++ " times, complexity " ++ toString c ++ "."

                _ ->
                    "Evaluated " ++ toString cnt ++ " times."
    in
    Html.span
        [ Attr.class <| toClass cnt
        , Attr.title content
        ]


toClass : Int -> String
toClass cnt =
    if cnt == 0 then
        "cover uncovered"
    else
        "cover covered"


addToListDict : a -> Maybe (List a) -> Maybe (List a)
addToListDict a m =
    case m of
        Nothing ->
            Just [ a ]

        Just xs ->
            Just <| a :: xs


toMarkerDict : List AnnotationInfo -> Index -> Dict Int (List Marker)
toMarkerDict regions offsets =
    let
        addRegion : AnnotationInfo -> Dict Int (List Marker) -> Dict Int (List Marker)
        addRegion ( region, ( annotation, count ) ) acc =
            Maybe.map2
                (\from to ->
                    acc
                        |> Dict.update from (addToListDict (Begin count annotation))
                        |> Dict.update to (addToListDict End)
                )
                (positionToOffset region.from offsets)
                (positionToOffset region.to offsets)
                |> Maybe.withDefault acc
    in
    List.foldl addRegion Dict.empty regions


type alias Index =
    Array Int


positionToOffset : Position -> Index -> Maybe Int
positionToOffset ( line, column ) idx =
    Array.get (line - 1) idx
        |> Maybe.map (\offSet -> offSet + column - 1)


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


view : Model -> Html msg
view model =
    let
        sourceCoverage : List (Html msg)
        sourceCoverage =
            model.moduleMap
                |> Dict.toList
                |> List.filterMap
                    (\( key, coverageInfo ) ->
                        Dict.get key model.inputs
                            |> Maybe.map (showCoverage key coverageInfo)
                    )

        coverageOverview : Html msg
        coverageOverview =
            overview model.moduleMap
    in
    container <| coverageOverview :: sourceCoverage


overview : CoverageMap -> Html msg
overview moduleMap =
    let
        ( rows, totals ) =
            moduleMap
                |> Dict.toList
                |> List.foldr
                    (\( moduleName, coverageInfo ) ( rows, totals ) ->
                        let
                            counts : Dict String ( Int, Int )
                            counts =
                                computeCounts coverageInfo

                            adjustedTotals : Dict String ( Int, Int )
                            adjustedTotals =
                                counts
                                    |> Dict.foldl
                                        (\coverageType cnts ->
                                            Dict.update coverageType
                                                (Maybe.map (sum2 cnts)
                                                    >> Maybe.withDefault cnts
                                                    >> Just
                                                )
                                        )
                                        totals

                            name =
                                Html.a
                                    [ Attr.href <| "#" ++ moduleToId moduleName ]
                                    [ Html.code [] [ Html.text moduleName ] ]
                        in
                        ( row (Just moduleName) name counts :: rows
                        , adjustedTotals
                        )
                    )
                    ( [], Dict.empty )
    in
    Html.table [ Attr.class "overview" ]
        [ Html.thead [] [ heading totals ]
        , Html.tbody [] rows
        , Html.tfoot [] [ row Nothing (Html.text "total") totals ]
        ]


heading : Dict String a -> Html msg
heading map =
    let
        makeHead : String -> Html msg
        makeHead =
            shortHumanCoverageType >> Html.th []
    in
    Html.tr []
        (Html.th [] [] :: (Dict.keys map |> List.map makeHead))


shortHumanCoverageType : String -> List (Html msg)
shortHumanCoverageType coverageType =
    case coverageType of
        "caseBranches" ->
            [ Html.code [] [ Html.text "case" ]
            , Html.text " branches"
            ]

        "declarations" ->
            [ Html.text "Declarations" ]

        "ifElseBranches" ->
            [ Html.code [] [ Html.text "if/else" ]
            , Html.text " branches"
            ]

        "lambdaBodies" ->
            [ Html.text "Lambdas" ]

        "letDeclarations" ->
            [ Html.code [] [ Html.text "let" ]
            , Html.text " declarations"
            ]

        _ ->
            [ Html.text "unknown" ]


annotationToString : Annotation -> String
annotationToString annotation =
    case annotation of
        Declaration _ _ ->
            "declarations"

        LetDeclaration _ ->
            "letDeclarations"

        LambdaBody _ ->
            "lambdaBodies"

        CaseBranch ->
            "caseBranches"

        IfElseBranch ->
            "ifElseBranches"


computeCounts : List AnnotationInfo -> Dict String ( Int, Int )
computeCounts =
    let
        addCount : AnnotationInfo -> Dict String ( Int, Int ) -> Dict String ( Int, Int )
        addCount ( _, ( annotation, count ) ) acc =
            Dict.update (annotationToString annotation)
                (\current ->
                    current
                        |> Maybe.withDefault ( 0, 0 )
                        |> sum2 ( min 1 count, 1 )
                        |> Just
                )
                acc
    in
    List.foldl addCount emptyCountDict


emptyCountDict : Dict String ( Int, Int )
emptyCountDict =
    [ "declarations", "letDeclarations", "lambdaBodies", "caseBranches", "ifElseBranches" ]
        |> List.foldl (\k -> Dict.insert k ( 0, 0 )) Dict.empty


sum2 : ( Int, Int ) -> ( Int, Int ) -> ( Int, Int )
sum2 ( a, b ) ( x, y ) =
    ( a + x
    , b + y
    )


row : Maybe String -> Html msg -> Dict String ( Int, Int ) -> Html msg
row moduleName name counts =
    Html.tr []
        (Html.th [] [ name ]
            :: (Dict.toList counts |> List.map (uncurry <| showCount moduleName))
        )


showCount : Maybe String -> String -> ( Int, Int ) -> Html msg
showCount moduleName coverageType ( used, total ) =
    if total == 0 then
        Html.td [ Attr.class "none" ]
            [ Html.text "n/a" ]
    else
        Html.td []
            [ Html.div [ Attr.class "wrapper" ]
                [ Html.div
                    [ Attr.class "info" ]
                    [ Html.text <|
                        toString used
                            ++ "/"
                            ++ toString total
                    ]
                , Html.progress
                    [ Attr.max <| toString total
                    , Attr.value <| toString used
                    ]
                    []
                ]
            ]


container : List (Html msg) -> Html msg
container content =
    Html.node "html"
        []
        [ Html.node "head"
            []
            [ Html.node "style"
                []
                [ Html.text styles ]
            , Html.node "meta" [ Attr.attribute "charset" "UTF-8" ] []
            ]
        , Html.body []
            (Html.h1 [ Attr.id "top" ] [ Html.text "Coverage report" ]
                :: content
            )
        ]


moduleToId : String -> String
moduleToId =
    String.toLower >> String.split "." >> String.join "-"


showCoverage : String -> List AnnotationInfo -> String -> Html msg
showCoverage moduleName coverageInfo source =
    let
        fileIndex =
            index source
    in
    Html.div [ Attr.class "file" ]
        [ Html.h2 [ Attr.id <| moduleToId moduleName ]
            [ Html.text "Module: "
            , Html.code [] [ Html.text moduleName ]
            , Html.a [ Attr.class "toTop", Attr.href "#top" ] [ Html.text "▲" ]
            ]
        , process (moduleToId moduleName) source fileIndex coverageInfo
        ]


process : String -> String -> Index -> List AnnotationInfo -> Html msg
process coverageId input index regions =
    let
        markerDict =
            toMarkerDict regions index
    in
    markup coverageId input markerDict


styles : String
styles =
    """
@import url(https://fonts.googleapis.com/css?family=Fira+Sans);

@font-face {
    font-family: 'Fira Code';
    src: local('Fira Code'), local('FiraCode'), url(https://cdn.rawgit.com/tonsky/FiraCode/master/distr/ttf/FiraCode-Regular.ttf);
}

code {
    font-family: "Fira Code", monospace;
    font-size: 0.9em;
}

body {
    margin: 0 30px;
    color: #333333;
    font-family: "Fira Sans", sans-serif;
}

.coverage {
    font-family: "Fira Code", monospace;
    font-size: 0.8em;
    white-space: pre;
    line-height: 1.5em;
    background-color: #fafafa;
    padding: 1em;
    border: 1px solid #D0D0D0;
    border-radius: 0.5em;
    display: flex;
    flex-direction: row-reverse;
}

.covered {
    background-color: #83dc83;
    color: #202020;
    box-shadow: 0 0 0 2px #83dc83;
    border-bottom: 1px solid #83dc83;
}

.uncovered {
    background-color: rgb(255, 30, 30);
    color: white;
    box-shadow: 0 0 0 2px rgb(255, 30, 30);
    border-bottom-width: 1px;
    border-bottom-style: dashed;
}

.covered > .covered {
    box-shadow: none;
    background-color: initial;
    border-bottom: none;
}

.uncovered > .uncovered {
    box-shadow: none;
    border-bottom: none;
    background-color: initial;
}

.uncovered .covered {
    background-color: transparent;
    color: inherit;
    box-shadow: none;
}

.lines {
    text-align: right;
    margin-right: 10px;
    border-right: 1px solid #B0B0B0;
    padding-right: 10px;
    margin-top: -1em;
    padding-top: 1em;
    padding-bottom: 1em;
    margin-bottom: -1em;
    color: #B0B0B0;
}

.lines a {
    color: #B0B0B0;
    text-decoration: none;
    transition: all 0.3s ease;
}

.lines a:hover {
    color: #303030;
}

.source {
    flex: 1;
    overflow: scroll;
}

.overview {
    width: 100%;
    padding: 0 30px;
    border: 1px solid #d0d0d0;
    border-radius: 0.5em;
    table-layout: fixed;
}

.overview thead {
    text-align: center;
}

.overview thead tr,
.overview tfoot tr {
    height: 3em;
}

.overview tbody th,
.overview tfoot th {
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    direction: rtl;
}

.overview .wrapper {
    display: flex;
}

.overview .none {
    text-align: center;
    color: #606060;
    font-size: 0.8em;
}

.overview progress {
    flex: 1.5;
    display: none;
}

@media only screen  and (min-width : 960px) {
    .overview progress {
        display: block;
    }
}

.overview .info {
    flex: 1;
    text-align: right;
    margin: 0 1em;
}

.toTop {
    float: right;
    text-decoration: none;
}

body {
    background-color: #fdfdfd;
}
"""
