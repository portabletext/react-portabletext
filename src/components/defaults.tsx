import type {PortableTextBlock} from '@portabletext/types'
import type {JSX} from 'react'

import type {
  DefaultPortableTextBlockStyle,
  PortableTextBlockComponent,
  PortableTextComponentProps,
  PortableTextReactComponents,
} from '../types'
import {DefaultListItem, defaultLists} from './list'
import {defaultMarks} from './marks'
import {
  DefaultUnknownBlockStyle,
  DefaultUnknownList,
  DefaultUnknownListItem,
  DefaultUnknownMark,
  DefaultUnknownType,
} from './unknown'

export function DefaultHardBreak(): JSX.Element {
  return <br />
}

export function DefaultNormal({
  children,
}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <p>{children}</p>
}

export function DefaultBlockquote({
  children,
}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <blockquote>{children}</blockquote>
}

export function DefaultH1({children}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <h1>{children}</h1>
}

export function DefaultH2({children}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <h2>{children}</h2>
}

export function DefaultH3({children}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <h3>{children}</h3>
}

export function DefaultH4({children}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <h4>{children}</h4>
}

export function DefaultH5({children}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <h5>{children}</h5>
}

export function DefaultH6({children}: PortableTextComponentProps<PortableTextBlock>): JSX.Element {
  return <h6>{children}</h6>
}

export const defaultBlockStyles: Record<DefaultPortableTextBlockStyle, PortableTextBlockComponent> =
  {
    normal: DefaultNormal,
    blockquote: DefaultBlockquote,
    h1: DefaultH1,
    h2: DefaultH2,
    h3: DefaultH3,
    h4: DefaultH4,
    h5: DefaultH5,
    h6: DefaultH6,
  }

export const defaultComponents: PortableTextReactComponents = {
  types: {},

  block: defaultBlockStyles,
  marks: defaultMarks,
  list: defaultLists,
  listItem: DefaultListItem,
  hardBreak: DefaultHardBreak,

  unknownType: DefaultUnknownType,
  unknownMark: DefaultUnknownMark,
  unknownList: DefaultUnknownList,
  unknownListItem: DefaultUnknownListItem,
  unknownBlockStyle: DefaultUnknownBlockStyle,
}
