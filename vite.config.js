const path = require('path')
const {defineConfig} = require('vite')
const dts = require('vite-dts').default
const {visualizer} = require('rollup-plugin-visualizer')
const pkg = require('./package.json')

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['esm', 'cjs'],
      name: 'react-portable-text',
      fileName: (format) => `react-portable-text.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
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
