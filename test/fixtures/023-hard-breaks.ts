import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: 'bd73ec5f61a1',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'A paragraph\ncan have hard\n\nbreaks.',
        marks: [],
      },
    ],
  },
]

export default {
  input,
  output: '<p>A paragraph<br/>can have hard<br/><br/>breaks.</p>',
}
