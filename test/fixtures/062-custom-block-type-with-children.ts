import type {ArbitraryTypedObject} from '@portabletext/types'

const input: ArbitraryTypedObject[] = [
  {
    _type: 'quote',
    _key: '9a15ea2ed8a2',
    background: 'blue',
    children: [
      {
        _type: 'span',
        _key: '9a15ea2ed8a2',
        text: 'This is an inspirational quote',
      },
    ],
  },
]

export default {
  input,
  output: '<p style="background:blue">Customers say: This is an inspirational quote</p>',
}
