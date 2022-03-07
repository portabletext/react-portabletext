import path from 'path'
import {defineConfig} from 'vite'
import {visualizer} from 'rollup-plugin-visualizer'

const pkg = require('./package.json')

export default defineConfig({
  plugins: [
    visualizer({
      filename: path.join(__dirname, 'demo', 'dist', 'stats.html'),
      gzipSize: true,
      title: `${pkg.name}@${pkg.version} demo bundle analysis`,
    }),
  ],
})
