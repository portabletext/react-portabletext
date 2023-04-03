import path from 'path'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vite'
import {visualizer} from 'rollup-plugin-visualizer'

const pkg = require('./package.json')

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: path.join(__dirname, 'demo', 'dist', 'stats.html'),
      gzipSize: true,
      title: `${pkg.name}@${pkg.version} demo bundle analysis`,
    }),
  ],
})
