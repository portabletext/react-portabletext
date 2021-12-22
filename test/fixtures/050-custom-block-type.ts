import type {ArbitraryTypedObject} from '../../src/types'

const input: ArbitraryTypedObject[] = [
  {
    _type: 'code',
    _key: '9a15ea2ed8a2',
    language: 'javascript',
    code: "const foo = require('foo')\n\nfoo('hi there', (err, thing) => {\n  console.log(err)\n})\n",
  },
]

export default {
  input,
  output: [
    '<pre data-language="javascript">',
    '<code>',
    'const foo = require(&#x27;foo&#x27;)\n\n',
    'foo(&#x27;hi there&#x27;, (err, thing) =&gt; {\n',
    '  console.log(err)\n',
    '})\n',
    '</code></pre>',
  ].join(''),
}
