import React from 'react'
import ReactDOM from 'react-dom/server'
import tap from 'tap'
import {PortableText} from '../src/react-portable-text'
import type {PortableTextComponents, PortableTextProps} from '../src/types'
import * as fixtures from './fixtures'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText {...props} />)

tap.test('never mutates input', (t) => {
  for (const [key, fixture] of Object.entries(fixtures)) {
    if (key === 'default') {
      continue
    }

    const highlight = () => <mark />
    const components: Partial<PortableTextComponents> = {
      marks: {highlight},
      unknownMark: ({children}) => <span>{children}</span>,
      unknownType: ({children}) => <div>{children}</div>,
    }
    const originalInput = JSON.parse(JSON.stringify(fixture.input))
    const passedInput = fixture.input
    try {
      render({
        value: passedInput as any,
        components,
      })
    } catch (error) {
      // ignore
    }
    t.same(originalInput, passedInput)
  }

  t.end()
})
