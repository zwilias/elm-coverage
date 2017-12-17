module Overview exposing (..)

import Coverage
import Dict.LLRB as Dict exposing (Dict)
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


computeCounts : Dict String ( Int, Int ) -> List Coverage.AnnotationInfo -> Dict String ( Int, Int )
computeCounts emptyCountDict =
    let
        addCount : Coverage.AnnotationInfo -> Dict String ( Int, Int ) -> Dict String ( Int, Int )
        addCount ( _, ( annotation, count ) ) acc =
            Dict.update (Coverage.annotationType annotation)
                (\current ->
                    current
                        |> Maybe.withDefault ( 0, 0 )
                        |> Util.mapBoth (+) ( min count 1, 1 )
                        |> Just
                )
                acc
    in
    List.foldl addCount emptyCountDict


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
