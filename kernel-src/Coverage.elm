module Coverage exposing (track)


track : String -> Int -> ()
track line index =
    let
        _ = Debug.log "got" (line, index)
    in
    ()
