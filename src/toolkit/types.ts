import type {ReactNode} from 'react'
import type {
  ArbitraryTypedObject,
  MarkDefinition,
  PortableTextBlock,
  PortableTextListItemBlock,
  PortableTextSpan,
  TypedObject,
} from '../types'

/* eslint-disable no-shadow, no-unused-vars */
export enum ListNestMode {
  Html = 'html',
  Direct = 'direct',
}
/* eslint-enable no-shadow, no-unused-vars */

export type ToolkitPortableTextList = ToolkitPortableTextHtmlList | ToolkitPortableTextDirectList
export interface ToolkitPortableTextHtmlList {
  _type: '@list'
  _key: string
  mode: 'html'
  level: number
  listItem: string
  children: ToolkitPortableTextListItem[]
}

export interface ToolkitPortableTextDirectList {
  _type: '@list'
  _key: string
  mode: 'direct'
  level: number
  listItem: string
  children: (PortableTextListItemBlock | ToolkitPortableTextDirectList)[]
}

export interface ToolkitPortableTextListItem
  extends PortableTextListItemBlock<MarkDefinition, PortableTextSpan | ToolkitPortableTextList> {}

export interface ToolkitTextNode {
  _type: '@text'
  text: string
}

export interface ToolkitNestedPortableTextSpan<M extends MarkDefinition = MarkDefinition> {
  _type: '@span'
  _key?: string
  markDef?: M
  markKey?: string
  markType: string
  children: (
    | ToolkitTextNode
    | ToolkitNestedPortableTextSpan<MarkDefinition>
    | ArbitraryTypedObject
  )[]
}

export type ToolkitNestedPortableTextBlock<
  M extends MarkDefinition = MarkDefinition,
  C extends TypedObject = never
> = PortableTextBlock<M, C | ToolkitNestedPortableTextSpan<M>>

export interface SerializedBlock {
  _key: string
  children: ReactNode
  index: number
  isInline: boolean
  node: PortableTextBlock | PortableTextListItemBlock
}
