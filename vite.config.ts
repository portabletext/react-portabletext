import path from 'path'
import {defineConfig} from 'vite'
import dts from '@rexxars/vite-dts'
import {visualizer} from 'rollup-plugin-visualizer'

const pkg = require('./package.json')

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      name: 'react-portable-text',
      fileName: (format) => {
        const ext = format === 'es' ? 'mjs' : 'js'
        return `react-portable-text.${ext}`
      },
    },
    rollupOptions: {
      external: ['react', '@portabletext/toolkit', '@portabletext/types'],
      output: {
        // Since we publish our ./src folder, there's no point in bloating sourcemaps with another copy of it.
        sourcemapExcludeSources: true,
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts(),
    visualizer({
      filename: path.join(__dirname, 'dist', 'stats.html'),
      gzipSize: true,
      title: `${pkg.name}@${pkg.version} bundle analysis`,
    }),
  ],
})
