import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _key: 'R5FvMrjo',
  _type: 'block',
  children: [
    {
      _key: 'cZUQGmh4',
      _type: 'span',
      marks: [],
      text: 'Dat heading',
    },
  ],
  markDefs: [],
  style: 'h2',
}

export default {
  input,
  output: '<h2>Dat heading</h2>',
}
