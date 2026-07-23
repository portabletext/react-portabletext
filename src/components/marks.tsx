import type {TypedObject} from '@portabletext/types'
import type {JSX} from 'react'

import type {
  DefaultPortableTextMark,
  PortableTextMarkComponent,
  PortableTextMarkComponentProps,
} from '../types'

interface DefaultLinkMark extends TypedObject {
  _type: 'link'
  href: string
}

const underlineStyle = {textDecoration: 'underline'}

function DefaultEm({children}: PortableTextMarkComponentProps): JSX.Element {
  return <em>{children}</em>
}

function DefaultStrong({children}: PortableTextMarkComponentProps): JSX.Element {
  return <strong>{children}</strong>
}

function DefaultCode({children}: PortableTextMarkComponentProps): JSX.Element {
  return <code>{children}</code>
}

function DefaultUnderline({children}: PortableTextMarkComponentProps): JSX.Element {
  return <span style={underlineStyle}>{children}</span>
}

function DefaultStrikeThrough({children}: PortableTextMarkComponentProps): JSX.Element {
  return <del>{children}</del>
}

function DefaultLink({
  children,
  value,
}: PortableTextMarkComponentProps<DefaultLinkMark>): JSX.Element {
  return <a href={value?.href}>{children}</a>
}

export const defaultMarks: Record<DefaultPortableTextMark, PortableTextMarkComponent> = {
  em: DefaultEm,
  strong: DefaultStrong,
  code: DefaultCode,
  underline: DefaultUnderline,
  'strike-through': DefaultStrikeThrough,
  link: DefaultLink,
}
