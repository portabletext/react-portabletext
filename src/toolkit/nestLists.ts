import type {PortableTextBlock, PortableTextListItemBlock, TypedObject} from '../types'
import type {
  ListNestMode,
  ToolkitPortableTextDirectList,
  ToolkitPortableTextHtmlList,
  ToolkitPortableTextList,
  ToolkitPortableTextListItem,
} from './types'
import {isListItemBlock, isPortableTextSpan, isToolkitList} from './asserters'

type NestListsInputNode = PortableTextBlock | TypedObject
type NestListsOutputNode<T> = T | ToolkitPortableTextHtmlList | ToolkitPortableTextDirectList

export function nestLists<T extends TypedObject = NestListsInputNode>(
  blocks: T[],
  mode: ListNestMode
): NestListsOutputNode<T>[] {
  const tree: NestListsOutputNode<T>[] = []
  let currentList: ToolkitPortableTextList | undefined

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (!isListItemBlock(block)) {
      tree.push(block)
      currentList = undefined
      continue
    }

    // Start of a new list?
    if (!currentList) {
      currentList = listFromBlock(block, i, mode)
      tree.push(currentList)
      continue
    }

    // New list item within same list?
    if (blockMatchesList(block, currentList)) {
      currentList.children.push(block)
      continue
    }

    // Different list props, are we going deeper?
    if ((block.level || 1) > currentList.level) {
      const newList = listFromBlock(block, i, mode)

      if (mode === 'html') {
        // Because HTML is kinda weird, nested lists needs to be nested within list items.
        // So while you would think that we could populate the parent list with a new sub-list,
        // we actually have to target the last list element (child) of the parent.
        // However, at this point we need to be very careful - simply pushing to the list of children
        // will mutate the input, and we don't want to blindly clone the entire tree.

        // Clone the last child while adding our new list as the last child of it
        const lastListItem = currentList.children[
          currentList.children.length - 1
        ] as ToolkitPortableTextListItem

        const newLastChild: ToolkitPortableTextListItem = {
          ...lastListItem,
          children: [...lastListItem.children, newList],
        }

        // Swap the last child
        currentList.children[currentList.children.length - 1] = newLastChild
      } else {
        ;(currentList as ToolkitPortableTextDirectList).children.push(
          newList as ToolkitPortableTextDirectList
        )
      }

      // Set the newly created, deeper list as the current
      currentList = newList
      continue
    }

    // Different list props, are we going back up the tree?
    if ((block.level || 1) < currentList.level) {
      // Current list has ended, and we need to hook up with a parent of the same level and type
      const match = findListMatching(tree[tree.length - 1], block)
      if (match) {
        currentList = match
        currentList.children.push(block)
        continue
      }

      // Similar parent can't be found, assume new list
      currentList = listFromBlock(block, i, mode)
      tree.push(currentList)
      continue
    }

    // Different list props, different list style?
    if (block.listItem !== currentList.listItem) {
      const match = findListMatching(tree[tree.length - 1], {level: block.level || 1})
      if (match && match.listItem === block.listItem) {
        currentList = match
        currentList.children.push(block)
        continue
      } else {
        currentList = listFromBlock(block, i, mode)
        tree.push(currentList)
        continue
      }
    }

    // eslint-disable-next-line no-console
    console.warn('Unknown state encountered for block', block)
    tree.push(block)
  }

  return tree
}

function blockMatchesList(block: PortableTextBlock, list: ToolkitPortableTextList) {
  return (
    (block.level || 1) === (list.level || 1) &&
    (block.listItem || 'bullet') === (list.listItem || 'bullet')
  )
}

function listFromBlock(
  block: PortableTextListItemBlock,
  index: number,
  mode: ListNestMode
): ToolkitPortableTextList {
  return {
    _type: '@list',
    _key: `${block._key || `${index}`}-parent`,
    mode,
    level: block.level || 1,
    listItem: block.listItem || 'bullet',
    children: [block],
  }
}

function findListMatching<T extends TypedObject | PortableTextBlock>(
  rootNode: T,
  matching: Partial<PortableTextListItemBlock>
): ToolkitPortableTextList | undefined {
  const level = matching.level || 1
  const style = matching.listItem || 'normal'
  const filterOnType = typeof matching.listItem === 'string'
  if (
    isToolkitList(rootNode) &&
    (rootNode.level || 1) === level &&
    filterOnType &&
    (rootNode.listItem || 'normal') === style
  ) {
    return rootNode
  }

  if (!('children' in rootNode)) {
    return undefined
  }

  const node = rootNode.children[rootNode.children.length - 1]
  return node && !isPortableTextSpan(node) ? findListMatching(node, matching) : undefined
}
