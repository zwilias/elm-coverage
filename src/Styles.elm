module Styles exposing (..)


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
    line-height: 1.5em;
    background-color: #fafafa;
    padding: 1em;
    border: 1px solid #D0D0D0;
    border-radius: 0.5em;
    display: flex;
    flex-direction: row-reverse;
}

.covered {
    background-color: #83dc83;
    color: #202020;
    box-shadow: 0 0 0 2px #83dc83;
    border-bottom: 1px solid #83dc83;
}

.uncovered {
    background-color: rgb(255, 30, 30);
    color: white;
    box-shadow: 0 0 0 2px rgb(255, 30, 30);
    border-bottom-width: 1px;
    border-bottom-style: dashed;
}

.covered > .covered {
    box-shadow: none;
    background-color: initial;
    border-bottom: none;
}

.uncovered > .uncovered {
    box-shadow: none;
    border-bottom: none;
    background-color: initial;
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

.lines a {
    color: #B0B0B0;
    text-decoration: none;
    transition: all 0.3s ease;
}

.lines a:hover {
    color: #303030;
}

.source {
    flex: 1;
    overflow: scroll;
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
