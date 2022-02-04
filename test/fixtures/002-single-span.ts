import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _key: 'R5FvMrjo',
  _type: 'block',
  children: [
    {
      _key: 'cZUQGmh4',
      _type: 'span',
      marks: [],
      text: 'Plain text.',
    },
  ],
  markDefs: [],
  style: 'normal',
}

export default {
  input,
  output: '<p>Plain text.</p>',
}
