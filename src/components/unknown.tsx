import React from 'react'
import type {PortableTextReactComponents} from '../types'

export const DefaultUnknownType: PortableTextReactComponents['unknownType'] = ({value: node}) => {
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown block type "${node._type}", please specify a component for it in the \`components.types\` prop`
  )

  return (
    <div style={{display: 'none'}}>
      Unknown block type "{node._type}", specify a component for it in the `components.types` prop
    </div>
  )
}

export const DefaultUnknownMark: PortableTextReactComponents['unknownMark'] = ({
  markType,
  children,
}) => {
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown mark type "${markType}", please specify a component for it in the \`components.marks\` prop`
  )

  return <span className={`unknown__pt__mark__${markType}`}>{children}</span>
}

export const DefaultUnknownBlockStyle: PortableTextReactComponents['unknownBlockStyle'] = ({
  children,
  value: node,
}) => {
  const style = node.style || 'normal'
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown block style "${style}", please specify a component for it in the \`components.block\` prop`
  )

  return <p>{children}</p>
}

export const DefaultUnknownList: PortableTextReactComponents['unknownList'] = ({
  children,
  value: node,
}) => {
  const style = node.listItem || 'bullet'
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown list style "${style}", please specify a component for it in the \`components.list\` prop`
  )

  return <ul>{children}</ul>
}

export const DefaultUnknownListItem: PortableTextReactComponents['unknownListItem'] = ({
  children,
  value: node,
}) => {
  const style = node.listItem || 'bullet'
  // eslint-disable-next-line no-console
  console.warn(
    `Unknown list item style "${style}", please specify a component for it in the \`components.list\` prop`
  )

  return <li>{children}</li>
}
