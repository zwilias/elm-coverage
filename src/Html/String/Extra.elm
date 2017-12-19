module Html.String.Extra exposing (..)

import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr


html : List (Html.Attribute msg) -> List (Html msg) -> Html msg
html =
    Html.node "html"


head : List (Html.Attribute msg) -> List (Html msg) -> Html msg
head =
    Html.node "head"


style : List (Html.Attribute msg) -> List (Html msg) -> Html msg
style =
    Html.node "style"


data : String -> String -> Html.Attribute msg
data key value =
    Attr.attribute ("data-" ++ key) value
