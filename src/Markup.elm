module Markup exposing (file)

import Coverage
import Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Overview
import Source
import Util


file : String -> List Coverage.AnnotationInfo -> String -> String -> Html msg
file moduleName coverageInfo source presentablePath =
    let
        rendered =
            Source.render source coverageInfo
                |> render
                |> foldRendered (moduleToId moduleName)
    in
    Html.div [ Attr.class "file" ]
        [ Html.h2 [ Attr.id <| moduleToId moduleName ]
            [ Html.text "Module: "
            , Html.code [] [ Html.text presentablePath ]
            , Html.a [ Attr.class "toTop", Attr.href "#top" ] [ Html.text "▲" ]
            ]
        , listDeclarations (moduleToId moduleName) coverageInfo
        , Html.p [ Attr.class "legend" ]
            [ Html.text "Declarations sorted by cyclomatic complexity" ]
        , Html.div [ Attr.class "coverage" ]
            [ Html.div [ Attr.class "lines" ] rendered.lines
            , Html.div [ Attr.class "source" ] rendered.source
            ]
        ]


moduleToId : String -> String
moduleToId =
    String.toLower >> String.split "." >> String.join "-"


listDeclarations : String -> List Coverage.AnnotationInfo -> Html msg
listDeclarations moduleId annotations =
    let
        ( rows, totals, complexities ) =
            topLevelDeclarationInfo [] [] annotations
                |> List.sortBy .complexity
                |> List.foldl (foldDeclarations moduleId) ( [], Dict.empty, [] )
    in
    Html.table [ Attr.class "overview" ]
        [ Html.thead [] [ Overview.heading totals ]
        , Html.tbody [] rows
        , Html.tfoot []
            [ Overview.row
                (Html.text <|
                    "("
                        ++ String.fromInt (Coverage.totalComplexity annotations)
                        ++ ") total"
                )
                totals
            ]
        ]


type alias TopLevelDecl =
    { name : Coverage.Name
    , complexity : Coverage.Complexity
    , startLine : Int
    , children : List Coverage.AnnotationInfo
    }


topLevelDeclarationInfo :
    List TopLevelDecl
    -> List Coverage.AnnotationInfo
    -> List Coverage.AnnotationInfo
    -> List TopLevelDecl
topLevelDeclarationInfo acc children annotations =
    case annotations of
        [] ->
            List.reverse acc

        ( { from }, Coverage.Declaration name complexity, _ ) :: rest ->
            let
                decl : TopLevelDecl
                decl =
                    { name = name
                    , complexity = complexity
                    , startLine = Coverage.line from
                    , children = children
                    }
            in
            topLevelDeclarationInfo (decl :: acc) [] rest

        c :: rest ->
            topLevelDeclarationInfo acc (c :: children) rest


foldDeclarations :
    String
    -> TopLevelDecl
    -> ( List (Html msg), Dict String ( Int, Int ), List Coverage.Complexity )
    -> ( List (Html msg), Dict String ( Int, Int ), List Coverage.Complexity )
foldDeclarations moduleId declaration ( rows, totals, totalComplexity ) =
    let
        counts : Dict String ( Int, Int )
        counts =
            Overview.computeCounts emptyCountDict declaration.children

        adjustTotals :
            String
            -> ( Int, Int )
            -> Dict String ( Int, Int )
            -> Dict String ( Int, Int )
        adjustTotals coverageType innerCounts =
            Dict.update coverageType
                (Maybe.map (Util.mapBoth (+) innerCounts)
                    >> Maybe.withDefault innerCounts
                    >> Just
                )

        adjustedTotals : Dict String ( Int, Int )
        adjustedTotals =
            counts
                |> Dict.foldl adjustTotals totals

        declarationId : String
        declarationId =
            "#" ++ moduleId ++ "_" ++ String.fromInt declaration.startLine

        formattedName =
            Html.a
                [ Attr.href declarationId ]
                [ Html.text <| "(" ++ String.fromInt declaration.complexity ++ ")\u{00A0}"
                , Html.code [] [ Html.text declaration.name ]
                ]
    in
    ( Overview.row formattedName counts :: rows
    , adjustedTotals
    , declaration.complexity :: totalComplexity
    )


emptyCountDict : Dict String ( Int, Int )
emptyCountDict =
    [ Coverage.letDeclaration
    , Coverage.lambdaBody
    , Coverage.caseBranch
    , Coverage.ifElseBranch
    ]
        |> List.foldl (\k -> Dict.insert k ( 0, 0 )) Dict.empty


type alias Rendered msg =
    { lines : List (Html msg), source : List (Html msg) }


foldRendered : String -> List (Line msg) -> Rendered msg
foldRendered coverageId xs =
    xs
        |> Util.indexedFoldr
            (\idx (Line info content) ( lines, sources ) ->
                ( showLine coverageId (idx + 1) info :: lines
                , content :: sources
                )
            )
            ( [], [] )
        |> Tuple.mapSecond (Util.intercalate linebreak)
        |> (\( a, b ) -> Rendered a b)


showLine : String -> Int -> List Source.MarkerInfo -> Html msg
showLine coverageId lineNr info =
    let
        lineId : String
        lineId =
            coverageId ++ "_" ++ String.fromInt lineNr
    in
    Html.a [ Attr.href <| "#" ++ lineId, Attr.id lineId, Attr.class "line" ]
        [ Html.div []
            (Util.rFilterMap
                (.annotation >> Coverage.complexity >> Maybe.map indicator)
                info
                ++ [ Html.text <| String.fromInt lineNr ]
            )
        ]


indicator : Coverage.Complexity -> Html msg
indicator complexity =
    let
        intensity : Float
        intensity =
            (toFloat (clamp 0 50 complexity) / 50)
                |> sqrt
    in
    Html.span
        [ Attr.class "indicator"
        , Attr.style "opacity" (String.fromFloat intensity)
        , Attr.title <| "Cyclomatic complexity: " ++ String.fromInt complexity
        ]
        [ Html.text " " ]


linebreak : Html msg
linebreak =
    Html.br [] []


render : List Source.Content -> List (Line msg)
render content =
    let
        initialAcc : ToHtmlAcc msg
        initialAcc =
            { lineSoFar = Line [] []
            , stack = []
            , lines = []
            }

        finalize : ToHtmlAcc msg -> List (Line msg)
        finalize { lineSoFar, lines } =
            lineSoFar :: lines
    in
    List.foldl contentToHtml initialAcc content
        |> finalize


type alias ToHtmlAcc msg =
    { lineSoFar : Line msg
    , stack : List Source.MarkerInfo
    , lines : List (Line msg)
    }


type Line msg
    = Line (List Source.MarkerInfo) (List (Html msg))


contentToHtml : Source.Content -> ToHtmlAcc msg -> ToHtmlAcc msg
contentToHtml content acc =
    case content of
        Source.Plain parts ->
            partsToHtml parts acc

        Source.Content marker parts ->
            List.foldl contentToHtml (pushStack marker acc) parts
                |> popStack


pushStack : Source.MarkerInfo -> ToHtmlAcc msg -> ToHtmlAcc msg
pushStack marker acc =
    { acc
        | stack = marker :: acc.stack
        , lineSoFar = addMarkerToLine marker acc.lineSoFar
    }


popStack : ToHtmlAcc msg -> ToHtmlAcc msg
popStack acc =
    case acc.stack of
        [] ->
            acc

        _ :: rest ->
            { acc | stack = rest }


partsToHtml : List Source.Part -> ToHtmlAcc msg -> ToHtmlAcc msg
partsToHtml parts acc =
    case parts of
        [] ->
            acc

        -- Empty part, just skip it
        (Source.Part "") :: rest ->
            partsToHtml rest acc

        (Source.Part s) :: rest ->
            tagAndAdd s acc
                |> partsToHtml rest

        Source.LineBreak :: rest ->
            newLine acc
                |> partsToHtml rest

        -- Empty part, useless markup to include, so skip it!
        (Source.Indented 0 "") :: rest ->
            partsToHtml rest acc

        (Source.Indented indent content) :: rest ->
            acc
                |> tagAndAdd content
                |> add (whitespace indent)
                |> partsToHtml rest


add : Html msg -> ToHtmlAcc msg -> ToHtmlAcc msg
add content acc =
    { acc | lineSoFar = addToLine content acc.lineSoFar }


addMarkerToLine : Source.MarkerInfo -> Line msg -> Line msg
addMarkerToLine marker (Line info content) =
    Line (marker :: info) content


tagAndAdd : String -> ToHtmlAcc msg -> ToHtmlAcc msg
tagAndAdd content acc =
    add (tagWith acc.stack content identity) acc


addToLine : Html msg -> Line msg -> Line msg
addToLine x (Line info xs) =
    Line info (x :: xs)


{-| We need to use this rather than inlining `wrapper << tagger` to prevent
a nasty variable shadowing bug.
-}
wrapTagger : Source.MarkerInfo -> (Html msg -> Html msg) -> Html msg -> Html msg
wrapTagger { count, annotation } tagger content =
    wrapper count annotation <| tagger content


tagWith : List Source.MarkerInfo -> String -> (Html msg -> Html msg) -> Html msg
tagWith markers s tagger =
    case markers of
        [] ->
            tagger <| Html.text s

        marker :: rest ->
            tagWith rest s (wrapTagger marker tagger)


newLine : ToHtmlAcc msg -> ToHtmlAcc msg
newLine acc =
    { acc | lineSoFar = Line acc.stack [], lines = acc.lineSoFar :: acc.lines }


whitespace : Int -> Html msg
whitespace indent =
    Html.text <| String.repeat indent " "


wrapper : Int -> Coverage.Annotation -> Html msg -> Html msg
wrapper count annotation content =
    let
        withComplexity : Coverage.Complexity -> String
        withComplexity complexity =
            "Evaluated "
                ++ String.fromInt count
                ++ " times, complexity "
                ++ String.fromInt complexity
                ++ "."

        justCount : String
        justCount =
            "Evaluated " ++ String.fromInt count ++ "times."

        title : String
        title =
            Coverage.complexity annotation
                |> Maybe.map withComplexity
                |> Maybe.withDefault justCount
    in
    Html.span
        [ Attr.class <| toClass count
        , Attr.title title
        ]
        [ content ]


toClass : Int -> String
toClass cnt =
    if cnt == 0 then
        "cover uncovered"

    else
        "cover covered"
