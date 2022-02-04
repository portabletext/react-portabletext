import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _key: 'R5FvMrjo',
  _type: 'block',
  children: [
    {
      _key: 'cZUQGmh4',
      _type: 'span',
      marks: [],
      text: 'Span number one. ',
    },
    {
      _key: 'toaiCqIK',
      _type: 'span',
      marks: [],
      text: 'And span number two.',
    },
  ],
  markDefs: [],
  style: 'normal',
}

export default {
  input,
  output: '<p>Span number one. And span number two.</p>',
}
