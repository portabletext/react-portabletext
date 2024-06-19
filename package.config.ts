/* eslint-disable no-console */
import {defineConfig} from '@sanity/pkg-utils'
import {visualizer} from 'rollup-plugin-visualizer'

import {name, version} from './package.json'

export default defineConfig({
  extract: {
    rules: {
      'ae-missing-release-tag': 'off',
      'tsdoc-undefined-tag': 'off',
    },
  },

  rollup: {
    plugins: [
      visualizer({
        emitFile: true,
        filename: 'stats.html',
        gzipSize: true,
        title: `${name}@${version} bundle analysis`,
      }),
    ],
  },

  babel: {
    plugins: ['@babel/plugin-transform-object-rest-spread'],
  },

  tsconfig: 'tsconfig.dist.json',

  reactCompilerOptions: {
    logger: {
      logEvent(filename, event) {
        if (event.kind === 'CompileError') {
          console.group(`[${filename}] ${event.kind}`)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const {reason, description, severity, loc, suggestions} = event.detail as any
          console.error(`[${severity}] ${reason}`)
          console.log(`${filename}:${loc.start?.line}:${loc.start?.column} ${description}`)
          console.log(suggestions)

          console.groupEnd()
        }
      },
    },
  },
})
