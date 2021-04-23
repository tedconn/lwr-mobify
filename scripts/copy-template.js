/**
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */
require("colors");

const cpx = require("cpx");
const watch = process.argv.includes("--watch");

const { log } = console;

function copy(src, dest) {
    if (watch) {
        const watcher = cpx.watch(src, dest);
        let ready = false;
        watcher.on("watch-ready", () => {
            ready = true;
            log(`Done copying ${src} to ${dest}`);
            log(`Watching ${src} for changes...`.green);
        });
        watcher.on("watch-error", (err) => {
            log(`Error watching ${src}: ${err}`.red);
        });
        watcher.on("copy", (event) => {
            if (ready) {
                log(`Copied ${event.srcPath} to ${event.dstPath}`);
            }
        });
        watcher.on("remove", (event) => {
            log(`Removed ${event.path}`);
        });
    } else {
        cpx.copy(src, dest, () => {
            log(`Done copying ${src} to ${dest}`);
        });
    }
}

copy("src/modules/**/*", "dist/src/modules");
copy("src/partials/**/*", "dist/src/partials");
copy("src/views/**/*", "dist/src/views");
copy("src/public/**/*", "dist");

copy("src/branding.json", "dist/src/");
copy("src/index.html", "dist/src/");
copy("src/labels.json", "dist/src/");
copy("src/manifest.xml", "dist/src/");
copy("src/palette.xml", "dist/src/");
copy("src/routes.json", "dist/src/");
copy("src/theme.json", "dist/src/");

copy("scoped/**/*", "dist/scoped");
copy("package.json", "dist");
copy("lwc.config.json", "dist");
