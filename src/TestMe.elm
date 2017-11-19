module TestMe exposing (..)

import Char
import Coverage


unusedFunction : String -> Int
unusedFunction input =
    Coverage.declaration 0 0 <|
        Coverage.expression 0 0 <|
            String.length input


isLowerString : String -> Bool
isLowerString string =
    Coverage.declaration 0 1 <|
        Coverage.expression 0 2 <|
            isLowerStringHelper (Coverage.expression 0 1 (String.toList string))


isLowerStringHelper : List Char -> Bool
isLowerStringHelper charList =
    Coverage.declaration 0 2 <|
        Coverage.expression 0 12 <|
            case Coverage.expression 0 11 charList of
                [] ->
                    Coverage.caseBranch 0 0 <|
                        Coverage.expression 0 3 False

                [ x ] ->
                    Coverage.caseBranch 0 1 <|
                        Coverage.expression 0 7 <|
                            if Coverage.expression 0 5 <| Char.isLower x then
                                Coverage.ifElseBranch 0 0 <|
                                    Coverage.expression 0 4 True
                            else
                                Coverage.ifElseBranch 0 1 <|
                                    Coverage.expression 0 6 False

                x :: xs ->
                    Coverage.caseBranch 0 2 <|
                        Coverage.expression 0 10 <|
                            (Coverage.expression 0 8 <| Char.isLower x)
                                && (Coverage.expression 0 9 <| isLowerStringHelper xs)


initCoverage : Never -> a
initCoverage =
    Coverage.init
        "TestMe"
        0
        { expressions =
            [ Coverage.Identifier ( 8, 5 ) ( 8, 24 )
            , Coverage.Identifier ( 13, 25 ) ( 13, 47 )
            , Coverage.Identifier ( 13, 5 ) ( 13, 47 )
            , Coverage.Identifier ( 20, 13 ) ( 20, 18 )
            , Coverage.Identifier ( 24, 17 ) ( 24, 21 )
            , Coverage.Identifier ( 23, 16 ) ( 23, 30 )
            , Coverage.Identifier ( 26, 17 ) ( 26, 22 )
            , Coverage.Identifier ( 23, 13 ) ( 26, 22 )
            , Coverage.Identifier ( 29, 13 ) ( 29, 27 )
            , Coverage.Identifier ( 29, 31 ) ( 29, 53 )
            , Coverage.Identifier ( 29, 13 ) ( 29, 53 )
            , Coverage.Identifier ( 18, 10 ) ( 18, 18 )
            , Coverage.Identifier ( 18, 5 ) ( 29, 53 )
            ]
        , caseBranches =
            [ Coverage.Identifier ( 19, 9 ) ( 20, 18 )
            , Coverage.Identifier ( 22, 9 ) ( 26, 22 )
            , Coverage.Identifier ( 28, 9 ) ( 29, 53 )
            ]
        , ifElseBranches =
            [ Coverage.Identifier ( 23, 13 ) ( 24, 21 )
            , Coverage.Identifier ( 25, 13 ) ( 26, 22 )
            ]
        , declarations =
            [ Coverage.Identifier ( 7, 1 ) ( 8, 24 )
            , Coverage.Identifier ( 12, 1 ) ( 13, 47 )
            , Coverage.Identifier ( 17, 1 ) ( 29, 53 )
            ]
        }
