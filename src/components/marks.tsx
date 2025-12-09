'use no memo'

import type {TypedObject} from '@portabletext/types'

import type {PortableTextMarkComponent} from '../types'

interface DefaultLinkType extends TypedObject {
  _type: 'link'
  href: string
}

const DefaultLink: PortableTextMarkComponent<DefaultLinkType> = ({children, value}) => (
  <a href={value?.href}>{children}</a>
)

const underlineStyle = {textDecoration: 'underline'}

const DefaultEm: PortableTextMarkComponent = ({children}) => <em>{children}</em>
const DefaultStrong: PortableTextMarkComponent = ({children}) => <strong>{children}</strong>
const DefaultCode: PortableTextMarkComponent = ({children}) => <code>{children}</code>
const DefaultUnderline: PortableTextMarkComponent = ({children}) => (
  <span style={underlineStyle}>{children}</span>
)
const DefaultStrikeThrough: PortableTextMarkComponent = ({children}) => <del>{children}</del>

export const defaultMarks: Record<string, PortableTextMarkComponent | undefined> = {
  em: DefaultEm,
  strong: DefaultStrong,
  code: DefaultCode,
  underline: DefaultUnderline,
  'strike-through': DefaultStrikeThrough,
  link: DefaultLink,
}
