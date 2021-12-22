import type {PortableTextBlock} from '../../src/types'

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
        _type: 'image',
        url: 'https://cdn.provider/star.png',
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
        _type: 'image',
        url: 'https://cdn.provider/star.png',
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
        _type: 'image',
        url: 'https://cdn.provider/star.png',
      },
      {_key: '08707ed2945b1', text: ' Baz!', _type: 'span', marks: ['code']},
    ],
    markDefs: [],
  },
]

export default {
  input,
  output:
    '<p><code>Foo! Bar!</code><img src="https://cdn.provider/star.png"/>Neat</p><p><code>Foo! Bar! </code><img src="https://cdn.provider/star.png"/><code> Baz!</code></p><p>Foo! Bar! <img src="https://cdn.provider/star.png"/><code> Baz!</code></p>',
}
