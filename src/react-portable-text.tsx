import React, {ReactNode, useMemo} from 'react'
import type {
  NodeRenderer,
  PortableTextBlock,
  PortableTextComponents,
  PortableTextProps,
  SerializeOptions,
  TypedObject,
} from './types'
import {
  isListItemBlock,
  isPortableTextBlock,
  isToolkitList,
  isToolkitSpan,
  isToolkitTextNode,
} from './toolkit/asserters'
import {nestLists} from './toolkit/nestLists'
import {mergeComponents} from './components/merge'
import {Block as DefaultBlock, serializeBlock} from './components/block'
import {PortableTextComponentsContext} from './context'
import {usePortableTextComponents} from './hooks'

export function PortableText<B extends TypedObject = PortableTextBlock>({
  blocks: input,
  components: componentOverrides,
}: PortableTextProps<B>) {
  const blocks = Array.isArray(input) ? input : [input]
  const nested = nestLists(blocks)

  const parentComponents = usePortableTextComponents()
  const components = useMemo(() => {
    return componentOverrides
      ? mergeComponents(parentComponents, componentOverrides)
      : parentComponents
  }, [parentComponents, componentOverrides])

  const renderNode = useMemo(() => getNodeRenderer(components), [components])
  const rendered = nested.map((node, index) =>
    renderNode({node, index, isInline: false, renderNode})
  )

  return componentOverrides ? (
    <PortableTextComponentsContext.Provider value={components}>
      {rendered}
    </PortableTextComponentsContext.Provider>
  ) : (
    <>{rendered}</>
  )
}

const getNodeRenderer = (components: PortableTextComponents): NodeRenderer => {
  return function renderNode<N extends TypedObject>(options: SerializeOptions<N>): ReactNode {
    const {node, index, isInline} = options
    const passthrough = {index, isInline, renderNode}
    const key = node._key || `node-${index}`

    if (isToolkitList(node)) {
      const children = node.children.map((child, childIndex) =>
        renderNode({
          node: child._key ? child : {...child, _key: `li-${index}-${childIndex}`},
          index: index,
          isInline,
          renderNode,
        })
      )

      const List = components.list
      return (
        <List key={key} node={node} {...passthrough}>
          {children}
        </List>
      )
    }

    if (isListItemBlock(node)) {
      const tree = serializeBlock({node, index, isInline, renderNode})
      const renderer = components.listItem
      const handler = typeof renderer === 'function' ? renderer : renderer[node.listItem]
      const Li = handler // @todo unknown handler for list styles

      return (
        <Li key={key} node={node} {...passthrough}>
          {tree.children}
        </Li>
      )
    }

    if (isToolkitSpan(node)) {
      const {markDef, markType, markKey} = node
      const Span = components.marks[markType] || components.unknownMark
      const children = node.children.map((child, childIndex) =>
        renderNode({node: child, index: childIndex, isInline: true, renderNode})
      )

      return (
        <Span
          key={key}
          markType={markType}
          markDef={markDef}
          markKey={markKey}
          renderNode={renderNode}
        >
          {children}
        </Span>
      )
    }

    if (isPortableTextBlock(node)) {
      const {_key, ...props} = serializeBlock({node, index, isInline, renderNode})
      const Block = typeof components.block === 'function' ? components.block : DefaultBlock
      return <Block key={key} {...props} renderNode={renderNode} />
    }

    if (isToolkitTextNode(node)) {
      return node.text === '\n' ? <br key={key} /> : node.text
    }

    const Node = components.types[node._type]
    if (Node) {
      return <Node key={key} {...options} />
    }

    const UnknownType = components.unknownType
    return <UnknownType key={key} {...options} />
  }
}
