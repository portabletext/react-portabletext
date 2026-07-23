import type {PortableTextBlock, PortableTextListItemBlock} from '@portabletext/types'
import type {JSX} from 'react'

import type {
  PortableTextComponentProps,
  PortableTextMarkComponentProps,
  ReactPortableTextList,
  UnknownNodeType,
} from '../types'
import {unknownTypeWarning} from '../warnings'

const hidden = {display: 'none'}

export function DefaultUnknownType({
  value,
  isInline,
}: PortableTextComponentProps<UnknownNodeType>): JSX.Element {
  const warning = unknownTypeWarning(value._type)
  return isInline ? <span style={hidden}>{warning}</span> : <div style={hidden}>{warning}</div>
}

export function DefaultUnknownMark({
  markType,
  children,
}: PortableTextMarkComponentProps): JSX.Element {
  return <span className={`unknown__pt__mark__${markType}`}>{children}</span>
}

export function DefaultUnknownBlockStyle({
  children,
}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <p>{children}</p>
}

export function DefaultUnknownList({
  children,
}: PortableTextComponentProps<ReactPortableTextList>): JSX.Element {
  return <ul>{children}</ul>
}

export function DefaultUnknownListItem({
  children,
}: PortableTextComponentProps<PortableTextListItemBlock>): JSX.Element {
  return <li>{children}</li>
}
