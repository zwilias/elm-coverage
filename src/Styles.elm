module Styles exposing (..)

import Html.String as Html exposing (Html)
import Html.String.Attributes as Attr
import Html.String.Extra as Html
import Service


page : String -> String -> Service.Version -> List (Html msg) -> Html msg
page title styles version content =
    Html.html []
        [ Html.head []
            [ Html.style [] [ Html.text styles ]
            , Html.node "meta" [ Attr.attribute "charset" "UTF-8" ] []
            ]
        , Html.body []
            [ Html.header [] [ Html.h1 [ Attr.id "top" ] [ Html.text title ] ]
            , Html.section [] content
            , Html.footer []
                [ Html.text "Generated with "
                , Html.a [ Attr.href "https://github.com/zwilias/elm-coverage" ] [ Html.text "elm-coverage" ]
                , Html.text <| "@" ++ version
                ]
            ]
        ]


general : String
general =
    """
@import url(https://fonts.googleapis.com/css?family=Fira+Sans);

@font-face {
    font-family: 'Fira Code';
    src: local('Fira Code'), local('FiraCode'), url(https://cdn.rawgit.com/tonsky/FiraCode/master/distr/ttf/FiraCode-Regular.ttf);
}

code {
    font-family: "Fira Code", monospace;
    font-size: 0.9em;
}

body {
    margin: 0 30px;
    color: #333333;
    font-family: "Fira Sans", sans-serif;
    background-color: #fdfdfd;
    font-size: 16px;
}

footer {
    margin: 1em;
    text-align: center;
    font-size: 0.8em;
}

a {
    font-weight: normal;
}
"""


file : String
file =
    """
.toTop {
    float: right;
    text-decoration: none;
}

.coverage {
    font-family: "Fira Code", monospace;
    font-size: 0.8em;
    white-space: pre;
    line-height: 1.2rem;
    background-color: #fdfdfd;
    padding: 1em 0.4em;
    border: 1px solid #D0D0D0;
    border-radius: 0.5em;
    display: flex;
    flex-direction: row;
    padding-left: 0;
}

.source .covered {
    background-color: #aef5ae;
    color: #202020;
    box-shadow: 0 0 0 2px #aef5ae;
    border-bottom: 1px solid #aef5ae;
}

.source .uncovered {
    background-color: rgb(255, 30, 30);
    color: white;
    box-shadow: 0 0 0 2px rgb(255, 30, 30);
    border-bottom-width: 1px;
    border-bottom-style: dashed;
}

.source .covered > .covered {
    box-shadow: none;
    background-color: initial;
    border-bottom: none;
}

.source .uncovered > .uncovered {
    box-shadow: none;
    border-bottom: none;
    background-color: initial;
}

.source .uncovered .covered {
    background-color: transparent;
    color: inherit;
    box-shadow: none;
}

.lines {
    text-align: right;
    margin-right: 10px;
    border-right: 1px solid #d0d0d0;
    padding-right: 10px;
    margin-top: -1em;
    padding-top: 1em;
    padding-bottom: 1em;
    margin-bottom: -1em;
}

.lines .line {
    display: block;
    color: #c0c0c0;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 0.9em;
    line-height: 1.2rem;
}

.lines .line:hover {
    color: #303030;
}

.source {
    flex: 1;
    overflow: scroll;
}

.legend {
    text-align: center;
    font-size: 0.9em;
    margin-bottom: 2em;
}

.indicator {
    display: inline-block;
    float: left;
    background-color: rgb(255, 30, 30);
}
"""


overview : String
overview =
    """
.overview {
    width: 100%;
    padding: 0 30px;
    border: 1px solid #d0d0d0;
    border-radius: 0.5em;
    table-layout: fixed;
}

.overview thead {
    text-align: center;
}

.overview thead tr,
.overview tfoot tr {
    height: 3em;
}

.overview tbody th,
.overview tfoot th {
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    direction: rtl;
}

.overview .wrapper {
    display: flex;
}

.overview .none {
    text-align: center;
    color: #606060;
    font-size: 0.8em;
}

.overview progress {
    flex: 1.5;
    display: none;
}

@media only screen  and (min-width : 960px) {
    .overview progress {
        display: block;
    }
}

.overview .info {
    flex: 1;
    text-align: right;
    margin: 0 1em;
}
"""
