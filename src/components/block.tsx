import React, {ReactNode} from 'react'
import {usePortableTextComponents} from '../hooks'
import {buildMarksTree} from '../toolkit/buildMarksTree'
import type {
  PortableTextBlock,
  PortableTextComponent,
  PortableTextListItemBlock,
  SerializeOptions,
} from '../types'

interface SerializedBlock {
  _key: string
  children: ReactNode
  index: number
  isInline: boolean
  node: PortableTextBlock | PortableTextListItemBlock
}

export const Block: PortableTextComponent<PortableTextBlock> = (props) => {
  // @todo `unknownStyle` as fallback instead of `<p>`
  // Get the individual block style renderers
  const {block} = usePortableTextComponents()
  const styles = typeof block === 'object' ? block : {}

  // Pick the corresponding style renderer
  const style = props.node.style || ''
  const PTBlock = styles[style]

  return PTBlock ? <PTBlock {...props} /> : <p>{props.children}</p>
}

export function serializeBlock(options: SerializeOptions<PortableTextBlock>): SerializedBlock {
  const {node, index, isInline, renderNode} = options
  const tree = buildMarksTree(node)
  const children = tree.map((child, i) => {
    return renderNode({node: child, isInline: true, index: i, renderNode})
  })

  return {
    _key: node._key || `block-${index}`,
    children,
    index,
    isInline,
    node,
  }
}
