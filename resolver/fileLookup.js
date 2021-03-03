"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileLookup = exports.resolveIfExists = void 0;
const fs = require("fs");
const path = require("path");
const parseTypescriptConfig_1 = require("../compilerOptions/parseTypescriptConfig");
const utils_1 = require("../utils/utils");
const JS_EXTENSIONS = ['.js', '.jsx', '.mjs'];
const TS_EXTENSIONS = ['.ts', '.tsx'];
const TS_EXTENSIONS_FIRST = [...TS_EXTENSIONS, ...JS_EXTENSIONS];
const JS_EXTENSIONS_FIRST = [...JS_EXTENSIONS, ...TS_EXTENSIONS];
function isFileSync(path) {
    return utils_1.fileExists(path) && fs.lstatSync(path).isFile();
}
// A SubPathResolver that simply checks the actual filesystem
const resolveIfExists = (base, target = '', type, props = {}) => {
    const absPath = path.join(base, target);
    switch (type) {
        case 'dir':
            return ((utils_1.fileExists(absPath) &&
                fs.lstatSync(absPath).isDirectory() && Object.assign({ absPath, extension: path.extname(absPath), fileExists: true }, props)) ||
                undefined);
        case 'exists':
        case undefined:
            return ((utils_1.fileExists(absPath) && Object.assign({ absPath, extension: path.extname(absPath), fileExists: true }, props)) || undefined);
        case 'file':
            return ((utils_1.fileExists(absPath) &&
                fs.lstatSync(absPath).isFile() && Object.assign({ absPath, extension: path.extname(absPath), fileExists: true }, props)) ||
                undefined);
        default:
            // never
            return undefined;
    }
};
exports.resolveIfExists = resolveIfExists;
function fileLookup(props) {
    if (!props.fileDir && !props.filePath) {
        throw new Error('Failed to lookup. Provide either fileDir or filePath');
    }
    const jsFirst = props.javascriptFirst && !props.typescriptFirst;
    const base = path.normalize(props.filePath ? path.dirname(props.filePath) : props.fileDir);
    const subpathResolver = props.subPathResolver || exports.resolveIfExists;
    const target = props.target && path.normalize(props.target);
    return resolveSubmodule(base, target, subpathResolver, true, jsFirst, props.isBrowserBuild);
}
exports.fileLookup = fileLookup;
function resolveSubmodule(base, target, resolveSubpath, checkPackage, jsFirst, isBrowserBuild) {
    // If an exact file exists, return it
    const exactFile = resolveSubpath(base, target, 'file');
    if (exactFile) {
        return exactFile;
    }
    // If a file exists after adding an extension, return it
    const extensions = jsFirst ? JS_EXTENSIONS_FIRST : TS_EXTENSIONS_FIRST;
    for (const extension of extensions) {
        const withExtension = resolveSubpath(base, `${target}${extension}`, 'file');
        if (withExtension) {
            return withExtension;
        }
    }
    // If we should check for a package.json, do that
    // We don't always check because we might be here by following the "main" field from a previous package.json
    // and no further package.json files should be followed after that
    if (checkPackage) {
        const packageJSONPath = path.join(base, target, 'package.json');
        if (isFileSync(packageJSONPath)) {
            const packageJSON = JSON.parse(utils_1.readFile(packageJSONPath));
            if (isBrowserBuild && packageJSON['browser'] && typeof packageJSON['browser'] === 'string') {
                const browser = path.join(target, packageJSON['browser']);
                const subresolution = resolveSubmodule(base, browser, resolveSubpath, false, jsFirst, isBrowserBuild);
                return subresolution;
            }
            // NOTE: the implementation of "local:main" has a couple of flaws
            //         1. the isLocal test is fragile and won't work in Yarn 2
            //         2. it is incorrect to simply assume that the tsconfig at the root of the package is the right one
            //       a more robust solution would be to use tsconfig references which can map outputs to inputs
            //       and then you can just "main" instead of "local:main" and the output will be mapped to the input
            //       and tsconfig references also solve the "which tsconfig to use?" problem
            const isLocal = !/node_modules/.test(packageJSONPath);
            if (isLocal && packageJSON['local:main']) {
                const localMain = path.join(target, packageJSON['local:main']);
                const subresolution = resolveSubmodule(base, localMain, resolveSubpath, false, jsFirst, isBrowserBuild);
                // TODO: not used?
                const submodules = path.resolve(base, path.join(target, 'node_modules'));
                const monorepoModulesPaths = utils_1.fileExists(submodules) ? submodules : undefined;
                return Object.assign(Object.assign({}, subresolution), { customIndex: true, isDirectoryIndex: true, 
                    // TODO: not used?
                    monorepoModulesPaths, tsConfigAtPath: loadTsConfig(path.join(base, target)) });
            }
            if (packageJSON['ts:main']) {
                const tsMain = path.join(target, packageJSON['ts:main']);
                const subresolution = resolveSubmodule(base, tsMain, resolveSubpath, false, jsFirst, isBrowserBuild);
                if (subresolution.fileExists) {
                    return Object.assign(Object.assign({}, subresolution), { customIndex: true, isDirectoryIndex: true });
                }
            }
            if (packageJSON['module']) {
                const mod = path.join(target, packageJSON['module']);
                const subresolution = resolveSubmodule(base, mod, resolveSubpath, false, jsFirst, isBrowserBuild);
                if (subresolution.fileExists) {
                    return Object.assign(Object.assign({}, subresolution), { customIndex: true, isDirectoryIndex: true });
                }
            }
            if (packageJSON['main']) {
                const main = path.join(target, packageJSON['main']);
                const subresolution = resolveSubmodule(base, main, resolveSubpath, false, jsFirst, isBrowserBuild);
                if (subresolution.fileExists) {
                    return Object.assign(Object.assign({}, subresolution), { customIndex: true, isDirectoryIndex: true });
                }
            }
            // We do not look for index.js (etc.) here
            // Because we always look for those whether we are checking package.json or not
            // So that's done outside the if.
        }
    }
    // If an index file exists return it
    for (const extension of extensions) {
        const asIndex = resolveSubpath(base, path.join(target, `index${extension}`), 'file', {
            isDirectoryIndex: true,
        });
        if (asIndex) {
            return asIndex;
        }
    }
    const asJson = resolveSubpath(base, `${target}.json`, 'file', {
        customIndex: true,
    });
    if (asJson) {
        return asJson;
    }
    return {
        absPath: path.join(base, target),
        fileExists: false,
    };
}
function loadTsConfig(packageDir) {
    const tsConfig = path.resolve(packageDir, 'tsconfig.json');
    if (isFileSync(tsConfig)) {
        const tsConfigParsed = parseTypescriptConfig_1.parseTypescriptConfig(tsConfig);
        if (!tsConfigParsed.error) {
            return {
                absPath: packageDir,
                compilerOptions: tsConfigParsed.config.compilerOptions,
                tsconfigPath: tsConfig,
            };
        }
    }
}
