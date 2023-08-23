import React from 'react'
import {render} from 'react-dom'
import {studioTheme, ThemeProvider} from '@sanity/ui'
import {PortableTextComponents} from '../src'
import {PortableText} from '../src/react-portable-text'
import {blocks} from './fixture'

import {Link} from './components/Link'
import {TermDefinition} from './components/TermDefinition'
import {CharacterReference} from './components/CharacterReference'
import {hasSpeechApi, SpeechSynthesis} from './components/SpeechSynthesis'
import {CurrencyAmount} from './components/CurrencyAmount'
import {LinkableHeader} from './components/LinkableHeader'
import {SchnauzerList} from './components/SchnauzerList'
import {AnnotatedMap} from './components/AnnotatedMap'
import {Code} from './components/Code'

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

render(
  <React.StrictMode>
    <ThemeProvider theme={studioTheme}>
      <Demo />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('demo-root'),
)
