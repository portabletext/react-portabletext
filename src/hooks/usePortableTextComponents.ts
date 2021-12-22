import {useContext} from 'react'
import type {PortableTextComponents} from '../types'
import {PortableTextComponentsContext} from '../context'

export const usePortableTextComponents = (): PortableTextComponents =>
  useContext(PortableTextComponentsContext)
