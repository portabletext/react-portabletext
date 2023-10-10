import {useCallback} from 'react'
import type {PortableTextMarkComponent} from '../../src'

interface SpeechSynthesisMark {
  _type: 'speech'
  pitch?: number
}

export const hasSpeechApi = typeof window !== 'undefined' && 'speechSynthesis' in window

export const SpeechSynthesis: PortableTextMarkComponent<SpeechSynthesisMark> = ({
  children,
  text,
  value,
}) => {
  const pitch = value?.pitch || 1
  const handleSynthesis = useCallback(() => {
    const msg = new SpeechSynthesisUtterance()
    msg.text = text
    msg.pitch = pitch
    window.speechSynthesis.speak(msg)
  }, [text, pitch])

  return (
    <button type="button" onClick={handleSynthesis}>
      {children}
    </button>
  )
}
