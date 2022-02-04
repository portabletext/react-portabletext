import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    listItem: 'square',
    style: 'normal',
    level: 1,
    _type: 'block',
    _key: '937effb1cd06',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Square 1',
        marks: [],
      },
    ],
  },
  {
    listItem: 'square',
    style: 'normal',
    level: 1,
    _type: 'block',
    _key: 'bd2d22278b88',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Square 2',
        marks: [],
      },
    ],
  },
  {
    listItem: 'disc',
    style: 'normal',
    level: 2,
    _type: 'block',
    _key: 'a97d32e9f747',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Dat disc',
        marks: [],
      },
    ],
  },
  {
    listItem: 'square',
    style: 'normal',
    level: 1,
    _type: 'block',
    _key: 'a97d32e9f747',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Square 3',
        marks: [],
      },
    ],
  },
]

export default {
  input,
  output: [
    '<ul>',
    '<li>Square 1</li>',
    '<li>',
    '  Square 2',
    '  <ul>',
    '    <li>Dat disc</li>',
    '  </ul>',
    '</li>',
    '<li>Square 3</li>',
    '</ul>',
  ]
    .map((line) => line.trim())
    .join(''),
}
