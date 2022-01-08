import tap from 'tap'
import {toPlainText} from '../src'
import * as fixtures from './fixtures'

tap.test('can extract text from all fixtures without crashing', (t) => {
  for (const [key, fixture] of Object.entries(fixtures)) {
    if (key === 'default') {
      continue
    }

    const output = toPlainText(fixture.input)
    t.same(typeof output, 'string')
  }
  t.end()
})

tap.test('can extract text from a properly formatted block', (t) => {
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

  t.same(text, 'Plain text, even with annotated value.\n\nShould work?')
  t.end()
})
