import type {PortableTextBlock} from '../../src/types'

const input: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: 'bd73ec5f61a1',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: "I enjoyed it. It's not perfect, but I give it a strong ",
        marks: [],
      },
      {
        _type: 'rating',
        _key: 'd234a4fa317a',
        type: 'dice',
        rating: 5,
      },
      {
        _type: 'span',
        text: ', and look forward to the next season!',
        marks: [],
      },
    ],
  },
  {
    _type: 'block',
    _key: 'foo',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Sibling paragraph',
        marks: [],
      },
    ],
  },
]

export default {
  input,
  output: [
    '<p>I enjoyed it. It&#x27;s not perfect, but I give it a strong ',
    '<span class="rating type-dice rating-5"></span>',
    ', and look forward to the next season!</p>',
    '<p>Sibling paragraph</p>',
  ].join(''),
}
