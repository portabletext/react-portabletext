import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'source',
          typecheck: {
            enabled: true,
            ignoreSourceErrors: true,
          },
        },
      },
      {
        // Runs the same tests against `src` compiled with the React Compiler, like the published
        // `default` build. Test files themselves are left uncompiled. The plugin only compiles
        // client modules, hence the browser-like environment.
        plugins: react({include: /[\\/]src[\\/].*\.tsx?$/, compiler: {target: '19'}}).filter(
          (plugin) => plugin.name === 'vite:react-compiler',
        ),
        test: {
          name: 'compiled',
          environment: 'jsdom',
          env: {PORTABLETEXT_REACT_COMPILED: 'true'},
        },
      },
    ],
  },
})
