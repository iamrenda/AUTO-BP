const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "src/main.ts"), // Entry point of your script
  mode: "production",
  target: ["es2020"],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
  },
  output: {
    filename: "main.js", // Output filename for the bundled code
    path: path.resolve(__dirname, "scripts"),
  },
  experiments: {
    outputModule: true,
  },
  resolve: { extensions: [".ts", ".js"] },
  externalsType: "module",
  externals: {
    "@minecraft/server": "@minecraft/server",
    "@minecraft/server-ui": "@minecraft/server-ui",
    "@minecraft/server-gametest": "@minecraft/server-gametest",
    "@minecraft/server-common": "@minecraft/server-common",
    "@minecraft/debug-utilities": "@minecraft/debug-utilities",
  },
};
