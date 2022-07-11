import React from 'react'
import ReactDOM from 'react-dom/server'
import tap from 'tap'
import {PortableTextProps} from '../src'
import {PortableText} from '../src/react-portable-text'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText {...props} onMissingComponent={false} />)

tap.test('can override unknown mark component', (t) => {
  const result = render({
    value: {
      _type: 'block',
      markDefs: [{_key: 'unknown-mark', _type: 'unknown-mark'}],
      children: [
        {_type: 'span', marks: ['unknown-deco'], text: 'simple'},
        {_type: 'span', marks: ['unknown-mark'], text: 'advanced'},
      ],
    },
    components: {
      unknownMark: ({children, markType}) => (
        <span className="unknown">
          Unknown ({markType}): {children}
        </span>
      ),
    },
  })
  t.same(
    result,
    '<p><span class="unknown">Unknown (unknown-deco): simple</span><span class="unknown">Unknown (unknown-mark): advanced</span></p>'
  )
  t.end()
})

tap.test('can receive custom props', (t) => {
  const result = render({
    value: {
      _type: 'block',
      children: [
        {_type: 'span', text: 'simple'},
      ],
    },
    components: {
      block: {
        normal: ({customProps}) => (
          <span className="custom">
            {customProps.text}
          </span>
        ),
      },
    },
    customProps: {text: 'Hello World'}
  })
  t.same(
    result,
    '<span class="custom">Hello World</span>'
  )
  t.end()
})
