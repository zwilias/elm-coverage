
var path = require("path");
var spawn = require("cross-spawn");

testPath = path.join(".", "tests", "data", "simple");

var fakeElmBinary = path.relative(testPath, path.resolve(path.join(__dirname, "bin", "fake-elm")))

//var process = spawn(path.resolve(path.join(__dirname, "bin", "elm-coverage")), [ "-v" ],
//    {
//        // run elm-test in the mocha tests elm project dir
//        cwd: "tests/data/simple",
//        stdio: ["ignore", "inherit", "inherit"]
//    });
console.log("fake elm binary", fakeElmBinary);
spawn("dir", {stdio: ["ignore", "inherit", "inherit"], cwd: testPath });

var process = spawn("elm-test", [ "--compiler", fakeElmBinary, "tests"],
    {
        // run elm-test in the mocha tests elm project dir
        cwd: testPath,
        stdio: ["ignore", "inherit", "inherit"]
    });

process.on("exit", function(exitCode) {
    if (exitCode === 0) {
        console.log("Ran tests!");
    } else {
        console.error("Ruh roh, tests failed.");
    }
});

