# Hello Mobify!

"Hello World" example of an app that will run on the Mobify runtime.

To deploy, you'll need a Mobify API key: https://cloud.mobify.com/account/

From there, create a file `~/.mobify`:

```json
{
    "username": "john@example.com",
    "api_key": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
}
```

Confirm you can access test project: https://beta.mobifyplatform.com/mobify/hello-mobify

After that you can get things running locally:

```bash
# Use Node 12.x to run:
nvm use 12
npm ci

# Show available commands:
npm run

# Run locally, available on localhost:3000
npm start

# Create the "bundle" the release artifact used by the Mobify Runtime
npm run bundle

# Upload the built bundle to Mobify Cloud
npm run upload

# Build, upload and deploy the current code to Mobify Cloud
npm run deploy
```

You should be able to see your changes here:

https://hello-mobify-production.mobify-storefront.com/