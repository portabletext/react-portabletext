import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _key: 'R5FvMrjo',
  _type: 'block',
  children: [
    {
      _key: 'cZUQGmh4',
      _type: 'span',
      marks: ['code'],
      text: 'sanity',
    },
    {
      _key: 'toaiCqIK',
      _type: 'span',
      marks: [],
      text: ' is the name of the CLI tool.',
    },
  ],
  markDefs: [],
  style: 'normal',
}

export default {
  input,
  output: '<p><code>sanity</code> is the name of the CLI tool.</p>',
}
