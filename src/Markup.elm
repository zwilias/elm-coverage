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
    toMarkerDict regions index
        |> markup coverageId input


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

        totalComplexity : Coverage.Complexity
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
    List.foldl (addRegion offsets) Dict.empty regions


addRegion :
    Coverage.Index
    -> Coverage.AnnotationInfo
    -> Dict Int (List Marker)
    -> Dict Int (List Marker)
addRegion offsets ( location, annotation, count ) acc =
    Maybe.map2
        (\from to ->
            acc
                |> Dict.update from
                    (addToListDict (Begin <| MarkerInfo count annotation))
                |> Dict.update to (addToListDict End)
        )
        (Coverage.positionToOffset location.from offsets)
        (Coverage.positionToOffset location.to offsets)
        |> Maybe.withDefault acc


type alias MarkerInfo =
    { count : Int
    , annotation : Coverage.Annotation
    }


type Marker
    = Begin MarkerInfo
    | End


markup : String -> String -> Dict Int (List Marker) -> Html msg
markup coverageId input markers =
    let
        content : List Content
        content =
            .children <| markupHelper input 0 (Dict.toList markers) { children = [], stack = [] }

        ( lines, rendered ) =
            toHtml content
                |> foldRendered coverageId
    in
    Html.div [ Attr.class "coverage" ]
        [ Html.div [ Attr.class "lines" ] lines
        , Html.div [ Attr.class "source" ] rendered
        ]


foldRendered : String -> List (Line msg) -> ( List (Html msg), List (Html msg) )
foldRendered coverageId xs =
    xs
        |> indexedFoldr
            (\idx (Line info content) ( lines, sources ) ->
                ( showLine coverageId (idx + 1) info :: lines
                , content :: sources
                )
            )
            ( [], [] )
        |> Tuple.mapSecond (intercalate linebreak)


indexedFoldr : (Int -> a -> b -> b) -> b -> List a -> b
indexedFoldr op acc xs =
    List.foldr
        (\x ( idx, a ) ->
            ( idx - 1
            , op idx x a
            )
        )
        ( List.length xs - 1, acc )
        xs
        |> Tuple.second


intercalate : a -> List (List a) -> List a
intercalate sep =
    List.intersperse [ sep ] >> List.concat


showLine : String -> Int -> List MarkerInfo -> Html msg
showLine coverageId lineNr info =
    let
        lineId : String
        lineId =
            coverageId ++ "_" ++ toString lineNr
    in
    Html.a [ Attr.href <| "#" ++ lineId, Attr.id lineId, Attr.class "line" ]
        [ Html.div []
            (rFilterMap indicator info
                ++ [ Html.text <| toString <| lineNr ]
            )
        ]


rFilterMap : (a -> Maybe b) -> List a -> List b
rFilterMap toMaybe =
    List.foldl
        (\x acc ->
            case toMaybe x of
                Just ok ->
                    ok :: acc

                Nothing ->
                    acc
        )
        []


indicator : MarkerInfo -> Maybe (Html msg)
indicator { annotation } =
    let
        intensity : Coverage.Complexity -> Float
        intensity complexity =
            toFloat (clamp 0 50 complexity)
                / 50
                |> sqrt
    in
    Coverage.complexity annotation
        |> Maybe.map
            (\complexity ->
                Html.span
                    [ Attr.class "indicator"
                    , Attr.style
                        [ ( "opacity"
                          , toString <| intensity complexity
                          )
                        ]
                    , Attr.title <| "Cyclomatic complexity: " ++ toString complexity
                    ]
                    [ Html.text " " ]
            )


linebreak : Html msg
linebreak =
    Html.br [] []


type alias Acc =
    { children : List Content
    , stack : List ( MarkerInfo, List Content )
    }


type Part
    = Part String
    | LineBreak
    | Indented Int String


type Content
    = Plain (List Part)
    | Content MarkerInfo (List Content)


toHtml : List Content -> List (Line msg)
toHtml content =
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
    , stack : List MarkerInfo
    , lines : List (Line msg)
    }


type Line msg
    = Line (List MarkerInfo) (List (Html msg))


contentToHtml : Content -> ToHtmlAcc msg -> ToHtmlAcc msg
contentToHtml content acc =
    case content of
        Plain parts ->
            partsToHtml parts acc

        Content marker parts ->
            List.foldl contentToHtml (pushStack marker acc) parts
                |> popStack


pushStack : MarkerInfo -> ToHtmlAcc msg -> ToHtmlAcc msg
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


partsToHtml : List Part -> ToHtmlAcc msg -> ToHtmlAcc msg
partsToHtml parts acc =
    case parts of
        [] ->
            acc

        -- Empty part, just skip it
        (Part "") :: rest ->
            partsToHtml rest acc

        (Part s) :: rest ->
            tagAndAdd s acc
                |> partsToHtml rest

        LineBreak :: rest ->
            newLine acc
                |> partsToHtml rest

        -- Empty part, useless markup to include, so skip it!
        (Indented 0 "") :: rest ->
            partsToHtml rest acc

        (Indented indent content) :: rest ->
            acc
                |> tagAndAdd content
                |> add (whitespace indent)
                |> partsToHtml rest


add : Html msg -> ToHtmlAcc msg -> ToHtmlAcc msg
add content acc =
    { acc | lineSoFar = addToLine content acc.lineSoFar }


addMarkerToLine : MarkerInfo -> Line msg -> Line msg
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
wrapTagger : MarkerInfo -> (Html msg -> Html msg) -> Html msg -> Html msg
wrapTagger { count, annotation } tagger content =
    wrapper count annotation <| tagger content


tagWith : List MarkerInfo -> String -> (Html msg -> Html msg) -> Html msg
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


stringParts : String -> Content
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
                Indented spaces ""
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


markupHelper : String -> Int -> List ( Int, List Marker ) -> Acc -> Acc
markupHelper original offset markers acc =
    let
        rest : String -> Content
        rest input =
            input
                |> String.slice offset (String.length input)
                |> stringParts

        readUntil : Int -> String -> Content
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


consumeMarkers : List Marker -> Acc -> Acc
consumeMarkers markers acc =
    List.foldl consumeMarker acc markers


consumeMarker : Marker -> Acc -> Acc
consumeMarker marker acc =
    case marker of
        Begin markerInfo ->
            { children = []
            , stack = ( markerInfo, acc.children ) :: acc.stack
            }

        End ->
            case acc.stack of
                [] ->
                    acc

                ( markerInfo, x ) :: xs ->
                    let
                        content : Content
                        content =
                            Content markerInfo acc.children
                    in
                    { children = content :: x
                    , stack = xs
                    }


wrapper : Int -> Coverage.Annotation -> Html msg -> Html msg
wrapper cnt annotation content =
    let
        title =
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
        , Attr.title title
        ]
        [ content ]


toClass : Int -> String
toClass cnt =
    if cnt == 0 then
        "cover uncovered"
    else
        "cover covered"
