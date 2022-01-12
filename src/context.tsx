import React, {createContext, ReactNode, useMemo} from 'react'
import {mergeComponents, PortableTextReactComponents} from '.'
import {defaultComponents} from './components/defaults'

export const PortableTextComponentsContext: React.Context<PortableTextReactComponents> =
  createContext(defaultComponents)

export const PortableTextComponentsProvider = ({
  components,
  children,
}: {
  components: Partial<PortableTextReactComponents>
  children: ReactNode
}) => {
  const value = useMemo(() => mergeComponents(defaultComponents, components), [components])
  return (
    <PortableTextComponentsContext.Provider value={value}>
      {children}
    </PortableTextComponentsContext.Provider>
  )
}
