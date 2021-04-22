const { registerTemplateGenerators } = require('@communities-webruntime/services');
const {
    templateGenerators,
} = require('@communities-webruntime/template-generators-ui-lightning-community');
registerTemplateGenerators(...templateGenerators);

module.exports = {
  compiler: {
    isDesignMode: false,
  },
  locker: {
    isEnabled: false,
    trustedNamespaces: [],
  },
  api: {
    endpointUrl: "/api",
    httpHeaders: [],
    recordApiCalls: false,
  },
  templateDir: ".",
  basePath: "",
  port: process.env.PORT || 3000,
};
