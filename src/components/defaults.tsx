'use no memo'

import type {PortableTextBlockStyle} from '@portabletext/types'
import type {JSX} from 'react'

import type {PortableTextBlockComponent, PortableTextReactComponents} from '../types'

import {DefaultListItem, defaultLists} from './list'
import {defaultMarks} from './marks'
import {
  DefaultUnknownBlockStyle,
  DefaultUnknownList,
  DefaultUnknownListItem,
  DefaultUnknownMark,
  DefaultUnknownType,
} from './unknown'

const DefaultHardBreak = (): JSX.Element => <br />

const DefaultParagraph: PortableTextBlockComponent = ({children}) => <p>{children}</p>
const DefaultBlockquote: PortableTextBlockComponent = ({children}) => (
  <blockquote>{children}</blockquote>
)
const DefaultH1: PortableTextBlockComponent = ({children}) => <h1>{children}</h1>
const DefaultH2: PortableTextBlockComponent = ({children}) => <h2>{children}</h2>
const DefaultH3: PortableTextBlockComponent = ({children}) => <h3>{children}</h3>
const DefaultH4: PortableTextBlockComponent = ({children}) => <h4>{children}</h4>
const DefaultH5: PortableTextBlockComponent = ({children}) => <h5>{children}</h5>
const DefaultH6: PortableTextBlockComponent = ({children}) => <h6>{children}</h6>

const defaultBlockStyles: Record<PortableTextBlockStyle, PortableTextBlockComponent | undefined> = {
  normal: DefaultParagraph,
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
