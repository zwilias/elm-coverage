module Markup exposing (file)

import Coverage
import Dict.LLRB as Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Overview
import Util


file : String -> List Coverage.AnnotationInfo -> String -> Html msg
file moduleName coverageInfo source =
    let
        fileIndex =
            Coverage.index source
    in
    Html.div [ Attr.class "file" ]
        [ Html.h2 [ Attr.id <| moduleToId moduleName ]
            [ Html.text "Module: "
            , Html.code [] [ Html.text moduleName ]
            , Html.a [ Attr.class "toTop", Attr.href "#top" ] [ Html.text "▲" ]
            ]
        , listDeclarations (moduleToId moduleName) coverageInfo
        , Html.p [ Attr.class "legend" ]
            [ Html.text "Declarations sorted by cyclomatic complexity, and an overview of their internal coverage." ]
        , process (moduleToId moduleName) source fileIndex coverageInfo
        ]


process : String -> String -> Coverage.Index -> List Coverage.AnnotationInfo -> Html msg
process coverageId input index regions =
    let
        markerDict =
            toMarkerDict regions index
    in
    markup coverageId input markerDict


moduleToId : String -> String
moduleToId =
    String.toLower >> String.split "." >> String.join "-"


listDeclarations : String -> List Coverage.AnnotationInfo -> Html msg
listDeclarations moduleId annotations =
    let
        declarations =
            topLevelDeclarationInfo [] [] annotations
                |> List.sortBy .complexity

        ( rows, totals, complexities ) =
            List.foldl (foldDeclarations moduleId) ( [], Dict.empty, [] ) declarations

        totalComplexity =
            List.sum complexities - List.length complexities + 1
    in
    Html.table [ Attr.class "overview" ]
        [ Html.thead [] [ Overview.heading totals ]
        , Html.tbody [] rows
        , Html.tfoot [] [ Overview.row (Html.text <| "(" ++ toString totalComplexity ++ ") total") totals ]
        ]


type alias TopLevelDecl =
    { name : Coverage.Name
    , complexity : Coverage.Complexity
    , startLine : Int
    , children : List Coverage.AnnotationInfo
    }


topLevelDeclarationInfo : List TopLevelDecl -> List Coverage.AnnotationInfo -> List Coverage.AnnotationInfo -> List TopLevelDecl
topLevelDeclarationInfo acc children annotations =
    case annotations of
        [] ->
            List.reverse acc

        ( { from, to }, ( Coverage.Declaration name complexity, _ ) ) :: rest ->
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
foldDeclarations moduleId { name, complexity, children, startLine } ( rows, totals, totalComplexity ) =
    let
        counts : Dict String ( Int, Int )
        counts =
            Overview.computeCounts emptyCountDict children

        adjustTotals : String -> ( Int, Int ) -> Dict String ( Int, Int ) -> Dict String ( Int, Int )
        adjustTotals coverageType counts =
            Dict.update coverageType
                (Maybe.map (Util.mapBoth (+) counts)
                    >> Maybe.withDefault counts
                    >> Just
                )

        adjustedTotals : Dict String ( Int, Int )
        adjustedTotals =
            counts
                |> Dict.foldl adjustTotals totals

        formattedName =
            Html.a
                [ Attr.href <| "#" ++ moduleId ++ "_" ++ toString startLine ]
                [ Html.text <| "(" ++ toString complexity ++ ") "
                , Html.code [] [ Html.text name ]
                ]
    in
    ( Overview.row formattedName counts :: rows
    , adjustedTotals
    , complexity :: totalComplexity
    )


emptyCountDict : Dict String ( Int, Int )
emptyCountDict =
    [ Coverage.letDeclaration, Coverage.lambdaBody, Coverage.caseBranch, Coverage.ifElseBranch ]
        |> List.foldl (\k -> Dict.insert k ( 0, 0 )) Dict.empty


addToListDict : a -> Maybe (List a) -> Maybe (List a)
addToListDict a m =
    case m of
        Nothing ->
            Just [ a ]

        Just xs ->
            Just <| a :: xs


toMarkerDict : List Coverage.AnnotationInfo -> Coverage.Index -> Dict Int (List Marker)
toMarkerDict regions offsets =
    let
        addRegion : Coverage.AnnotationInfo -> Dict Int (List Marker) -> Dict Int (List Marker)
        addRegion ( region, ( annotation, count ) ) acc =
            Maybe.map2
                (\from to ->
                    acc
                        |> Dict.update from (addToListDict (Begin count annotation))
                        |> Dict.update to (addToListDict End)
                )
                (Coverage.positionToOffset region.from offsets)
                (Coverage.positionToOffset region.to offsets)
                |> Maybe.withDefault acc
    in
    List.foldl addRegion Dict.empty regions


type Marker
    = Begin Int Coverage.Annotation
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
    , stack : List ( Int, Coverage.Annotation, List (Content msg) )
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
            [ Html.text <| String.repeat indent " " ]


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


wrapper : Int -> Coverage.Annotation -> List (Html msg) -> Html msg
wrapper cnt annotation =
    let
        content =
            case annotation of
                Coverage.Declaration _ c ->
                    "Evaluated " ++ toString cnt ++ " times, complexity " ++ toString c ++ "."

                Coverage.LetDeclaration c ->
                    "Evaluated " ++ toString cnt ++ " times, complexity " ++ toString c ++ "."

                Coverage.LambdaBody c ->
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
