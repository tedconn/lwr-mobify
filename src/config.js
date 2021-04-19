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
  app: {
    defaultTemplate: "src/index.html",
  },
  templateDir: ".",
  basePath: "",
  port: process.env.PORT || 3000,
};
