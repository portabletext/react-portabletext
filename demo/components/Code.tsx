import './Code.css'
import React from 'react'
import Refractor from 'react-refractor'
import typescript from 'refractor/lang/typescript'
import {PortableTextComponent} from '../../src'

Refractor.registerLanguage(typescript)

export interface CodeBlock {
  _type: 'code'
  code: string
  language?: string
}

export const Code: PortableTextComponent<CodeBlock> = ({value}) => {
  return <Refractor language={value.language || 'js'} value={value.code} />
}
