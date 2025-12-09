'use no memo'

import type {ToolkitNestedPortableTextSpan} from '@portabletext/toolkit'
import type {PortableTextBlock, PortableTextListItemBlock, TypedObject} from '@portabletext/types'

import {
  buildMarksTree,
  isPortableTextBlock,
  isPortableTextListItemBlock,
  isPortableTextToolkitList,
  isPortableTextToolkitSpan,
  isPortableTextToolkitTextNode,
  LIST_NEST_MODE_HTML,
  nestLists,
  spanToPlainText,
} from '@portabletext/toolkit'
import {type ReactNode, useMemo} from 'react'

import type {
  MissingComponentHandler,
  NodeRenderer,
  PortableTextProps,
  PortableTextReactComponents,
  ReactPortableTextList,
  Serializable,
  SerializedBlock,
} from './types'

import {defaultComponents} from './components/defaults'
import {mergeComponents} from './components/merge'
import {
  printWarning,
  unknownBlockStyleWarning,
  unknownListItemStyleWarning,
  unknownListStyleWarning,
  unknownMarkWarning,
  unknownTypeWarning,
} from './warnings'

export function PortableText<B extends TypedObject = PortableTextBlock>({
  value: input,
  components: componentOverrides,
  listNestingMode,
  onMissingComponent: missingComponentHandler = printWarning,
}: PortableTextProps<B>): ReactNode {
  const handleMissingComponent = missingComponentHandler || noop
  const blocks = useMemo(() => (Array.isArray(input) ? input : [input]), [input])
  const nested = useMemo(
    () => nestLists(blocks, listNestingMode || LIST_NEST_MODE_HTML),
    [blocks, listNestingMode],
  )

  const components = useMemo(() => {
    return componentOverrides
      ? mergeComponents(defaultComponents, componentOverrides)
      : defaultComponents
  }, [componentOverrides])

  const renderNode = useMemo(
    () => getNodeRenderer(components, handleMissingComponent),
    [components, handleMissingComponent],
  )
  return useMemo(
    () => nested.map((node, index) => renderNode({node: node, index, isInline: false, renderNode})),
    [nested, renderNode],
  )
}

function getNodeRenderer(
  components: PortableTextReactComponents,
  handleMissingComponent: MissingComponentHandler,
): NodeRenderer {
  // oxlint-disable-next-line jsx-no-new-function-as-prop
  function renderNode<N extends TypedObject>(options: Serializable<N>): ReactNode {
    const {node, index, isInline} = options
    const key = node._key || `node-${index}`

    if (isPortableTextToolkitList(node)) {
      return (
        <RenderList
          key={key}
          renderNode={renderNode}
          components={components}
          handleMissingComponent={handleMissingComponent}
          node={node}
          index={index}
        />
      )
    }

    if (isPortableTextListItemBlock(node)) {
      return (
        <RenderListItem
          key={key}
          renderNode={renderNode}
          components={components}
          handleMissingComponent={handleMissingComponent}
          node={node}
          index={index}
        />
      )
    }

    if (isPortableTextToolkitSpan(node)) {
      return (
        <RenderSpan
          key={key}
          renderNode={renderNode}
          components={components}
          handleMissingComponent={handleMissingComponent}
          node={node}
        />
      )
    }

    if (hasCustomComponentForNode(node)) {
      return (
        <RenderCustomBlock
          key={key}
          renderNode={renderNode}
          components={components}
          node={node}
          index={index}
          isInline={isInline}
        />
      )
    }

    if (isPortableTextBlock(node)) {
      return (
        <RenderBlock
          key={key}
          renderNode={renderNode}
          components={components}
          handleMissingComponent={handleMissingComponent}
          node={node}
          index={index}
          isInline={isInline}
        />
      )
    }

    if (isPortableTextToolkitTextNode(node)) {
      if (node.text === '\n') {
        const HardBreak = components.hardBreak
        return HardBreak ? <HardBreak key={key} /> : '\n'
      }

      return node.text
    }

    return (
      <RenderUnknownType
        key={key}
        renderNode={renderNode}
        components={components}
        handleMissingComponent={handleMissingComponent}
        node={node}
        index={index}
        isInline={isInline}
      />
    )
  }

  function hasCustomComponentForNode(node: TypedObject): boolean {
    return node._type in components.types
  }

  return renderNode
}

function RenderList({
  renderNode,
  components,
  handleMissingComponent,
  node,
  index,
}: {
  renderNode: NodeRenderer
  components: PortableTextReactComponents
  handleMissingComponent: MissingComponentHandler
  node: ReactPortableTextList
  index: number
}) {
  const children = node.children.map((child, childIndex) =>
    renderNode({
      node: child._key ? child : {...child, _key: `li-${index}-${childIndex}`},
      index: childIndex,
      isInline: false,
      renderNode,
    }),
  )

  const component = components.list
  const handler = typeof component === 'function' ? component : component[node.listItem]
  const List = handler || components.unknownList

  if (List === components.unknownList) {
    const style = node.listItem || 'bullet'
    handleMissingComponent(unknownListStyleWarning(style), {
      nodeType: 'listStyle',
      type: style,
    })
  }

  return (
    <List value={node} index={index} isInline={false} renderNode={renderNode}>
      {children}
    </List>
  )
}

function RenderListItem({
  renderNode,
  components,
  handleMissingComponent,
  node,
  index,
}: {
  components: PortableTextReactComponents
  handleMissingComponent: MissingComponentHandler
  renderNode: NodeRenderer
  node: PortableTextListItemBlock
  index: number
}) {
  const tree = serializeBlock({node, index, isInline: false, renderNode})
  const renderer = components.listItem
  const handler = typeof renderer === 'function' ? renderer : renderer[node.listItem]
  const Li = handler || components.unknownListItem

  if (Li === components.unknownListItem) {
    const style = node.listItem || 'bullet'
    handleMissingComponent(unknownListItemStyleWarning(style), {
      type: style,
      nodeType: 'listItemStyle',
    })
  }

  let children = tree.children
  if (node.style && node.style !== 'normal') {
    // Wrap any other style in whatever the block serializer says to use
    const {listItem: _listItem, ...blockNode} = node
    children = renderNode({
      node: blockNode,
      index,
      isInline: false,
      renderNode,
    })
  }

  return (
    <Li value={node} index={index} isInline={false} renderNode={renderNode}>
      {children}
    </Li>
  )
}

function RenderSpan({
  renderNode,
  components,
  handleMissingComponent,
  node,
}: {
  renderNode: NodeRenderer
  components: PortableTextReactComponents
  handleMissingComponent: MissingComponentHandler
  node: ToolkitNestedPortableTextSpan
}) {
  const {markDef, markType, markKey} = node
  const Span = components.marks[markType] || components.unknownMark
  const children = node.children.map((child, childIndex) =>
    renderNode({
      node: child,
      index: childIndex,
      isInline: true,
      renderNode,
    }),
  )

  if (Span === components.unknownMark) {
    handleMissingComponent(unknownMarkWarning(markType), {
      nodeType: 'mark',
      type: markType,
    })
  }

  return (
    <Span
      text={spanToPlainText(node)}
      value={markDef}
      markType={markType}
      markKey={markKey}
      renderNode={renderNode}
    >
      {children}
    </Span>
  )
}

function RenderCustomBlock({
  renderNode,
  components,
  node,
  index,
  isInline,
}: {
  renderNode: NodeRenderer
  components: PortableTextReactComponents
  node: TypedObject
  index: number
  isInline: boolean
}) {
  const Node = components.types[node._type]
  return Node ? (
    <Node value={node} isInline={isInline} index={index} renderNode={renderNode} />
  ) : null
}

function RenderBlock({
  renderNode,
  components,
  handleMissingComponent,
  node,
  index,
  isInline,
}: {
  renderNode: NodeRenderer
  components: PortableTextReactComponents
  handleMissingComponent: MissingComponentHandler
  node: PortableTextBlock
  index: number
  isInline: boolean
}) {
  const block = serializeBlock({
    node,
    index,
    isInline,
    renderNode,
  })
  const style = block.node.style || 'normal'
  const handler =
    typeof components.block === 'function' ? components.block : components.block[style]
  const Block = handler || components.unknownBlockStyle

  if (Block === components.unknownBlockStyle) {
    handleMissingComponent(unknownBlockStyleWarning(style), {
      nodeType: 'blockStyle',
      type: style,
    })
  }

  return useMemo(
    () => (
      <Block
        index={block.index}
        isInline={block.isInline}
        value={block.node}
        renderNode={renderNode}
      >
        {block.children}
      </Block>
    ),
    [block.index, block.children, block.isInline, block.node, Block, renderNode],
  )
}

function RenderUnknownType({
  renderNode,
  components,
  handleMissingComponent,
  node,
  index,
  isInline,
}: {
  renderNode: NodeRenderer
  components: PortableTextReactComponents
  handleMissingComponent: MissingComponentHandler
  node: TypedObject
  index: number
  isInline: boolean
}) {
  handleMissingComponent(unknownTypeWarning(node._type), {
    nodeType: 'block',
    type: node._type,
  })

  const UnknownType = components.unknownType
  return useMemo(
    () => <UnknownType value={node} isInline={isInline} index={index} renderNode={renderNode} />,
    [index, isInline, node, renderNode, UnknownType],
  )
}

function serializeBlock(options: Serializable<PortableTextBlock>): SerializedBlock {
  const {node, index, isInline, renderNode} = options
  const tree = buildMarksTree(node)
  const children = tree.map((child, i) =>
    renderNode({node: child, isInline: true, index: i, renderNode}),
  )

  return {
    _key: node._key || `block-${index}`,
    children,
    index,
    isInline,
    node,
  }
}

function noop() {
  // Intentional noop
}
