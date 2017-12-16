port module Service exposing (Service, create)

import Json.Decode as Decode exposing (Decoder, Value)
import Json.Encode as Encode


port emit : Value -> Cmd msg


port receive : (Value -> msg) -> Sub msg


type Msg input
    = Receive input
    | Bad String


type alias Service input =
    Program Never () (Msg input)


create :
    { handle : input -> output
    , receive : Decoder input
    , emit : output -> Value
    }
    -> Service input
create settings =
    Platform.program
        { init = () ! []
        , update = handle <| settings.handle >> settings.emit
        , subscriptions = subscribe settings.receive
        }


handle : (input -> Value) -> Msg input -> a -> ( a, Cmd msg )
handle handler msg model =
    case msg of
        Receive input ->
            ( model, emit <| handler input )

        Bad val ->
            ( model
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
