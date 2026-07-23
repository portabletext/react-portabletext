import {PortableText} from '@portabletext/react'

import {blocks} from './content'

// Render at request time so `next start` + fetch exercises the react-server build live -
// a static prerender would hide resolution failures behind the build step.
export const dynamic = 'force-dynamic'

/**
 * A pure React Server Component (no `'use client'` anywhere in its module graph):
 * `@portabletext/react` must resolve through the `react-server` export condition to the
 * uncompiled build, since React Compiler output cannot load in the react-server environment.
 */
export default function ServerPage() {
  return (
    <main data-testid="rsc-page">
      <PortableText value={blocks} />
    </main>
  )
}
