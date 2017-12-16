module Html.String.Extra exposing (..)

import Html.String as Html exposing (Html)


html : List (Html.Attribute msg) -> List (Html msg) -> Html msg
html =
    Html.node "html"


head : List (Html.Attribute msg) -> List (Html msg) -> Html msg
head =
    Html.node "head"


style : List (Html.Attribute msg) -> List (Html msg) -> Html msg
style =
    Html.node "style"
