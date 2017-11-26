module CoverageExample exposing (main)

import Analyze exposing (..)
import Html.String as Html exposing (Html)
import Html as Core
import Http
import Dict exposing (Dict)


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
    ( emptyModel
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


main : Program Never Model Msg
main =
    Core.program
        { init = init
        , update = update
        , view = view >> Html.toHtml
        , subscriptions = always Sub.none
        }
