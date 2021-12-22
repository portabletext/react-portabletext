import React from 'react'
import type {
  PortableTextComponent,
  PortableTextListItemBlock,
  ReactPortableTextList,
} from '../types'

export const DefaultList: PortableTextComponent<ReactPortableTextList> = ({children, node}) =>
  node.listItem === 'number' ? <ol>{children}</ol> : <ul>{children}</ul>

export const DefaultListItem: PortableTextComponent<PortableTextListItemBlock> = ({
  index,
  isInline,
  children: rawChildren,
  node,
  renderNode,
}) => {
  const {listItem, ...blockNode} = node
  const children =
    !node.style || node.style === 'normal'
      ? // Don't wrap plain text in paragraphs inside of a list item
        rawChildren
      : // But wrap any other style in whatever the block serializer says to use
        renderNode({node: blockNode, index, isInline, renderNode})

  return <li>{children}</li>
}
