const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  stats: {
    colors: true,
    chunks: false
  },
  entry: ["react-hot-loader/patch", "./src/index.js"],
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/"
  },
  devServer: {
    contentBase: "./dist",
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(["dist"]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      filename: "index.html"
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)?$/,
        include: [path.join(__dirname, "./src")],
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        include: [path.join(__dirname, "./src")],
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              localIdentName: "[name]_[local]_[hash:base64:3]"
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: loader => [
                require("postcss-import")({ root: loader.resourcePath }),
                require("precss")(),
                require("autoprefixer")()
              ]
            }
          }
        ]
      }
    ]
  }
};
