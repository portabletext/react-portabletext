// @vitest-environment jsdom
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponentProps,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
  type PortableTextProps,
  type UnknownNodeType,
} from '@portabletext/react'
import type {TypedObject} from '@portabletext/types'
import {
  act,
  createContext,
  isValidElement,
  useContext,
  type ReactElement,
  type ReactNode,
} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {renderToStaticMarkup} from 'react-dom/server'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

type BlockOptions = Partial<Omit<PortableTextBlock, 'children'>> & {
  marks?: string[]
}

function block(_key: string, text: string, {marks = [], ...rest}: BlockOptions = {}) {
  return {
    _type: 'block',
    _key,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `${_key}-span`, text, marks}],
    ...rest,
  } satisfies PortableTextBlock
}

const listItem = (_key: string, text: string, options: BlockOptions = {}) =>
  block(_key, text, {listItem: 'bullet', level: 1, ...options})

const nestedStyledList: PortableTextBlock[] = [
  listItem('a', 'Heading item', {style: 'h2'}),
  listItem('b', 'Strong item', {level: 2, marks: ['strong']}),
  listItem('c', 'Quoted item', {level: 3, style: 'blockquote', marks: ['em']}),
  listItem('d', 'Second level heading', {level: 2, style: 'h3'}),
  listItem('e', 'Back at the top'),
]

const markedBlock: PortableTextBlock = {
  _type: 'block',
  _key: 'marked',
  style: 'normal',
  markDefs: [{_type: 'highlight', _key: 'hl'}],
  children: [
    {_type: 'span', _key: 's1', text: 'Plain, ', marks: []},
    {_type: 'span', _key: 's2', text: 'highlighted ', marks: ['hl']},
    {_type: 'span', _key: 's3', text: 'and strong', marks: ['hl', 'strong']},
    {_type: 'span', _key: 's4', text: ' end', marks: []},
  ],
}

const render = (props: PortableTextProps) =>
  renderToStaticMarkup(<PortableText onMissingComponent={false} {...props} />)

describe('static output', () => {
  test('renders nested lists with styled list items', () => {
    expect(render({value: nestedStyledList})).toMatchInlineSnapshot(
      `"<ul><li><h2>Heading item<ul><li><strong>Strong item</strong><ul><li><blockquote><em>Quoted item</em></blockquote></li></ul></li><li><h3>Second level heading</h3></li></ul></h2></li><li>Back at the top</li></ul>"`,
    )
  })

  test('passes the same props to custom list item and block components', () => {
    const calls: string[] = []
    const components: PortableTextComponents = {
      listItem: ({value, index, isInline, children}) => {
        calls.push(`li ${value._key} ${value.style} index=${index} inline=${isInline}`)
        return <li>{children}</li>
      },
      block: {
        h2: ({value, index, isInline, children}) => {
          calls.push(
            `h2 ${value._key} listItem=${'listItem' in value} index=${index} inline=${isInline}`,
          )
          return <h2>{children}</h2>
        },
      },
    }
    render({value: nestedStyledList, components})
    expect(calls).toMatchInlineSnapshot(`
      [
        "li a h2 index=0 inline=false",
        "h2 a listItem=false index=0 inline=false",
        "li b normal index=0 inline=false",
        "li c blockquote index=0 inline=false",
        "li d h3 index=1 inline=false",
        "li e normal index=1 inline=false",
      ]
    `)
  })

  test('reports missing components inside styled list items', () => {
    const onMissingComponent = vi.fn()
    render({
      value: [listItem('a', 'Item', {style: 'unknown-style', marks: ['unknown-mark']})],
      onMissingComponent,
    })
    expect(onMissingComponent).toHaveBeenCalledWith(
      expect.stringContaining('Unknown mark type "unknown-mark"'),
      {nodeType: 'mark', type: 'unknown-mark'},
    )
    expect(onMissingComponent).toHaveBeenCalledWith(
      expect.stringContaining('Unknown block style "unknown-style"'),
      {nodeType: 'blockStyle', type: 'unknown-style'},
    )
  })

  test('renders unmarked spans as plain text, with hard breaks', () => {
    const value: PortableTextBlock = {
      _type: 'block',
      _key: 'plain',
      children: [
        {_type: 'span', text: 'One, '},
        {_type: 'span', text: 'two\nthree', marks: []},
      ],
    }
    expect(render({value})).toBe('<p>One, two<br/>three</p>')
    expect(render({value, components: {hardBreak: () => <hr />}})).toBe('<p>One, two<hr/>three</p>')
    expect(render({value, components: {hardBreak: false}})).toBe('<p>One, two\nthree</p>')
  })

  test('lets a custom `@text` type render both plain and marked text', () => {
    const components: PortableTextComponents = {
      types: {
        '@text': ({value, index, isInline}: PortableTextComponentProps<{text: string}>) => (
          <span data-index={index} data-inline={isInline}>
            {value.text}
          </span>
        ),
      },
    }
    expect(render({value: block('a', 'Plain'), components})).toBe(
      '<p><span data-index="0" data-inline="true">Plain</span></p>',
    )
    expect(render({value: block('a', 'Bold', {marks: ['strong']}), components})).toBe(
      '<p><strong><span data-index="0" data-inline="true">Bold</span></strong></p>',
    )
  })

  test('passes the plain text of the marked range to custom marks', () => {
    const texts: string[] = []
    const Highlight = ({text, children}: PortableTextMarkComponentProps) => {
      texts.push(text)
      return <mark>{children}</mark>
    }
    const UnknownMark = ({text, children}: PortableTextMarkComponentProps) => {
      texts.push(text)
      return <span>{children}</span>
    }
    expect(
      render({value: markedBlock, components: {marks: {highlight: Highlight}}}),
    ).toMatchInlineSnapshot(
      `"<p>Plain, <mark>highlighted <strong>and strong</strong></mark> end</p>"`,
    )
    expect(texts).toEqual(['highlighted and strong'])

    texts.length = 0
    render({value: markedBlock, components: {unknownMark: UnknownMark}})
    expect(texts).toEqual(['highlighted and strong'])
  })
})

describe('React keys', () => {
  // Calls the component inside a render so the compiled build can use its memo cache
  const renderPortableText = PortableText
  function keysOf(node: ReactNode): unknown {
    if (Array.isArray(node)) {
      return node.map(keysOf)
    }
    if (isValidElement<{children?: ReactNode}>(node)) {
      const children = keysOf(node.props.children)
      return children === undefined ? node.key : {key: node.key, children}
    }
    return typeof node === 'string' ? 'text' : undefined
  }
  function captureKeys(props: PortableTextProps) {
    let element: ReactElement<{children?: ReactNode}> | undefined
    function Capture() {
      element = renderPortableText({onMissingComponent: false, ...props}) as typeof element
      return null
    }
    renderToStaticMarkup(<Capture />)
    return keysOf(element?.props.children)
  }

  test('keeps keys for blocks, lists, list items and marks', () => {
    expect(captureKeys({value: [block('p', 'Para'), markedBlock, ...nestedStyledList]}))
      .toMatchInlineSnapshot(`
      [
        {
          "children": [
            "text",
          ],
          "key": "p",
        },
        {
          "children": [
            "text",
            {
              "children": [
                "text",
                {
                  "children": [
                    "text",
                  ],
                  "key": "s3",
                },
              ],
              "key": "s2",
            },
            "text",
          ],
          "key": "marked",
        },
        {
          "children": [
            {
              "children": {
                "children": [
                  "text",
                  {
                    "children": [
                      {
                        "children": [
                          {
                            "children": [
                              "text",
                            ],
                            "key": "b-span",
                          },
                          {
                            "children": [
                              {
                                "children": {
                                  "children": [
                                    {
                                      "children": [
                                        "text",
                                      ],
                                      "key": "c-span",
                                    },
                                  ],
                                  "key": "c",
                                },
                                "key": "c",
                              },
                            ],
                            "key": "c-parent",
                          },
                        ],
                        "key": "b",
                      },
                      {
                        "children": {
                          "children": [
                            "text",
                          ],
                          "key": "d",
                        },
                        "key": "d",
                      },
                    ],
                    "key": "b-parent",
                  },
                ],
                "key": "a",
              },
              "key": "a",
            },
            {
              "children": [
                "text",
              ],
              "key": "e",
            },
          ],
          "key": "a-parent",
        },
      ]
    `)
  })

  test('generates keys for keyless blocks and list items', () => {
    const value = [block('', 'Para'), listItem('', 'One'), listItem('', 'Two')].map(
      ({_key, ...rest}) => rest,
    )
    expect(captureKeys({value})).toMatchInlineSnapshot(`
      [
        {
          "children": [
            "text",
          ],
          "key": "node-0",
        },
        {
          "children": [
            {
              "children": [
                "text",
              ],
              "key": "li-1-0",
            },
            {
              "children": [
                "text",
              ],
              "key": "li-1-1",
            },
          ],
          "key": "1-parent",
        },
      ]
    `)
  })
})

describe('client updates', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    container = document.createElement('div')
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    vi.unstubAllGlobals()
  })

  const update = (node: ReactNode) => act(() => root.render(node))

  // Renders the same blocks twice, so that the update a test makes next is the third render
  function mount(props: PortableTextProps) {
    update(<PortableText {...props} />)
    update(<PortableText {...props} value={[...(props.value as TypedObject[])]} />)
  }

  test('updates an edited block and keeps the DOM of unchanged blocks', () => {
    const value = [block('a', 'First'), block('b', 'Second'), block('c', 'Third')]
    mount({value})
    const [first, , third] = container.querySelectorAll('p')

    update(<PortableText value={[value[0]!, block('b', 'Edited'), value[2]!]} />)
    expect(container.innerHTML).toBe('<p>First</p><p>Edited</p><p>Third</p>')
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs[0]).toBe(first)
    expect(paragraphs[2]).toBe(third)
  })

  test('updates edits inside nested lists', () => {
    mount({value: nestedStyledList})
    const value = nestedStyledList.map((item) =>
      item._key === 'c' ? listItem('c', 'Edited', {level: 3, style: 'blockquote'}) : item,
    )
    update(<PortableText value={value} />)
    expect(container.innerHTML).toBe(render({value}))
    expect(container.innerHTML).toContain('<blockquote>Edited</blockquote>')
  })

  test('passes new indexes to custom blocks after inserting a block above them', () => {
    const Custom = ({
      value,
      index,
    }: PortableTextComponentProps<{_type: 'custom'; _key: string}>) => (
      <div>
        {value._key}@{index}
      </div>
    )
    const components = {types: {custom: Custom}}
    const a = block('a', 'A')
    const custom = {_type: 'custom', _key: 'x'}
    mount({value: [a, custom], components})
    update(<PortableText value={[block('new', 'New'), a, custom]} components={components} />)
    expect(container.innerHTML).toBe('<p>New</p><p>A</p><div>x@2</div>')
  })

  test('reports missing components again on every update', () => {
    const onMissingComponent = vi.fn()
    const value = [
      {_type: 'mystery', _key: 'm'},
      block('a', 'Unknown mark', {marks: ['unknown-mark']}),
      listItem('b', 'Unknown list', {listItem: 'unknown-list'}),
      block('c', 'Plain'),
    ]
    mount({value, onMissingComponent})
    expect(onMissingComponent).toHaveBeenCalledTimes(6)

    onMissingComponent.mockClear()
    update(
      <PortableText
        value={[value[0]!, value[1]!, value[2]!, block('c', 'Edited')]}
        onMissingComponent={onMissingComponent}
      />,
    )
    expect(onMissingComponent.mock.calls.map(([, options]) => options)).toEqual([
      {nodeType: 'block', type: 'mystery'},
      {nodeType: 'mark', type: 'unknown-mark'},
      {nodeType: 'listStyle', type: 'unknown-list'},
    ])
  })

  test('re-renders unchanged blocks when components change', () => {
    const value = [block('a', 'Bold', {marks: ['strong']})]
    mount({value})
    update(
      <PortableText
        value={value}
        components={{marks: {strong: ({children}) => <b>{children}</b>}}}
      />,
    )
    expect(container.innerHTML).toBe('<p><b>Bold</b></p>')
  })

  test('re-renders unchanged blocks when the missing component handler changes', () => {
    const value = [block('a', 'Unknown mark', {marks: ['unknown-mark']}), block('b', 'Plain')]
    mount({value, onMissingComponent: false})
    const onMissingComponent = vi.fn()
    update(<PortableText value={[...value]} onMissingComponent={onMissingComponent} />)
    expect(onMissingComponent).toHaveBeenCalledWith(expect.any(String), {
      nodeType: 'mark',
      type: 'unknown-mark',
    })
  })

  test('re-renders unchanged blocks when the list nesting mode changes', () => {
    const value = [listItem('a', 'One'), listItem('b', 'Two', {level: 2})]
    mount({value})
    update(<PortableText value={value} listNestingMode="direct" />)
    expect(container.innerHTML).toBe('<ul><li>One</li><ul><li>Two</li></ul></ul>')
  })

  test('re-renders custom components when context they read changes', () => {
    const Theme = createContext('light')
    const Custom = () => <div>{useContext(Theme)}</div>
    const value = [{_type: 'custom', _key: 'x'}]
    const components = {types: {custom: Custom}}
    for (const theme of ['light', 'light', 'dark']) {
      update(
        <Theme.Provider value={theme}>
          <PortableText value={[...value]} components={components} />
        </Theme.Provider>,
      )
    }
    expect(container.innerHTML).toBe('<div>dark</div>')
  })
})

describe.runIf(process.env['PORTABLETEXT_REACT_COMPILED'])('reusing unchanged blocks', () => {
  let container: HTMLDivElement
  let root: Root
  let renders: Record<string, number>

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
    container = document.createElement('div')
    root = createRoot(container)
    renders = {}
  })

  afterEach(() => {
    act(() => root.unmount())
    vi.unstubAllGlobals()
  })

  const count = (key: string) => {
    renders[key] = (renders[key] ?? 0) + 1
  }
  const update = (props: PortableTextProps) => act(() => root.render(<PortableText {...props} />))

  const Custom = ({value}: PortableTextComponentProps<{_type: 'custom'; _key: string}>) => {
    count(value._key)
    return <div>{value._key}</div>
  }
  const components: PortableTextComponents = {
    types: {custom: Custom},
    listItem: ({value, children}) => {
      count(value._key ?? '')
      return <li>{children}</li>
    },
  }
  const custom = (_key: string) => ({_type: 'custom', _key})

  test('skips unchanged blocks from the first update on', () => {
    const value = [custom('x'), custom('y'), block('p', 'Paragraph')]
    update({value, components})
    update({value: [value[0]!, custom('y'), value[2]!], components})
    update({value: [value[0]!, custom('y'), value[2]!], components})
    expect(renders).toEqual({x: 1, y: 3})
  })

  test('skips unchanged list items from the second update on, but not items with a nested list', () => {
    update({value: nestedStyledList, components})
    update({value: [...nestedStyledList], components})
    renders = {}

    update({
      value: nestedStyledList.map((item) =>
        item._key === 'c' ? listItem('c', 'Edited', {level: 3, style: 'blockquote'}) : item,
      ),
      components,
    })
    // `a` and `b` contain nested lists, which are rebuilt on every render
    expect(renders).toEqual({a: 1, b: 1, c: 1})
  })

  test('keeps re-rendering blocks that report missing components', () => {
    const UnknownType = ({value}: PortableTextComponentProps<UnknownNodeType>) => {
      count(value._type)
      return null
    }
    const value = [{_type: 'mystery', _key: 'm'}, custom('x')]
    const props = {components: {...components, unknownType: UnknownType}, onMissingComponent: noop}
    update({value, ...props})
    update({value: [...value], ...props})
    update({value: [...value], ...props})
    expect(renders).toEqual({mystery: 3, x: 1})
  })

  test('re-renders every block when components are a new object on every render', () => {
    const value = [custom('x')]
    update({value, components: {...components}})
    update({value: [...value], components: {...components}})
    update({value: [...value], components: {...components}})
    expect(renders).toEqual({x: 3})
  })
})

function noop() {}
