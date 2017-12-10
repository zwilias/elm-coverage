module Example exposing (..)

import Expect exposing (Expectation)
import Main
import Test exposing (..)


suite : Test
suite =
    test "A simple, succesfull test" <|
        \_ ->
            Main.foo
                |> Expect.equal "hello"
