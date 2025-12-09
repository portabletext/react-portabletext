import type {PortableTextMarkComponent} from '@portabletext/react'

import {Popover, Text} from '@sanity/ui'
import {useState} from 'react'

interface DefinitionMark {
  _type: 'definition'
  details: string
}

export const TermDefinition: PortableTextMarkComponent<DefinitionMark> = ({value, children}) => {
  const [isOpen, setOpen] = useState(false)
  return (
    <Popover
      animate
      open={isOpen}
      padding={2}
      portal
      placement="top"
      content={
        <Text size={2} style={{maxWidth: '260px'}}>
          {value?.details}
        </Text>
      }
    >
      <span
        style={{textDecoration: 'underline'}}
        onMouseOver={() => setOpen(true)}
        onMouseOut={() => setOpen(false)}
      >
        {children}
      </span>
    </Popover>
  )
}
