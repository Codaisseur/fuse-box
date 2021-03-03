"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparky = exports.pluginWebWorker = exports.pluginStylus = exports.pluginSass = exports.pluginReplace = exports.pluginRaw = exports.pluginPostCSS = exports.pluginMinifyHtmlLiterals = exports.pluginLink = exports.pluginLess = exports.pluginJSON = exports.pluginCustomTransform = exports.pluginCSSInJSX = exports.pluginCSS = exports.pluginConsolidate = exports.pluginAngular = exports.fusebox = exports.coreTransformerList = exports.testTransform = void 0;
var testUtils_1 = require("./compiler/testUtils");
Object.defineProperty(exports, "testTransform", { enumerable: true, get: function () { return testUtils_1.initCommonTransform; } });
var transformer_1 = require("./compiler/transformer");
Object.defineProperty(exports, "coreTransformerList", { enumerable: true, get: function () { return transformer_1.BASE_TRANSFORMERS; } });
var fusebox_1 = require("./core/fusebox");
Object.defineProperty(exports, "fusebox", { enumerable: true, get: function () { return fusebox_1.fusebox; } });
var plugin_angular_1 = require("./plugins/core/plugin_angular");
Object.defineProperty(exports, "pluginAngular", { enumerable: true, get: function () { return plugin_angular_1.pluginAngular; } });
var plugin_consolidate_1 = require("./plugins/core/plugin_consolidate");
Object.defineProperty(exports, "pluginConsolidate", { enumerable: true, get: function () { return plugin_consolidate_1.pluginConsolidate; } });
var plugin_css_1 = require("./plugins/core/plugin_css");
Object.defineProperty(exports, "pluginCSS", { enumerable: true, get: function () { return plugin_css_1.pluginCSS; } });
var plugin_css_in_jsx_1 = require("./plugins/core/plugin_css_in_jsx");
Object.defineProperty(exports, "pluginCSSInJSX", { enumerable: true, get: function () { return plugin_css_in_jsx_1.pluginCSSInJSX; } });
var plugin_customtransform_1 = require("./plugins/core/plugin_customtransform");
Object.defineProperty(exports, "pluginCustomTransform", { enumerable: true, get: function () { return plugin_customtransform_1.pluginCustomTransform; } });
var plugin_json_1 = require("./plugins/core/plugin_json");
Object.defineProperty(exports, "pluginJSON", { enumerable: true, get: function () { return plugin_json_1.pluginJSON; } });
var plugin_less_1 = require("./plugins/core/plugin_less");
Object.defineProperty(exports, "pluginLess", { enumerable: true, get: function () { return plugin_less_1.pluginLess; } });
var plugin_link_1 = require("./plugins/core/plugin_link");
Object.defineProperty(exports, "pluginLink", { enumerable: true, get: function () { return plugin_link_1.pluginLink; } });
var plugin_minify_html_literals_1 = require("./plugins/core/plugin_minify_html_literals");
Object.defineProperty(exports, "pluginMinifyHtmlLiterals", { enumerable: true, get: function () { return plugin_minify_html_literals_1.pluginMinifyHtmlLiterals; } });
var plugin_postcss_1 = require("./plugins/core/plugin_postcss");
Object.defineProperty(exports, "pluginPostCSS", { enumerable: true, get: function () { return plugin_postcss_1.pluginPostCSS; } });
var plugin_raw_1 = require("./plugins/core/plugin_raw");
Object.defineProperty(exports, "pluginRaw", { enumerable: true, get: function () { return plugin_raw_1.pluginRaw; } });
var plugin_replace_1 = require("./plugins/core/plugin_replace");
Object.defineProperty(exports, "pluginReplace", { enumerable: true, get: function () { return plugin_replace_1.pluginReplace; } });
var plugin_sass_1 = require("./plugins/core/plugin_sass");
Object.defineProperty(exports, "pluginSass", { enumerable: true, get: function () { return plugin_sass_1.pluginSass; } });
var plugin_stylus_1 = require("./plugins/core/plugin_stylus");
Object.defineProperty(exports, "pluginStylus", { enumerable: true, get: function () { return plugin_stylus_1.pluginStylus; } });
var plugin_web_worker_1 = require("./plugins/webworker/plugin_web_worker");
Object.defineProperty(exports, "pluginWebWorker", { enumerable: true, get: function () { return plugin_web_worker_1.pluginWebWorker; } });
var sparky_1 = require("./sparky/sparky");
Object.defineProperty(exports, "sparky", { enumerable: true, get: function () { return sparky_1.sparky; } });
