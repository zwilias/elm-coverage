module TestMe exposing (..)

import Char
import Native.Coverage


unusedFunction : String -> Int
unusedFunction input =
    Native.Coverage.declaration 0 <|
        Native.Coverage.expr 0 <|
            String.length input


isLowerString : String -> Bool
isLowerString string =
    Native.Coverage.declaration 1 <|
        Native.Coverage.expr 2 <|
            isLowerStringHelper (Native.Coverage.expr 1 (String.toList string))


isLowerStringHelper : List Char -> Bool
isLowerStringHelper charList =
    Native.Coverage.declaration 2 <|
        Native.Coverage.expr 3 <|
            case Native.Coverage.expr 4 charList of
                [] ->
                    Native.Coverage.caseBranch 0 <|
                        Native.Coverage.expr 5 False

                [ x ] ->
                    Native.Coverage.caseBranch 1 <|
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
                    Native.Coverage.caseBranch 2 <|
                        Native.Coverage.expr 10 <|
                            (Native.Coverage.expr 11 <| Char.isLower x)
                                && (Native.Coverage.expr 12 <| isLowerStringHelper xs)


expressions : ()
expressions =
    Native.Coverage.init
        -- top level declarations
        [ 7, 12, 17 ]
        -- case patterns
        [ 19, 22, 28 ]
        -- if/else branches
        [ 23, 25 ]
        -- number of expressions
        12
