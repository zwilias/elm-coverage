module Source exposing (Content(..), Marker(..), MarkerInfo, Part(..), render)

import Coverage
import Dict exposing (Dict)


type Marker
    = Begin MarkerInfo
    | End


type alias MarkerInfo =
    { count : Int
    , annotation : Coverage.Annotation
    }


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


render : String -> List Coverage.AnnotationInfo -> List Content
render source regions =
    markupHelper source 0 (toMarkerDict regions source) { children = [], stack = [] }
        |> .children


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


toMarkerDict : List Coverage.AnnotationInfo -> String -> List ( Int, List Marker )
toMarkerDict regions source =
    let
        offsets =
            Coverage.index source
    in
    List.foldl (addRegion offsets) Dict.empty regions
        |> Dict.toList


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


addToListDict : a -> Maybe (List a) -> Maybe (List a)
addToListDict a m =
    case m of
        Nothing ->
            Just [ a ]

        Just xs ->
            Just <| a :: xs
