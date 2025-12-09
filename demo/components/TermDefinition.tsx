import type {PortableTextMarkComponent} from '@portabletext/react'

import {Popover, Text} from '@sanity/ui'
import {useCallback, useState} from 'react'

interface DefinitionMark {
  _type: 'definition'
  details: string
}

export const TermDefinition: PortableTextMarkComponent<DefinitionMark> = ({value, children}) => {
  const [isOpen, setOpen] = useState(false)
  const handleOpen = useCallback(() => setOpen(true), [setOpen])
  const handleClose = useCallback(() => setOpen(false), [setOpen])
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
      <span style={{textDecoration: 'underline'}} onMouseOver={handleOpen} onMouseOut={handleClose}>
        {children}
      </span>
    </Popover>
  )
}
