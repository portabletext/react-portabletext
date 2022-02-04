import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    style: 'normal',
    _type: 'block',
    _key: 'f94596b05b41',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: "Let's test some of these lists!",
        marks: [],
      },
    ],
  },
  {
    listItem: 'bullet',
    style: 'normal',
    level: 1,
    _type: 'block',
    _key: '937effb1cd06',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Bullet 1',
        marks: [],
      },
    ],
  },
  {
    listItem: 'bullet',
    style: 'h1',
    level: 1,
    _type: 'block',
    _key: 'bd2d22278b88',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Bullet 2',
        marks: [],
      },
    ],
  },
  {
    listItem: 'bullet',
    style: 'normal',
    level: 1,
    _type: 'block',
    _key: 'a97d32e9f747',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Bullet 3',
        marks: [],
      },
    ],
  },
]

export default {
  input,
  output: [
    '<p>Let&#x27;s test some of these lists!</p>',
    '<ul>',
    '<li>Bullet 1</li>',
    '<li><h1>Bullet 2</h1></li>',
    '<li>Bullet 3</li>',
    '</ul>',
  ].join(''),
}
