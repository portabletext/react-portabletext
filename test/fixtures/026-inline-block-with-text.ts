import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: 'foo',
    style: 'normal',
    children: [
      {_type: 'span', text: 'Men, '},
      {_type: 'button', text: 'bli med du også'},
      {_type: 'span', text: ', da!'},
    ],
  },
]

export default {
  input,
  output: '<p>Men, <button type="button">bli med du også</button>, da!</p>',
}
