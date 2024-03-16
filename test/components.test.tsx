import ReactDOM from 'react-dom/server'
import {test} from 'vitest'

import {PortableTextProps} from '../src'
import {PortableText} from '../src/react-portable-text'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText {...props} onMissingComponent={false} />)

test('can override unknown mark component', ({expect}) => {
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
  expect(result).toBe(
    '<p><span class="unknown">Unknown (unknown-deco): simple</span><span class="unknown">Unknown (unknown-mark): advanced</span></p>',
  )
})
