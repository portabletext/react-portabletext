'use no memo'

import type {PortableTextListComponent, PortableTextListItemComponent} from '../types'

const DefaultNumberList: PortableTextListComponent = ({children}) => <ol>{children}</ol>
const DefaultBulletList: PortableTextListComponent = ({children}) => <ul>{children}</ul>

export const defaultLists: Record<'number' | 'bullet', PortableTextListComponent> = {
  number: DefaultNumberList,
  bullet: DefaultBulletList,
}

export const DefaultListItem: PortableTextListItemComponent = ({children}) => <li>{children}</li>
