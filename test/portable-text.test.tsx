import React from 'react'
import ReactDOM from 'react-dom/server'
import tap from 'tap'
import {PortableText} from '../src/react-portable-text'
import {
  PortableTextReactComponents,
  PortableTextMarkComponent,
  PortableTextProps,
  MissingComponentHandler,
} from '../src/types'
import * as fixtures from './fixtures'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText onMissingComponent={false} {...props} />)

tap.test('builds empty tree on empty block', (t) => {
  const {input, output} = fixtures.emptyBlock
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds simple one-node tree on single, markless span', (t) => {
  const {input, output} = fixtures.singleSpan
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds simple multi-node tree on markless spans', (t) => {
  const {input, output} = fixtures.multipleSpans
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated span on simple mark', (t) => {
  const {input, output} = fixtures.basicMarkSingleSpan
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated, joined span on adjacent, equal marks', (t) => {
  const {input, output} = fixtures.basicMarkMultipleAdjacentSpans
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated, nested spans in tree format', (t) => {
  const {input, output} = fixtures.basicMarkNestedMarks
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds annotated spans with expanded marks on object-style marks', (t) => {
  const {input, output} = fixtures.linkMarkDef
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds correct structure from advanced, nested mark structure', (t) => {
  const {input, output} = fixtures.messyLinkText
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds bullet lists in parent container', (t) => {
  const {input, output} = fixtures.basicBulletList
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds numbered lists in parent container', (t) => {
  const {input, output} = fixtures.basicNumberedList
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds nested lists', (t) => {
  const {input, output} = fixtures.nestedLists
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds all basic marks as expected', (t) => {
  const {input, output} = fixtures.allBasicMarks
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('builds weirdly complex lists without any issues', (t) => {
  const {input, output} = fixtures.deepWeirdLists
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('renders all default block styles', (t) => {
  const {input, output} = fixtures.allDefaultBlockStyles
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('sorts marks correctly on equal number of occurences', (t) => {
  const {input, output} = fixtures.marksAllTheWayDown
  const marks: PortableTextReactComponents['marks'] = {
    highlight: ({value, children}) => (
      <span style={{border: `${value?.thickness}px solid`}}>{children}</span>
    ),
  }
  const result = render({value: input, components: {marks}})
  t.same(result, output)
  t.end()
})

tap.test('handles keyless blocks/spans', (t) => {
  const {input, output} = fixtures.keyless
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('handles empty arrays', (t) => {
  const {input, output} = fixtures.emptyArray
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('handles lists without level', (t) => {
  const {input, output} = fixtures.listWithoutLevel
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('handles inline non-span nodes', (t) => {
  const {input, output} = fixtures.inlineNodes
  const result = render({
    value: input,
    components: {
      types: {
        rating: ({value}) => {
          return <span className={`rating type-${value.type} rating-${value.rating}`} />
        },
      },
    },
  })
  t.same(result, output)
  t.end()
})

tap.test('handles hardbreaks', (t) => {
  const {input, output} = fixtures.hardBreaks
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('can disable hardbreak component', (t) => {
  const {input, output} = fixtures.hardBreaks
  const result = render({value: input, components: {hardBreak: false}})
  t.same(result, output.replace(/<br\/>/g, '\n'))
  t.end()
})

tap.test('can customize hardbreak component', (t) => {
  const {input, output} = fixtures.hardBreaks
  const hardBreak = () => <br className="dat-newline" />
  const result = render({value: input, components: {hardBreak}})
  t.same(result, output.replace(/<br\/>/g, '<br class="dat-newline"/>'))
  t.end()
})

tap.test('can nest marks correctly in block/marks context', (t) => {
  const {input, output} = fixtures.inlineObjects
  const result = render({
    value: input,
    components: {
      types: {
        localCurrency: ({value}) => {
          // in the real world we'd look up the users local currency,
          // do some rate calculations and render the result. Obviously.
          const rates: Record<string, number> = {USD: 8.82, DKK: 1.35, EUR: 10.04}
          const rate = rates[value.sourceCurrency] || 1
          return <span className="currency">~{Math.round(value.sourceAmount * rate)} NOK</span>
        },
      },
    },
  })

  t.same(result, output)
  t.end()
})

tap.test('can render inline block with text property', (t) => {
  const {input, output} = fixtures.inlineBlockWithText
  const result = render({
    value: input,
    components: {types: {button: (props) => <button type="button">{props.value.text}</button>}},
  })
  t.same(result, output)
  t.end()
})

tap.test('can render styled list items', (t) => {
  const {input, output} = fixtures.styledListItems
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('can render custom list item styles with fallback', (t) => {
  const {input, output} = fixtures.customListItemType
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('can render custom list item styles with provided list style component', (t) => {
  const {input} = fixtures.customListItemType
  const result = render({
    value: input,
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
    value: input,
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

tap.test('warns on missing list style component', (t) => {
  const {input} = fixtures.customListItemType
  const result = render({
    value: input,
    components: {list: {}},
  })
  t.same(
    result,
    '<ul><li>Square 1</li><li>Square 2<ul><li>Dat disc</li></ul></li><li>Square 3</li></ul>'
  )
  t.end()
})

tap.test('can render styled list items with custom list item component', (t) => {
  const {input, output} = fixtures.styledListItems
  const result = render({
    value: input,
    components: {
      listItem: ({children}) => {
        return <li>{children}</li>
      },
    },
  })
  t.same(result, output)
  t.end()
})

tap.test('can specify custom component for custom block types', (t) => {
  const {input, output} = fixtures.customBlockType
  const types: Partial<PortableTextReactComponents>['types'] = {
    code: ({renderNode, ...props}) => {
      t.same(props, {
        value: {
          _key: '9a15ea2ed8a2',
          _type: 'code',
          code: input[0]?.code,
          language: 'javascript',
        },
        index: 0,
        isInline: false,
      })
      return (
        <pre data-language={props.value.language}>
          <code>{props.value.code}</code>
        </pre>
      )
    },
  }
  const result = render({value: input, components: {types}})
  t.same(result, output)
  t.end()
})

tap.test('can specify custom components for custom marks', (t) => {
  const {input, output} = fixtures.customMarks
  const highlight: PortableTextMarkComponent<{_type: 'highlight'; thickness: number}> = ({
    value,
    children,
  }) => <span style={{border: `${value?.thickness}px solid`}}>{children}</span>

  const result = render({value: input, components: {marks: {highlight}}})
  t.same(result, output)
  t.end()
})

tap.test('can specify custom components for defaults marks', (t) => {
  const {input, output} = fixtures.overrideDefaultMarks
  const link: PortableTextMarkComponent<{_type: 'link'; href: string}> = ({value, children}) => (
    <a className="mahlink" href={value?.href}>
      {children}
    </a>
  )

  const result = render({value: input, components: {marks: {link}}})
  t.same(result, output)
  t.end()
})

tap.test('falls back to default component for missing mark components', (t) => {
  const {input, output} = fixtures.missingMarkComponent
  const result = render({value: input})
  t.same(result, output)
  t.end()
})

tap.test('can register custom `missing component` handler', (t) => {
  let warning = '<never called>'
  const onMissingComponent: MissingComponentHandler = (message) => {
    warning = message
  }

  const {input} = fixtures.missingMarkComponent
  render({value: input, onMissingComponent})
  t.same(
    warning,
    'Unknown mark type "abc", specify a component for it in the `components.marks` prop'
  )
  t.end()
})
