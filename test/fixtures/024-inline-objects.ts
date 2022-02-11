import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    _key: '08707ed2945b',
    _type: 'block',
    style: 'normal',
    children: [
      {
        _key: '08707ed2945b0',
        text: 'Foo! Bar!',
        _type: 'span',
        marks: ['code'],
      },
      {
        _key: 'a862cadb584f',
        _type: 'localCurrency',
        sourceCurrency: 'USD',
        sourceAmount: 13.5,
      },
      {_key: '08707ed2945b1', text: 'Neat', _type: 'span', marks: []},
    ],
    markDefs: [],
  },

  {
    _key: 'abc',
    _type: 'block',
    style: 'normal',
    children: [
      {
        _key: '08707ed2945b0',
        text: 'Foo! Bar! ',
        _type: 'span',
        marks: ['code'],
      },
      {
        _key: 'a862cadb584f',
        _type: 'localCurrency',
        sourceCurrency: 'DKK',
        sourceAmount: 200,
      },
      {_key: '08707ed2945b1', text: ' Baz!', _type: 'span', marks: ['code']},
    ],
    markDefs: [],
  },

  {
    _key: 'def',
    _type: 'block',
    style: 'normal',
    children: [
      {
        _key: '08707ed2945b0',
        text: 'Foo! Bar! ',
        _type: 'span',
        marks: [],
      },
      {
        _key: 'a862cadb584f',
        _type: 'localCurrency',
        sourceCurrency: 'EUR',
        sourceAmount: 25,
      },
      {_key: '08707ed2945b1', text: ' Baz!', _type: 'span', marks: ['code']},
    ],
    markDefs: [],
  },
]

export default {
  input,
  output:
    '<p><code>Foo! Bar!</code><span class="currency">~119 NOK</span>Neat</p><p><code>Foo! Bar! </code><span class="currency">~270 NOK</span><code> Baz!</code></p><p>Foo! Bar! <span class="currency">~251 NOK</span><code> Baz!</code></p>',
}
