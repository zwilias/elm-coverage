module TestMe exposing (..)

import Char
import Coverage


unusedFunction : String -> Int
unusedFunction input =
    Coverage.declaration 0 <|
        Coverage.expression 0 <|
            String.length input


isLowerString : String -> Bool
isLowerString string =
    Coverage.declaration 1 <|
        Coverage.expression 2 <|
            isLowerStringHelper (Coverage.expression 1 (String.toList string))


isLowerStringHelper : List Char -> Bool
isLowerStringHelper charList =
    Coverage.declaration 2 <|
        Coverage.expression 3 <|
            case Coverage.expression 4 charList of
                [] ->
                    Coverage.caseBranch 0 <|
                        Coverage.expression 5 False

                [ x ] ->
                    Coverage.caseBranch 1 <|
                        Coverage.expression 6 <|
                            if Coverage.expression 7 <| Char.isLower x then
                                Coverage.ifBranch 0 <|
                                    Coverage.expression 8 True
                            else
                                Coverage.ifBranch 1 <|
                                    Coverage.expression 9 False

                x :: xs ->
                    Coverage.caseBranch 2 <|
                        Coverage.expression 10 <|
                            (Coverage.expression 11 <| Char.isLower x)
                                && (Coverage.expression 12 <| isLowerStringHelper xs)


expressions : Never -> a
expressions =
    Coverage.init
        -- top level declarations
        [ 7, 12, 17 ]
        -- case patterns
        [ 19, 22, 28 ]
        -- if/else branches
        [ 23, 25 ]
        -- number of expressions
        12
