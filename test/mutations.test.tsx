/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactDOM from 'react-dom/server'
import {test} from 'vitest'

import {PortableText} from '../src/react-portable-text'
import type {PortableTextProps, PortableTextReactComponents} from '../src/types'
import * as fixtures from './fixtures'

const render = (props: PortableTextProps) =>
  ReactDOM.renderToStaticMarkup(<PortableText {...props} onMissingComponent={false} />)

test('never mutates input', ({expect}) => {
  for (const [key, fixture] of Object.entries(fixtures)) {
    if (key === 'default') {
      continue
    }

    const highlight = () => <mark />
    const components: Partial<PortableTextReactComponents> = {
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
    expect(originalInput).toStrictEqual(passedInput)
  }
})
