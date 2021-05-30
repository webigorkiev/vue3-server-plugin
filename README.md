<h1 align="center"> vue3-server-plugin </h1>
<p align="center">
  <b >The server config is meant for generating the server bundle that will be passed to createBundleRenderer</b>
</p>

## Features

* webpack 5
* vue3
* source-map

## Usage

```javascript
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseConfig = require('./webpack.base.config.js')
const VueSSRServerPlugin = require('vue3-server-plugin')

module.exports = merge(baseConfig, {
  entry: '/path/to/entry-server.js',
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2'
  },
  externals: nodeExternals({
    whitelist: /\.css$/
  }),
  plugins: [
    new VueSSRServerPlugin()
  ]
})

```