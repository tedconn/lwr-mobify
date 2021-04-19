// Shared entry point for local dev and while running in MR.
const config = require('./config');
const { Server } = require('@webruntime/server');

const server = new Server({
    config: {
        projectDir: config.templateDir,
        server: {
            basePath: config.basePath,
            port: config.port,
        },
    },
    configFiles: [require.resolve('@communities-webruntime/app')],
    additionalProperties: {
        compiler: config.compiler,
        locker: config.locker,
        api: config.api
    }
});
server.initialize();

module.exports = server