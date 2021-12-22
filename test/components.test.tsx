import React from 'react'
import ReactDOM from 'react-dom/server'
import tap from 'tap'
import {PortableTextProps} from '../src'
import {PortableText} from '../src/react-portable-text'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText {...props} />)

tap.test('can override unknown mark component', (t) => {
  const result = render({
    blocks: {
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
