import type {PortableTextBlock} from '../../src/types'

const input: PortableTextBlock = {
  _type: 'block',
  children: [
    {
      _key: 'a1ph4',
      _type: 'span',
      marks: ['mark1', 'em', 'mark2'],
      text: 'Sanity',
    },
    {
      _key: 'b374',
      _type: 'span',
      marks: ['mark2', 'mark1', 'em'],
      text: ' FTW',
    },
  ],
  markDefs: [
    {
      _key: 'mark1',
      _type: 'highlight',
      thickness: 1,
    },
    {
      _key: 'mark2',
      _type: 'highlight',
      thickness: 3,
    },
  ],
}

export default {
  input,
  output: [
    '<p>',
    '<span style="border:1px solid">',
    '<span style="border:3px solid">',
    '<em>Sanity FTW</em>',
    '</span>',
    '</span>',
    '</p>',
  ].join(''),
}
