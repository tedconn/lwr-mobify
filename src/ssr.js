// Entry point for the Mobify runtime. Not used for local development.
// This file must be called `ssr.js` and must export a Lambda Node.js compatible handler `get`:
// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html

const config = require('./config');
const awsServerlessExpress = require('aws-serverless-express')
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
const awsServer = awsServerlessExpress.createServer(server.app)

exports.get = (event, context) => awsServerlessExpress.proxy(awsServer, event, context)