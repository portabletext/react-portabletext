import type {PortableTextListItemBlock} from '@portabletext/types'
import type {JSX} from 'react'

import type {
  DefaultPortableTextListItem,
  PortableTextComponentProps,
  PortableTextListComponent,
  ReactPortableTextList,
} from '../types'

export function DefaultNumberList({
  children,
}: PortableTextComponentProps<ReactPortableTextList>): JSX.Element {
  return <ol>{children}</ol>
}

export function DefaultBulletList({
  children,
}: PortableTextComponentProps<ReactPortableTextList>): JSX.Element {
  return <ul>{children}</ul>
}

export function DefaultListItem({
  children,
}: PortableTextComponentProps<PortableTextListItemBlock>): JSX.Element {
  return <li>{children}</li>
}

export const defaultLists: Record<DefaultPortableTextListItem, PortableTextListComponent> = {
  number: DefaultNumberList,
  bullet: DefaultBulletList,
}
