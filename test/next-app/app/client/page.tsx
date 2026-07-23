'use client'

import {PortableText} from '@portabletext/react'
import {useState} from 'react'

import {blocks} from '../content'

/**
 * A client component page: `@portabletext/react` resolves through the `default` export
 * condition to the React Compiler-optimized build, both in the browser bundle and during SSR.
 */
export default function ClientPage() {
  const [count, setCount] = useState(0)
  return (
    <main data-testid="client-page">
      <button type="button" onClick={() => setCount((current) => current + 1)}>
        count is {count}
      </button>
      <PortableText value={blocks} />
    </main>
  )
}
