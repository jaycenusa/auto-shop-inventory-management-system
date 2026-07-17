require('dotenv').config()

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')

/** @param {import('webpack').Configuration} env */
/** @param {{ mode?: string }} argv */
module.exports = (env, argv) => {
  const isDev = argv.mode === 'development'
  // Project Pages base path; override with PUBLIC_PATH=/ for custom domains / root hosting
  const publicPath =
    process.env.PUBLIC_PATH ??
    (isDev ? '/' : '/auto-shop-inventory-management-system/')
  // webpack-cli sets WEBPACK_SERVE when using `webpack serve`
  const isServe = process.env.WEBPACK_SERVE === 'true'
  // MiniCssExtractPlugin breaks HMR and can show errors in the browser overlay when serving
  const extractCss = !isDev && !isServe

  return {
    entry: './src/main.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? '[name].js' : '[name].[contenthash].js',
      assetModuleFilename: 'assets/[hash][ext][query]',
      clean: true,
      publicPath,
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    devtool: isDev ? 'inline-source-map' : 'source-map',
    devServer: {
      historyApiFallback: true,
      hot: isDev,
      liveReload: isDev,
      port: 3000,
      open: true,
      allowedHosts: 'all',
      proxy: [
        {
          context: ['/api'],
          target: 'http://localhost:3001',
        },
      ],
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              envName: isDev ? 'development' : 'production',
              plugins: isDev ? [require.resolve('react-refresh/babel')] : [],
            },
          },
        },
        {
          test: /\.css$/i,
          use: [
            extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        GOOGLE_CLIENT_ID: JSON.stringify(process.env.GOOGLE_CLIENT_ID ?? ''),
        AWS_REGION: JSON.stringify(process.env.AWS_REGION ?? ''),
        AWS_USER_POOL_ID: JSON.stringify(process.env.AWS_USER_POOL_ID ?? ''),
        AWS_USER_POOL_CLIENT_ID: JSON.stringify(
          process.env.AWS_USER_POOL_CLIENT_ID ?? '',
        ),
        AWS_COGNITO_DOMAIN: JSON.stringify(process.env.AWS_COGNITO_DOMAIN ?? ''),
        AWS_REDIRECT_SIGN_IN: JSON.stringify(
          process.env.AWS_REDIRECT_SIGN_IN ?? 'http://localhost:3000/',
        ),
        AWS_REDIRECT_SIGN_OUT: JSON.stringify(
          process.env.AWS_REDIRECT_SIGN_OUT ??
            process.env.AWS_REDIRECT_SIGN_IN ??
            'http://localhost:3000/',
        ),
      }),
      new HtmlWebpackPlugin({
        template: './index.html',
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'public', to: '.' }],
      }),
      extractCss &&
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        }),
      isDev && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
  }
}
