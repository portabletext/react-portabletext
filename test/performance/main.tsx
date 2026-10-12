import {
  PortableText,
  type PortableTextComponentProps,
  type PortableTextComponents,
} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'
import {flushSync} from 'react-dom'
import {createRoot} from 'react-dom/client'

import {cases, paragraph} from './cases'

const fixture = document.querySelector<HTMLDivElement>('#fixture')!
const results = document.querySelector<HTMLPreElement>('#results')!
const button = document.querySelector<HTMLButtonElement>('#run')!

function median(samples: number[]) {
  return [...samples].sort((a, b) => a - b)[Math.floor(samples.length / 2)]!
}

function measure(value: PortableTextBlock[]) {
  let renders = 0
  const recordRender = () => {
    renders += 1
  }
  function Block({children}: PortableTextComponentProps<PortableTextBlock>) {
    recordRender()
    return <p>{children}</p>
  }
  function ListItem({children}: PortableTextComponentProps<PortableTextBlock>) {
    recordRender()
    return <li>{children}</li>
  }
  const components: PortableTextComponents = {block: Block, listItem: ListItem}
  const rows = []
  for (const scenario of [
    'defaultMount',
    'mount',
    'sameProps',
    'newArray',
    'oneEdit',
    'prepend',
    'deleteFirst',
    'recreate',
    'newComponents',
  ]) {
    const samples: number[] = []
    const counts: number[] = []
    for (let run = 0; run < 25; run++) {
      const root = createRoot(fixture)
      try {
        if (scenario !== 'mount' && scenario !== 'defaultMount') {
          flushSync(() => root.render(<PortableText value={value} components={components} />))
        }
        let next =
          scenario === 'recreate'
            ? structuredClone(value)
            : scenario === 'newArray' || scenario === 'oneEdit'
              ? [...value]
              : value
        if (scenario === 'oneEdit') {
          const index = Math.floor(next.length / 2)
          const original = next[index]!
          next[index] = {
            ...original,
            children: [
              ...original.children,
              {_type: 'span', _key: 'edit', text: 'Edited', marks: []},
            ],
          }
        }
        if (scenario === 'prepend') next = [paragraph('inserted', 'Inserted'), ...value]
        if (scenario === 'deleteFirst') next = value.slice(1)
        const overrides =
          scenario === 'defaultMount'
            ? undefined
            : scenario === 'newComponents'
              ? {...components}
              : components
        renders = 0
        const start = performance.now()
        flushSync(() => root.render(<PortableText value={next} components={overrides} />))
        const elapsed = performance.now() - start
        if (run >= 5) {
          samples.push(elapsed)
          counts.push(renders)
        }
      } finally {
        flushSync(() => root.unmount())
      }
    }
    rows.push({
      scenario,
      medianMs: median(samples),
      renders: scenario === 'defaultMount' ? undefined : median(counts),
    })
  }
  return rows
}

button.addEventListener('click', async () => {
  button.disabled = true
  delete results.dataset['status']
  results.textContent = 'Running'
  try {
    const timings: Record<string, ReturnType<typeof measure>> = {}
    for (const [name, value] of Object.entries(cases)) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      timings[name] = measure(value)
      results.textContent = JSON.stringify({timings}, null, 2)
    }
    results.dataset['status'] = 'passed'
  } catch (error) {
    results.textContent = error instanceof Error ? error.stack || error.message : String(error)
    results.dataset['status'] = 'failed'
  } finally {
    button.disabled = false
  }
})
