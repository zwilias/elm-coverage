module TestMe exposing (..)

import Char
import Native.Coverage


unusedFunction : String -> Int
unusedFunction input =
    let
        _ =
            Native.Coverage.tldecl 0
    in
    Native.Coverage.expr 0 <| String.length input


isLowerString : String -> Bool
isLowerString string =
    let
        _ =
            Native.Coverage.tldecl 1
    in
    Native.Coverage.expr 2 <| isLowerStringHelper (Native.Coverage.expr 1 (String.toList string))


isLowerStringHelper : List Char -> Bool
isLowerStringHelper charList =
    let
        _ =
            Native.Coverage.tldecl 2
    in
    Native.Coverage.expr 3 <|
        case Native.Coverage.expr 4 charList of
            [] ->
                let
                    _ =
                        Native.Coverage.caseBranch 0
                in
                Native.Coverage.expr 5 False

            [ x ] ->
                let
                    _ =
                        Native.Coverage.caseBranch 1
                in
                Native.Coverage.expr 6 <|
                    if Native.Coverage.expr 7 <| Char.isLower x then
                        let
                            _ =
                                Native.Coverage.bool 0
                        in
                        Native.Coverage.expr 8 True
                    else
                        let
                            _ =
                                Native.Coverage.bool 1
                        in
                        Native.Coverage.expr 9 False

            x :: xs ->
                let
                    _ =
                        Native.Coverage.caseBranch 2
                in
                Native.Coverage.expr 10 <| (Native.Coverage.expr 11 <| Char.isLower x) && (Native.Coverage.expr 12 <| isLowerStringHelper xs)


expressions : ()
expressions =
    Native.Coverage.init
        [ 7
        , 12
        , 17
        ]
        [ 19, 22, 28 ]
        [ 23, 25 ]
        12
