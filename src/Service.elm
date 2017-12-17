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
    Program Version Version (Msg input)


create :
    { handle : Version -> input -> output
    , receive : Decoder input
    , emit : output -> Value
    }
    -> Service input
create settings =
    Platform.programWithFlags
        { init = flip (!) []
        , update = handle settings.handle settings.emit
        , subscriptions = subscribe settings.receive
        }


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
                    Bad e
        )
