import {type PortableTextProps, PortableText} from '@portabletext/react'
import ReactDOM from 'react-dom/server'
import {test} from 'vitest'

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

const renderLink = (href: unknown) =>
  render({
    value: {
      _type: 'block',
      markDefs: [{_key: 'l', _type: 'link', href}],
      children: [{_type: 'span', marks: ['l'], text: 'click'}],
    },
  })

test.for([
  'https://example.com/?a=1&b=2',
  'http://example.com',
  'mailto:hello@example.com',
  'tel:+4712345678',
  '#section',
  '/relative/path',
  'relative/path',
  '../up',
  '?query=1',
])('links safe href %s', (href, {expect}) => {
  const escaped = href.replace(/&/g, '&amp;')
  expect(renderLink(href)).toBe(`<p><a href="${escaped}">click</a></p>`)
})

test.for([
  'javascript:alert(1)',
  '  JavaScript:alert(1)',
  'java\tscript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  undefined,
  null,
  42,
])('renders unsafe href %j as plain text', (href, {expect}) => {
  expect(renderLink(href)).toBe('<p>click</p>')
})
