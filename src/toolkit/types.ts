import type {
  ArbitraryTypedObject,
  MarkDefinition,
  PortableTextBlock,
  PortableTextListItemBlock,
  PortableTextSpan,
  TypedObject,
} from '../types'

export interface ToolkitPortableTextList {
  _type: '@list'
  _key: string
  level: number
  listItem: string
  children: ToolkitPortableTextListItem[]
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
