var fs = require("fs-extra"),
    Promise = require("bluebird"),
    path = require("path");

module.exports = async function(sourcePath) {
    const infoData = await readInfo();
    const dataFiles = await findCoverageJsonDataFiles();

    const coverageData = await Promise.reduce(
        dataFiles.map(readJsonFile),
        addCoverage,
        infoData
    );

    var moduleMap = {};

    Object.keys(coverageData).forEach(function(moduleName) {
        moduleMap[moduleName] = toPath(sourcePath, moduleName);
    });

    return {
        coverageData: coverageData,
        moduleMap: moduleMap
    };
};

async function findCoverageJsonDataFiles() {
    // elm-test@0.19.1-revision5 and later
    let dir = path.join('.coverage', 'instrumented');
    let files = await findDataJsonFiles(dir);

    if (!files || files.length === 0) {
        // elm-test@0.19.1-revision4 and earlier
        dir = await findElmTestGeneratedDir();
        files = await findDataJsonFiles(dir);
    }

    if (!files || files.length === 0) {
        console.error('Could not find any files shaped `data-<pid>.json` with coverage data');
        process.exit(1);
    }

    return files.map(file => path.join(dir, file));
}

async function findElmTestGeneratedDir() {
    const base = path.join(
        ".coverage",
        "instrumented",
        "elm-stuff",
        "generated-code",
        "elm-community",
        "elm-test"
    );

    const folders = (await fs.readdir(base, { withFileTypes: true })).filter(e => e.isDirectory());
    if (!folders || folders.length === 0) {
        console.error(`Could not find an elm-test version folder in ${path.resolve(base)}`);
        process.exit(1);
    }
    const last = folders[folders.length - 1]
    const dir = path.join(base, last.name);
    console.log('Trying to read elm tests from', dir)
    return dir
}

function findDataJsonFiles(dir) {
    return fs.readdir(dir).then(files => files.filter(isCoverageDataFile))
}

function readJsonFile(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath)
            .then(function(infoData) {
                try {
                    resolve(JSON.parse(infoData));
                } catch (e) {
                    reject(e);
                }
            })
            .catch(reject);
    });
}

function readInfo() {
    return readJsonFile(path.join(".coverage", "info.json"));
}

function addCoverage(info, coverage) {
    Object.keys(coverage).forEach(function(module) {
        var evaluatedExpressions = coverage[module];

        evaluatedExpressions.forEach(function(idx) {
            info[module][idx].count = info[module][idx].count + 1 || 1;
        });
    });

    return info;
}

function isCoverageDataFile(filePath) {
    if (filePath.endsWith("elm.json") || filePath.endsWith("info.json")) {
        return false;
    }
    return filePath.endsWith(".json");
}

function toPath(sourcePath, moduleName) {
    var parts = moduleName.split(".");
    var moduleFile = parts.pop();
    parts.push(moduleFile + ".elm");

    return path.join.apply(path, [sourcePath].concat(parts));
}
