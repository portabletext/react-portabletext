import path from 'path'

import react from '@vitejs/plugin-react'
import {visualizer} from 'rollup-plugin-visualizer'
import {defineConfig} from 'vite'

const pkg = require('./package.json')

export default defineConfig({
  plugins: [
    react({babel: {plugins: [['babel-plugin-react-compiler', {target: '19'}]]}}),
    visualizer({
      filename: path.join(__dirname, 'demo', 'dist', 'stats.html'),
      gzipSize: true,
      title: `${pkg.name}@${pkg.version} demo bundle analysis`,
    }),
  ],
})
