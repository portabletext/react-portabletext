import {type PortableTextBlock, type PortableTextComponents, PortableText} from '@portabletext/react-latest'
import {studioTheme, ThemeProvider} from '@sanity/ui'
import {StrictMode, Suspense, use, useEffect, useState} from 'react'
import {createRoot} from 'react-dom/client'
import {createClient} from '@sanity/client'

import {AnnotatedMap} from './components/AnnotatedMap'
import {CharacterReference} from './components/CharacterReference'
import {Code} from './components/Code'
import {CurrencyAmount} from './components/CurrencyAmount'
import {Link} from './components/Link'
import {LinkableHeader} from './components/LinkableHeader'
import {SchnauzerList} from './components/SchnauzerList'
import {hasSpeechApi, SpeechSynthesis} from './components/SpeechSynthesis'
import {TermDefinition} from './components/TermDefinition'
// import {blocks} from './fixture'

/**
 * Note that these are statically defined (outside the scope of a function),
 * which ensures that unnecessary rerenders does not happen because of a new
 * components object being generated on every render. The alternative is to
 * `useMemo()`, but if you can get away with this approach it is _better_.
 **/
const ptComponents: PortableTextComponents = {
  // Components for totally custom types outside the scope of Portable Text
  types: {
    code: Code,
    currencyAmount: CurrencyAmount,
    annotatedMap: AnnotatedMap,
  },

  // Overrides for specific block styles - in this case just the `h2` style
  block: {
    h2: LinkableHeader,
  },

  // Implements a custom component to handle the `schnauzer` list item type
  list: {
    schnauzer: SchnauzerList,
  },

  // Custom components for marks - note that `link` overrides the default component,
  // while the others define components for totally custom types.
  marks: {
    link: Link,
    characterReference: CharacterReference,
    speech: hasSpeechApi ? SpeechSynthesis : undefined,
    definition: TermDefinition,
  },
}

const client = createClient({projectId: 'ppsg7ml5', dataset: 'test', apiVersion: '2025-12-09', useCdn: true, perspective: 'published'})
const promise = client.fetch<PortableTextBlock[]>(`*[_type == "simpleBlock" && _id == $id][0].body`, {id: '6468a09e-ce29-48d3-8b36-4b058366e6b5'})

function Demo() {
  const blocks = use(promise)
  const [count, setCount] = useState(0)
  const showingEverything = count >= blocks.length
  const blocksToShow = showingEverything ? blocks : blocks.slice(0, count)
  useEffect(() => {
    if (showingEverything) {
      // setCount(count + 100)
      return undefined
    }
    const raf = requestAnimationFrame(() => setCount( count + 30))
    return () => cancelAnimationFrame(raf)
  }, [showingEverything, count])
  return <PortableText value={blocksToShow} components={ptComponents} />
}

const root = createRoot(document.getElementById('demo-root')!)
root.render(
  <StrictMode>
    <ThemeProvider theme={studioTheme}>
      <Suspense fallback={<div>Loading...</div>}>
        <Demo />
      </Suspense>
    </ThemeProvider>
  </StrictMode>,
)
