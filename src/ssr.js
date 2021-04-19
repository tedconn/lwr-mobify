// Entry point for the Mobify runtime. Not used for local development.
// This file must be called `ssr.js` and must export a Lambda Node.js compatible handler `get`:
// https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html
const awsServerlessExpress = require('aws-serverless-express')

const awsServer = awsServerlessExpress.createServer(server.app)

exports.get = (event, context) => awsServerlessExpress.proxy(awsServer, event, context)