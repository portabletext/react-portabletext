import React, {createContext, ReactNode, useMemo} from 'react'
import {mergeComponents, PortableTextComponents} from '.'
import {defaultComponents} from './components/defaults'

export const PortableTextComponentsContext: React.Context<PortableTextComponents> =
  createContext(defaultComponents)

export const PortableTextComponentsProvider = ({
  components,
  children,
}: {
  components: Partial<PortableTextComponents>
  children: ReactNode
}) => {
  const value = useMemo(() => mergeComponents(defaultComponents, components), [components])
  return (
    <PortableTextComponentsContext.Provider value={value}>
      {children}
    </PortableTextComponentsContext.Provider>
  )
}
