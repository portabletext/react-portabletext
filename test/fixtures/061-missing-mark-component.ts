import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _type: 'block',
  children: [
    {
      _key: 'cZUQGmh4',
      _type: 'span',
      marks: ['abc'],
      text: 'A word of ',
    },
    {
      _key: 'toaiCqIK',
      _type: 'span',
      marks: ['abc', 'em'],
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
}

export default {
  input,
  output:
    '<p><span class="unknown__pt__mark__abc">A word of <em>warning;</em></span> Sanity is addictive.</p>',
}
