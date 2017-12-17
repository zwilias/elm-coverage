module Analyzer exposing (main)

import Coverage
import Dict.LLRB as Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Html.String.Extra as Html
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Markup
import Service exposing (Service)
import Styles
import Util


main : Service Model
main =
    Service.create
        { handle = view >> Html.toString 0
        , emit = Encode.string
        , receive = decodeModel
        }


decodeModel : Decoder Model
decodeModel =
    Decode.map2 Model
        (Decode.field "files" (Decode.keyValuePairs Decode.string |> Decode.map Dict.fromList))
        (Decode.field "coverage" Coverage.regionsDecoder)


type alias Model =
    { inputs : Dict String String
    , moduleMap : Coverage.Map
    }


view : Model -> Html msg
view model =
    model.moduleMap
        |> Dict.toList
        |> List.filterMap
            (\( key, coverageInfo ) ->
                Dict.get key model.inputs
                    |> Maybe.map (Markup.file key coverageInfo)
            )
        |> (::) (overview model.moduleMap)
        |> container


container : List (Html msg) -> Html msg
container content =
    Html.html []
        [ Html.head []
            [ Html.style [] [ Html.text styles ]
            , Html.node "meta" [ Attr.attribute "charset" "UTF-8" ] []
            ]
        , Html.body []
            (Html.h1 [ Attr.id "top" ] [ Html.text "Coverage report" ] :: content)
        ]


overview : Coverage.Map -> Html msg
overview moduleMap =
    let
        ( rows, totals ) =
            moduleMap
                |> Dict.toList
                |> List.foldr foldFile ( [], Dict.empty )
    in
    Html.table [ Attr.class "overview" ]
        [ Html.thead [] [ heading totals ]
        , Html.tbody [] rows
        , Html.tfoot [] [ row (Html.text "total") totals ]
        ]


foldFile :
    ( String, List Coverage.AnnotationInfo )
    -> ( List (Html msg), Dict String ( Int, Int ) )
    -> ( List (Html msg), Dict String ( Int, Int ) )
foldFile ( moduleName, coverageInfo ) ( rows, totals ) =
    let
        counts : Dict String ( Int, Int )
        counts =
            computeCounts coverageInfo

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

        name =
            Html.a
                [ Attr.href <| "#" ++ moduleToId moduleName ]
                [ Html.code [] [ Html.text moduleName ] ]
    in
    ( row name counts :: rows
    , adjustedTotals
    )


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


annotationToString : Coverage.Annotation -> String
annotationToString annotation =
    case annotation of
        Coverage.Declaration _ _ ->
            "declarations"

        Coverage.LetDeclaration _ ->
            "letDeclarations"

        Coverage.LambdaBody _ ->
            "lambdaBodies"

        Coverage.CaseBranch ->
            "caseBranches"

        Coverage.IfElseBranch ->
            "ifElseBranches"


computeCounts : List Coverage.AnnotationInfo -> Dict String ( Int, Int )
computeCounts =
    let
        addCount : Coverage.AnnotationInfo -> Dict String ( Int, Int ) -> Dict String ( Int, Int )
        addCount ( _, ( annotation, count ) ) acc =
            Dict.update (annotationToString annotation)
                (\current ->
                    current
                        |> Maybe.withDefault ( 0, 0 )
                        |> Util.mapBoth (+) ( min count 1, 1 )
                        |> Just
                )
                acc
    in
    List.foldl addCount emptyCountDict


emptyCountDict : Dict String ( Int, Int )
emptyCountDict =
    [ "declarations", "letDeclarations", "lambdaBodies", "caseBranches", "ifElseBranches" ]
        |> List.foldl (\k -> Dict.insert k ( 0, 0 )) Dict.empty


row : Html msg -> Dict String ( Int, Int ) -> Html msg
row name counts =
    Html.tr []
        (Html.th [] [ name ]
            :: (Dict.toList counts |> List.map (uncurry showCount))
        )


showCount : String -> ( Int, Int ) -> Html msg
showCount coverageType ( used, total ) =
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
