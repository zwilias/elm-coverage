var spawn = require("cross-spawn"),
    chai = require("chai"),
    Promise = require("bluebird"),
    assert = chai.assert,
    expect = chai.expect,
    shell = require("shelljs"),
    path = require("path"),
    fs = require("fs-extra"),
    chaiMatchPattern = require("chai-match-pattern");

chai.use(require("chai-json-schema-ajv"));
chai.use(chaiMatchPattern);
var _ = chaiMatchPattern.getLodashModule();
_.mixin({
    matchesPath: (expected, actual) => actual.replace("\\", "/") === expected
});

var elmCoverage = require.resolve("../bin/elm-coverage");

describe("Sanity test", () => {
    it("prints the usage instructions when running with `--help`", done => {
        var process = spawn.spawn(elmCoverage, ["--help"]);
        var output = "";

        process.stderr.on("data", data => {
            console.error(data.toString());
        });
        process.stdout.on("data", data => {
            output += data;
        });

        process.on("exit", exitCode => {
            assert.equal(exitCode, 0, "Expected to exit with 0 exitcode");
            assert.notEqual(output, "", "Expected to have some output");
            done();
        });
    });
});

describe("E2E tests", function() {
    this.timeout(Infinity);
    it("Should run succesfully", done => {
        var process = spawn.spawn(elmCoverage, {
            cwd: path.join("tests", "data", "simple")
        });

        process.stderr.on("data", data => {
            console.error(data.toString());
        });

        process.on("exit", exitCode => {
            assert.equal(exitCode, 0, "Expected to finish succesfully");
            done();
        });
    });

    it("Should generate schema-validated JSON", () =>
        Promise.all([
            fs.readJSON(require.resolve("../docs/elm-coverage.json")),
            generateJSON()
        ]).spread((json, schema) => {
            expect(json).to.be.jsonSchema(schema);
        }));

    it("Should generate JSON that matches the pregenerated one, modulus runcount", () =>
        Promise.all([
            generateJSON(),
            fs.readJSON(require.resolve("./data/simple/expected.json"))
        ]).spread((actual, expectedJSON) => {
            var expected = {};

            // Ignore runcounts
            expected.coverageData = _.mapValues(
                expectedJSON.coverageData,
                moduleData =>
                    _.map(moduleData, coverage =>
                        Object.assign({}, coverage, {
                            count: _.isInteger
                        })
                    )
            );

            // System agnostic paths
            expected.moduleMap = _.mapValues(
                expectedJSON.moduleMap,
                modulePath => _.partial(_.matchesPath, modulePath, _)
            );

            expect(actual).to.matchPattern(expected);
        }));
});

function generateJSON() {
    return new Promise((resolve, reject) => {
        var process = spawn.spawn(
            elmCoverage,
            ["generate", "--report", "json"],
            {
                cwd: path.join("tests", "data", "simple")
            }
        );

        var output = "";

        process.stdout.on("data", data => {
            output += data;
        });

        process.on("exit", exitCode => {
            assert.equal(exitCode, 0, "Expected to finish succesfully");
            if (exitCode === 0) {
                resolve(output);
            } else {
                reject(new Error("Expected to finish successfully"));
            }
        });
    }).then(json => JSON.parse(json));
}
