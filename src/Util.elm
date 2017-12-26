module Util exposing (indexedFoldr, intercalate, mapBoth, rFilterMap)


mapBoth : (a -> a -> a) -> ( a, a ) -> ( a, a ) -> ( a, a )
mapBoth f ( a, b ) ( x, y ) =
    ( f a x, f b y )


indexedFoldr : (Int -> a -> b -> b) -> b -> List a -> b
indexedFoldr op acc xs =
    List.foldr
        (\x ( idx, a ) ->
            ( idx - 1
            , op idx x a
            )
        )
        ( List.length xs - 1, acc )
        xs
        |> Tuple.second


intercalate : a -> List (List a) -> List a
intercalate sep =
    List.intersperse [ sep ] >> List.concat


rFilterMap : (a -> Maybe b) -> List a -> List b
rFilterMap toMaybe =
    List.foldl
        (\x acc ->
            case toMaybe x of
                Just ok ->
                    ok :: acc

                Nothing ->
                    acc
        )
        []
