"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureFuseBoxPath = exports.isNodeModuleInstalled = exports.getPathRelativeToConfig = exports.excludeRedundantFolders = exports.ensureScriptRoot = exports.ensureAbsolutePath = exports.createConcat = exports.Concat = exports.ensureUserPath = exports.path2RegexPattern = exports.findReplace = exports.safeRegex = exports.cleanExistingSourceMappingURL = exports.measureTime = exports.makeFuseBoxPath = exports.fileStat = exports.ensurePackageJson = exports.ensureDir = exports.getFilename = exports.getExtension = exports.pathRelative = exports.pathJoin = exports.isObject = exports.copyFile = exports.removeFile = exports.readFileAsBuffer = exports.readFileAsync = exports.readFile = exports.fileExists = exports.extractFuseBoxPath = exports.replaceExt = exports.parseVersion = exports.ensurePublicExtension = exports.createVarString = exports.createStringConst = exports.createRequireConstWithObject = exports.createRequireConst = exports.isRegExp = exports.offsetLines = exports.listDirectory = exports.beautifyBundleName = exports.getPublicPath = exports.isDirectoryEmpty = exports.isPathRelative = exports.readJSONFile = exports.removeFolder = exports.makePublicPath = exports.getFileModificationTime = exports.matchAll = exports.path2Regex = void 0;
exports.fastHash = exports.randomHash = exports.writeFile = exports.joinFuseBoxPath = void 0;
const appRoot = require("app-root-path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const offsetLinesModule = require("offset-sourcemap-lines");
const path = require("path");
const env_1 = require("../env");
const CACHED_PATHS = new Map();
let prettyTime = require('pretty-time');
function path2Regex(path) {
    if (CACHED_PATHS.get(path)) {
        return CACHED_PATHS.get(path);
    }
    path = path.replace(/(\.|\/)/, '\\$1');
    const re = new RegExp(path);
    CACHED_PATHS.set(path, re);
    return re;
}
exports.path2Regex = path2Regex;
function matchAll(regex, str, cb) {
    let matches;
    while ((matches = regex.exec(str))) {
        cb(matches);
    }
}
exports.matchAll = matchAll;
function getFileModificationTime(absPath) {
    return fs.statSync(absPath).mtime.getTime();
}
exports.getFileModificationTime = getFileModificationTime;
function makePublicPath(target) {
    return ensureFuseBoxPath(path.relative(appRoot.path, target));
}
exports.makePublicPath = makePublicPath;
function removeFolder(userPath) {
    fsExtra.removeSync(userPath);
}
exports.removeFolder = removeFolder;
function readJSONFile(target) {
    return JSON.parse(readFile(target));
}
exports.readJSONFile = readJSONFile;
function isPathRelative(from, to) {
    const relativePath = path.relative(from, to);
    return !relativePath.startsWith('..');
}
exports.isPathRelative = isPathRelative;
function isDirectoryEmpty(directory) {
    const files = fs.readdirSync(directory);
    return files.length === 0;
}
exports.isDirectoryEmpty = isDirectoryEmpty;
function getPublicPath(x) {
    return path.relative(env_1.env.APP_ROOT, x);
}
exports.getPublicPath = getPublicPath;
function beautifyBundleName(absPath, maxLength) {
    return absPath
        .replace(/(\.\w+)$/g, '')
        .split(/(\/|\\)/g)
        .filter(a => a !== '' && a !== '.' && !a.match(/(\/|\\)/g))
        .reduce((acc, curr, _idx, arr) => acc ? (maxLength && acc.length > maxLength ? arr[arr.length - 1] : `${acc}-${curr}`) : curr)
        .toLowerCase();
}
exports.beautifyBundleName = beautifyBundleName;
const listDirectory = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? exports.listDirectory(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });
    return filelist;
};
exports.listDirectory = listDirectory;
function offsetLines(obj, amount) {
    return offsetLinesModule(obj, amount);
}
exports.offsetLines = offsetLines;
function isRegExp(input) {
    return !!(input && typeof input.test === 'function');
}
exports.isRegExp = isRegExp;
function createRequireConst(name, variable) {
    return `var ${variable ? variable : name} = require("${name}");`;
}
exports.createRequireConst = createRequireConst;
function createRequireConstWithObject(name, variable, obj) {
    return `var ${variable ? variable : name} = require("${name}").${obj};`;
}
exports.createRequireConstWithObject = createRequireConstWithObject;
function createStringConst(name, value) {
    return `const ${name} = ${JSON.stringify(value)};`;
}
exports.createStringConst = createStringConst;
function createVarString(name, value) {
    return `var ${name} = ${JSON.stringify(value)};`;
}
exports.createVarString = createVarString;
function ensurePublicExtension(url) {
    let ext = path.extname(url);
    if (ext === '.ts') {
        url = replaceExt(url, '.js');
    }
    if (ext === '.tsx') {
        url = replaceExt(url, '.jsx');
    }
    return url;
}
exports.ensurePublicExtension = ensurePublicExtension;
function parseVersion(version) {
    const re = /v?(\d+)/g;
    let matcher;
    const versions = [];
    while ((matcher = re.exec(version))) {
        versions.push(parseInt(matcher[1]));
    }
    return versions;
}
exports.parseVersion = parseVersion;
function replaceExt(npath, ext) {
    if (!npath) {
        return npath;
    }
    if (/\.[a-z0-9]+$/i.test(npath)) {
        return npath.replace(/\.[a-z0-9]+$/i, ext);
    }
    else {
        return npath + ext;
    }
}
exports.replaceExt = replaceExt;
function extractFuseBoxPath(homeDir, targetPath) {
    homeDir = ensureFuseBoxPath(homeDir);
    targetPath = ensureFuseBoxPath(targetPath);
    let result = targetPath.replace(homeDir, '');
    if (result[0] === '/') {
        result = result.slice(1);
    }
    return result;
}
exports.extractFuseBoxPath = extractFuseBoxPath;
exports.fileExists = fs.existsSync;
function readFile(file) {
    return fs.readFileSync(file).toString();
}
exports.readFile = readFile;
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (e, data) => {
            if (e)
                return reject(e);
            return resolve(data.toString());
        });
    });
}
exports.readFileAsync = readFileAsync;
function readFileAsBuffer(file) {
    return fs.readFileSync(file);
}
exports.readFileAsBuffer = readFileAsBuffer;
function removeFile(file) {
    return fs.unlinkSync(file);
}
exports.removeFile = removeFile;
async function copyFile(file, target) {
    return fsExtra.copy(file, target);
}
exports.copyFile = copyFile;
function isObject(obj) {
    return typeof obj === 'object';
}
exports.isObject = isObject;
function pathJoin(...args) {
    return path.join(...args);
}
exports.pathJoin = pathJoin;
function pathRelative(from, to) {
    return path.relative(from, to);
}
exports.pathRelative = pathRelative;
function getExtension(file) {
    return path.extname(file);
}
exports.getExtension = getExtension;
function getFilename(file) {
    return path.basename(file);
}
exports.getFilename = getFilename;
function ensureDir(dir) {
    fsExtra.ensureDirSync(dir);
    return dir;
}
exports.ensureDir = ensureDir;
function ensurePackageJson(dir) {
    ensureDir(dir);
    const pkgJsonPath = pathJoin(dir, 'package.json');
    if (!exports.fileExists(pkgJsonPath)) {
        const contents = JSON.stringify({ name: path.basename(dir) }, null, 4);
        fs.writeFileSync(pkgJsonPath, contents);
    }
}
exports.ensurePackageJson = ensurePackageJson;
function fileStat(file) {
    return fs.statSync(file);
}
exports.fileStat = fileStat;
function makeFuseBoxPath(homeDir, absPath) {
    return homeDir && ensurePublicExtension(extractFuseBoxPath(homeDir, absPath));
}
exports.makeFuseBoxPath = makeFuseBoxPath;
function measureTime(group) {
    let startTime = process.hrtime();
    return {
        end: (precision) => {
            return prettyTime(process.hrtime(startTime), precision);
        },
    };
}
exports.measureTime = measureTime;
function cleanExistingSourceMappingURL(contents) {
    return contents.replace(/\/*#\s*sourceMappingURL=\s*([^\s]+)\s*\*\//, '');
}
exports.cleanExistingSourceMappingURL = cleanExistingSourceMappingURL;
function safeRegex(contents) {
    return new RegExp(contents.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&'), 'g');
}
exports.safeRegex = safeRegex;
function findReplace(str, re, fn) {
    return str.replace(re, (...args) => {
        return fn(args);
    });
}
exports.findReplace = findReplace;
function path2RegexPattern(input) {
    if (!input) {
        return;
    }
    if (typeof input === 'string') {
        let r = '';
        for (let i = 0; i < input.length; i++) {
            switch (input[i]) {
                case '*':
                    r += '.*';
                    break;
                case '.':
                    r += '\\.';
                    break;
                case '/':
                    r += '(\\/|\\\\)';
                    break;
                case '\\': // window paths
                    r += '(\\/|\\\\)';
                    break;
                default:
                    r += input[i];
            }
        }
        return new RegExp(r);
    }
    return input;
}
exports.path2RegexPattern = path2RegexPattern;
function ensureUserPath(userPath, root) {
    if (!path.isAbsolute(userPath)) {
        userPath = path.join(root, userPath);
    }
    userPath = path.normalize(userPath);
    let dir = path.dirname(userPath);
    fsExtra.ensureDirSync(dir);
    return userPath;
}
exports.ensureUserPath = ensureUserPath;
exports.Concat = require('fuse-concat-with-sourcemaps');
function createConcat(generateSourceMap, outputFileName, seperator) {
    return new exports.Concat(generateSourceMap, outputFileName, seperator);
}
exports.createConcat = createConcat;
function ensureAbsolutePath(userPath, root) {
    if (!path.isAbsolute(userPath)) {
        return path.join(root, userPath);
    }
    return userPath;
}
exports.ensureAbsolutePath = ensureAbsolutePath;
function ensureScriptRoot(userPath) {
    if (!path.isAbsolute(userPath)) {
        return path.join(env_1.env.SCRIPT_PATH, userPath);
    }
    return userPath;
}
exports.ensureScriptRoot = ensureScriptRoot;
/**
 * Given a list of folders, exclude any that are contained in any others
 * e.g.:
 *   - "/one/two"
 *   - "/one/two/three"  ❌ _exclude: contained by "/one/two"_
 *   - "/four/five/six"
 *   - "/four/five/six"  ❌ _exclude: duplicate_
 * @param folders
 */
function excludeRedundantFolders(folders) {
    // normalize and sort, so that all ancestors come before descendants
    const sorted = folders.map(r => path.normalize(r)).sort();
    let keep = [];
    for (const folder of sorted) {
        // ignore anything if we have already seen it or its ancestor
        if (keep.some(k => k === folder || folder.startsWith(`${k}${path.sep}`)))
            continue;
        keep.push(folder);
    }
    return keep;
}
exports.excludeRedundantFolders = excludeRedundantFolders;
function getPathRelativeToConfig(props) {
    let target = props.fileName ? path.dirname(props.fileName) : props.dirName;
    const fileName = props.fileName && path.basename(props.fileName);
    if (!path.isAbsolute(target)) {
        target = path.join(env_1.env.SCRIPT_PATH, target);
    }
    if (props.ensureDirExist) {
        const baseDir = path.dirname(target);
        ensureDir(baseDir);
    }
    return fileName ? path.join(target, fileName) : target;
}
exports.getPathRelativeToConfig = getPathRelativeToConfig;
function isNodeModuleInstalled(name) {
    try {
        return require(name);
    }
    catch (e) {
        return false;
    }
}
exports.isNodeModuleInstalled = isNodeModuleInstalled;
function ensureFuseBoxPath(input) {
    return input && input.replace(/\\/g, '/').replace(/\/$/, '');
}
exports.ensureFuseBoxPath = ensureFuseBoxPath;
function joinFuseBoxPath(...any) {
    let includesProtocol = any[0].includes('://');
    let joinedPath = !includesProtocol
        ? path.join(...any)
        : any[0].replace(/([^/])$/, '$1/') + path.join(...any.slice(1));
    return ensureFuseBoxPath(joinedPath);
}
exports.joinFuseBoxPath = joinFuseBoxPath;
async function writeFile(name, contents) {
    return new Promise((resolve, reject) => {
        ensureDir(path.dirname(name));
        fs.writeFile(name, contents, err => {
            if (err)
                return reject(err);
            return resolve();
        });
    });
}
exports.writeFile = writeFile;
function randomHash() {
    return fastHash(`${Math.random()}_${Math.random()}`);
}
exports.randomHash = randomHash;
function fastHash(text) {
    let hash = 0;
    if (text.length == 0)
        return '';
    for (let i = 0; i < text.length; i++) {
        let char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    let result = hash.toString(16).toString();
    if (result.charAt(0) === '-') {
        result = result.replace(/-/, '0');
    }
    return result;
}
exports.fastHash = fastHash;
