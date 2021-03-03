"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuild = void 0;
const bundle_1 = require("../bundle/bundle");
const bundleRouter_1 = require("../bundle/bundleRouter");
const server_1 = require("../devServer/server");
const ServerEntry_1 = require("../production/module/ServerEntry");
const createBuild = async (props) => {
    const { bundleContext, ctx, entries, modules, rebundle, splitEntries } = props;
    const router = bundleRouter_1.createBundleRouter({ ctx, entries });
    await router.init(modules);
    router.generateBundles(modules);
    if (splitEntries && splitEntries.entries.length > 0) {
        router.generateSplitBundles(splitEntries.entries);
    }
    const bundles = await router.writeBundles();
    // create a server bundle if we have more than 1 bundle in a server setup
    if (ctx.config.target === 'server' || ctx.config.target === 'electron') {
        const indexedTypes = [bundle_1.BundleType.JS_APP, bundle_1.BundleType.JS_VENDOR];
        let indexedAmount = 0;
        for (const item of bundles) {
            if (indexedTypes.includes(item.bundle.type))
                indexedAmount++;
        }
        if (indexedAmount > 1)
            bundles.push(await ServerEntry_1.createServerEntry(ctx, bundles));
    }
    // write the manifest
    const manifest = await router.writeManifest(bundles);
    if (bundleContext.cache && ctx.config.isDevelopment)
        await bundleContext.cache.write();
    ctx.isWorking = false;
    const onCompleteHandler = {
        get electron() {
            return server_1.createServerProcess({ bundles, ctx, processName: require('electron') });
        },
        get server() {
            return server_1.createServerProcess({ bundles, ctx, processName: 'node' });
        },
    };
    const response = {
        bundleContext,
        bundles,
        entries,
        manifest,
        modules,
        onComplete: handler => handler(onCompleteHandler),
        onWatch: userFn => {
            userFn(bundles);
            ctx.ict.on('rebundle', () => userFn(bundles));
        },
    };
    ctx.ict.sync(rebundle ? 'rebundle' : 'complete', response);
    return response;
};
exports.createBuild = createBuild;
