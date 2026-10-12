import type {PortableTextBlock} from '@portabletext/types'

export function paragraph(key: string, text = key, marks: string[] = []): PortableTextBlock {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `${key}-span`, text, marks}],
  }
}

export const cases: Record<string, PortableTextBlock[]> = {
  prose: Array.from({length: 1000}, (_, i) => paragraph(`p-${i}`, 'A short plain paragraph.')),
  marks: Array.from({length: 300}, (_, i) => ({
    ...paragraph(`m-${i}`),
    children: Array.from({length: 12}, (_span, j) => ({
      _type: 'span' as const,
      _key: `${i}-${j}`,
      text: 'Marked text ',
      marks: ['strong', 'em', 'underline'],
    })),
  })),
  lists: Array.from({length: 1000}, (_, i) => ({
    ...paragraph(`l-${i}`),
    listItem: 'bullet',
    level: 1,
  })),
  styledLists: Array.from({length: 30}, (_, group) => [
    paragraph(`separator-${group}`),
    ...Array.from({length: 8}, (_item, i) => ({
      ...paragraph(`s-${group}-${i}`, 'Nested styled item', ['strong', 'em']),
      listItem: 'bullet',
      style: 'h2',
      level: i + 1,
    })),
  ]).flat(),
}
