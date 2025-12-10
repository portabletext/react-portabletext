// @vitest-environment happy-dom

import {PortableText} from '@portabletext/react'
import {PortableText as PortableTextLatest} from '@portabletext/react-latest'
import {render, cleanup} from '@testing-library/react'
import {renderToStaticMarkup} from 'react-dom/server'
import {bench, describe} from 'vitest'

import data from './data/large-array.json' with {type: 'json'}

describe('renderToStaticMarkup', () => {
  bench('src', () => {
    renderToStaticMarkup(<PortableText value={data} />)
  })
  bench('@portabletext/react@latest', () => {
    renderToStaticMarkup(<PortableTextLatest value={data} />)
  })
})

describe('initial render', () => {
  bench(
    'src',
    () => {
      render(<PortableText value={data} />)
    },
    {teardown: cleanup},
  )
  bench(
    '@portabletext/react@latest',
    () => {
      render(<PortableTextLatest value={data} />)
    },
    {teardown: cleanup},
  )
})

describe('rerender', () => {
  let rerender: (ui: React.ReactNode) => void
  bench(
    'src',
    () => {
      rerender(<PortableText value={[...data]} />)
    },
    {
      setup: () => {
        const result = render(<PortableText value={data} />)
        rerender = result.rerender
      },
      teardown: cleanup,
    },
  )
  bench(
    '@portabletext/react@latest',
    () => {
      rerender(<PortableTextLatest value={[...data]} />)
    },
    {
      setup: () => {
        const result = render(<PortableTextLatest value={data} />)
        rerender = result.rerender
      },
      teardown: cleanup,
    },
  )
})
