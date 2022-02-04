import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _type: 'block',
  children: [
    {
      _key: 'a1ph4',
      _type: 'span',
      marks: ['mark1'],
      text: 'Sanity',
    },
  ],
  markDefs: [
    {
      _key: 'mark1',
      _type: 'highlight',
      thickness: 5,
    },
  ],
}

export default {
  input,
  output: '<p><span style="border:5px solid">Sanity</span></p>',
}
