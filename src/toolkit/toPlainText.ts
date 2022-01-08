import type {PortableTextBlock, ArbitraryTypedObject} from '../types'
import {isPortableTextBlock, isPortableTextSpan} from './asserters'

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
