const path = require('path')
const {defineConfig} = require('vite')
const {visualizer} = require('rollup-plugin-visualizer')
const pkg = require('./package.json')

module.exports = defineConfig({
  plugins: [
    visualizer({
      filename: path.join(__dirname, 'demo', 'dist', 'stats.html'),
      gzipSize: true,
      title: `${pkg.name}@${pkg.version} demo bundle analysis`,
    }),
  ],
})
