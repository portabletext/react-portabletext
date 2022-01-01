import React from 'react'
import type {PortableTextComponents} from '../types'

export const DefaultUnknownType: PortableTextComponents['unknownType'] = ({node}) => {
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown block type "${node._type}", please specify a serializer for it in the \`serializers.types\` prop`
  )

  return (
    <div style={{display: 'none'}}>
      Unknown block type "{node._type}", specify a component for it in the `components.types` prop
    </div>
  )
}

export const DefaultUnknownMark: PortableTextComponents['unknownMark'] = ({markType, children}) => {
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown mark type "${markType}", please specify a serializer for it in the \`serializers.marks\` prop`
  )

  return <span className={`unknown__pt__mark__${markType}`}>{children}</span>
}

export const DefaultUnknownBlockStyle: PortableTextComponents['unknownBlockStyle'] = ({
  children,
  node,
}) => {
  const style = node.style || 'normal'
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown block style "${style}", please specify a serializer for it in the \`serializers.block\` prop`
  )

  return <p>{children}</p>
}
