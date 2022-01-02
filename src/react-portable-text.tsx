import React, {ReactNode, useMemo} from 'react'
import type {SerializedBlock} from './toolkit/types'
import type {
  NodeRenderer,
  PortableTextBlock,
  PortableTextComponents,
  PortableTextProps,
  Serializable,
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
import {buildMarksTree} from './toolkit/buildMarksTree'
import {mergeComponents} from './components/merge'
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
    renderNode({node: node, index, isInline: false, renderNode})
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
  return function renderNode<N extends TypedObject>(options: Serializable<N>): ReactNode {
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

      const component = components.list
      const handler = typeof component === 'function' ? component : component[node.listItem]
      const List = handler || components.unknownList
      return (
        <List key={key} data={node} {...passthrough}>
          {children}
        </List>
      )
    }

    if (isListItemBlock(node)) {
      const tree = serializeBlock({node, index, isInline, renderNode})
      const renderer = components.listItem
      const handler = typeof renderer === 'function' ? renderer : renderer[node.listItem]
      const Li = handler || components.unknownListItem

      let children = tree.children
      if (node.style && node.style !== 'normal') {
        // Wrap any other style in whatever the block serializer says to use
        const {listItem, ...blockNode} = node
        children = renderNode({node: blockNode, index, isInline, renderNode})
      }

      return (
        <Li key={key} data={node} {...passthrough}>
          {children}
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
      const style = props.node.style || 'normal'
      const handler =
        typeof components.block === 'function' ? components.block : components.block[style]
      const Block = handler || components.unknownBlockStyle
      return <Block key={key} {...props} data={props.node} renderNode={renderNode} />
    }

    if (isToolkitTextNode(node)) {
      if (node.text === '\n') {
        const HardBreak = components.hardBreak
        return HardBreak ? <HardBreak key={key} /> : '\n'
      }

      return node.text
    }

    const Node = components.types[node._type]

    const nodeOptions = {...options, node: undefined, data: options.node}
    delete nodeOptions.node

    if (Node) {
      return <Node key={key} {...nodeOptions} />
    }

    const UnknownType = components.unknownType
    return <UnknownType key={key} {...nodeOptions} />
  }
}

function serializeBlock(options: Serializable<PortableTextBlock>): SerializedBlock {
  const {node, index, isInline, renderNode} = options
  const tree = buildMarksTree(node)
  const children = tree.map((child, i) =>
    renderNode({node: child, isInline: true, index: i, renderNode})
  )

  return {
    _key: node._key || `block-${index}`,
    children,
    index,
    isInline,
    node,
  }
}
