import {type PortableTextComponents, PortableText} from '@portabletext/react'
import {studioTheme, ThemeProvider} from '@sanity/ui'
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'

import {AnnotatedMap} from './components/AnnotatedMap'
import {CharacterReference} from './components/CharacterReference'
import {Code} from './components/Code'
import {CurrencyAmount} from './components/CurrencyAmount'
import {Link} from './components/Link'
import {LinkableHeader} from './components/LinkableHeader'
import {SchnauzerList} from './components/SchnauzerList'
import {hasSpeechApi, SpeechSynthesis} from './components/SpeechSynthesis'
import {TermDefinition} from './components/TermDefinition'
import {blocks} from './fixture'

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

function Demo() {
  return <PortableText value={blocks} components={ptComponents} />
}

const root = createRoot(document.getElementById('demo-root')!)
root.render(
  <StrictMode>
    <ThemeProvider theme={studioTheme}>
      <Demo />
    </ThemeProvider>
  </StrictMode>,
)
