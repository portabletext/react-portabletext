import {fileURLToPath} from 'node:url'

import {defineConfig} from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@portabletext/react':
        process.env['PORTABLETEXT_BENCHMARK_ENTRY'] ||
        fileURLToPath(new URL('../../dist/index.js', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
})
