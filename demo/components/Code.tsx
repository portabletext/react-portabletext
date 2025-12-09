// oxlint-disable-next-line no-unassigned-import
import './Code.css'
import {Refractor, registerLanguage} from 'react-refractor'
import typescript from 'refractor/typescript'

import type {PortableTextComponent} from '../../src'

// Prism auto-highlights, but we only want the API, so we need to set it to manual mode
if (typeof window !== 'undefined') {
  const prismWindow = window as any
  prismWindow.Prism = prismWindow.Prism || {}
  prismWindow.Prism.manual = true
}

registerLanguage(typescript)

export interface CodeBlock {
  _type: 'code'
  code: string
  language?: string
}

export const Code: PortableTextComponent<CodeBlock> = ({value}) => {
  return <Refractor language={value.language || 'js'} value={value.code} />
}
