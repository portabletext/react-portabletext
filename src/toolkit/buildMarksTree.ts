import type {
  ArbitraryTypedObject,
  MarkDefinition,
  PortableTextBlock,
  PortableTextSpan,
  TypedObject,
} from '../types'
import {isPortableTextSpan} from './asserters'
import {ToolkitNestedPortableTextSpan, ToolkitTextNode} from './types'

const knownDecorators = ['strong', 'em', 'code', 'underline', 'strike-through']

export function buildMarksTree<M extends MarkDefinition = MarkDefinition>(
  block: PortableTextBlock<M>
): (ToolkitNestedPortableTextSpan<M> | ToolkitTextNode | ArbitraryTypedObject)[] {
  const {children, markDefs = []} = block
  if (!children || !children.length) {
    return []
  }

  const sortedMarks = children.map(sortMarksByOccurences)

  const rootNode: ToolkitNestedPortableTextSpan<M> = {
    _type: '@span',
    children: [],
    markType: '<unknown>',
  }

  let nodeStack: ToolkitNestedPortableTextSpan<M>[] = [rootNode]

  for (let i = 0; i < children.length; i++) {
    const span = children[i]

    const marksNeeded = sortedMarks[i]
    if (!marksNeeded) {
      const lastNode = nodeStack[nodeStack.length - 1]
      lastNode.children.push({...span, _type: '@span', children: [], markType: '<unknown>'})
      continue
    }

    let pos = 1

    // Start at position one. Root is always plain and should never be removed
    if (nodeStack.length > 1) {
      for (pos; pos < nodeStack.length; pos++) {
        const mark = nodeStack[pos].markKey
        const index = mark ? marksNeeded.indexOf(mark) : -1

        if (index === -1) {
          break
        }

        marksNeeded.splice(index, 1)
      }
    }

    // Keep from beginning to first miss
    nodeStack = nodeStack.slice(0, pos)

    // Add needed nodes
    let currentNode = findLastParentNode(nodeStack) || rootNode
    for (const markKey of marksNeeded) {
      const markDef = markDefs.find((def) => def._key === markKey)
      const markType = markDef ? markDef._type : markKey
      const node: ToolkitNestedPortableTextSpan<M> = {
        _type: '@span',
        _key: span._key,
        children: [],
        markDef,
        markType,
        markKey,
      }

      currentNode.children.push(node)
      nodeStack.push(node)
      currentNode = node
    }

    // Split at newlines to make individual line chunks, but keep newline
    // characters as individual elements in the array. We use these characters
    // in the span serializer to trigger hard-break rendering
    if (isPortableTextSpan(span)) {
      const lines = span.text.split('\n')
      for (let line = lines.length; line-- > 1; ) {
        lines.splice(line, 0, '\n')
      }

      currentNode.children = currentNode.children.concat(lines.map(toTextNode))
    } else {
      // This is some other inline object, not a text span
      currentNode.children = currentNode.children.concat(span)
    }
  }

  return rootNode.children
}

/**
 * We want to sort all the marks of all the spans in the following order:
 *
 *  1. Marks that are shared amongst the most adjacent siblings
 *  2. Non-default marks (links, custom metadata)
 *  3. Decorators (bold, emphasis, code etc)
 */
function sortMarksByOccurences(
  span: PortableTextSpan | TypedObject,
  i: number,
  spans: (PortableTextSpan | TypedObject)[]
): string[] {
  if (!isPortableTextSpan(span) || !span.marks) {
    return []
  }

  if (!span.marks.length) {
    return []
  }

  // Slicing because we'll be sorting with `sort()`, which mutates
  const marks = span.marks.slice()
  const occurences: Record<string, number> = {}
  marks.forEach((mark) => {
    occurences[mark] = occurences[mark] ? occurences[mark] + 1 : 1

    for (let siblingIndex = i + 1; siblingIndex < spans.length; siblingIndex++) {
      const sibling = spans[siblingIndex]

      if (
        isPortableTextSpan(sibling) &&
        Array.isArray(sibling.marks) &&
        sibling.marks.indexOf(mark) !== -1
      ) {
        occurences[mark]++
      } else {
        break
      }
    }
  })

  return marks.sort((markA, markB) => sortMarks(occurences, markA, markB))
}

function sortMarks(occurences: Record<string, number>, markA: string, markB: string): number {
  const aOccurences = occurences[markA] || 0
  const bOccurences = occurences[markB] || 0

  if (aOccurences !== bOccurences) {
    return bOccurences - aOccurences
  }

  const aKnownPos = knownDecorators.indexOf(markA)
  const bKnownPos = knownDecorators.indexOf(markB)

  // Sort known decorators last
  if (aKnownPos !== bKnownPos) {
    return aKnownPos - bKnownPos
  }

  // Sort other marks simply by key
  if (markA < markB) {
    return -1
  } else if (markA > markB) {
    return 1
  }

  return 0
}

function findLastParentNode<M extends MarkDefinition>(nodes: ToolkitNestedPortableTextSpan<M>[]) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    if (node._type === '@span' && node.children) {
      return node
    }
  }

  return undefined
}

function toTextNode(text: string): ToolkitTextNode {
  return {_type: '@text', text}
}
