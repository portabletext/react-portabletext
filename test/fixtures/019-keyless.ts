import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        marks: [],
        text: 'sanity',
      },
      {
        _type: 'span',
        marks: [],
        text: ' is a full time job',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        marks: [],
        text: 'in a world that ',
      },
      {
        _type: 'span',
        marks: [],
        text: 'is always changing',
      },
    ],
    markDefs: [],
    style: 'normal',
  },
]

export default {
  input,
  output: '<p>sanity is a full time job</p><p>in a world that is always changing</p>',
}
