import {type PortableTextMarkComponent} from '@portabletext/react'

interface LinkMark {
  _type: 'link'
  href: string
}

export const Link: PortableTextMarkComponent<LinkMark> = ({value, children}) => {
  const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
  return (
    <a href={value?.href} target={target}>
      {children}
    </a>
  )
}
