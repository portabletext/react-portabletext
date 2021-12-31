import type {PortableTextComponents} from '../types'

export function mergeComponents(
  parent: PortableTextComponents,
  overrides: Partial<PortableTextComponents>
): PortableTextComponents {
  const {block, list, listItem, marks, types, ...rest} = overrides
  // @todo figure out how to not `as ...` these
  return {
    ...parent,
    block: mergeDeeply(parent, overrides, 'block') as PortableTextComponents['block'],
    list: mergeDeeply(parent, overrides, 'list') as PortableTextComponents['list'],
    listItem: mergeDeeply(parent, overrides, 'listItem') as PortableTextComponents['listItem'],
    marks: mergeDeeply(parent, overrides, 'marks') as PortableTextComponents['marks'],
    types: mergeDeeply(parent, overrides, 'types') as PortableTextComponents['types'],
    ...rest,
  }
}

function mergeDeeply(
  parent: PortableTextComponents,
  overrides: Partial<PortableTextComponents>,
  key: 'block' | 'list' | 'listItem' | 'marks' | 'types'
): PortableTextComponents[typeof key] {
  const override = overrides[key]
  const parentVal = parent[key]

  if (typeof override === 'function') {
    return override
  }

  if (override && typeof parentVal === 'function') {
    return override
  }

  if (override) {
    return {...parentVal, ...override} as PortableTextComponents[typeof key]
  }

  return parentVal
}
