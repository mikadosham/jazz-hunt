const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new WorkboxWebpackPlugin.InjectManifest({
          swSrc: "./src/service-worker.js", // Path to your custom service worker
          swDest: "service-worker.js", // Output name of the service worker
        }),
      ],
    },
  },
};
