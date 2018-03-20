const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');


module.exports = {
  entry: ['react-hot-loader/patch', './src/index.js'],
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
  },

  plugins: [
    new CleanWebpackPlugin(['dist'], { exclude: ['CNAME', 'favicon.ico'] }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      favicon: 'favicon.ico',
    }),
    new webpack.ProvidePlugin({
      log: ['utils', 'log'],
      getParamByName: ['utils', 'getParameterByName'],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
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
        test: /\.(woff|woff2|eot|ttf|otf|png|svg)$/,
        use: {
          loader: 'file-loader',
        },
      },
      {
        test: /\.(html)$/,
        loader: 'html-loader',
      },
      {
        test: /(\.css$)/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.scss$/,
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
