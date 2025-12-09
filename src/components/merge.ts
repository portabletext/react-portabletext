import type {PortableTextComponents, PortableTextReactComponents} from '../types'

export function mergeComponents(
  parent: PortableTextReactComponents,
  overrides: PortableTextComponents,
): PortableTextReactComponents {
  const {
    block: _block,
    list: _list,
    listItem: _listItem,
    marks: _marks,
    types: _types,
    ...rest
  } = overrides
  return {
    ...parent,
    block: mergeDeeply(parent, overrides, 'block'),
    list: mergeDeeply(parent, overrides, 'list'),
    listItem: mergeDeeply(parent, overrides, 'listItem'),
    marks: mergeDeeply(parent, overrides, 'marks'),
    types: mergeDeeply(parent, overrides, 'types'),
    ...rest,
  }
}

function mergeDeeply<K extends 'block' | 'list' | 'listItem' | 'marks' | 'types'>(
  parent: PortableTextReactComponents,
  overrides: PortableTextComponents,
  key: K,
): PortableTextReactComponents[K] {
  const override = overrides[key]
  const parentVal = parent[key]

  if (typeof override === 'function') {
    // oxlint-disable-next-line no-unsafe-type-assertion -- Functions are compatible
    return override as PortableTextReactComponents[K]
  }

  if (override && typeof parentVal === 'function') {
    return override as PortableTextReactComponents[K]
  }

  if (override) {
    if (typeof override === 'object' && typeof parentVal === 'object') {
      return {...parentVal, ...override} as PortableTextReactComponents[K]
    }
    return override as PortableTextReactComponents[K]
  }

  return parentVal
}
