import {
  PortableText,
  type NodeRenderer,
  type PortableTextBlock,
  type PortableTextComponentProps,
  type PortableTextComponents,
  type PortableTextProps,
  type ReactPortableTextList,
} from '@portabletext/react'
import {buildMarksTree, nestLists} from '@portabletext/toolkit'
import {act, createContext, useContext, type ReactNode} from 'react'
import {createRoot, hydrateRoot, type Root} from 'react-dom/client'
import {renderToString} from 'react-dom/server'
import {afterEach, beforeEach, expect, test, vi} from 'vitest'

vi.mock('@portabletext/toolkit', async (importOriginal) => {
  const toolkit = await importOriginal<typeof import('@portabletext/toolkit')>()
  return {
    ...toolkit,
    buildMarksTree: vi.fn(toolkit.buildMarksTree),
    nestLists: vi.fn(toolkit.nestLists),
  }
})

interface CustomBlock {
  _type: 'custom'
  _key: string
  text: string
}

function custom(_key: string, text = _key): CustomBlock {
  return {_type: 'custom', _key, text}
}

function marked(_key: string, text = _key, mark = 'strong'): PortableTextBlock {
  return {
    _type: 'block',
    _key,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `${_key}-span`, text, marks: [mark]}],
  }
}

let container: HTMLDivElement
let root: Root | undefined

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div')
  document.body.append(container)
  vi.clearAllMocks()
})

afterEach(async () => {
  await act(async () => root?.unmount())
  root = undefined
  container.remove()
  vi.unstubAllGlobals()
})

async function render(node: ReactNode) {
  root ??= createRoot(container)
  await act(async () => root?.render(node))
}

async function renderPortableText(props: PortableTextProps) {
  await render(<PortableText {...props} />)
}

test('reuses custom blocks and the renderer across array replacement and a one-block edit', async () => {
  const calls = vi.fn<(key: string, renderNode: NodeRenderer) => void>()
  function Custom({value, renderNode}: PortableTextComponentProps<CustomBlock>) {
    calls(value._key, renderNode)
    return <p>{value.text}</p>
  }
  const components = {types: {custom: Custom}}
  const first = custom('first')
  const second = custom('second')
  const value = [first, second]

  await renderPortableText({value, components})
  expect(calls).toHaveBeenCalledTimes(2)
  const renderer = calls.mock.calls[0]![1]
  expect(calls.mock.calls[1]![1]).toBe(renderer)
  calls.mockClear()

  await renderPortableText({value, components})
  expect(calls).not.toHaveBeenCalled()
  await renderPortableText({value: [...value], components})
  expect(calls).not.toHaveBeenCalled()

  await renderPortableText({value: [first, {...second, text: 'edited'}], components})
  expect(calls).toHaveBeenCalledExactlyOnceWith('second', renderer)
  expect(container.innerHTML).toBe('<p>first</p><p>edited</p>')
  calls.mockClear()

  await renderPortableText({value: [custom('first'), custom('second')], components})
  expect(calls).toHaveBeenCalledTimes(2)
  expect(calls).toHaveBeenNthCalledWith(1, 'first', renderer)
  expect(calls).toHaveBeenNthCalledWith(2, 'second', renderer)
  expect(container.innerHTML).toBe('<p>first</p><p>second</p>')
})

test('prepares only an edited marked block and keeps the public renderer stable', async () => {
  const calls = vi.fn<(key: string | undefined, renderNode: NodeRenderer) => void>()
  function Block({value, children, renderNode}: PortableTextComponentProps<PortableTextBlock>) {
    calls(value._key, renderNode)
    return <p>{children}</p>
  }
  const components = {block: Block}
  const first = marked('first')
  const second = marked('second')
  const value = [first, second]
  await renderPortableText({value, components})
  expect(buildMarksTree).toHaveBeenCalledTimes(2)
  const renderer = calls.mock.calls[0]![1]
  vi.clearAllMocks()

  await renderPortableText({value: [...value], components})
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(calls).not.toHaveBeenCalled()

  const edited = marked('second', 'edited')
  await renderPortableText({value: [first, edited], components})
  expect(buildMarksTree).toHaveBeenCalledExactlyOnceWith(edited)
  expect(calls).toHaveBeenCalledExactlyOnceWith('second', renderer)
  expect(container.innerHTML).toBe('<p><strong>first</strong></p><p><strong>edited</strong></p>')
})

test('changes presentation without rebuilding unchanged marks trees', async () => {
  const value = [marked('first'), marked('second')]
  const firstComponents: PortableTextComponents = {
    marks: {strong: ({children}) => <em>{children}</em>},
  }
  const nextComponents: PortableTextComponents = {
    marks: {strong: ({children}) => <b>{children}</b>},
  }
  await renderPortableText({value, components: firstComponents})
  expect(buildMarksTree).toHaveBeenCalledTimes(2)
  expect(container.innerHTML).toBe('<p><em>first</em></p><p><em>second</em></p>')
  vi.clearAllMocks()

  await renderPortableText({value, components: nextComponents})
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(container.innerHTML).toBe('<p><b>first</b></p><p><b>second</b></p>')
})

test('keeps nested list containers stable when only components change', async () => {
  const calls = vi.fn<(value: ReactPortableTextList) => void>()
  function List({value, children}: PortableTextComponentProps<ReactPortableTextList>) {
    calls(value)
    return <ul>{children}</ul>
  }
  const value = [
    {...marked('first'), listItem: 'bullet', level: 1},
    {...marked('nested'), listItem: 'bullet', level: 2},
  ]
  const firstComponents: PortableTextComponents = {
    list: List,
    marks: {strong: ({children}) => <em>{children}</em>},
  }
  const nextComponents: PortableTextComponents = {
    list: List,
    marks: {strong: ({children}) => <b>{children}</b>},
  }
  await renderPortableText({value, components: firstComponents})
  expect(nestLists).toHaveBeenCalledTimes(1)
  expect(calls).toHaveBeenCalledTimes(2)
  const containers = calls.mock.calls.map(([list]) => list)
  vi.clearAllMocks()

  await renderPortableText({value, components: nextComponents})
  expect(nestLists).not.toHaveBeenCalled()
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(calls).toHaveBeenCalledTimes(2)
  expect(calls.mock.calls[0]![0]).toBe(containers[0])
  expect(calls.mock.calls[1]![0]).toBe(containers[1])
  expect(container.innerHTML).toBe('<ul><li><b>first</b><ul><li><b>nested</b></li></ul></li></ul>')
})

test('switches toolkit text overrides without preparing a marks tree for plain text', async () => {
  const block = marked('first')
  block.children[0]!.marks = []
  const value = [block]
  const firstComponents: PortableTextComponents = {
    types: {'@text': ({value: text}) => <i>{text.text}</i>},
  }
  const nextComponents: PortableTextComponents = {
    types: {'@text': ({value: text}) => <b>{text.text}</b>},
  }
  await renderPortableText({value})
  expect(container.innerHTML).toBe('<p>first</p>')
  await renderPortableText({value, components: firstComponents})
  expect(container.innerHTML).toBe('<p><i>first</i></p>')
  await renderPortableText({value, components: firstComponents})
  expect(container.innerHTML).toBe('<p><i>first</i></p>')
  await renderPortableText({value, components: nextComponents})
  expect(container.innerHTML).toBe('<p><b>first</b></p>')
  await renderPortableText({value})
  expect(container.innerHTML).toBe('<p>first</p>')
  expect(buildMarksTree).not.toHaveBeenCalled()
})

test('uses the changed missing-component handler without rebuilding marks trees', async () => {
  const value = [marked('first', 'unknown', 'missing')]
  const firstHandler = vi.fn()
  const nextHandler = vi.fn()
  await renderPortableText({value, onMissingComponent: firstHandler})
  expect(firstHandler).toHaveBeenCalledTimes(1)
  expect(buildMarksTree).toHaveBeenCalledTimes(1)
  vi.clearAllMocks()

  await renderPortableText({value, onMissingComponent: nextHandler})
  expect(firstHandler).not.toHaveBeenCalled()
  expect(nextHandler).toHaveBeenCalledExactlyOnceWith(expect.any(String), {
    type: 'missing',
    nodeType: 'mark',
  })
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(container.textContent).toBe('unknown')
})

test('updates custom-block indices after keyed reordering and insertion', async () => {
  function Custom({value, index}: PortableTextComponentProps<CustomBlock>) {
    return <p>{`${value.text}:${index}`}</p>
  }
  const components = {types: {custom: Custom}}
  const first = custom('first')
  const second = custom('second')
  await renderPortableText({value: [first, second], components})
  expect(container.innerHTML).toBe('<p>first:0</p><p>second:1</p>')
  const firstElement = container.children[0]
  const secondElement = container.children[1]

  await renderPortableText({value: [second, first], components})
  expect(container.innerHTML).toBe('<p>second:0</p><p>first:1</p>')
  expect(container.children[0]).toBe(secondElement)
  expect(container.children[1]).toBe(firstElement)
  await renderPortableText({value: [custom('inserted'), second, first], components})
  expect(container.innerHTML).toBe('<p>inserted:0</p><p>second:1</p><p>first:2</p>')
  expect(container.children[1]).toBe(secondElement)
  expect(container.children[2]).toBe(firstElement)

  await renderPortableText({value: [first], components})
  expect(container.innerHTML).toBe('<p>first:0</p>')
  expect(container.children[0]).toBe(firstElement)
})

test('updates marked-block indices without preparing unchanged blocks again', async () => {
  function Block({children, index}: PortableTextComponentProps<PortableTextBlock>) {
    return <p data-index={index}>{children}</p>
  }
  const components = {block: Block}
  const first = marked('first')
  const second = marked('second')
  await renderPortableText({value: [first, second], components})
  vi.clearAllMocks()

  await renderPortableText({value: [second, first], components})
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(container.innerHTML).toBe(
    '<p data-index="0"><strong>second</strong></p><p data-index="1"><strong>first</strong></p>',
  )

  const inserted = marked('inserted')
  await renderPortableText({value: [inserted, second, first], components})
  expect(buildMarksTree).toHaveBeenCalledExactlyOnceWith(inserted)
  expect(container.innerHTML).toBe(
    '<p data-index="0"><strong>inserted</strong></p>' +
      '<p data-index="1"><strong>second</strong></p><p data-index="2"><strong>first</strong></p>',
  )
})

test('cached custom components still receive context updates', async () => {
  const Theme = createContext('light')
  function Custom({value}: PortableTextComponentProps<CustomBlock>) {
    const theme = useContext(Theme)
    return <p>{`${value.text}:${theme}`}</p>
  }
  const components = {types: {custom: Custom}}
  const value = [custom('first')]
  const content = <PortableText value={value} components={components} />
  await render(<Theme value="light">{content}</Theme>)
  expect(container.textContent).toBe('first:light')

  await render(<Theme value="dark">{content}</Theme>)
  expect(container.textContent).toBe('first:dark')
})

test.each(['html', 'direct'] as const)(
  'updates list content and switches nesting mode from %s',
  async (listNestingMode) => {
    const first = {...marked('first'), listItem: 'bullet', level: 1}
    const nested = {...marked('nested'), listItem: 'bullet', level: 2}
    const last = {...marked('last'), listItem: 'bullet', level: 1}
    const value = [first, nested, last]
    const html = (text: string) =>
      '<ul><li><strong>first</strong><ul><li><strong>' +
      `${text}</strong></li></ul></li><li><strong>last</strong></li></ul>`
    const direct = (text: string) =>
      '<ul><li><strong>first</strong></li><ul><li><strong>' +
      `${text}</strong></li></ul><li><strong>last</strong></li></ul>`
    const expected = listNestingMode === 'html' ? html : direct
    const switched = listNestingMode === 'html' ? direct : html

    await renderPortableText({value, listNestingMode})
    expect(container.innerHTML).toBe(expected('nested'))
    const edited = {...nested, children: marked('nested', 'edited').children}
    const nextValue = [first, edited, last]
    await renderPortableText({value: nextValue, listNestingMode})
    expect(container.innerHTML).toBe(expected('edited'))

    await renderPortableText({
      value: nextValue,
      listNestingMode: listNestingMode === 'html' ? 'direct' : 'html',
    })
    expect(container.innerHTML).toBe(switched('edited'))
  },
)

test('handles null, single-block, array and undefined transitions without stale output', async () => {
  const block = marked('first')
  await renderPortableText({value: null})
  expect(container.innerHTML).toBe('')
  await renderPortableText({value: block})
  expect(container.innerHTML).toBe('<p><strong>first</strong></p>')
  vi.clearAllMocks()

  await renderPortableText({value: [block]})
  expect(container.innerHTML).toBe('<p><strong>first</strong></p>')
  expect(buildMarksTree).not.toHaveBeenCalled()
  await renderPortableText({value: undefined})
  expect(container.innerHTML).toBe('')
  await renderPortableText({value: marked('first', 'replaced')})
  expect(container.innerHTML).toBe('<p><strong>replaced</strong></p>')
  await renderPortableText({value: null})
  expect(container.innerHTML).toBe('')
})

test('hydrates compiled output and reuses unchanged blocks after hydration', async () => {
  const calls = vi.fn<(key: string) => void>()
  function Custom({value}: PortableTextComponentProps<CustomBlock>) {
    calls(value._key)
    return <aside>{value.text}</aside>
  }
  const components = {types: {custom: Custom}}
  const first = custom('first')
  const second = marked('second')
  const value = [first, second]
  const onRecoverableError = vi.fn()
  container.innerHTML = renderToString(<PortableText value={value} components={components} />)
  const serverNode = container.firstChild
  vi.clearAllMocks()

  await act(async () => {
    root = hydrateRoot(container, <PortableText value={value} components={components} />, {
      onRecoverableError,
    })
  })
  expect(onRecoverableError).not.toHaveBeenCalled()
  expect(container.firstChild).toBe(serverNode)
  expect(calls).toHaveBeenCalledExactlyOnceWith('first')
  expect(buildMarksTree).toHaveBeenCalledExactlyOnceWith(second)
  vi.clearAllMocks()

  await renderPortableText({value: [...value], components})
  expect(calls).not.toHaveBeenCalled()
  expect(buildMarksTree).not.toHaveBeenCalled()
  await renderPortableText({value: [{...first, text: 'edited'}, second], components})
  expect(calls).toHaveBeenCalledExactlyOnceWith('first')
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(container.innerHTML).toBe('<aside>edited</aside><p><strong>second</strong></p>')
  expect(onRecoverableError).not.toHaveBeenCalled()
})
