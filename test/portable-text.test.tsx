import React from 'react'
import ReactDOM from 'react-dom/server'
import tap from 'tap'
import {PortableText} from '../src/react-portable-text'
import {PortableTextComponents, PortableTextMarkComponent, PortableTextProps} from '../src/types'
import * as fixtures from './fixtures'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText {...props} />)

tap.test('never mutates input', (t) => {
  for (const [key, fixture] of Object.entries(fixtures)) {
    if (key === 'default') {
      continue
    }

    const highlight = () => <mark />
    const components: Partial<PortableTextComponents> = {
      marks: {highlight},
      unknownMark: ({children}) => <span>{children}</span>,
      unknownType: ({children}) => <div>{children}</div>,
    }
    const originalInput = JSON.parse(JSON.stringify(fixture.input))
    const passedInput = fixture.input
    try {
      render({
        blocks: passedInput as any,
        components,
      })
    } catch (error) {
      // ignore
    }
    t.same(originalInput, passedInput)
  }

  t.end()
})

tap.test('builds empty tree on empty block', (t) => {
  const {input, output} = fixtures.emptyBlock
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds simple one-node tree on single, markless span', (t) => {
  const {input, output} = fixtures.singleSpan
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds simple multi-node tree on markless spans', (t) => {
  const {input, output} = fixtures.multipleSpans
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated span on simple mark', (t) => {
  const {input, output} = fixtures.basicMarkSingleSpan
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated, joined span on adjacent, equal marks', (t) => {
  const {input, output} = fixtures.basicMarkMultipleAdjacentSpans
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated, nested spans in tree format', (t) => {
  const {input, output} = fixtures.basicMarkNestedMarks
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated spans with expanded marks on object-style marks', (t) => {
  const {input, output} = fixtures.linkMarkDef
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds correct structure from advanced, nested mark structure', (t) => {
  const {input, output} = fixtures.messyLinkText
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds bullet lists in parent container', (t) => {
  const {input, output} = fixtures.basicBulletList
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds numbered lists in parent container', (t) => {
  const {input, output} = fixtures.basicNumberedList
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds nested lists', (t) => {
  const {input, output} = fixtures.nestedLists
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds all basic marks as expected', (t) => {
  const {input, output} = fixtures.allBasicMarks
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('builds weirdly complex lists without any issues', (t) => {
  const {input, output} = fixtures.deepWeirdLists
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('renders all default block styles', (t) => {
  const {input, output} = fixtures.allDefaultBlockStyles
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('sorts marks correctly on equal number of occurences', (t) => {
  const {input, output} = fixtures.marksAllTheWayDown
  const marks: PortableTextComponents['marks'] = {
    highlight: ({markDef, children}) => (
      <span style={{border: `${markDef?.thickness}px solid`}}>{children}</span>
    ),
  }
  const result = render({blocks: input, components: {marks}})
  t.same(result, output)
  t.end()
})

tap.test('handles keyless blocks/spans', (t) => {
  const {input, output} = fixtures.keyless
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('handles empty arrays', (t) => {
  const {input, output} = fixtures.emptyArray
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('handles lists without level', (t) => {
  const {input, output} = fixtures.listWithoutLevel
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('handles inline non-span nodes', (t) => {
  const {input, output} = fixtures.inlineNodes
  const result = render({
    blocks: input,
    components: {
      types: {
        rating: ({node}) => {
          return <span className={`rating type-${node.type} rating-${node.rating}`} />
        },
      },
    },
  })
  t.same(result, output)
  t.end()
})

tap.test('handles hardbreaks', (t) => {
  const {input, output} = fixtures.hardBreaks
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('can disable hardbreak component', (t) => {
  const {input, output} = fixtures.hardBreaks
  const result = render({blocks: input, components: {hardBreak: false}})
  t.same(result, output.replace(/<br\/>/g, '\n'))
  t.end()
})

tap.test('can customize hardbreak component', (t) => {
  const {input, output} = fixtures.hardBreaks
  const hardBreak = () => <br className="dat-newline" />
  const result = render({blocks: input, components: {hardBreak}})
  t.same(result, output.replace(/<br\/>/g, '<br class="dat-newline"/>'))
  t.end()
})

tap.test('can nest marks correctly in block/marks context', (t) => {
  const {input, output} = fixtures.inlineImages
  const result = render({
    blocks: input,
    components: {types: {image: ({node}) => <img src={node.url} />}},
  })
  t.same(result, output)
  t.end()
})

tap.test('can render inline block with text property', (t) => {
  const {input, output} = fixtures.inlineBlockWithText
  const result = render({
    blocks: input,
    components: {types: {button: (props) => <button type="button">{props.node.text}</button>}},
  })
  t.same(result, output)
  t.end()
})

tap.test('can render styled list items', (t) => {
  const {input, output} = fixtures.styledListItems
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('can render custom list item styles with fallback', (t) => {
  const {input, output} = fixtures.customListItemType
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})

tap.test('can render custom list item styles with provided list style component', (t) => {
  const {input} = fixtures.customListItemType
  const result = render({
    blocks: input,
    components: {list: {square: ({children}) => <ul className="list-squared">{children}</ul>}},
  })
  t.same(
    result,
    '<ul class="list-squared"><li>Square 1</li><li>Square 2<ul><li>Dat disc</li></ul></li><li>Square 3</li></ul>'
  )
  t.end()
})

tap.test('can render custom list item styles with provided list style component', (t) => {
  const {input} = fixtures.customListItemType
  const result = render({
    blocks: input,
    components: {
      listItem: {
        square: ({children}) => <li className="item-squared">{children}</li>,
      },
    },
  })
  t.same(
    result,
    '<ul><li class="item-squared">Square 1</li><li class="item-squared">Square 2<ul><li>Dat disc</li></ul></li><li class="item-squared">Square 3</li></ul>'
  )
  t.end()
})

tap.test('can specify custom component for custom block types', (t) => {
  const {input, output} = fixtures.customBlockType
  const types: Partial<PortableTextComponents>['types'] = {
    code: ({renderNode, ...props}) => {
      t.same(props, {
        node: {
          _key: '9a15ea2ed8a2',
          _type: 'code',
          code: input[0].code,
          language: 'javascript',
        },
        index: 0,
        isInline: false,
      })
      return (
        <pre data-language={props.node.language}>
          <code>{props.node.code}</code>
        </pre>
      )
    },
  }
  const result = render({blocks: input, components: {types}})
  t.same(result, output)
  t.end()
})

tap.test('can specify custom components for custom marks', (t) => {
  const {input, output} = fixtures.customMarks
  const highlight: PortableTextMarkComponent<{_type: 'highlight'; thickness: number}> = ({
    markDef,
    children,
  }) => <span style={{border: `${markDef?.thickness}px solid`}}>{children}</span>

  const result = render({blocks: input, components: {marks: {highlight}}})
  t.same(result, output)
  t.end()
})

tap.test('can specify custom components for defaults marks', (t) => {
  const {input, output} = fixtures.overrideDefaultMarks
  const link: PortableTextMarkComponent<{_type: 'link'; href: string}> = ({markDef, children}) => (
    <a className="mahlink" href={markDef?.href}>
      {children}
    </a>
  )

  const result = render({blocks: input, components: {marks: {link}}})
  t.same(result, output)
  t.end()
})

tap.test('falls back to default component for missing mark components', (t) => {
  const {input, output} = fixtures.missingMarkComponent
  const result = render({blocks: input})
  t.same(result, output)
  t.end()
})
