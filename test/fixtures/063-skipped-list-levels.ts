import type {PortableTextBlock} from '@portabletext/types'

function listItem(text: string, level: number, style = 'bullet'): PortableTextBlock {
  return {
    _type: 'block',
    _key: text.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
    children: [{_type: 'span', marks: [], text}],
    markDefs: [],
    style: 'normal',
    level,
    listItem: style,
  }
}

const input: PortableTextBlock[] = [
  // Starts deeper than level 1
  listItem('Level 3, item 1', 3, 'number'),
  listItem('Level 1, item 2', 1, 'number'),

  // Skips two levels at a time, then back to the top
  listItem('Level 1 bullet', 1),
  listItem('Level 4 bullet', 4),
  listItem('Level 1 bullet again', 1),

  // Skips levels _and_ changes list style, then returns to the level it came from
  listItem('Level 1 number', 1, 'number'),
  listItem('Level 3 bullet', 3),
  listItem('Level 1 number again', 1, 'number'),
]

export default {
  input,
  output: [
    // Starts at level 3: two generated ancestor lists, each in an empty list item
    '<ol>',
    '<li>',
    '<ol>',
    '<li>',
    '<ol>',
    '<li>Level 3, item 1</li>',
    '</ol>',
    '</li>',
    '</ol>',
    '</li>',
    '<li>Level 1, item 2</li>',
    '</ol>',

    // Level 1 -> 4: levels 2 and 3 are generated as empty list items
    '<ul>',
    '<li>',
    'Level 1 bullet',
    '<ul>',
    '<li>',
    '<ul>',
    '<li>',
    '<ul>',
    '<li>Level 4 bullet</li>',
    '</ul>',
    '</li>',
    '</ul>',
    '</li>',
    '</ul>',
    '</li>',
    '<li>Level 1 bullet again</li>',
    '</ul>',

    // The deeper bullet list nests into the ordered item it follows, and the
    // generated level 2 list takes the style of the incoming item
    '<ol>',
    '<li>',
    'Level 1 number',
    '<ul>',
    '<li>',
    '<ul>',
    '<li>Level 3 bullet</li>',
    '</ul>',
    '</li>',
    '</ul>',
    '</li>',
    // Returning to level 1 rejoins the original ordered list
    '<li>Level 1 number again</li>',
    '</ol>',
  ].join(''),
}
