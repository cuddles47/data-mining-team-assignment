const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './web/app.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      "events": require.resolve("events/")
    }
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist/web'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "web/index.html", to: "" },
        { from: "web/styles.css", to: "" },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/web'),
    },
    compress: true,
    port: 9000,
  },
};
