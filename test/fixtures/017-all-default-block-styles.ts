import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    style: 'h1',
    _type: 'block',
    _key: 'b07278ae4e5a',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Sanity',
        marks: [],
      },
    ],
  },
  {
    style: 'h2',
    _type: 'block',
    _key: '0546428bbac2',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'The outline',
        marks: [],
      },
    ],
  },
  {
    style: 'h3',
    _type: 'block',
    _key: '34024674e160',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'More narrow details',
        marks: [],
      },
    ],
  },
  {
    style: 'h4',
    _type: 'block',
    _key: '06ca981a1d18',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Even less thing',
        marks: [],
      },
    ],
  },
  {
    style: 'h5',
    _type: 'block',
    _key: '06ca98afnjkg',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Small header',
        marks: [],
      },
    ],
  },
  {
    style: 'h6',
    _type: 'block',
    _key: 'cc0afafn',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Lowest thing',
        marks: [],
      },
    ],
  },
  {
    style: 'blockquote',
    _type: 'block',
    _key: '0ee0381658d0',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'A block quote of awesomeness',
        marks: [],
      },
    ],
  },
  {
    style: 'normal',
    _type: 'block',
    _key: '44fb584a634c',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Plain old normal block',
        marks: [],
      },
    ],
  },
  {
    _type: 'block',
    _key: 'abcdefg',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Default to "normal" style',
        marks: [],
      },
    ],
  },
]

export default {
  input,
  output: [
    '<h1>Sanity</h1>',
    '<h2>The outline</h2>',
    '<h3>More narrow details</h3>',
    '<h4>Even less thing</h4>',
    '<h5>Small header</h5>',
    '<h6>Lowest thing</h6>',
    '<blockquote>A block quote of awesomeness</blockquote>',
    '<p>Plain old normal block</p>',
    '<p>Default to &quot;normal&quot; style</p>',
  ].join(''),
}
