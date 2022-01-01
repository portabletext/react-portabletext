import React from 'react'
import type {
  PortableTextComponent,
  PortableTextListItemBlock,
  ReactPortableTextList,
} from '../types'

export const defaultLists: Record<
  'number' | 'bullet',
  PortableTextComponent<ReactPortableTextList>
> = {
  number: ({children}) => <ol>{children}</ol>,
  bullet: ({children}) => <ul>{children}</ul>,
}

export const DefaultListItem: PortableTextComponent<PortableTextListItemBlock> = ({children}) => (
  <li>{children}</li>
)
