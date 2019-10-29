const path = require("path");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];
const webpack = require("webpack");

const merge = require("lodash.merge");
const nodeExternals = require("webpack-node-externals");
const TARGET_NODE = process.env.WEBPACK_TARGET === "node";
const VueSSRServerPlugin = require("vue-server-renderer/server-plugin");
const VueSSRClientPlugin = require("vue-server-renderer/client-plugin");

function resolve(dir) {
  return path.join(__dirname, ".", dir);
}

const NODE_ENV = process.env.NODE_ENV;

module.exports = {
  configureWebpack: {
    output: {},
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        "@": resolve("src"),
        vue$: "vue/dist/vue.esm.js"
      }
    },
    externals: {
      // 'vue': 'Vue'
    },
    plugins: [
      new CompressionWebpackPlugin({
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240,
        minRatio: 0.8
      }),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ]
  },

  devServer: {
    clientLogLevel: "warning",
    compress: true,
    // contentBase: false, // since we use CopyWebpackPlugin.
    // host: '192.168.6.40',
    hot: true,
    open: true,
    openPage: "",
    port: "9888",
    disableHostCheck: true,
    overlay: {
      warnings: true,
      errors: true
    },
    proxy: {
      "/api": {
        target: `https://${process.env.VUE_APP_PROXY}`,
        changeOrigin: true
      }
    }
  },

  css: {
    loaderOptions: {
      sass: {
        // data: '@import "styles/mixin/index.scss";'
      }
    }
  },

  chainWebpack: config => {
    config
      .entry("app")
      .clear()
      .add("./src/entry-client.js")
      .end();

    config.module
      .rule("vue")
      .use("vue-loader")
      .tap(options => {
        merge(options, {
          optimizeSSR: false
        });
      });

    config.plugins
      // Delete plugins that are unnecessary/broken in SSR & add Vue SSR plugin
      .delete("pwa")
      .end()
      .plugin("vue-ssr")
      .use(TARGET_NODE ? VueSSRServerPlugin : VueSSRClientPlugin)
      .end();

    if (TARGET_NODE) {
      config
        .entry("app")
        .clear()
        .add("./src/entry-server.js")
        .end()
        .target("node")
        .devtool("source-map")
        .externals(nodeExternals({ whitelist: /\.css$/ }))
        .output.filename("server-bundle.js")
        .libraryTarget("commonjs2")
        .end()
        .optimization.splitChunks({})
        .end()
        .plugins.delete("named-chunks")
        .delete("hmr")
        .delete("workbox");
    }

    if (NODE_ENV !== "development") {
      config.optimization.splitChunks({});
    }
  },
  assetsDir: undefined,
  runtimeCompiler: undefined,
  productionSourceMap: false,
  parallel: undefined,
  publicPath: "./"
};
