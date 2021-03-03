"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryLoadExtendedTsConfig = void 0;
const parseTypescriptConfig_1 = require("./parseTypescriptConfig");
const path = require("path");
const tryLoadExtendedTsConfig = (tsConfigDir, tsExtends) => {
    let extendedPath = path.resolve(tsConfigDir, tsExtends);
    let extendedConfig = parseTypescriptConfig_1.parseTypescriptConfig(extendedPath);
    /**
     * If 'extends' references a tsconfig file in a 'node_module', the above will fail.
     * In this case, Trying using require.resolve to find the path to the tsconfig in
     * a 'node_module'.
     */
    if (extendedConfig.error) {
        extendedPath = require.resolve(tsExtends, { paths: [tsConfigDir, process.cwd()] });
        extendedConfig = parseTypescriptConfig_1.parseTypescriptConfig(extendedPath);
    }
    return [extendedConfig, extendedPath];
};
exports.tryLoadExtendedTsConfig = tryLoadExtendedTsConfig;