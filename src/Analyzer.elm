port module Analyzer exposing (..)

import Dict.LLRB as Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Json.Decode as Decode exposing (Decoder)
import Platform


main : Program Flags Model msg
main =
    Platform.programWithFlags
        { init = init
        , update = \_ m -> m ! []
        , subscriptions = always Sub.none
        }


type alias Model =
    { inputs : Dict String String
    , moduleMap : ModuleMap
    }


emptyModel : Model
emptyModel =
    { inputs = Dict.empty, moduleMap = Dict.empty }


type alias Flags =
    { coverage : Decode.Value
    , files : List ( String, String )
    }


flagsToModel : Flags -> Model
flagsToModel flags =
    let
        moduleMap =
            Decode.decodeValue regionsDecoder flags.coverage
                |> Result.withDefault Dict.empty
    in
        { moduleMap = moduleMap
        , inputs = Dict.fromList flags.files
        }


init : Flags -> ( Model, Cmd msg )
init flags =
    let
        model : Model
        model =
            flagsToModel flags
    in
        ( model
        , dump model
        )


port coverage : String -> Cmd msg


dump : Model -> Cmd msg
dump =
    view >> Html.toString 0 >> coverage


regionDecoder : Decoder Region
regionDecoder =
    let
        position : Decoder ( Int, Int )
        position =
            Decode.map2 (,)
                (Decode.field "line" Decode.int)
                (Decode.field "column" Decode.int)
    in
        Decode.map3 Region
            (Decode.at [ "location", "from" ] position)
            (Decode.at [ "location", "to" ] position)
            (Decode.field "count" Decode.int)


type alias CoverageMap =
    Dict String (List Region)


type alias ModuleMap =
    Dict String CoverageMap


dictDec : Decoder a -> Decoder (Dict String a)
dictDec =
    Decode.keyValuePairs >> Decode.map Dict.fromList


regionsDecoder : Decoder ModuleMap
regionsDecoder =
    dictDec <| dictDec <| Decode.list regionDecoder


type alias Position =
    ( Int, Int )


type Marker
    = Begin Int
    | End


type alias Context =
    Int


type alias Region =
    { from : Position, to : Position, count : Int }


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
                        coverageId ++ "_" ++ toString idx
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
    , stack : List ( Int, List (Content msg) )
    }


type Part
    = Part String
    | LineBreak
    | Indent Int
    | Indented Int String


wrap : (List (Html msg) -> Html msg) -> List (Content msg) -> Content msg
wrap wrapper content =
    Content (List.singleton >> wrapper) content


type Content msg
    = Plain (List Part)
    | Content (Html msg -> Html msg) (List (Content msg))


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
            [ whitespace indent ]

        Indented indent content ->
            [ tagger <| Html.text content
            , whitespace indent
            ]


whitespace : Int -> Html msg
whitespace indent =
    Html.span
        [ Attr.class "whitespace" ]
        [ Html.text <| String.repeat indent " " ]


stringParts : String -> Content msg
stringParts string =
    case String.lines string of
        [] ->
            Debug.crash "nope"

        head :: rest ->
            (Part head :: List.map findIndent rest)
                |> List.intersperse LineBreak
                |> List.reverse
                |> Plain


findIndent : String -> Part
findIndent string =
    String.foldl
        (\c ( spaces, continue ) ->
            if continue && c == ' ' then
                ( spaces + 1, True )
            else
                ( spaces, False )
        )
        ( 0, True )
        string
        |> (\( spaces, _ ) ->
                let
                    rest =
                        String.slice spaces (String.length string) string
                in
                    if String.isEmpty rest then
                        Indent spaces
                    else if spaces == 0 then
                        Part string
                    else
                        Indented spaces (String.slice spaces (String.length string) string)
           )


markupHelper : String -> Int -> List ( Int, List Marker ) -> Acc msg -> Acc msg
markupHelper original offset markers acc =
    case markers of
        [] ->
            let
                rest : Content msg
                rest =
                    original
                        |> String.slice offset (String.length original)
                        |> stringParts
            in
                { acc | children = rest :: acc.children }

        ( pos, markerList ) :: rest ->
            let
                readIn : Content msg
                readIn =
                    original
                        |> String.slice offset pos
                        |> stringParts
            in
                consumeMarkers markerList { acc | children = readIn :: acc.children }
                    |> markupHelper original pos rest


consumeMarkers : List Marker -> Acc msg -> Acc msg
consumeMarkers markers acc =
    List.foldl consumeMarker acc markers


consumeMarker : Marker -> Acc msg -> Acc msg
consumeMarker marker acc =
    case marker of
        Begin cnt ->
            { children = []
            , stack = ( cnt, acc.children ) :: acc.stack
            }

        End ->
            case acc.stack of
                [] ->
                    Debug.crash "unexpected end"

                ( cnt, x ) :: xs ->
                    let
                        content : Content msg
                        content =
                            wrap (wrapper cnt) acc.children
                    in
                        { children = content :: x
                        , stack = xs
                        }


wrapper : Int -> List (Html msg) -> Html msg
wrapper cnt =
    Html.span
        [ Attr.class <| toClass cnt
        , Attr.title <| "Evaluated " ++ toString cnt ++ " times."
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


regionOrder : Region -> Region -> Order
regionOrder left right =
    if left.from == right.from && left.to == right.to then
        EQ
    else if left.from < right.from then
        LT
    else
        compare left.to right.to


toMarkerDict : List Region -> Dict Position Int -> Dict Int (List Marker)
toMarkerDict regions offsets =
    List.foldl
        (\region acc ->
            Maybe.map2
                (\from to ->
                    acc
                        |> Dict.update from (addToListDict (Begin region.count))
                        |> Dict.update to (addToListDict End)
                )
                (positionToOffset region.from offsets)
                (positionToOffset region.to offsets)
                |> Maybe.withDefault acc
        )
        Dict.empty
        regions


positionToOffset : Position -> Dict Position Int -> Maybe Int
positionToOffset =
    Dict.get


index : String -> Dict Position Int
index input =
    input
        |> String.lines
        |> List.foldl indexLine ( 0, 1, Dict.empty )
        |> (\( _, _, acc ) -> acc)


indexLine : String -> ( Int, Int, Dict Position Int ) -> ( Int, Int, Dict Position Int )
indexLine string ( offset, line, acc ) =
    string
        |> String.foldl (indexChar line) ( offset, 1, acc )
        |> (\( offset, col, acc ) ->
                ( -- skip newline
                  offset + 1
                  -- go to next line
                , line + 1
                , Dict.insert ( line, col ) offset acc
                )
           )


indexChar : Int -> a -> ( Int, Int, Dict Position Int ) -> ( Int, Int, Dict Position Int )
indexChar line _ ( offset, column, acc ) =
    ( offset + 1
    , column + 1
    , Dict.insert ( line, column ) offset acc
    )


view : Model -> Html msg
view model =
    let
        sourceCoverage : List (Html msg)
        sourceCoverage =
            model.moduleMap
                |> Dict.toList
                |> List.filterMap
                    (\( key, coverageTypes ) ->
                        Dict.get key model.inputs
                            |> Maybe.map (showCoverage key coverageTypes)
                    )

        coverageOverview : Html msg
        coverageOverview =
            overview model.moduleMap
    in
        container <| coverageOverview :: sourceCoverage


overview : ModuleMap -> Html msg
overview moduleMap =
    let
        ( rows, totals ) =
            moduleMap
                |> Dict.toList
                |> List.foldr
                    (\( key, coverageMap ) ( rows, totals ) ->
                        let
                            counts : Dict String ( Int, Int )
                            counts =
                                computeCounts coverageMap

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
                                    [ Attr.href <| "#" ++ moduleToId key ]
                                    [ Html.code [] [ Html.text key ] ]
                        in
                            ( row (Just key) name counts :: rows
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


computeCounts : CoverageMap -> Dict String ( Int, Int )
computeCounts =
    Dict.map
        (always <|
            List.foldl
                (\region ( used, total ) ->
                    ( used + min 1 region.count
                    , total + 1
                    )
                )
                ( 0, 0 )
        )


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
        let
            link : Html msg -> Html msg
            link content =
                case moduleName of
                    Just name ->
                        Html.a
                            [ Attr.href <| "#" ++ moduleCoverageId name coverageType ]
                            [ content ]

                    Nothing ->
                        content
        in
            Html.td []
                [ Html.div [ Attr.class "wrapper" ]
                    [ Html.div
                        [ Attr.class "info" ]
                        [ link <|
                            Html.text <|
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
    let
        containerContent =
            Html.div [ Attr.class "container" ]
                (Html.node "style"
                    []
                    [ Html.text styles ]
                    :: Html.h1 [] [ Html.text "Coverage report" ]
                    :: content
                )
    in
        -- Html.textarea [ Attr.value <| Html.toString 0 containerContent ] []
        containerContent


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

.container {
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

body {
    background-color: #fdfdfd;
}
"""


shortHumanCoverageType : String -> List (Html msg)
shortHumanCoverageType coverageType =
    case coverageType of
        "expressions" ->
            [ Html.text "Expressions" ]

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


humanCoverageType : String -> Html msg
humanCoverageType coverageType =
    case coverageType of
        "expressions" ->
            Html.text "Expressions evaluated"

        "caseBranches" ->
            Html.span []
                [ Html.code [] [ Html.text "case..of" ]
                , Html.text " branches entered"
                ]

        "declarations" ->
            Html.text "Top-level declarations evaluated"

        "ifElseBranches" ->
            Html.span []
                [ Html.code [] [ Html.text "if/else" ]
                , Html.text " branches entered"
                ]

        "lambdaBodies" ->
            Html.text "Anonymous functions executed"

        "letDeclarations" ->
            Html.span []
                [ Html.code [] [ Html.text "let..in" ]
                , Html.text " declarations evaluated"
                ]

        _ ->
            Html.text "unknown"


moduleToId : String -> String
moduleToId =
    String.toLower >> String.split "." >> String.join "-"


moduleCoverageId : String -> String -> String
moduleCoverageId moduleName coverageType =
    moduleToId moduleName
        ++ "_"
        ++ String.toLower coverageType


showCoverage : String -> CoverageMap -> String -> Html msg
showCoverage moduleName coverageMap file =
    let
        fileIndex =
            index file
    in
        Html.div [ Attr.class "file" ]
            (Html.h2 [ Attr.id <| moduleToId moduleName ]
                [ Html.text "Module: "
                , Html.code [] [ Html.text moduleName ]
                ]
                :: (Dict.toList coverageMap
                        |> List.filterMap
                            (\( coverageType, regions ) ->
                                let
                                    processedResult : Maybe (Html msg)
                                    processedResult =
                                        process coverageId file fileIndex regions

                                    coverageId : String
                                    coverageId =
                                        moduleCoverageId
                                            moduleName
                                            coverageType
                                in
                                    case processedResult of
                                        Just processed ->
                                            Just <|
                                                Html.div []
                                                    [ Html.h3
                                                        [ Attr.id coverageId ]
                                                        [ humanCoverageType
                                                            coverageType
                                                        ]
                                                    , processed
                                                    ]

                                        Nothing ->
                                            Nothing
                            )
                   )
            )


process : String -> String -> Dict Position Int -> List Region -> Maybe (Html msg)
process coverageId input index regions =
    case regions of
        [] ->
            Nothing

        _ ->
            let
                markerDict =
                    toMarkerDict regions index
            in
                Just <| markup coverageId input markerDict
