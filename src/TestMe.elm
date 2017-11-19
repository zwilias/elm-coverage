module TestMe exposing (..)

import Char
import Native.Coverage


unusedFunction : String -> Int
unusedFunction input =
    Native.Coverage.declaration 0 <|
        Native.Coverage.expression 0 <|
            String.length input


isLowerString : String -> Bool
isLowerString string =
    Native.Coverage.declaration 1 <|
        Native.Coverage.expression 2 <|
            isLowerStringHelper (Native.Coverage.expression 1 (String.toList string))


isLowerStringHelper : List Char -> Bool
isLowerStringHelper charList =
    Native.Coverage.declaration 2 <|
        Native.Coverage.expression 3 <|
            case Native.Coverage.expression 4 charList of
                [] ->
                    Native.Coverage.caseBranch 0 <|
                        Native.Coverage.expression 5 False

                [ x ] ->
                    Native.Coverage.caseBranch 1 <|
                        Native.Coverage.expression 6 <|
                            if Native.Coverage.expression 7 <| Char.isLower x then
                                let
                                    _ =
                                        Native.Coverage.ifBranch 0
                                in
                                Native.Coverage.expression 8 True
                            else
                                let
                                    _ =
                                        Native.Coverage.ifBranch 1
                                in
                                Native.Coverage.expression 9 False

                x :: xs ->
                    Native.Coverage.caseBranch 2 <|
                        Native.Coverage.expression 10 <|
                            (Native.Coverage.expression 11 <| Char.isLower x)
                                && (Native.Coverage.expression 12 <| isLowerStringHelper xs)


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
