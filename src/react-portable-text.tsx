import type {
  ToolkitListNestMode,
  ToolkitNestedPortableTextSpan,
  ToolkitTextNode,
} from '@portabletext/toolkit'
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
import type {
  PortableTextBlock,
  PortableTextListItemBlock,
  PortableTextMarkDefinition,
  PortableTextSpan,
  TypedObject,
} from '@portabletext/types'
import {memo, type ReactNode, useMemo} from 'react'

import {defaultComponents} from './components/defaults'
import {mergeComponents} from './components/merge'
import type {
  MissingComponentHandler,
  NodeRenderer,
  PortableTextProps,
  PortableTextReactComponents,
  ReactPortableTextList,
  Serializable,
  SerializedBlock,
} from './types'
import {
  printWarning,
  unknownBlockStyleWarning,
  unknownListItemStyleWarning,
  unknownListStyleWarning,
  unknownMarkWarning,
  unknownTypeWarning,
} from './warnings'

export const PortableText = memo(function PortableTextComponent<
  B extends TypedObject = PortableTextBlock,
>({
  value,
  components,
  listNestingMode,
  onMissingComponent: missingComponentHandler = printWarning,
}: PortableTextProps<B>): JSX.Element {
  const renderNode = useMemo(
    () =>
      getNodeRenderer(
        components ? mergeComponents(defaultComponents, components) : defaultComponents,
        missingComponentHandler || noop,
      ),
    [components, missingComponentHandler],
  )

  return (
    <PortableTextRenderer
      listNestingMode={listNestingMode || LIST_NEST_MODE_HTML}
      renderNode={renderNode}
      value={value}
    />
  )
})

function PortableTextRenderer<B extends TypedObject = PortableTextBlock>({
  listNestingMode,
  renderNode,
  value,
}: {
  listNestingMode: ToolkitListNestMode
  renderNode: NodeRenderer
  value: B | B[]
}): JSX.Element {
  const blocks = Array.isArray(value) ? value : [value]
  const nested = nestLists(blocks, listNestingMode)
  const rendered = nested.map((node, index) =>
    renderNode({node: node, index, isInline: false, renderNode}),
  )

  return <>{rendered}</>
}

const getNodeRenderer = (
  components: PortableTextReactComponents,
  handleMissingComponent: MissingComponentHandler,
): NodeRenderer => {
  const renderNode = <N extends TypedObject>(options: Serializable<N>): ReactNode => {
    const {node, index, isInline} = options
    const key = node._key || `node-${index}`

    if (isPortableTextToolkitList(node)) {
      return renderList(node, index, key)
    }

    if (isPortableTextListItemBlock(node)) {
      return renderListItem(node, index, key)
    }

    if (isPortableTextToolkitSpan(node)) {
      return renderSpan(node, index, key)
    }

    if (hasCustomComponentForNode(node)) {
      return renderCustomBlock(node, index, key, isInline)
    }

    if (isPortableTextBlock(node)) {
      return renderBlock(node, index, key, isInline)
    }

    if (isPortableTextToolkitTextNode(node)) {
      return renderText(node, key)
    }

    return renderUnknownType(node, index, key, isInline)
  }

  const hasCustomComponentForNode = (node: TypedObject): boolean => {
    return node._type in components.types
  }

  /* eslint-disable react/jsx-no-bind */
  const renderListItem = (
    node: PortableTextListItemBlock<PortableTextMarkDefinition, PortableTextSpan>,
    index: number,
    key: string,
  ) => {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {listItem, ...blockNode} = node
      children = renderNode({node: blockNode, index, isInline: false, renderNode})
    }

    return (
      <Li key={key} value={node} index={index} isInline={false} renderNode={renderNode}>
        {children}
      </Li>
    )
  }

  const renderList = (node: ReactPortableTextList, index: number, key: string) => {
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
      handleMissingComponent(unknownListStyleWarning(style), {nodeType: 'listStyle', type: style})
    }

    return (
      <List key={key} value={node} index={index} isInline={false} renderNode={renderNode}>
        {children}
      </List>
    )
  }

  const renderSpan = (node: ToolkitNestedPortableTextSpan, _index: number, key: string) => {
    const {markDef, markType, markKey} = node
    const Span = components.marks[markType] || components.unknownMark
    const children = node.children.map((child, childIndex) =>
      renderNode({node: child, index: childIndex, isInline: true, renderNode}),
    )

    if (Span === components.unknownMark) {
      handleMissingComponent(unknownMarkWarning(markType), {nodeType: 'mark', type: markType})
    }

    return (
      <Span
        key={key}
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

  const renderBlock = (node: PortableTextBlock, index: number, key: string, isInline: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {_key, ...props} = serializeBlock({node, index, isInline, renderNode})
    const style = props.node.style || 'normal'
    const handler =
      typeof components.block === 'function' ? components.block : components.block[style]
    const Block = handler || components.unknownBlockStyle

    if (Block === components.unknownBlockStyle) {
      handleMissingComponent(unknownBlockStyleWarning(style), {
        nodeType: 'blockStyle',
        type: style,
      })
    }

    return <Block key={key} {...props} value={props.node} renderNode={renderNode} />
  }

  const renderText = (node: ToolkitTextNode, key: string) => {
    if (node.text === '\n') {
      const HardBreak = components.hardBreak
      return HardBreak ? <HardBreak key={key} /> : '\n'
    }

    return node.text
  }

  const renderUnknownType = (node: TypedObject, index: number, key: string, isInline: boolean) => {
    const nodeOptions = {
      value: node,
      isInline,
      index,
      renderNode,
    }

    handleMissingComponent(unknownTypeWarning(node._type), {nodeType: 'block', type: node._type})

    const UnknownType = components.unknownType
    return <UnknownType key={key} {...nodeOptions} />
  }

  const renderCustomBlock = (node: TypedObject, index: number, key: string, isInline: boolean) => {
    const nodeOptions = {
      value: node,
      isInline,
      index,
      renderNode,
    }

    const Node = components.types[node._type]
    return Node ? <Node key={key} {...nodeOptions} /> : null
  }
  /* eslint-enable react/jsx-no-bind */

  return renderNode
}

const serializeBlock = (options: Serializable<PortableTextBlock>): SerializedBlock => {
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
