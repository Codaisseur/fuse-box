"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtendedTsConfig = void 0;
const path = require("path");
const tryLoadExtendedTsConfig_1 = require("./tryLoadExtendedTsConfig");
const merge = require('lodash.merge');
/**
 * Recursively loads the tsconfigs extended, and returns the resulting settings
 * merged sequentially.
 *
 * Does not mutate the original rawTsConfig.
 *
 * @param rawTsConfig The tsConfig result to load extended tsconfigs from.
 * @param tsConfigDirectory The directory containing 'rawTsConfig'.
 */
const getExtendedTsConfig = (rawTsConfig, tsConfigDirectory) => {
    if (!rawTsConfig.config)
        return [rawTsConfig, tsConfigDirectory];
    const tsConfig = rawTsConfig.config;
    if (!tsConfig.extends)
        return [rawTsConfig, tsConfigDirectory];
    const [extendedConfig, extendedPath] = tryLoadExtendedTsConfig_1.tryLoadExtendedTsConfig(tsConfigDirectory, tsConfig.extends);
    /**
     * If we still have an error, then probably the extends path is wrong. Return the error.
     */
    if (extendedConfig.error)
        return [extendedConfig, extendedPath];
    const [resolvedBase, resolvedPath] = exports.getExtendedTsConfig(extendedConfig, path.dirname(extendedPath));
    return [merge({}, resolvedBase, rawTsConfig), resolvedPath];
};
exports.getExtendedTsConfig = getExtendedTsConfig;