import React from 'react'
import type {
  BlockStyle,
  PortableTextBlock,
  PortableTextComponent,
  PortableTextComponents,
} from '../types'
import {defaultMarks} from './marks'
import {DefaultList, DefaultListItem} from './list'
import {DefaultUnknownType, DefaultUnknownMark} from './unknown'

const hardBreak = () => <br />

// @todo move these into `./block.tsx` without typescript/tap complaining
export const defaultBlockStyles: Record<
  BlockStyle,
  PortableTextComponent<PortableTextBlock> | undefined
> = {
  normal: ({children}) => <p>{children}</p>,
  blockquote: ({children}) => <blockquote>{children}</blockquote>,
  h1: ({children}) => <h1>{children}</h1>,
  h2: ({children}) => <h2>{children}</h2>,
  h3: ({children}) => <h3>{children}</h3>,
  h4: ({children}) => <h4>{children}</h4>,
  h5: ({children}) => <h5>{children}</h5>,
  h6: ({children}) => <h6>{children}</h6>,
}

export const defaultComponents: PortableTextComponents = {
  block: defaultBlockStyles,
  marks: defaultMarks,
  list: DefaultList,
  listItem: DefaultListItem,
  types: {},
  hardBreak,
  unknownType: DefaultUnknownType,
  unknownMark: DefaultUnknownMark,
}
