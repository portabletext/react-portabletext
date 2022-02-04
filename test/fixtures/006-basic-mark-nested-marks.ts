import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _key: 'R5FvMrjo',
  _type: 'block',
  children: [
    {
      _key: 'cZUQGmh4',
      _type: 'span',
      marks: ['strong'],
      text: 'A word of ',
    },
    {
      _key: 'toaiCqIK',
      _type: 'span',
      marks: ['strong', 'em'],
      text: 'warning;',
    },
    {
      _key: 'gaZingA',
      _type: 'span',
      marks: [],
      text: ' Sanity is addictive.',
    },
  ],
  markDefs: [],
  style: 'normal',
}

export default {
  input,
  output: '<p><strong>A word of <em>warning;</em></strong> Sanity is addictive.</p>',
}
