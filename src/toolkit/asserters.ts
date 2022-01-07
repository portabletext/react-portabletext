import type {
  PortableTextBlock,
  PortableTextListItemBlock,
  PortableTextSpan,
  TypedObject,
} from '../types'
import type {ToolkitNestedPortableTextSpan, ToolkitPortableTextList, ToolkitTextNode} from './types'

export function isPortableTextSpan(node: TypedObject | PortableTextSpan): node is PortableTextSpan {
  return (
    node._type === 'span' &&
    'text' in node &&
    typeof node.text === 'string' &&
    (Array.isArray(node.marks) || typeof node.marks === 'undefined')
  )
}

export function isPortableTextBlock(
  node: PortableTextBlock | TypedObject
): node is PortableTextBlock {
  return (
    // A block doesn't _have_ to be named 'block' - to differentiate between
    // allowed child types and marks, one might name them differently
    typeof node._type === 'string' &&
    // Toolkit-types like nested spans are @-prefixed
    node._type[0] !== '@' &&
    // `markDefs` isn't _required_ per say, but if it's there, it needs to be an array
    (!('markDefs' in node) ||
      (Array.isArray(node.markDefs) &&
        // Every mark definition needs to have an `_key` to be mappable in child spans
        node.markDefs.every((def) => typeof def._key === 'string'))) &&
    // `children` is required and needs to be an array
    'children' in node &&
    Array.isArray(node.children) &&
    // All children are objects with `_type` (usually spans, but can contain other stuff)
    node.children.every((child) => typeof child === 'object' && '_type' in child)
  )
}

export function isListItemBlock(
  block: PortableTextBlock | TypedObject
): block is PortableTextListItemBlock {
  return isPortableTextBlock(block) && 'listItem' in block && typeof block.listItem === 'string'
}

export function isToolkitList(
  block: TypedObject | ToolkitPortableTextList
): block is ToolkitPortableTextList {
  return block._type === '@list'
}

export function isToolkitSpan(
  span: TypedObject | ToolkitNestedPortableTextSpan
): span is ToolkitNestedPortableTextSpan {
  return span._type === '@span'
}

export function isToolkitTextNode(node: TypedObject | ToolkitTextNode): node is ToolkitTextNode {
  return node._type === '@text'
}
