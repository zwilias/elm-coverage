module Analyzer exposing (main)

import Coverage
import Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Markup
import Overview
import Service exposing (Service)
import Styles
import Util


main : Service Model
main =
    Service.create
        { handle = \version model -> view version model |> Html.toString 0
        , emit = Encode.string
        , receive = decodeModel
        }


decodeModel : Decoder Model
decodeModel =
    Decode.map2 Model
        (Decode.field "files"
            (Decode.keyValuePairs Decode.string |> Decode.map Dict.fromList)
        )
        (Decode.field "coverage" Coverage.regionsDecoder)


type alias Model =
    { inputs : Dict String String
    , moduleMap : Coverage.Map
    }


view : Service.Version -> Model -> Html msg
view version model =
    model.moduleMap
        |> Dict.toList
        |> List.filterMap
            (\( key, coverageInfo ) ->
                Dict.get key model.inputs
                    |> Maybe.map (Markup.file key coverageInfo)
            )
        |> (::) (overview model.moduleMap)
        |> Styles.page "Coverage report" styles version


overview : Coverage.Map -> Html msg
overview moduleMap =
    let
        ( rows, totals ) =
            moduleMap
                |> Dict.toList
                |> List.foldr foldFile ( [], Dict.empty )
    in
    Html.table [ Attr.class "overview" ]
        [ Html.thead [] [ Overview.heading totals ]
        , Html.tbody [] rows
        , Html.tfoot [] [ Overview.row (Html.text "total") totals ]
        ]


foldFile :
    ( String, List Coverage.AnnotationInfo )
    -> ( List (Html msg), Dict String ( Int, Int ) )
    -> ( List (Html msg), Dict String ( Int, Int ) )
foldFile ( moduleName, coverageInfo ) ( rows, totals ) =
    let
        counts : Dict String ( Int, Int )
        counts =
            Overview.computeCounts emptyCountDict coverageInfo

        name : Html msg
        name =
            Html.a
                [ Attr.href <| "#" ++ moduleToId moduleName ]
                [ Html.text <|
                    "("
                        ++ (String.fromInt <| Coverage.totalComplexity coverageInfo)
                        ++ ")\u{00A0}"
                , Html.code [] [ Html.text moduleName ]
                ]
    in
    ( Overview.row name counts :: rows
    , Dict.foldl adjustTotals totals counts
    )


adjustTotals :
    String
    -> ( Int, Int )
    -> Dict String ( Int, Int )
    -> Dict String ( Int, Int )
adjustTotals coverageType counts =
    Dict.update coverageType
        (Maybe.map (Util.mapBoth (+) counts)
            >> Maybe.withDefault counts
            >> Just
        )


emptyCountDict : Dict String ( Int, Int )
emptyCountDict =
    [ Coverage.declaration
    , Coverage.letDeclaration
    , Coverage.lambdaBody
    , Coverage.caseBranch
    , Coverage.ifElseBranch
    ]
        |> List.foldl (\k -> Dict.insert k ( 0, 0 )) Dict.empty


moduleToId : String -> String
moduleToId =
    String.toLower >> String.split "." >> String.join "-"


styles : String
styles =
    String.concat
        [ Styles.general
        , Styles.file
        , Styles.overview
        ]
