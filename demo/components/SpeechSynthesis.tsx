import type {PortableTextMarkComponent} from '@portabletext/react'

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

  return (
    <button
      type="button"
      onClick={() => {
        const msg = new SpeechSynthesisUtterance()
        msg.text = text
        msg.pitch = pitch
        window.speechSynthesis.speak(msg)
      }}
    >
      {children}
    </button>
  )
}
