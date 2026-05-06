import type {
  DefaultPortableTextListItem,
  PortableTextListComponent,
  PortableTextListItemComponent,
} from '../types'

export const defaultLists: Record<DefaultPortableTextListItem, PortableTextListComponent> = {
  number: ({children}) => <ol>{children}</ol>,
  bullet: ({children}) => <ul>{children}</ul>,
}

export const DefaultListItem: PortableTextListItemComponent = ({children}) => <li>{children}</li>
