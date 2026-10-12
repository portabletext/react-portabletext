import {defaultComponents, PortableText, type PortableTextProps} from '@portabletext/react'
import {buildMarksTree, spanToPlainText} from '@portabletext/toolkit'
import type {PortableTextBlock} from '@portabletext/types'
import {isValidElement, type ReactNode} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {beforeEach, expect, test, vi} from 'vitest'

vi.mock('@portabletext/toolkit', async (importOriginal) => {
  const toolkit = await importOriginal<typeof import('@portabletext/toolkit')>()
  return {
    ...toolkit,
    buildMarksTree: vi.fn(toolkit.buildMarksTree),
    spanToPlainText: vi.fn(toolkit.spanToPlainText),
  }
})

const render = (props: PortableTextProps) => renderToStaticMarkup(<PortableText {...props} />)
const block = (text: string, marks: string[] = []): PortableTextBlock => ({
  _type: 'block',
  _key: 'block',
  children: [{_type: 'span', _key: 'span', text, marks}],
  markDefs: [],
})

beforeEach(() => vi.clearAllMocks())

test('serializes each nested styled list item only once', () => {
  const value = Array.from({length: 6}, (_, index) => ({
    ...block(`Item ${index}`, ['strong']),
    _key: `item-${index}`,
    style: 'h2',
    listItem: 'bullet',
    level: index + 1,
  }))
  const html = render({value})
  expect(html.match(/<strong>/g)).toHaveLength(6)
  expect(buildMarksTree).toHaveBeenCalledTimes(6)
})

test('does not warn for discarded children of a custom styled list block', () => {
  const onMissingComponent = vi.fn()
  expect(
    render({
      value: {...block('Hidden', ['unknown']), listItem: 'bullet', style: 'h2'},
      components: {types: {block: () => <h2>Replacement</h2>}},
      onMissingComponent,
    }),
  ).toBe('<ul><li><h2>Replacement</h2></li></ul>')
  expect(buildMarksTree).not.toHaveBeenCalled()
  expect(onMissingComponent).not.toHaveBeenCalled()
})

test('warns once for an unknown mark inside a styled list item', () => {
  const onMissingComponent = vi.fn()
  render({
    value: {...block('Text', ['unknown']), listItem: 'bullet', style: 'h2'},
    onMissingComponent,
  })
  expect(onMissingComponent).toHaveBeenCalledTimes(1)
})

test.each(['', 'Plain text', '<escaped>&text'])('fast path preserves text %j', (text) => {
  const value = block(text)
  const inspect = vi.fn(({children}) => <p>{children}</p>)
  render({value, components: {block: inspect}})
  expect(inspect.mock.calls[0]?.[0].children).toEqual([text])
  expect(buildMarksTree).not.toHaveBeenCalled()
})

test('fast path accepts absent marks and preserves block props', () => {
  const value = block('Text')
  delete value.children[0]!.marks
  const inspect = vi.fn(({children}) => <p>{children}</p>)
  expect(render({value, components: {block: inspect}})).toBe('<p>Text</p>')
  expect(inspect.mock.calls[0]?.[0]).toMatchObject({value, index: 0, isInline: false})
  expect(buildMarksTree).not.toHaveBeenCalled()
})

test('retains custom toolkit text dispatch', () => {
  expect(
    render({
      value: block('Text'),
      components: {types: {'@text': ({value}) => <i>{value.text}</i>}},
    }),
  ).toBe('<p><i>Text</i></p>')
  expect(buildMarksTree).not.toHaveBeenCalled()
})

test.each([undefined, false, () => <hr />] as const)('retains hard-break behavior', (hardBreak) => {
  const components = hardBreak === undefined ? undefined : {hardBreak}
  const result = render({value: block('a\n\nb'), components})
  expect(result).toBe(
    hardBreak === false
      ? '<p>a\n\nb</p>'
      : hardBreak
        ? '<p>a<hr/><hr/>b</p>'
        : '<p>a<br/><br/>b</p>',
  )
  expect(buildMarksTree).toHaveBeenCalledTimes(1)
})

test('preserves aggregate text for built-in marks', () => {
  expect(render({value: block('Text', ['strong', 'em'])})).toBe(
    '<p><strong><em>Text</em></strong></p>',
  )
  expect(spanToPlainText).toHaveBeenCalledTimes(2)
})

test('built-in marks expose complete text through the public renderer', () => {
  const value = block('Visible text', ['strong'])
  render({
    value: {_type: 'inspect'},
    components: {
      types: {
        inspect: ({renderNode}) => {
          const rendered = renderNode({node: value, index: 0, isInline: false, renderNode})
          expect(isValidElement(rendered)).toBe(true)
          if (isValidElement<{children: ReactNode[]}>(rendered)) {
            const mark = rendered.props.children[0]
            expect(isValidElement(mark)).toBe(true)
            if (isValidElement<{text: string}>(mark)) {
              expect(mark.props.text).toBe('Visible text')
            }
          }
          return rendered
        },
      },
    },
  })
})

test('preserves aggregate text for custom and unknown marks', () => {
  const value = {
    ...block('a\nb', ['strong', 'custom']),
    children: [
      ...block('a\nb', ['strong', 'custom']).children,
      {_type: 'inline', _key: 'inline', text: 'Excluded', marks: ['custom']},
      {...block('c', ['custom']).children[0]!, _key: 'last'},
    ],
  }
  const texts: string[] = []
  render({
    value,
    components: {
      types: {inline: () => <span>Inline</span>},
      marks: {
        strong: ({text, children}) => {
          texts.push(text)
          return <b>{children}</b>
        },
      },
      unknownMark: ({text, children}) => {
        texts.push(text)
        return <mark>{children}</mark>
      },
    },
    onMissingComponent: false,
  })
  expect(texts).toContain('a\nb')
  expect(texts.join('')).not.toContain('Excluded')
  expect(spanToPlainText).toHaveBeenCalled()
})

test('custom block and list item overrides still receive their full props', () => {
  const value = {...block('Content'), listItem: 'bullet', style: 'h2'}
  const heading = vi.fn(({children}) => <h2 className="custom">{children}</h2>)
  const listItem = vi.fn(({children}) => <li className="custom">{children}</li>)
  expect(render({value, components: {block: {h2: heading}, listItem}})).toBe(
    '<ul><li class="custom"><h2 class="custom">Content</h2></li></ul>',
  )
  expect(listItem.mock.calls[0]?.[0]).toMatchObject({value, index: 0, isInline: false})
  expect(heading.mock.calls[0]?.[0]).toMatchObject({
    value: {style: 'h2', children: value.children},
    index: 0,
    isInline: false,
    renderNode: expect.any(Function),
  })
})

test('native default block fast paths follow component identity, not the style name', () => {
  const defaults = defaultComponents.block
  if (typeof defaults === 'function') throw new Error('Expected default style map')
  expect(
    render({
      value: {...block('Heading'), style: 'custom'},
      components: {block: {custom: defaults.h3}},
    }),
  ).toBe('<h3>Heading</h3>')
})

test('custom nested marks receive identical complete text including newlines', () => {
  const text = 'Nested\ntext'
  const inspect = vi.fn(({children}) => <mark>{children}</mark>)
  render({
    value: block(text, ['outer', 'inner', 'strong']),
    components: {marks: {outer: inspect, inner: inspect}},
  })
  expect(inspect).toHaveBeenCalledTimes(2)
  for (const [props] of inspect.mock.calls) expect(props).toMatchObject({text})
})

test.each([
  {text: 'Text', marks: [42]},
  {text: 42, marks: []},
])('malformed spans do not take the fast path: %j', (span) => {
  const value = block('Text')
  value.children = [{_type: 'span', _key: 'span', ...span}]
  const onMissingComponent = vi.fn()
  render({value, onMissingComponent})
  expect(buildMarksTree).toHaveBeenCalledTimes(1)
  expect(onMissingComponent).toHaveBeenCalledWith(expect.any(String), {
    type: 'span',
    nodeType: 'block',
  })
})

test('public renderNode ignores extra callback arguments from Array#map', () => {
  expect(
    render({
      value: {_type: 'custom', _key: 'custom'},
      components: {
        types: {
          custom: ({renderNode}) => (
            <section>
              {[block('First'), {...block('Second'), _key: 'second'}]
                .map((node, index) => ({node, index, isInline: true, renderNode}))
                .map(renderNode)}
            </section>
          ),
        },
      },
    }),
  ).toBe('<section><p>First</p><p>Second</p></section>')
})
