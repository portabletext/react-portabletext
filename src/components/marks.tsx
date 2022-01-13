import React from 'react'
import type {PortableTextMarkComponent, TypedObject} from '../types'

interface DefaultLink extends TypedObject {
  _type: 'link'
  href: string
}

const link: PortableTextMarkComponent<DefaultLink> = ({children, value}) => (
  <a href={value?.href}>{children}</a>
)

const underlineStyle = {textDecoration: 'underline'}

export const defaultMarks: Record<string, PortableTextMarkComponent | undefined> = {
  em: ({children}) => <em>{children}</em>,
  strong: ({children}) => <strong>{children}</strong>,
  code: ({children}) => <code>{children}</code>,

  // @todo Consider whether or not these belong in core
  underline: ({children}) => <span style={underlineStyle}>{children}</span>,
  'strike-through': ({children}) => <del>{children}</del>,
  link,
}
