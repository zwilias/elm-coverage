module Overview exposing (computeCounts, heading, row)

import Coverage
import Dict exposing (Dict)
import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Util


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
shortHumanCoverageType =
    Coverage.fromAnnotation
        { caseBranch =
            [ Html.code [] [ Html.text "case" ]
            , Html.text " branches"
            ]
        , ifElseBranch =
            [ Html.code [] [ Html.text "if/else" ]
            , Html.text " branches"
            ]
        , declaration = [ Html.text "Declarations" ]
        , lambdaBody = [ Html.text "Lambdas" ]
        , letDeclaration =
            [ Html.code [] [ Html.text "let" ]
            , Html.text " declarations"
            ]
        , default = [ Html.text "unknown" ]
        }


computeCounts :
    Dict String ( Int, Int )
    -> List Coverage.AnnotationInfo
    -> Dict String ( Int, Int )
computeCounts emptyCountDict =
    List.foldl addCount emptyCountDict


addCount :
    Coverage.AnnotationInfo
    -> Dict String ( Int, Int )
    -> Dict String ( Int, Int )
addCount ( _, annotation, count ) acc =
    Dict.update (Coverage.annotationType annotation)
        (Maybe.withDefault ( 0, 0 )
            >> Util.mapBoth (+) ( min count 1, 1 )
            >> Just
        )
        acc


row : Html msg -> Dict String ( Int, Int ) -> Html msg
row name counts =
    Html.tr []
        (Html.th [] [ name ]
            :: (Dict.values counts |> List.map showCount)
        )


showCount : ( Int, Int ) -> Html msg
showCount ( used, total ) =
    if total == 0 then
        Html.td [ Attr.class "none" ]
            [ Html.text "n/a" ]

    else
        Html.td []
            [ Html.div [ Attr.class "wrapper" ]
                [ Html.div
                    [ Attr.class "info" ]
                    [ Html.text <|
                        String.fromInt used
                            ++ "/"
                            ++ String.fromInt total
                    ]
                , Html.progress
                    [ Attr.max <| String.fromInt total
                    , Attr.value <| String.fromInt used
                    ]
                    []
                ]
            ]
