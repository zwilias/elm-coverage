var binwrap = require("binwrap");
var path = require("path");

var binVersion = "0.0.7";

var root =
    "https://github.com/zwilias/elm-instrument/releases/download/" +
    binVersion +
    "/";

module.exports = binwrap({
    dirname: __dirname,
    binaries: ["elm-instrument"],
    urls: {
        "darwin-arm64": root + "osx-x64.tar.gz",
        "darwin-x64": root + "osx-x64.tar.gz",
        "linux-x64": root + "linux-x64.tar.gz",
        "win32-x64": root + "windows-x64.tar.gz",
        "win32-ia32": root + "windows-ia32.tar.gz"
    }
});
