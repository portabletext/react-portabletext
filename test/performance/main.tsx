import {
  PortableText,
  type PortableTextComponentProps,
  type PortableTextComponents,
  type PortableTextProps,
} from '@portabletext/react'
import type {PortableTextBlock} from '@portabletext/types'
import {createContext, useContext, useState} from 'react'
import {flushSync} from 'react-dom'
import {createRoot, hydrateRoot} from 'react-dom/client'
import {renderToStaticMarkup} from 'react-dom/server'

import {cases, paragraph} from './cases'

const fixture = document.querySelector<HTMLDivElement>('#fixture')!
const results = document.querySelector<HTMLPreElement>('#results')!
const button = document.querySelector<HTMLButtonElement>('#run')!
const baseline = new URLSearchParams(location.search).has('baseline')

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message)
}

async function checkUpdates() {
  const root = createRoot(fixture)
  let renders = 0
  const recordRender = () => {
    renders += 1
  }
  let lookups = 0
  const block = (key: string, text: string) => {
    const value = paragraph(key, text, ['annotation'])
    value.markDefs = [{_type: 'label', _key: 'annotation'}]
    const find = value.markDefs.find.bind(value.markDefs)
    Object.defineProperty(value.markDefs, 'find', {
      value: (...args: Parameters<typeof find>) => {
        lookups += 1
        return find(...args)
      },
    })
    return value
  }
  const context = createContext('initial')
  function Block({children, index, value}: PortableTextComponentProps<PortableTextBlock>) {
    recordRender()
    const current = useContext(context)
    const [identity] = useState(value._key)
    return (
      <p data-index={index} data-identity={identity} data-context={current}>
        {children}
      </p>
    )
  }
  const components: PortableTextComponents = {
    block: Block,
    marks: {label: ({children, text}) => <span data-text={text}>{children}</span>},
  }
  const first = block('a', 'A')
  const second = block('b', 'B')
  let value = [first, second]
  const render = (props: PortableTextProps, contextValue = 'initial') =>
    flushSync(() =>
      root.render(
        <context.Provider value={contextValue}>
          <PortableText {...props} />
        </context.Provider>,
      ),
    )
  try {
    render({value, components})
    assert(renders === 2 && lookups === 2, 'initial render serializes both blocks')
    renders = 0
    lookups = 0
    render({value, components})
    assert(renders === 0 && lookups === 0, 'identical props reuse the entire tree')
    render({value: [...value], components})
    if (!baseline) assert(renders === 0 && lookups === 0, 'new array reuses unchanged blocks')

    renders = 0
    lookups = 0
    value = [first, block('b', 'Changed')]
    render({value, components})
    if (!baseline) assert(renders === 1 && lookups === 1, 'only the edited block is serialized')
    assert(fixture.textContent === 'AChanged', 'edited content is visible')
    render({value: structuredClone(value), components})
    assert(fixture.textContent === 'AChanged', 'recreated objects with the same keys are fresh')
    render({value, components})

    renders = 0
    lookups = 0
    const updatedComponents: PortableTextComponents = {
      ...components,
      marks: {label: ({text}) => <b>{text.toUpperCase()}</b>},
    }
    render({value, components: updatedComponents})
    assert(fixture.textContent === 'ACHANGED', 'component overrides invalidate rendered children')
    if (!baseline) assert(lookups === 0, 'presentation changes reuse prepared marks trees')
    render({value, components: updatedComponents}, 'updated')
    assert(
      [...fixture.querySelectorAll('p')].every((p) => p.dataset['context'] === 'updated'),
      'context consumers still update through reused elements',
    )

    render({value: [value[1]!, value[0]!], components})
    assert(fixture.querySelector('p')?.dataset['identity'] === 'b', 'keys preserve component state')
    assert(fixture.querySelector('p')?.dataset['index'] === '0', 'reordered indices update')

    let warnings = 0
    const unknown = [{_type: 'missing', _key: 'unknown'}]
    render({
      value: unknown,
      onMissingComponent: () => {
        warnings++
      },
    })
    render({
      value: unknown,
      onMissingComponent: () => {
        warnings += 10
      },
    })
    assert(warnings === 11, 'missing-component handler updates are not stale')
    render({value: unknown, onMissingComponent: false})
    assert(warnings === 11, 'warnings can be disabled after rendering')

    const list = [
      {...paragraph('one', 'One'), listItem: 'bullet', level: 1},
      {...paragraph('two', 'Two'), listItem: 'bullet', level: 2, style: 'h2'},
      {...paragraph('three', 'Three'), listItem: 'number', level: 1},
    ]
    for (const mode of ['html', 'direct'] as const) {
      for (const current of [list, list.slice(1), list.toReversed()]) {
        const props = {value: current, listNestingMode: mode}
        render(props)
        const expected = document.createElement('div')
        expected.innerHTML = renderToStaticMarkup(<PortableText {...props} />)
        assert(fixture.innerHTML === expected.innerHTML, 'list edits match a fresh render')
      }
    }
    render({
      value: [{_type: 'custom', _key: 'a'}],
      components: {
        types: {
          custom: ({renderNode}) =>
            renderNode({
              node: paragraph('nested', 'Nested'),
              index: 7,
              isInline: true,
              renderNode,
            }),
        },
      },
    })
    assert(fixture.textContent === 'Nested', 'public renderNode remains synchronous and usable')
    for (const current of [null, undefined, [], paragraph('single', 'Single')]) {
      render({value: current})
      assert(
        fixture.textContent === (current && !Array.isArray(current) ? 'Single' : ''),
        'empty and single-block transitions render correctly',
      )
    }
  } finally {
    flushSync(() => root.unmount())
  }
  const hydrationValue = cases['marks']!.slice(0, 2)
  fixture.innerHTML = renderToStaticMarkup(<PortableText value={hydrationValue} />)
  const html = fixture.innerHTML
  const errors: unknown[] = []
  const hydrated = hydrateRoot(fixture, <PortableText value={hydrationValue} />, {
    onRecoverableError: (error) => errors.push(error),
  })
  try {
    await new Promise((resolve) => setTimeout(resolve, 50))
    assert(errors.length === 0 && fixture.innerHTML === html, 'SSR markup hydrates without errors')
    flushSync(() => hydrated.render(<PortableText value={[...hydrationValue]} />))
    assert(fixture.innerHTML === html, 'hydrated content supports subsequent updates')
  } finally {
    flushSync(() => hydrated.unmount())
  }
}

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
        const next =
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
    await checkUpdates()
    const timings: Record<string, ReturnType<typeof measure>> = {}
    for (const [name, value] of Object.entries(cases)) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      timings[name] = measure(value)
      results.textContent = JSON.stringify({checks: 'passed', timings}, null, 2)
    }
    results.dataset['status'] = 'passed'
  } catch (error) {
    results.textContent = error instanceof Error ? error.stack || error.message : String(error)
    results.dataset['status'] = 'failed'
  } finally {
    button.disabled = false
  }
})
