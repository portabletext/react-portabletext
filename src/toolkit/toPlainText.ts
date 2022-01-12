import type {PortableTextBlock, ArbitraryTypedObject} from '../types'
import type {ToolkitNestedPortableTextSpan} from './types'
import {
  isPortableTextBlock,
  isPortableTextSpan,
  isToolkitSpan,
  isToolkitTextNode,
} from './asserters'

export function spanToPlainText(span: ToolkitNestedPortableTextSpan): string {
  let text = ''
  span.children.forEach((current) => {
    if (isToolkitTextNode(current)) {
      text += current.text
    } else if (isToolkitSpan(current)) {
      text += spanToPlainText(current)
    }
  })
  return text
}

export function toPlainText(
  block: PortableTextBlock | ArbitraryTypedObject[] | PortableTextBlock[]
): string {
  const blocks = Array.isArray(block) ? block : [block]
  let text = ''

  blocks.forEach((current, index) => {
    if (!isPortableTextBlock(current)) {
      return
    }

    current.children.forEach((span) => {
      text += isPortableTextSpan(span) ? span.text : ' '
    })

    if (index !== blocks.length - 1) {
      text += '\n\n'
    }
  })

  return text
}
