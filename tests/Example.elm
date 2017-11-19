module Example exposing (..)

import Char
import Expect exposing (Expectation)
import Fuzz exposing (string)
import Test exposing (..)
import TestMe


simpleTest : Test
simpleTest =
    test "all uppercase is false" <|
        \_ ->
            TestMe.isLowerString "FOO"
                |> Expect.equal False


singleChar : Test
singleChar =
    test "single uppercase char" <|
        \_ ->
            TestMe.isLowerString "F"
                |> Expect.equal False



-- fuzzer : Test
-- fuzzer =
--     fuzz string "fuzzed string" <|
--         \input ->
--             TestMe.isLowerString input
--                 |> Expect.equal ((not <| String.isEmpty input) && String.all Char.isLower input)
