module Json exposing (Value(..), fromCore, toCore)

{-| An exposed recursively defined union type that describes a JSON value, and
functions to go back and forth between `elm-lang/core`'s `Value` representation.

Note that manipulating this structure is much nicer when done through `Encoder`
and `Decoder`.

@docs Value, toCore, fromCore

-}

import Json.Decode as CoreDecode
import Json.Encode as Core


{-| A JSON value (actual JSON, not random JS) can be described using a structure
like this one.

Since the tags are also regular types, they are expected to be used qualified
, so `Json.String` rather than `String`.

-}
type Value
    = String String
    | Int Int
    | Float Float
    | Null
    | Array (List Value)
    | Object (List ( String, Value ))


{-| Convert a `Json.Value` to `Json.Encode.Value` (which is an alias for
`Json.Decode.Value`). Useful when integrating with `elm-lang/core`, though I
don't expect this library to actually be used.
-}
toCore : Value -> Core.Value
toCore value =
    case value of
        String val ->
            Core.string val

        Int val ->
            Core.int val

        Float val ->
            Core.float val

        Null ->
            Core.null

        Array values ->
            List.map toCore values |> Core.list

        Object kvPairs ->
            List.map (Tuple.mapSecond toCore) kvPairs |> Core.object


{-| Convert from a `Json.Encode.Value` _to_ a `Json.Value`.

Note that if your input isn't a JSON serializable value, for example if it
contains a function, this will simple return `Json.Null`.

-}
fromCore : Core.Value -> Value
fromCore value =
    CoreDecode.decodeValue decoder value
        |> Result.withDefault Null


decoder : CoreDecode.Decoder Value
decoder =
    CoreDecode.oneOf
        [ CoreDecode.map String CoreDecode.string
        , CoreDecode.map Int CoreDecode.int
        , CoreDecode.map Float CoreDecode.float
        , CoreDecode.null Null
        , CoreDecode.map Array (CoreDecode.list <| CoreDecode.lazy <| \_ -> decoder)
        , CoreDecode.map (List.reverse >> Object) (CoreDecode.keyValuePairs <| CoreDecode.lazy <| \_ -> decoder)
        ]
