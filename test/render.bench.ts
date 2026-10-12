import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'

import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {bench, describe, expect} from 'vitest'

import {cases} from './performance/cases'

// Benchmark built artifacts, not the source export used by the ordinary unit tests.
const entries = [
  ['current SSR', resolve('dist/index.js')],
  ['current server entry', resolve('dist/index.react-server.js')],
]
const baseline = process.env['PORTABLETEXT_BENCHMARK_BASELINE']
if (baseline) {
  entries.push(
    ['baseline SSR', resolve(baseline, 'index.js')],
    ['baseline server entry', resolve(baseline, 'index.react-server.js')],
  )
}

for (const [name, value] of Object.entries(cases)) {
  describe(name, async () => {
    let reference: string | undefined
    for (const [label, path] of entries) {
      const {PortableText} = (await import(
        /* @vite-ignore */ pathToFileURL(path!).href
      )) as typeof import('../src')
      const render = () => renderToStaticMarkup(createElement(PortableText, {value}))
      const html = render()
      reference ??= html
      expect(html).toBe(reference)
      bench(
        label!,
        () => {
          render()
        },
        {time: 1000, warmupTime: 200},
      )
    }
  })
}
