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
import {LinkableHeader} from './components/LinkableHeader'
import {SchnauzerList} from './components/SchnauzerList'
import {AnnotatedMap} from './components/AnnotatedMap'
import {Code} from './components/Code'

const ptComponents: PortableTextComponents = {
  types: {
    code: Code,
    annotatedMap: AnnotatedMap,
  },
  block: {
    h2: LinkableHeader,
  },
  list: {
    schnauzer: SchnauzerList,
  },
  marks: {
    link: Link,
    characterReference: CharacterReference,
    speech: hasSpeechApi ? SpeechSynthesis : undefined,
    definition: TermDefinition,
  },
}

render(
  <ThemeProvider theme={studioTheme}>
    <PortableText value={blocks} components={ptComponents} />
  </ThemeProvider>,
  document.getElementById('demo-root')
)
