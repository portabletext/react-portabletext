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

import {defaultBlockStyles, defaultComponents} from './components/defaults'
import {DefaultListItem} from './components/list'
import {defaultMarks} from './components/marks'
import {mergeComponents} from './components/merge'
import type {
  DefaultPortableTextBlockStyle,
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

const builtInMarks = new Set(Object.values(defaultMarks))
type BlockTag = Exclude<DefaultPortableTextBlockStyle, 'normal'> | 'p'
const builtInBlocks = new Map(
  Object.entries(defaultBlockStyles).map(([style, component]) => [
    component,
    (style === 'normal' ? 'p' : style) as BlockTag,
  ]),
)

type BlockChildren = ReturnType<typeof buildMarksTree> | string
interface Renderer {
  renderNode: (options: Serializable<TypedObject>, children?: BlockChildren) => ReactNode
  types: PortableTextReactComponents['types']
}

export function PortableText<B extends TypedObject = PortableTextBlock>({
  value: input,
  components: componentOverrides,
  listNestingMode,
  onMissingComponent: missingComponentHandler = printWarning,
}: PortableTextProps<B>): JSX.Element {
  const handleMissingComponent = missingComponentHandler || noop
  const renderer = useRenderer(componentOverrides, handleMissingComponent)
  const nested = useNestedBlocks(input, listNestingMode)
  const rendered = nested.map((node, index) => (
    <RenderedNode
      key={node._key || `node-${index}`}
      node={node}
      index={index}
      isInline={false}
      renderer={renderer}
    />
  ))

  return <>{rendered}</>
}

function useNestedBlocks<B extends TypedObject>(
  input: PortableTextProps<B>['value'],
  listNestingMode: PortableTextProps<B>['listNestingMode'],
) {
  'use memo'
  let blocks: B[]
  if (Array.isArray(input)) {
    blocks = input
  } else if (input == null) {
    blocks = []
  } else {
    blocks = [input]
  }
  return nestLists(blocks, listNestingMode || LIST_NEST_MODE_HTML)
}

// Separate compiler scopes keep the renderer stable when only the document changes.
// These helpers use no React hooks in the uncompiled react-server build.
function useRenderer(
  overrides: PortableTextComponents | undefined,
  handleMissingComponent: MissingComponentHandler,
): Renderer {
  'use memo'
  const components = overrides ? mergeComponents(defaultComponents, overrides) : defaultComponents
  return getNodeRenderer(components, handleMissingComponent)
}

function RenderedNode({
  node,
  index,
  isInline,
  renderer,
}: Omit<Serializable<TypedObject>, 'renderNode'> & {renderer: Renderer}): ReactNode {
  'use memo'
  const custom = node._type in renderer.types
  const listItem = 'listItem' in node && isPortableTextListItemBlock(node)
  const prepare = listItem
    ? !(custom && node.style && node.style !== 'normal')
    : !custom && isPortableTextBlock(node)
  const children = useBlockChildren(prepare ? (node as PortableTextBlock) : undefined)
  const {renderNode} = renderer
  return renderNode({node, index, isInline, renderNode}, children)
}

function useBlockChildren(node: PortableTextBlock | undefined): BlockChildren | undefined {
  'use memo'
  return node ? prepareBlockChildren(node) : undefined
}

function prepareBlockChildren(node: PortableTextBlock): BlockChildren {
  const first = node.children[0]
  return node.children.length === 1 &&
    first &&
    isPortableTextSpan(first) &&
    (!first.marks || first.marks.length === 0) &&
    !first.text.includes('\n')
    ? first.text
    : buildMarksTree(node)
}

const getNodeRenderer = (
  components: PortableTextReactComponents,
  handleMissingComponent: MissingComponentHandler,
): Renderer => {
  function renderNode<N extends TypedObject>(
    options: Serializable<N>,
    children?: BlockChildren,
  ): ReactNode {
    const {node, index, isInline} = options
    if (isPortableTextToolkitTextNode(node) && !hasCustomComponentForNode(node)) {
      return node.text === '\n' ? renderText(node, node._key || `node-${index}`) : node.text
    }
    const key = node._key || `node-${index}`

    if (isPortableTextToolkitList(node)) {
      return renderList(node, index, key)
    }

    if ('listItem' in node && isPortableTextListItemBlock(node)) {
      return renderListItem(node, index, key, children)
    }

    if (isPortableTextToolkitSpan(node)) {
      return renderSpan(node, index, key)
    }

    if (hasCustomComponentForNode(node)) {
      return renderCustomBlock(node, index, key, isInline)
    }

    if (isPortableTextBlock(node)) {
      return renderBlock(node, index, key, isInline, children)
    }

    return renderUnknownType(node, index, key, isInline)
  }

  function hasCustomComponentForNode(node: TypedObject): boolean {
    return node._type in components.types
  }

  function renderListItem(
    node: PortableTextListItemBlock,
    index: number,
    key: string,
    prepared?: BlockChildren,
  ) {
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

    let children: ReactNode
    if (node.style && node.style !== 'normal') {
      // Wrap any other style in whatever the block serializer says to use
      const {listItem: _listItem, ...blockNode} = node
      children = renderNode({node: blockNode, index, isInline: false, renderNode}, prepared)
    } else {
      children = serializeBlock(
        {node, index, isInline: false, renderNode},
        components,
        prepared,
      ).children
    }

    if (Li === DefaultListItem) {
      return <li key={key}>{children}</li>
    }

    return (
      <Li key={key} value={node} index={index} isInline={false} renderNode={renderNode}>
        {children}
      </Li>
    )
  }

  function renderList(node: ReactPortableTextList, index: number, key: string) {
    const children = node.children.map((child, childIndex) => (
      <RenderedNode
        key={child._key || `li-${index}-${childIndex}`}
        node={child._key ? child : {...child, _key: `li-${index}-${childIndex}`}}
        index={childIndex}
        isInline={false}
        renderer={renderer}
      />
    ))

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
        text={builtInMarks.has(Span) ? '' : spanToPlainText(node)}
        value={markDef}
        markType={markType}
        markKey={markKey}
        renderNode={renderNode}
      >
        {children}
      </Span>
    )
  }

  function renderBlock(
    node: PortableTextBlock,
    index: number,
    key: string,
    isInline: boolean,
    prepared?: BlockChildren,
  ) {
    const {_key, ...props} = serializeBlock(
      {node, index, isInline, renderNode},
      components,
      prepared,
    )
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

    const Tag = builtInBlocks.get(Block)
    if (Tag) {
      return <Tag key={key}>{props.children}</Tag>
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

  const renderer = {renderNode, types: components.types}
  return renderer
}

function serializeBlock(
  options: Serializable<PortableTextBlock>,
  components: PortableTextReactComponents,
  prepared?: BlockChildren,
): SerializedBlock {
  const {node, index, isInline, renderNode} = options
  const tree = prepared ?? prepareBlockChildren(node)
  // Keep the one-span case allocation-light, but preserve custom toolkit text renderers.
  const children =
    typeof tree === 'string' && !('@text' in components.types)
      ? [tree]
      : (typeof tree === 'string' ? buildMarksTree(node) : tree).map((child, i) =>
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
