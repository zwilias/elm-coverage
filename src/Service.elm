port module Service exposing (Service, Version, create)

import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode


type alias Version =
    String


port emit : Value -> Cmd msg


port receive : (Value -> msg) -> Sub msg


type Msg input
    = Receive input
    | Bad String


type alias Service input =
    Program Value Version (Msg input)


create :
    { handle : Version -> input -> output
    , receive : Decoder input
    , emit : output -> Value
    }
    -> Service input
create settings =
    Platform.worker
        { init = innerInit
        , update = handle settings.handle settings.emit
        , subscriptions = subscribe settings.receive
        }

innerInit : Value -> (Version, Cmd msg)
innerInit flags =
    (Result.withDefault "1.0.0" (Decode.decodeValue (Decode.field "version" Decode.string) flags), Cmd.none)


handle : (Version -> input -> output) -> (output -> Value) -> Msg input -> Version -> ( Version, Cmd msg )
handle handler encode msg version =
    case msg of
        Receive input ->
            ( version, emit <| encode <| handler version input )

        Bad val ->
            ( version
            , emit <|
                Encode.object
                    [ ( "type", Encode.string "error" )
                    , ( "message", Encode.string val )
                    ]
            )


subscribe : Decoder input -> a -> Sub (Msg input)
subscribe decoder _ =
    receive
        (\data ->
            case Decode.decodeValue decoder data of
                Ok input ->
                    Receive input

                Err e ->
                    Bad <| Decode.errorToString e
        )
