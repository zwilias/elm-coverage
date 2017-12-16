module Coverage exposing (..)

import Native.Coverage


track : String -> Int -> Never a
track =
    Native.Coverage.track
