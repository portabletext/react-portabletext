import {Fragment} from 'react'
import ReactDOM from 'react-dom/server'
import {test} from 'vitest'

import {PortableText} from '../src/react-portable-text'
import {
  MissingComponentHandler,
  PortableTextMarkComponent,
  PortableTextProps,
  PortableTextReactComponents,
} from '../src/types'
import * as fixtures from './fixtures'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText onMissingComponent={false} {...props} />)

test('builds empty tree on empty block', ({expect}) => {
  const {input, output} = fixtures.emptyBlock
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds simple one-node tree on single, markless span', ({expect}) => {
  const {input, output} = fixtures.singleSpan
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds simple multi-node tree on markless spans', ({expect}) => {
  const {input, output} = fixtures.multipleSpans
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds annotated span on simple mark', ({expect}) => {
  const {input, output} = fixtures.basicMarkSingleSpan
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds annotated, joined span on adjacent, equal marks', ({expect}) => {
  const {input, output} = fixtures.basicMarkMultipleAdjacentSpans
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds annotated, nested spans in tree format', ({expect}) => {
  const {input, output} = fixtures.basicMarkNestedMarks
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds annotated spans with expanded marks on object-style marks', ({expect}) => {
  const {input, output} = fixtures.linkMarkDef
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds correct structure from advanced, nested mark structure', ({expect}) => {
  const {input, output} = fixtures.messyLinkText
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds bullet lists in parent container', ({expect}) => {
  const {input, output} = fixtures.basicBulletList
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds numbered lists in parent container', ({expect}) => {
  const {input, output} = fixtures.basicNumberedList
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds nested lists', ({expect}) => {
  const {input, output} = fixtures.nestedLists
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds all basic marks as expected', ({expect}) => {
  const {input, output} = fixtures.allBasicMarks
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('builds weirdly complex lists without any issues', ({expect}) => {
  const {input, output} = fixtures.deepWeirdLists
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('renders all default block styles', ({expect}) => {
  const {input, output} = fixtures.allDefaultBlockStyles
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('sorts marks correctly on equal number of occurences', ({expect}) => {
  const {input, output} = fixtures.marksAllTheWayDown
  const marks: PortableTextReactComponents['marks'] = {
    highlight: ({value, children}) => (
      <span style={{border: `${value?.thickness}px solid`}}>{children}</span>
    ),
  }
  const result = render({value: input, components: {marks}})
  expect(result).toEqual(output)
})

test('handles keyless blocks/spans', ({expect}) => {
  const {input, output} = fixtures.keyless
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('handles empty arrays', ({expect}) => {
  const {input, output} = fixtures.emptyArray
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('handles lists without level', ({expect}) => {
  const {input, output} = fixtures.listWithoutLevel
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('handles inline non-span nodes', ({expect}) => {
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
  expect(result).toEqual(output)
})

test('handles hardbreaks', ({expect}) => {
  const {input, output} = fixtures.hardBreaks
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('can disable hardbreak component', ({expect}) => {
  const {input, output} = fixtures.hardBreaks
  const result = render({value: input, components: {hardBreak: false}})
  expect(result).toEqual(output.replace(/<br\/>/g, '\n'))
})

test('can customize hardbreak component', ({expect}) => {
  const {input, output} = fixtures.hardBreaks
  const hardBreak = () => <br className="dat-newline" />
  const result = render({value: input, components: {hardBreak}})
  expect(result).toEqual(output.replace(/<br\/>/g, '<br class="dat-newline"/>'))
})

test('can nest marks correctly in block/marks context', ({expect}) => {
  const {input, output} = fixtures.inlineObjects
  const result = render({
    value: input,
    components: {
      types: {
        localCurrency: ({value}) => {
          // in the real world we'd look up the users local currency,
          // do some rate calculations and render the result. Obviously.
          const rates: Record<string, number> = {
            USD: 8.82,
            DKK: 1.35,
            EUR: 10.04,
          }
          const rate = rates[value.sourceCurrency] || 1
          return <span className="currency">~{Math.round(value.sourceAmount * rate)} NOK</span>
        },
      },
    },
  })

  expect(result).toEqual(output)
})

test('can render inline block with text property', ({expect}) => {
  const {input, output} = fixtures.inlineBlockWithText
  const result = render({
    value: input,
    components: {
      types: {
        button: (props) => <button type="button">{props.value.text}</button>,
      },
    },
  })
  expect(result).toEqual(output)
})

test('can render styled list items', ({expect}) => {
  const {input, output} = fixtures.styledListItems
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('can render custom list item styles with fallback', ({expect}) => {
  const {input, output} = fixtures.customListItemType
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('can render custom list item styles with provided list style component', ({expect}) => {
  const {input} = fixtures.customListItemType
  const result = render({
    value: input,
    components: {
      list: {
        square: ({children}) => <ul className="list-squared">{children}</ul>,
      },
    },
  })
  expect(result).toBe(
    '<ul class="list-squared"><li>Square 1</li><li>Square 2<ul><li>Dat disc</li></ul></li><li>Square 3</li></ul>',
  )
})

test('can render custom list item styles with provided list style component', ({expect}) => {
  const {input} = fixtures.customListItemType
  const result = render({
    value: input,
    components: {
      listItem: {
        square: ({children}) => <li className="item-squared">{children}</li>,
      },
    },
  })
  expect(result).toBe(
    '<ul><li class="item-squared">Square 1</li><li class="item-squared">Square 2<ul><li>Dat disc</li></ul></li><li class="item-squared">Square 3</li></ul>',
  )
})

test('warns on missing list style component', ({expect}) => {
  const {input} = fixtures.customListItemType
  const result = render({
    value: input,
    components: {list: {}},
  })
  expect(result).toBe(
    '<ul><li>Square 1</li><li>Square 2<ul><li>Dat disc</li></ul></li><li>Square 3</li></ul>',
  )
})

test('can render styled list items with custom list item component', ({expect}) => {
  const {input, output} = fixtures.styledListItems
  const result = render({
    value: input,
    components: {
      listItem: ({children}) => {
        return <li>{children}</li>
      },
    },
  })
  expect(result).toEqual(output)
})

test('can specify custom component for custom block types', ({expect}) => {
  const {input, output} = fixtures.customBlockType
  const types: Partial<PortableTextReactComponents>['types'] = {
    code: ({renderNode, ...props}) => {
      expect(props).toEqual({
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
  expect(result).toEqual(output)
})

test('can specify custom component for custom block types with children', ({expect}) => {
  const {input, output} = fixtures.customBlockTypeWithChildren
  const types: Partial<PortableTextReactComponents>['types'] = {
    quote: ({renderNode, ...props}) => {
      expect(props).toEqual({
        value: {
          _type: 'quote',
          _key: '9a15ea2ed8a2',
          background: 'blue',
          children: [
            {
              _type: 'span',
              _key: '9a15ea2ed8a2',
              text: 'This is an inspirational quote',
            },
          ],
        },
        index: 0,
        isInline: false,
      })

      return (
        <p style={{background: props.value.background}}>
          {props.value.children.map(({text}: any) => (
            <Fragment key={text}>Customers say: {text}</Fragment>
          ))}
        </p>
      )
    },
  }
  const result = render({value: input, components: {types}})
  expect(result).toEqual(output)
})

test('can specify custom components for custom marks', ({expect}) => {
  const {input, output} = fixtures.customMarks
  const highlight: PortableTextMarkComponent<{
    _type: 'highlight'
    thickness: number
  }> = ({value, children}) => (
    <span style={{border: `${value?.thickness}px solid`}}>{children}</span>
  )

  const result = render({value: input, components: {marks: {highlight}}})
  expect(result).toEqual(output)
})

test('can specify custom components for defaults marks', ({expect}) => {
  const {input, output} = fixtures.overrideDefaultMarks
  const link: PortableTextMarkComponent<{_type: 'link'; href: string}> = ({value, children}) => (
    <a className="mahlink" href={value?.href}>
      {children}
    </a>
  )

  const result = render({value: input, components: {marks: {link}}})
  expect(result).toEqual(output)
})

test('falls back to default component for missing mark components', ({expect}) => {
  const {input, output} = fixtures.missingMarkComponent
  const result = render({value: input})
  expect(result).toEqual(output)
})

test('can register custom `missing component` handler', ({expect}) => {
  let warning = '<never called>'
  const onMissingComponent: MissingComponentHandler = (message) => {
    warning = message
  }

  const {input} = fixtures.missingMarkComponent
  render({value: input, onMissingComponent})
  expect(warning).toBe(
    '[@portabletext/react] Unknown mark type "abc", specify a component for it in the `components.marks` prop',
  )
})
