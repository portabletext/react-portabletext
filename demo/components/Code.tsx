import 'highlight.js/styles/github.css'
import React from 'react'
import Lowlight from 'react-lowlight'
import typescript from 'highlight.js/lib/languages/typescript'
import {PortableTextComponent} from '../../src'

Lowlight.registerLanguage('ts', typescript)
Lowlight.registerLanguage('typescript', typescript)

export interface CodeBlock {
  _type: 'code'
  code: string
  language?: string
}

export const Code: PortableTextComponent<CodeBlock> = ({value}) => {
  return <Lowlight language={value.language || 'js'} value={value.code} />
}
