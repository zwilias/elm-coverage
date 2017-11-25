module CoverageExample exposing (main)

import Analyze exposing (..)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Html as Core
import Json.Decode as Decode exposing (Decoder)
import Http
import Dict exposing (Dict)


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


regionsDecoder : Decoder ModuleMap
regionsDecoder =
    Decode.dict <| Decode.dict <| Decode.list regionDecoder


type alias Model =
    { inputs : Dict String String
    , moduleMap : ModuleMap
    }


type Msg
    = GotInput String (Result Http.Error String)
    | GotRegions (Result Http.Error ModuleMap)


getFile : String -> Cmd Msg
getFile moduleName =
    Http.getString ("/static/" ++ moduleName ++ ".elm.txt")
        |> Http.send (GotInput moduleName)


getRegions : Cmd Msg
getRegions =
    Http.get "/static/coverage.json" regionsDecoder
        |> Http.send GotRegions


init : ( Model, Cmd Msg )
init =
    ( { inputs = Dict.empty, moduleMap = Dict.empty }
    , getRegions
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotInput fileName (Ok input) ->
            { model
                | inputs = Dict.insert fileName input model.inputs
            }
                ! []

        GotRegions (Ok moduleMap) ->
            { model | moduleMap = moduleMap }
                ! [ Dict.keys moduleMap |> List.map getFile |> Cmd.batch ]

        _ ->
            model ! []


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
                        in
                            ( row key counts :: rows
                            , adjustedTotals
                            )
                    )
                    ( [], Dict.empty )
    in
        Html.table []
            (row "total" totals :: rows)


computeCounts : CoverageMap -> Dict String ( Int, Int )
computeCounts =
    Dict.map
        (always <|
            List.foldl
                (\region ( used, total ) ->
                    ( used + (min 1 region.count)
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


row : String -> Dict String ( Int, Int ) -> Html msg
row name counts =
    Html.tr []
        (Html.td [] [ Html.text name ]
            :: (Dict.values counts |> List.map showCount)
        )


showCount : ( Int, Int ) -> Html msg
showCount ( used, total ) =
    Html.td []
        [ Html.text <| toString used ++ " / " ++ toString total ]


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

        -- |> Html.toString 0
    in
        -- Html.textarea [ Attr.value <| Html.toString 0 containerAsString ] []
        containerContent


styles : String
styles =
    """
.container {
    margin: 0 30px;
    color: #333333;
}

.coverage {
    font-family: "Fira Code", monospace;
    font-size: 0.8em;
    white-space: pre;
    line-height: 1.5em;
    background-color: #F0F0F0;
    padding: 1em;
    border: 1px solid #D0D0D0;
    border-radius: 0.5em;
    display: flex;
    flex-direction: row-reverse;
}

.whitespace {
    background-color: #f0f0f0;
    padding: 2px 0;
}

.covered {
    background-color: rgba(0, 255, 0, 0.2);
    color: #202020;
    box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.2);
}

.uncovered {
    background-color: rgba(255, 30, 30, 0.8);
    color: white;
    box-shadow: 0 0 0 2px rgba(255, 30, 30, 0.8);
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

.source {
    flex: 1;
}
"""


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


showCoverage : String -> CoverageMap -> String -> Html msg
showCoverage moduleName coverageMap file =
    let
        fileIndex =
            index file
    in
        Html.div [ Attr.class "file" ]
            ((Html.h2 []
                [ Html.text "Module: "
                , Html.code [] [ Html.text moduleName ]
                ]
             )
                :: (Dict.toList coverageMap
                        |> List.map
                            (\( coverageType, regions ) ->
                                Html.div []
                                    [ Html.h3 [] [ humanCoverageType coverageType ]
                                    , process file regions
                                    ]
                            )
                   )
            )


process : String -> List Region -> Html msg
process input regions =
    let
        markerDict =
            toMarkerDict regions (index input)
    in
        markup input markerDict


main : Program Never Model Msg
main =
    Core.program
        { init = init
        , update = update
        , view = view >> Html.toHtml
        , subscriptions = always Sub.none
        }
