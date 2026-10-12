import {PortableText, type PortableTextProps} from '@portabletext/react'
import {buildMarksTree, spanToPlainText} from '@portabletext/toolkit'
import type {PortableTextBlock} from '@portabletext/types'
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
  expect(buildMarksTree).toHaveBeenCalledTimes(1)
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

test('does not aggregate unused plain text for built-in marks', () => {
  expect(render({value: block('Text', ['strong', 'em'])})).toBe(
    '<p><strong><em>Text</em></strong></p>',
  )
  expect(spanToPlainText).not.toHaveBeenCalled()
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
