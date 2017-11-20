module TestMe exposing (..)

import Char


unusedFunction : String -> Int
unusedFunction input =
    String.length input


isLowerString : String -> Bool
isLowerString string =
    isLowerStringHelper (String.toList string)


isLowerStringHelper : List Char -> Bool
isLowerStringHelper charList =
    case charList of
        [] ->
            False

        [ x ] ->
            if Char.isLower x then
                True
            else
                False

        x :: xs ->
            Char.isLower x && isLowerStringHelper xs
