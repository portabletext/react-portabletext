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
      render(<PortableText value={data} />, {reactStrictMode: true})
    },
    {teardown: cleanup},
  )
  bench(
    '@portabletext/react@latest',
    () => {
      render(<PortableTextLatest value={data} />, {reactStrictMode: true})
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
      throws: true,
      setup: () => {
        const result = render(<PortableText value={data} />, {reactStrictMode: true})
        rerender = result.rerender
      },
    },
  )
  bench(
    '@portabletext/react@latest',
    () => {
      rerender(<PortableText value={[...data]} />)
    },
    {
      throws: true,
      setup: () => {
        const result = render(<PortableTextLatest value={data} />, {reactStrictMode: true})
        rerender = result.rerender
      },
    },
  )
})
