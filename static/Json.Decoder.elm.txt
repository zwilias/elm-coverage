module Json.Decoder
    exposing
        ( Decoder
        , Error(..)
        , andMap
        , andThen
        , at
        , decodeString
        , decodeValue
        , fail
        , field
        , float
        , index
        , int
        , keyValuePairs
        , lazy
        , list
        , map
        , map2
        , map3
        , map4
        , map5
        , map6
        , map7
        , map8
        , maybe
        , null
        , oneOf
        , string
        , succeed
        , value
        )

{-|

    import Json

@docs Decoder, Error
@docs decodeString, decodeValue
@docs string, int, float, null, value
@docs index, list, field, at, keyValuePairs
@docs fail, succeed, lazy
@docs maybe, oneOf
@docs map, andThen, andMap
@docs map2, map3, map4, map5, map6, map7, map8

-}

import Json exposing (Value)
import Json.Parser exposing (parse)


{-| Sometimes decoding fails, due to any number of reasons. Actually, it's
usually a fairly limited set of reason.

The most generic reason is a type mismatch. This is represented as a `Failure`
which carries information about the type that was expected, and what was
actually encountered.

If that failure happes to happen while decoding the field of an object, the
failure will be wrapped in a `Field` error, with a string identifying the field.

A similar thing counts for `Index` which represents a decode failure somewhere
nested in a structure.

If you tried a bunch of decoders using `oneOf` and they _all_ failed, the errors
will be wrapped in a `OneOf` error.

These errors stack, so you can reconstruct the path to the failure by peeling
off layers of the Error-stack.

Occasionally, you're just dealing with some JSON that could be parsed at all. In
that case, you'll see a `BadJson` error containing the parse-error.

-}
type Error
    = Field String Error
    | Index Int Error
    | OneOf (List Error)
    | Failure String Value
    | BadJson Json.Parser.Error


{-| A Decoder is a sort of recipe for how to go from "arbitrary JSON" to "your
nicely typed Elm structure". They are built up using the primitives and
combinators defined in this library.
-}
type Decoder a
    = Decoder (Value -> Result Error a)



-- Running decoders


{-| Given a `String` representing JSON, run the provided decoder on that input.
-}
decodeString : Decoder a -> String -> Result Error a
decodeString decoder string =
    parse string
        |> Result.mapError BadJson
        |> Result.andThen (decodeValue decoder)


{-| Given a `Json.Value`, run the provided the decoder. This can never result in
a `BadJson` error.

    Json.String "foo"
        |> decodeValue string
        |> Ok "foo"

-}
decodeValue : Decoder a -> (Value -> Result Error a)
decodeValue (Decoder decoderF) =
    decoderF



-- Special decoders


{-| Create a decoder that will return the same value for every _structurally
valid_ JSON.

    """ "hello world" """
        |> decodeString (succeed "foobar")
    --> Ok "foobar"

For input that fails to parse, you will still receive an error.

    """ foo """
        |> decodeString (succeed "bar")
        |> Result.mapError (always "parse error")
    --> Err "parse error"

-}
succeed : a -> Decoder a
succeed a =
    Decoder (\_ -> Ok a)


{-| Create a decoder that will always fail with the same message for every
structurally valid JSON.

    """ "hello world" """
        |> decodeString (fail "oops")
    --> Err (Failure "oops" (Json.String "hello world"))

For input that fails with a parse error, you will still receive the parse error.

    parseErrorToString : Error -> String
    parseErrorToString error =
        case error of
            BadJson _ ->
                "parse error"
            _ ->
                toString error


    """ foo """
        |> decodeString (fail "oops")
        |> Result.mapError parseErrorToString
    -->  Err "parse error"

-}
fail : String -> Decoder a
fail msg =
    value |> andThen (Decoder << always << Err << Failure msg)


{-| Decode the raw `Json.Value` from the input.

    """ null """
        |> decodeString value
    --> Ok Json.Null


    """ { "key": "value" } """
        |> decodeString (field "key" value)
    --> Ok (Json.String "value")

-}
value : Decoder Value
value =
    Decoder <| \val -> Ok val



-- Primitives


{-| Decode a JSON string into an Elm `String`. JSON strings are weird.

    """ "hello world" """
        |> decodeString string
    --> Ok "hello world"


    """ 12 """
        |> decodeString string
    --> Err (Failure "Expected a string" (Json.Int 12))


    """ "foo\\nbar\\nbar" """
        |> decodeString string
    --> Ok "foo\nbar\nbar"


    """ "foo\\u0020bar" """
        |> decodeString string
    --> Ok "foo bar"

-}
string : Decoder String
string =
    Decoder <|
        \json ->
            case json of
                Json.String val ->
                    Ok val

                _ ->
                    Err (Failure "Expected a string" json)


{-| Decode a JSON number that is a valid Elm `Int` into an Elm `Int`. JSON
numbers are really annoying.

    """ 12 """
        |> decodeString int
    --> Ok 12


    """ 3e3 """
        |> decodeString int
    --> Ok 3000


    """ 3E-2 """
        |> decodeString int
        |> Result.mapError (always "that's a float")
    --> Err "that's a float"

-}
int : Decoder Int
int =
    Decoder <|
        \json ->
            case json of
                Json.Int val ->
                    Ok val

                _ ->
                    Err (Failure "Expected an integer" json)


{-| Decodes any JSON number into a `Float`. (But like, seriously, JSON numbers).

    """ 0.5 """
        |> decodeString float
    --> Ok 0.5


    """ 12 """
        |> decodeString float
    --> Ok 12


    """ 3e-2 """
        |> decodeString float
    --> Ok 0.03


    """ 3.25e+1 """
        |> decodeString float
    --> Ok 32.5

-}
float : Decoder Float
float =
    Decoder <|
        \json ->
            case json of
                Json.Float val ->
                    Ok val

                Json.Int val ->
                    Ok (toFloat val)

                _ ->
                    Err (Failure "Expected a float" json)


{-| Matches exactly `null`, returning a predefined value when it encounters that.

    """ null """
        |> decodeString (null 99)
    --> Ok 99

-}
null : a -> Decoder a
null onNull =
    Decoder <|
        \json ->
            case json of
                Json.Null ->
                    Ok onNull

                _ ->
                    Err (Failure "Expected null" json)



-- Structural primitives


{-| Decode the field of a JSON object with some decoder.

    """ { "foo": "bar" } """
        |> decodeString (field "foo" string)
    --> Ok "bar"


    """ "oops" """
        |> decodeString (field "foo" string)
    --> Err (Failure "Expected an object with a field 'foo'" (Json.String "oops"))

-}
field : String -> Decoder a -> Decoder a
field name (Decoder decoderF) =
    Decoder <|
        \json ->
            case json of
                Json.Object keyValuePairs ->
                    let
                        entry : Maybe Value
                        entry =
                            keyValuePairs
                                |> List.filter (\( key, _ ) -> key == name)
                                |> List.head
                                |> Maybe.map Tuple.second
                    in
                    case entry of
                        Nothing ->
                            Err <| Failure ("Expected an object with a field '" ++ name ++ "'") json

                        Just fieldValue ->
                            decoderF fieldValue
                                |> Result.mapError (Field name)

                _ ->
                    Err <| Failure ("Expected an object with a field '" ++ name ++ "'") json


{-| Decode a certain path in nested objects.

    """ { "first": { "second": 12 } } """
        |> decodeString (at [ "first", "second" ] int)
    --> Ok 12


    """ "or with an empty list" """
        |> decodeString (at [] string)
    --> Ok "or with an empty list"

-}
at : List String -> Decoder a -> Decoder a
at path decoder =
    List.foldr field decoder path


{-| Generic decoder for turning a JSON object into a list of key-value pairs.

    """ { "utensil": "spoon", "quality": "high", "size": "large" } """
        |> decodeString (keyValuePairs string)
    --> Ok [ ( "utensil", "spoon" ), ( "quality", "high" ), ( "size", "large" ) ]


    """ { "name": "Alex", "age": 34 } """
        |> decodeString (keyValuePairs string)
    --> Err (Field "age" (Failure "Expected a string" (Json.Int 34)))

-}
keyValuePairs : Decoder a -> Decoder (List ( String, a ))
keyValuePairs (Decoder decoderF) =
    Decoder <|
        \json ->
            case json of
                Json.Object rawKeyValuePairs ->
                    List.foldl
                        (\( key, value ) accResult ->
                            Result.map2 ((,) key >> (::))
                                (decoderF value |> Result.mapError (Field key))
                                accResult
                        )
                        (Ok [])
                        rawKeyValuePairs
                        |> Result.map List.reverse

                _ ->
                    Err <| Failure "Expected an object" json


{-| Decode a JSON array into a list of values.

    """ [ "hello", "world" ] """
        |> decodeString (list string)
    --> Ok [ "hello", "world" ]


    """ [ null, 12 ] """
        |> decodeString (list int)
    --> Err (Index 0 (Failure "Expected an integer" Json.Null))

-}
list : Decoder a -> Decoder (List a)
list (Decoder decoderF) =
    Decoder <|
        \json ->
            case json of
                Json.Array rawValues ->
                    List.foldl
                        (\value ( accResult, idx ) ->
                            ( Result.map2 (::)
                                (decoderF value |> Result.mapError (Index idx))
                                accResult
                            , idx + 1
                            )
                        )
                        ( Ok [], 0 )
                        rawValues
                        |> Tuple.first
                        |> Result.map List.reverse

                _ ->
                    Err <| Failure "Expected a list" json


{-| Decode the value at a certain offset in a JSON array.

    """ [ null, 12 ] """
        |> decodeString (index 1 int)
    --> Ok 12


    """ [] """
        |> decodeString (index 0 int)
    --> Err (Failure "Expected an array with index 0" (Json.Array []))

-}
index : Int -> Decoder a -> Decoder a
index idx (Decoder decoderF) =
    Decoder <|
        \json ->
            case json of
                Json.Array rawValues ->
                    List.foldl
                        (\value ( accResult, currentIdx ) ->
                            if idx == currentIdx then
                                ( decoderF value |> Result.mapError (Index idx), currentIdx + 1 )
                            else
                                ( accResult, currentIdx + 1 )
                        )
                        ( Err <| Failure ("Expected an array with index " ++ toString idx) json, 0 )
                        rawValues
                        |> Tuple.first

                _ ->
                    Err <| Failure "Expected a list" json



-- Complicated structures


{-| Try a bunch of decoders. If all fail, you'll get an error with information
from all of them. Else, you'll receive the value of the first successful decoder.

    stringOrIntString : Decoder String
    stringOrIntString =
        oneOf
            [ map toString int
            , string
            ]


    """ [ "foo", 12 ] """
        |> decodeString (list stringOrIntString)
    --> Ok [ "foo", "12" ]

-}
oneOf : List (Decoder a) -> Decoder a
oneOf decoders =
    let
        initialResult : ( List Error, Maybe a )
        initialResult =
            ( [], Nothing )

        combineResults : Value -> Decoder a -> ( List Error, Maybe a ) -> ( List Error, Maybe a )
        combineResults json (Decoder decoderF) ( errors, result ) =
            case result of
                Just _ ->
                    ( errors, result )

                Nothing ->
                    case decoderF json of
                        Ok val ->
                            ( errors, Just val )

                        Err e ->
                            ( e :: errors, Nothing )

        wrapUp : ( List Error, Maybe a ) -> Result Error a
        wrapUp ( errors, result ) =
            Maybe.map Ok result
                |> Maybe.withDefault (Err <| OneOf <| List.reverse errors)
    in
    Decoder <|
        \json ->
            List.foldl (combineResults json) initialResult decoders
                |> wrapUp


{-| Dealing with values that maybe result in a type-mismatch.

This particular solution involves completely disregarding errors on the decoder
and returning succeeding with `Nothing`.

    """ "foo" """
        |> decodeString (maybe string)
    --> Ok (Just "foo")


    """ "foo" """
        |> decodeString (maybe int)
    --> Ok Nothing


    """ { "foo": "bar" } """
        -- Putting the `maybe` inside results in failure, since the field isn't
        -- there to begin with.
        |> decodeString (field "bar" (maybe string))
    --> Err (Failure "Expected an object with a field 'bar'" (Json.Object [ ("foo", Json.String "bar" ) ]))


    """ { "foo": "bar" } """
        -- This actually applies the `maybe` to the entire decoder, meaning the
        -- missing field error is swallowed entirely.
        |> decodeString (maybe (field "bar" string))
    --> Ok Nothing

-}
maybe : Decoder a -> Decoder (Maybe a)
maybe decoder =
    oneOf [ map Just decoder, succeed Nothing ]


{-| For recursive JSON structures, you'll run into issues defining the recursive
structure; since you can't have a recursively defined _value_.

`lazy` handles that by enforcing `lazy` evaluation: the decoder isn't executed
until it actually has to.

    input : String
    input =
        """
    { "value": 12, "next": { "value" : 7, "next": null } }
    """


    inputDecoder : Decoder (List Int)
    inputDecoder =
        oneOf
            [ null []
            , map2 (::)
                (field "value" int)
                (field "next" (lazy <| \_ -> inputDecoder))
            ]


    input |> decodeString inputDecoder
    --> Ok [ 12, 7 ]

-}
lazy : (() -> Decoder a) -> Decoder a
lazy decoder =
    Decoder <|
        \json ->
            decodeValue (decoder ()) json



-- Combining decoders


{-| Transform the result of a decoder by executing a function on it.

    """ 66 """
        |> decodeString (map (\x -> x // 2) int)
    --> Ok 33

-}
map : (a -> b) -> Decoder a -> Decoder b
map f (Decoder decoderF) =
    Decoder (decoderF >> Result.map f)


{-| Combine the results of 2 decoders by executing a function on it.

    """ { "left": 66, "right": "foo" } """
        |> decodeString
            (
                map2 (\left right -> { left = left, right = right })
                    (field "left" int)
                    (field "right" string)
            )
    --> Ok { left = 66, right = "foo" }

-}
map2 : (a -> b -> c) -> Decoder a -> Decoder b -> Decoder c
map2 f (Decoder decoderFA) (Decoder decoderFB) =
    Decoder <|
        \val ->
            Result.map2 f (decoderFA val) (decoderFB val)


{-| Chain decoders that depend on the value of some other decoder.

    """ { "key": "foo", "foo": "bar" } """
        |> decodeString (field "key" string |> andThen (\key -> field key string))
    --> Ok "bar"

-}
andThen : (a -> Decoder b) -> Decoder a -> Decoder b
andThen toB (Decoder decoderF) =
    Decoder <|
        \val ->
            case decoderF val of
                Ok decoded ->
                    decodeValue (toB decoded) val

                Err err ->
                    Err err


{-| Apply a value to a function that's _in_ a decoder.

    """ { "first": "a", "rest": [ "b", "c", "d" ] } """
        |> decodeString (
            map (::) (field "first" string)
                |> andMap (field "rest" (list string))
        )
    --> Ok [ "a", "b", "c", "d" ]

-}
andMap : Decoder a -> Decoder (a -> b) -> Decoder b
andMap =
    map2 (|>)


{-| Combine the results of 3 decoders into a single thing.
-}
map3 :
    (a -> b -> c -> d)
    -> Decoder a
    -> Decoder b
    -> Decoder c
    -> Decoder d
map3 f decA decB decC =
    map f decA
        |> andMap decB
        |> andMap decC


{-| Combine the results of 4 decoders into a single thing.
-}
map4 :
    (a -> b -> c -> d -> e)
    -> Decoder a
    -> Decoder b
    -> Decoder c
    -> Decoder d
    -> Decoder e
map4 f decA decB decC decD =
    map f decA
        |> andMap decB
        |> andMap decC
        |> andMap decD


{-| Combine the results of 5 decoders into a single thing.
-}
map5 :
    (a -> b -> c -> d -> e -> f)
    -> Decoder a
    -> Decoder b
    -> Decoder c
    -> Decoder d
    -> Decoder e
    -> Decoder f
map5 f decA decB decC decD decE =
    map f decA
        |> andMap decB
        |> andMap decC
        |> andMap decD
        |> andMap decE


{-| Combine the results of 6 decoders into a single thing.
-}
map6 :
    (a -> b -> c -> d -> e -> f -> g)
    -> Decoder a
    -> Decoder b
    -> Decoder c
    -> Decoder d
    -> Decoder e
    -> Decoder f
    -> Decoder g
map6 f decA decB decC decD decE decF =
    map f decA
        |> andMap decB
        |> andMap decC
        |> andMap decD
        |> andMap decE
        |> andMap decF


{-| Combine the results of 7 decoders into a single thing.
-}
map7 :
    (a -> b -> c -> d -> e -> f -> g -> h)
    -> Decoder a
    -> Decoder b
    -> Decoder c
    -> Decoder d
    -> Decoder e
    -> Decoder f
    -> Decoder g
    -> Decoder h
map7 f decA decB decC decD decE decF decG =
    map f decA
        |> andMap decB
        |> andMap decC
        |> andMap decD
        |> andMap decE
        |> andMap decF
        |> andMap decG


{-| Combine the results of 8 decoders into a single thing.
-}
map8 :
    (a -> b -> c -> d -> e -> f -> g -> h -> i)
    -> Decoder a
    -> Decoder b
    -> Decoder c
    -> Decoder d
    -> Decoder e
    -> Decoder f
    -> Decoder g
    -> Decoder h
    -> Decoder i
map8 f decA decB decC decD decE decF decG decH =
    map f decA
        |> andMap decB
        |> andMap decC
        |> andMap decD
        |> andMap decE
        |> andMap decF
        |> andMap decG
        |> andMap decH
