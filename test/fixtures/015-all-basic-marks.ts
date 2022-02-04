import type {PortableTextBlock} from '@portabletext/types'

const input: PortableTextBlock = {
  _key: 'R5FvMrjo',
  _type: 'block',
  children: [
    {
      _key: 'a',
      _type: 'span',
      marks: ['code'],
      text: 'code',
    },
    {
      _key: 'b',
      _type: 'span',
      marks: ['strong'],
      text: 'strong',
    },
    {
      _key: 'c',
      _type: 'span',
      marks: ['em'],
      text: 'em',
    },
    {
      _key: 'd',
      _type: 'span',
      marks: ['underline'],
      text: 'underline',
    },
    {
      _key: 'e',
      _type: 'span',
      marks: ['strike-through'],
      text: 'strike-through',
    },
    {
      _key: 'f',
      _type: 'span',
      marks: ['dat-link'],
      text: 'link',
    },
  ],
  markDefs: [
    {
      _key: 'dat-link',
      _type: 'link',
      href: 'https://www.sanity.io/',
    },
  ],
  style: 'normal',
}

export default {
  input,
  output: [
    '<p>',
    '<code>code</code>',
    '<strong>strong</strong>',
    '<em>em</em>',
    '<span style="text-decoration:underline">underline</span>',
    '<del>strike-through</del>',
    '<a href="https://www.sanity.io/">link</a>',
    '</p>',
  ].join(''),
}
