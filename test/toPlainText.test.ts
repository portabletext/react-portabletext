import {toPlainText} from '@portabletext/react'
import {test} from 'vitest'

import * as fixtures from './fixtures'

test('can extract text from all fixtures without crashing', ({expect}) => {
  for (const [key, fixture] of Object.entries(fixtures)) {
    if (key === 'default') {
      continue
    }

    const output = toPlainText(fixture.input)
    expect(output).toBeTypeOf('string')
  }
})

test('can extract text from a properly formatted block', ({expect}) => {
  const text = toPlainText([
    {
      _type: 'block',
      markDefs: [{_type: 'link', _key: 'a1b', href: 'https://some.url/'}],
      children: [
        {_type: 'span', text: 'Plain '},
        {_type: 'span', text: 'text', marks: ['em']},
        {_type: 'span', text: ', even with '},
        {_type: 'span', text: 'annotated value', marks: ['a1b']},
        {_type: 'span', text: '.'},
      ],
    },
    {
      _type: 'otherBlockType',
      children: [{_type: 'span', text: 'Should work?'}],
    },
  ])

  expect(text).toBe('Plain text, even with annotated value.\n\nShould work?')
})
