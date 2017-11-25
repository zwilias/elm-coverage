module Analyze exposing (..)

import Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr


type alias Position =
    ( Int, Int )


type Marker
    = Begin Int
    | End


type alias Acc msg =
    { children : List (Html msg)
    , stack : List ( Int, List (Html msg) )
    }


type alias Context =
    Int


type alias Region =
    { from : Position, to : Position, count : Int }


markup : String -> Dict Int (List Marker) -> Html msg
markup input markers =
    markupHelper input 0 (Dict.toList markers) { children = [], stack = [] }
        |> \{ children } ->
            Html.div [ Attr.class "coverage" ]
                [ Html.div [ Attr.class "source" ] (List.reverse children)
                , Html.div [ Attr.class "lines" ] (lines input)
                ]


lines : String -> List (Html msg)
lines input =
    input
        |> String.lines
        |> List.indexedMap
            (\idx _ ->
                Html.div
                    [ Attr.class "line" ]
                    [ Html.text <| toString <| idx + 1 ]
            )


stringParts : String -> List (Html msg)
stringParts string =
    case String.lines string of
        [] ->
            []

        head :: rest ->
            [ Html.text head ]
                :: List.map chompSpaces rest
                |> List.intersperse ([ Html.br [] [] ])
                |> List.concat
                |> List.reverse


chompSpaces : String -> List (Html msg)
chompSpaces string =
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
                if spaces == 0 then
                    [ Html.text string ]
                else
                    [ Html.span
                        [ Attr.class "whitespace" ]
                        [ Html.text <| String.repeat spaces " " ]
                    , Html.text <| String.slice spaces (String.length string) string
                    ]
           )


markupHelper : String -> Int -> List ( Int, List Marker ) -> Acc msg -> Acc msg
markupHelper original offset markers acc =
    case markers of
        [] ->
            let
                rest : List (Html msg)
                rest =
                    original
                        |> String.slice offset (String.length original)
                        |> stringParts
            in
                { acc | children = rest ++ acc.children }

        ( pos, markerList ) :: rest ->
            let
                readIn : List (Html msg)
                readIn =
                    original
                        |> String.slice offset pos
                        |> stringParts
            in
                consumeMarkers markerList { acc | children = readIn ++ acc.children }
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
                        content =
                            Html.span
                                [ Attr.class <| toClass cnt
                                , Attr.title <| "Evaluated " ++ toString cnt ++ " times."
                                ]
                                (List.reverse acc.children)
                    in
                        { children = content :: x
                        , stack = xs
                        }


toClass : Int -> String
toClass cnt =
    if cnt == 0 then
        "uncovered"
    else
        "covered"


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
