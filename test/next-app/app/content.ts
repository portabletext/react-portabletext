import type {PortableTextBlock} from '@portabletext/react'

/**
 * Rendered by both routes; `run.mjs` asserts the served HTML of each route contains the
 * heading, the strong mark, the link href and the list item.
 */
export const blocks: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: 'heading',
    style: 'h1',
    children: [{_type: 'span', _key: 'heading-span', text: 'Portable Text in Next.js', marks: []}],
  },
  {
    _type: 'block',
    _key: 'paragraph',
    style: 'normal',
    markDefs: [{_type: 'link', _key: 'link-def', href: 'https://portabletext.org'}],
    children: [
      {_type: 'span', _key: 'paragraph-1', text: 'Rendered with ', marks: []},
      {_type: 'span', _key: 'paragraph-2', text: 'strong emphasis', marks: ['strong']},
      {_type: 'span', _key: 'paragraph-3', text: ' and a ', marks: []},
      {_type: 'span', _key: 'paragraph-4', text: 'link', marks: ['link-def']},
    ],
  },
  {
    _type: 'block',
    _key: 'list-item',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    children: [{_type: 'span', _key: 'list-span', text: 'a bullet list item', marks: []}],
  },
]
