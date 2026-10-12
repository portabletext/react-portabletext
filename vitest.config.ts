import react from '@vitejs/plugin-react'
import {configDefaults, defineConfig} from 'vitest/config'

const compiledTests = ['test/compiled-reuse.test.tsx']

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      ignoreSourceErrors: true,
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'source',
          exclude: [...configDefaults.exclude, ...compiledTests],
        },
      },
      {
        extends: true,
        // Match the production compiler without compiling the test components themselves.
        plugins: react({include: /\/src\/.*\.tsx?$/, compiler: {target: '19'}}).filter(
          (plugin) => plugin.name === 'vite:react-compiler',
        ),
        test: {
          name: 'compiled',
          include: compiledTests,
          environment: 'jsdom',
          typecheck: {enabled: false},
          benchmark: {include: []},
        },
      },
    ],
  },
})
