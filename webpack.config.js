const path = require('path');

module.exports = {
  // …your existing config…
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',        // allow any host
    hot: true,
    historyApiFallback: true,
    client: {
      // webpack 5+ socket config
      webSocketURL: 'auto'
    },
    // for older webpack‑dev‑server versions:
    disableHostCheck: true      // turn off host validation
  },
  // …rest of your config…
}; 