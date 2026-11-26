import type {ToolkitNestedPortableTextSpan, ToolkitTextNode} from '@portabletext/toolkit'
import {
  buildMarksTree,
  isPortableTextBlock,
  isPortableTextListItemBlock,
  isPortableTextSpan,
  isPortableTextToolkitList,
  isPortableTextToolkitSpan,
  isPortableTextToolkitTextNode,
  LIST_NEST_MODE_HTML,
  nestLists,
  spanToPlainText,
} from '@portabletext/toolkit'
import type {PortableTextBlock, PortableTextListItemBlock, TypedObject} from '@portabletext/types'
import type {JSX, ReactNode} from 'react'

import {defaultComponents} from './components/defaults'
import {mergeComponents} from './components/merge'
import type {
  MissingComponentHandler,
  PortableTextComponents,
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

export function PortableText<B extends TypedObject = PortableTextBlock>({
  value: input,
  components: componentOverrides,
  listNestingMode,
  onMissingComponent: missingComponentHandler = printWarning,
}: PortableTextProps<B>): JSX.Element {
  const renderBlocks = useBlocksRenderer(componentOverrides, missingComponentHandler || noop)
  let blocks: B[]
  if (Array.isArray(input)) {
    blocks = input
  } else if (input == null) {
    blocks = []
  } else {
    blocks = [input]
  }
  const nested = nestLists(blocks, listNestingMode || LIST_NEST_MODE_HTML)

  return <>{renderBlocks(nested)}</>
}

// The compiled (`default` condition) build gets React Compiler auto-memoization, and the
// uncompiled `react-server` build renders exactly once. Named like a hook so the compiler gives it
// its own memo scope, which keeps the renderer, and the blocks it rendered last time, across
// changes to `value`. It calls no hooks, so server rendering stays hook-free.
function useBlocksRenderer(
  componentOverrides: PortableTextComponents | undefined,
  handleMissingComponent: MissingComponentHandler,
): (nodes: TypedObject[]) => ReactNode[] {
  'use memo'
  const components = componentOverrides
    ? mergeComponents(defaultComponents, componentOverrides)
    : defaultComponents
  return getBlocksRenderer(components, handleMissingComponent)
}

const getBlocksRenderer = (
  components: PortableTextReactComponents,
  onMissingComponent: MissingComponentHandler,
) => {
  let missingComponents = 0
  const handleMissingComponent: MissingComponentHandler = (message, options) => {
    missingComponents++
    onMissingComponent(message, options)
  }

  // React skips re-rendering when it gets the exact element it rendered last time. So when a block
  // is the same object at the same position as in the previous pass, it gets that element back.
  // Blocks that reported missing components render again, so they keep reporting them.
  type RenderedChildren = {
    nodes: TypedObject[]
    elements: ReactNode[]
    reported?: Set<number> | undefined
  }
  let previousPass = new Map<string, RenderedChildren>()
  let currentPass = previousPass
  let passes = 0

  function renderBlocks(nodes: TypedObject[]): ReactNode[] {
    previousPass = currentPass
    currentPass = new Map()
    passes++
    return renderChildren('', nodes)
  }

  function renderChildren(parentKey: string, nodes: TypedObject[]): ReactNode[] {
    const previous = previousPass.get(parentKey)
    let reported: Set<number> | undefined
    const elements = nodes.map((node, index) => {
      if (previous?.nodes[index] === node && !previous.reported?.has(index)) {
        return previous.elements[index]
      }

      const reportedBefore = missingComponents
      const element = renderNode({node, index, isInline: false, renderNode})
      if (missingComponents !== reportedBefore) {
        reported ??= new Set()
        reported.add(index)
      }
      return element
    })
    // Lists are rebuilt on every pass and a page can have hundreds of them, so they are only
    // remembered once the renderer renders again. For most pages the first pass is the only one.
    if (parentKey === '' || passes > 1) {
      currentPass.set(parentKey, {nodes, elements, reported})
    }
    return elements
  }

  function renderNode<N extends TypedObject>(options: Serializable<N>): ReactNode {
    const {node, index, isInline} = options
    const key = node._key || `node-${index}`

    if (isPortableTextToolkitList(node)) {
      return renderList(node, index, key)
    }

    if ('listItem' in node && isPortableTextListItemBlock(node)) {
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

  function hasCustomComponentForNode(node: TypedObject): boolean {
    return node._type in components.types
  }

  function renderListItem(node: PortableTextListItemBlock, index: number, key: string) {
    let children: ReactNode
    if (node.style && node.style !== 'normal') {
      // Wrap any other style in whatever the block serializer says to use
      const {listItem: _listItem, ...blockNode} = node
      children = renderNode({
        node: blockNode,
        index,
        isInline: false,
        renderNode,
      })
    } else {
      children = serializeBlock({node, index, isInline: false, renderNode}).children
    }

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

    return (
      <Li key={key} value={node} index={index} isInline={false} renderNode={renderNode}>
        {children}
      </Li>
    )
  }

  function renderList(node: ReactPortableTextList, index: number, key: string) {
    const children = renderChildren(
      key,
      node.children.map((child, childIndex) =>
        child._key ? child : {...child, _key: `li-${index}-${childIndex}`},
      ),
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
      <List key={key} value={node} index={index} isInline={false} renderNode={renderNode}>
        {children}
      </List>
    )
  }

  function renderSpan(node: ToolkitNestedPortableTextSpan, _index: number, key: string) {
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

  function renderBlock(node: PortableTextBlock, index: number, key: string, isInline: boolean) {
    const {_key, ...props} = serializeBlock({
      node,
      index,
      isInline,
      renderNode,
    })
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

  function renderText(node: ToolkitTextNode, key: string) {
    if (node.text === '\n') {
      const HardBreak = components.hardBreak
      return HardBreak ? <HardBreak key={key} /> : '\n'
    }

    return node.text
  }

  function renderUnknownType(node: TypedObject, index: number, key: string, isInline: boolean) {
    const nodeOptions = {
      value: node,
      isInline,
      index,
      renderNode,
    }

    handleMissingComponent(unknownTypeWarning(node._type), {
      nodeType: 'block',
      type: node._type,
    })

    const UnknownType = components.unknownType
    return <UnknownType key={key} {...nodeOptions} />
  }

  function renderCustomBlock(node: TypedObject, index: number, key: string, isInline: boolean) {
    const nodeOptions = {
      value: node,
      isInline,
      index,
      renderNode,
    }

    const Node = components.types[node._type]
    return Node ? <Node key={key} {...nodeOptions} /> : null
  }

  function serializeBlock(options: Serializable<PortableTextBlock>): SerializedBlock {
    const {node, index, isInline} = options
    const children =
      unmarkedTexts(node) ??
      buildMarksTree(node).map((child, i) =>
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

  // What rendering the marks tree gives for a block of unmarked spans without line breaks
  function unmarkedTexts(node: PortableTextBlock): string[] | undefined {
    if ('@text' in components.types) {
      return undefined
    }

    const texts: string[] = []
    for (const child of node.children) {
      if (!isPortableTextSpan(child) || child.marks?.length || child.text.includes('\n')) {
        return undefined
      }
      texts.push(child.text)
    }
    return texts
  }

  return renderBlocks
}

function noop() {
  // Intentional noop
}
