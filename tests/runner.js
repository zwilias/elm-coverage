var spawn = require("cross-spawn"),
    chai = require("chai"),
    assert = chai.assert,
    shell = require("shelljs"),
    path = require("path");

var elmCoverage = require.resolve("../bin/elm-coverage");

describe("Sanity test", function() {
    it("prints the usage instructions when running with `--help`", function(done) {
        var process = spawn.spawn(elmCoverage, ["--help"]);
        var output = "";

        process.stderr.on("data", function(data) {
            console.error(data.toString());
        });
        process.stdout.on("data", function(data) {
            output += data;
        });

        process.on("exit", function(exitCode) {
            assert.equal(exitCode, 0, "Expected to exit with 0 exitcode");
            assert.notEqual(output, "", "Expected to have some output");
            done();
        });
    });
});

describe("E2E tests", function() {
    this.timeout(Infinity);
    it("Should run succesfully", function(done) {
        var process = spawn.spawn(elmCoverage, {
            cwd: path.join("tests", "data", "simple")
        });

        process.stderr.on("data", function(data) {
            console.error(data.toString());
        });

        process.on("exit", function(exitCode) {
            assert.equal(exitCode, 0, "Expected to finish succesfully");
            done();
        });
    });
});
