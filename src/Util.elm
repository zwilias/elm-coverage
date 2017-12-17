module Util exposing (mapBoth)


mapBoth : (a -> a -> a) -> ( a, a ) -> ( a, a ) -> ( a, a )
mapBoth f ( a, b ) ( x, y ) =
    ( f a x, f b y )
