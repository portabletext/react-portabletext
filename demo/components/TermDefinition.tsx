import {Popover, Text} from '@sanity/ui'
import {useCallback, useState} from 'react'

import type {PortableTextMarkComponent} from '../../src'

interface DefinitionMark {
  _type: 'definition'
  details: string
}

export const TermDefinition: PortableTextMarkComponent<DefinitionMark> = ({value, children}) => {
  const [isOpen, setOpen] = useState(false)
  const handleOpen = useCallback(() => setOpen(true), [setOpen])
  const handleClose = useCallback(() => setOpen(false), [setOpen])
  const [referenceElement, setReferenceElement] = useState<HTMLSpanElement | null>(null)
  return (
    <>
      <span
        ref={setReferenceElement}
        style={{textDecoration: 'underline'}}
        onMouseOver={handleOpen}
        onMouseOut={handleClose}
      >
        {children}
      </span>
      {isOpen && (
        <Popover
          open
          referenceElement={referenceElement}
          padding={2}
          portal
          placement="top"
          content={
            <Text size={2} style={{maxWidth: '260px'}}>
              {value?.details}
            </Text>
          }
        />
      )}
    </>
  )
}
