const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  entry: './src',
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  plugins: [
    new NodePolyfillPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/_redirects', to: '' },
        {
          from: 'src/assets/images/favicon.png',
          to: 'favicon.png',
        },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser.js',
    }),
    new webpack.DefinePlugin({
      process: {
        env: {
          DEFAULT_RITUAL_ID: JSON.stringify(process.env.DEFAULT_RITUAL_ID),
          DEFAULT_DOMAIN: JSON.stringify(process.env.DEFAULT_DOMAIN),
        },
      },
    }),
  ].filter(Boolean),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        exclude: /node_modules/,
        options: {
          loader: 'tsx',
          target: 'es2018',
        },
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf|ico)$/,
        use: ['file-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      // ...config.resolve.fallback,
      // stream: require.resolve('stream-browserify'),
      // vm: require.resolve('vm-browserify'),
      // // crypto: false
      // // crypto
      crypto: require.resolve('crypto-browserify'),
    },
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'build'),
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2018',
      }),
    ],
  },
  devServer: {
    historyApiFallback: true,
    host: '127.0.0.1',
    liveReload: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  experiments: {
    asyncWebAssembly: true,
  },
};
