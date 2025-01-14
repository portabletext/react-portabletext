/// <reference types="react/experimental" />

import {
  defineSchema,
  EditorEventListener,
  EditorProvider,
  PortableTextBlock,
  PortableTextChild,
  PortableTextEditable,
  RenderAnnotationFunction,
  RenderBlockFunction,
  RenderChildFunction,
  RenderDecoratorFunction,
  RenderStyleFunction,
  useEditor,
  useEditorSelector,
} from '@portabletext/editor'
import * as selectors from '@portabletext/editor/selectors'
import {startTransition, unstable_ViewTransition as ViewTransition, useId, useState} from 'react'

import {PortableText} from '../../src/react-portable-text'
import {AnnotatedMap} from './AnnotatedMap'
import {CharacterReference} from './CharacterReference'
import {Code} from './Code'
import {CurrencyAmount} from './CurrencyAmount'
import {blocks} from './fixture'
import {Link} from './Link'
import {LinkableHeader} from './LinkableHeader'
import {SchnauzerList} from './SchnauzerList'
import {hasSpeechApi, SpeechSynthesis} from './SpeechSynthesis'
import {TermDefinition} from './TermDefinition'

// Define the schema for the editor
// All options are optional
// Only the `name` property is required, but you can define a `title` and an `icon` as well
// You can use this schema definition later to build your toolbar
const schemaDefinition = defineSchema({
  // Decorators are simple marks that don't hold any data
  decorators: [
    {name: 'strong'},
    {name: 'em'},
    {name: 'underline'},
    {name: 'code'},
    {name: 'strike-through'},
  ],
  // Annotations are more complex marks that can hold data
  annotations: [
    {name: 'link'},
    {name: 'definition'},
    {name: 'characterReference'},
    {name: 'speech'},
  ],
  // Styles apply to entire text blocks
  // There's always a 'normal' style that can be considered the paragraph style
  styles: [{name: 'normal'}, {name: 'h1'}, {name: 'h2'}, {name: 'h3'}, {name: 'blockquote'}],
  // Lists apply to entire text blocks as well
  lists: [{name: 'bullet'}, {name: 'number'}],
  // Inline objects hold arbitrary data that can be inserted into the text
  inlineObjects: [{name: 'stock-ticker'}, {name: 'currencyAmount'}],
  // Block objects hold arbitrary data that live side-by-side with text blocks
  blockObjects: [{name: 'image'}],
})

const renderDecorator: RenderDecoratorFunction = (props) => {
  if (props.value === 'strong') {
    return <strong>{props.children}</strong>
  }
  if (props.value === 'em') {
    return <em>{props.children}</em>
  }
  if (props.value === 'underline') {
    return <u>{props.children}</u>
  }
  return <>{props.children}</>
}

const renderAnnotation: RenderAnnotationFunction = (props) => {
  if (props.schemaType.name === 'link') {
    return <span style={{textDecoration: 'underline'}}>{props.children}</span>
  }

  return <>{props.children}</>
}

const renderBlock: RenderBlockFunction = (props) => {
  if (props.schemaType.name === 'image' && isImage(props.value)) {
    return (
      <div
        style={{
          border: '1px dotted grey',
          padding: '0.25em',
          marginBlockEnd: '0.25em',
        }}
      >
        IMG: {props.value.src}
      </div>
    )
  }

  return <div style={{marginBlockEnd: '0.25em'}}>{props.children}</div>
}

function isImage(props: PortableTextBlock): props is PortableTextBlock & {src: string} {
  return 'src' in props
}

const renderStyle: RenderStyleFunction = (props) => {
  if (props.schemaType.value === 'h1') {
    return <h1>{props.children}</h1>
  }
  if (props.schemaType.value === 'h2') {
    return <h2>{props.children}</h2>
  }
  if (props.schemaType.value === 'h3') {
    return <h3>{props.children}</h3>
  }
  if (props.schemaType.value === 'blockquote') {
    return <blockquote>{props.children}</blockquote>
  }
  return <>{props.children}</>
}

const renderChild: RenderChildFunction = (props) => {
  if (props.schemaType.name === 'stock-ticker' && isStockTicker(props.value)) {
    return (
      <span
        style={{
          border: '1px dotted grey',
          padding: '0.15em',
        }}
      >
        {props.value.symbol}
      </span>
    )
  }

  if (props.schemaType.name === 'currencyAmount') {
    return (
      <span
        style={{
          border: '1px dotted grey',
          padding: '0.15em',
        }}
      >
        Currency Amount
      </span>
    )
  }

  return <>{props.children}</>
}

function isStockTicker(props: PortableTextChild): props is PortableTextChild & {symbol: string} {
  return 'symbol' in props
}

function Toolbar() {
  // Obtain the editor instance
  const editor = useEditor()

  const decoratorButtons = schemaDefinition.decorators.map((decorator) => (
    <DecoratorButton key={decorator.name} decorator={decorator.name} />
  ))

  const annotationButtons = schemaDefinition.annotations.map((annotation) => (
    <AnnotationButton key={annotation.name} annotation={annotation} />
  ))

  const styleButtons = schemaDefinition.styles.map((style) => (
    <StyleButton key={style.name} style={style.name} />
  ))

  const listButtons = schemaDefinition.lists.map((list) => (
    <ListButton key={list.name} list={list.name} />
  ))

  const imageButton = (
    <button
      onClick={() => {
        editor.send({
          type: 'insert.block object',
          blockObject: {
            name: 'image',
            value: {src: 'https://example.com/image.jpg'},
          },
          placement: 'auto',
        })
        editor.send({type: 'focus'})
      }}
    >
      {schemaDefinition.blockObjects[0].name}
    </button>
  )

  const stockTickerButton = (
    <button
      onClick={() => {
        editor.send({
          type: 'insert.inline object',
          inlineObject: {
            name: 'stock-ticker',
            value: {symbol: 'AAPL'},
          },
        })
        editor.send({type: 'focus'})
      }}
    >
      {schemaDefinition.inlineObjects[0].name}
    </button>
  )

  return (
    <>
      <div>{decoratorButtons}</div>
      <div>{annotationButtons}</div>
      <div>{styleButtons}</div>
      <div>{listButtons}</div>
      <div>{imageButton}</div>
      <div>{stockTickerButton}</div>
    </>
  )
}

function DecoratorButton(props: {decorator: string}) {
  // Obtain the editor instance
  const editor = useEditor()
  // Check if the decorator is active using a selector
  const active = useEditorSelector(editor, selectors.isActiveDecorator(props.decorator))

  return (
    <button
      style={{
        textDecoration: active ? 'underline' : 'unset',
      }}
      onClick={() => {
        // Toggle the decorator
        editor.send({
          type: 'decorator.toggle',
          decorator: props.decorator,
        })
        // Pressing this button steals focus so let's focus the editor again
        editor.send({type: 'focus'})
      }}
    >
      {props.decorator}
    </button>
  )
}

function AnnotationButton(props: {annotation: {name: string}}) {
  const editor = useEditor()
  const active = useEditorSelector(editor, selectors.isActiveAnnotation(props.annotation.name))

  return (
    <button
      style={{
        textDecoration: active ? 'underline' : 'unset',
      }}
      onClick={() => {
        if (active) {
          editor.send({
            type: 'annotation.remove',
            annotation: {
              name: props.annotation.name,
            },
          })
        } else {
          editor.send({
            type: 'annotation.add',
            annotation: {
              name: props.annotation.name,
              value: props.annotation.name === 'link' ? {href: 'https://example.com'} : {},
            },
          })
        }
        editor.send({type: 'focus'})
      }}
    >
      {props.annotation.name}
    </button>
  )
}

function StyleButton(props: {style: string}) {
  const editor = useEditor()
  const active = useEditorSelector(editor, selectors.isActiveStyle(props.style))

  return (
    <button
      style={{
        textDecoration: active ? 'underline' : 'unset',
      }}
      onClick={() => {
        editor.send({type: 'style.toggle', style: props.style})
        editor.send({type: 'focus'})
      }}
    >
      {props.style}
    </button>
  )
}

function ListButton(props: {list: string}) {
  const editor = useEditor()
  const active = useEditorSelector(editor, selectors.isActiveListItem(props.list))

  return (
    <button
      style={{
        textDecoration: active ? 'underline' : 'unset',
      }}
      onClick={() => {
        editor.send({
          type: 'list item.toggle',
          listItem: props.list,
        })
        editor.send({type: 'focus'})
      }}
    >
      {props.list}
    </button>
  )
}

export function App(): React.JSX.Element {
  const [value, setValue] = useState<Array<PortableTextBlock> | undefined>(blocks)
  const id = useId().replace(/:(.*?):/g, '\u00AB$1\u00BB')
  console.log({value, id})

  function getViewTransitionName(value: string | undefined, type: string) {
    return value ? `${id}_${value}` : 'auto'
  }

  return (
    <ViewTransition className="none">
      <main>
        {/* Create an editor */}
        <EditorProvider
          initialConfig={{
            schemaDefinition,
            initialValue: value,
          }}
        >
          {/* Subscribe to editor changes */}
          <EditorEventListener
            on={(event) => {
              if (event.type === 'mutation') {
                startTransition(() => setValue(event.value))
              }
            }}
          />
          {/* Toolbar needs to be rendered inside the `EditorProvider` component */}
          <Toolbar />
          {/* Component that controls the actual rendering of the editor */}
          <PortableTextEditable
            style={{border: '1px solid black', padding: '0.5em'}}
            // Control how decorators are rendered
            renderDecorator={renderDecorator}
            // Control how annotations are rendered
            renderAnnotation={renderAnnotation}
            // Required to render block objects but also to make `renderStyle` take effect
            renderBlock={renderBlock}
            // Control how styles are rendered
            renderStyle={renderStyle}
            // Control how inline objects are rendered
            renderChild={renderChild}
            // Rendering lists is harder and most likely requires a fair amount of CSS
            // First, return the children like here
            // Next, look in the imported `editor.css` file to see how list styles are implemented
            renderListItem={(props) => <>{props.children}</>}
          />
        </EditorProvider>
      </main>
      <aside>
        <ViewTransition>
          <PortableText
            value={value}
            components={{
              // Components for totally custom types outside the scope of Portable Text
              types: {
                code: Code,
                currencyAmount: CurrencyAmount,
                annotatedMap: AnnotatedMap,
              },

              // Overrides for specific block styles - in this case just the `h2` style
              block: {
                h2: LinkableHeader,
              },

              // Implements a custom component to handle the `schnauzer` list item type
              list: {
                schnauzer: SchnauzerList,
              },
              // Custom components for marks - note that `link` overrides the default component,
              // while the others define components for totally custom types.
              marks: {
                link: Link,
                characterReference: CharacterReference,
                speech: hasSpeechApi ? SpeechSynthesis : undefined,
                definition: TermDefinition,
              },
            }}
          />
        </ViewTransition>
      </aside>
    </ViewTransition>
  )
}
