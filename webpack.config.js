const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  stats: {
    colors: true,
    chunks: false,
  },
  entry: ['react-hot-loader/patch', './src/index.js'],
  devtool: 'inline-source-map',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ProvidePlugin({
      log: ['utils', 'log'],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      utils: path.resolve(__dirname, './src/app/utils/utils'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(jsx|js)?$/,
        include: [path.join(__dirname, './src')],
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.json$/,
        use: {
          loader: 'json-loader',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',
        },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
      {
        test: /\.scss$/,
        include: [path.join(__dirname, './src')],
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              camelCase: 'dashes',
              localIdentName: '[name]_[local]_[hash:base64:3]',
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: loader => [
                require('postcss-import')({ root: loader.resourcePath }),
                require('precss')(),
                require('autoprefixer')(),
              ],
            },
          },
        ],
      },
    ],
  },
};
