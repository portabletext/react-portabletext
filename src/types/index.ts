import type {ComponentType, ReactNode} from 'react'
import type {
  ListNestMode,
  ToolkitPortableTextList,
  ToolkitPortableTextListItem,
} from '../toolkit/types'

/**
 * Properties for the Portable Text react component
 *
 * @template B Types that can appear in the array of blocks
 */
export interface PortableTextProps<
  B extends TypedObject = PortableTextBlock | ArbitraryTypedObject
> {
  /**
   * One or more blocks to render
   */
  value: B | B[]

  /**
   * React components to use for rendering
   */
  components?: Partial<PortableTextReactComponents>

  /**
   * Function to call when encountering unknown unknown types, eg blocks, marks,
   * block style, list styles without an associated React component.
   *
   * Will print a warning message to the console by default.
   * Pass `false` to disable.
   */
  onMissingComponent?: MissingComponentHandler | false

  /**
   * Determines whether or not lists are nested inside of list items (`html`)
   * or as a direct child of another list (`direct` - for React Native)
   *
   * You rarely (if ever) need/want to customize this
   */
  listNestingMode?: ListNestMode
}

/**
 * Generic type for portable text rendering components that takes blocks/inline blocks
 *
 * @template N Node types we expect to be rendering (`PortableTextBlock` should usually be part of this)
 */
export type PortableTextComponent<N> = ComponentType<PortableTextComponentProps<N>>

/**
 * React component type for rendering portable text blocks (paragraphs, headings, blockquotes etc)
 */
export type PortableTextBlockComponent = PortableTextComponent<PortableTextBlock>

/**
 * React component type for rendering (virtual, not part of the spec) portable text lists
 */
export type PortableTextListComponent = PortableTextComponent<ReactPortableTextList>

/**
 * React component type for rendering portable text list items
 */
export type PortableTextListItemComponent = PortableTextComponent<PortableTextListItemBlock>

/**
 * React component type for rendering portable text marks and/or decorators
 *
 * @template M The mark type we expect
 */
export type PortableTextMarkComponent<M extends TypedObject = any> = ComponentType<
  PortableTextMarkComponentProps<M>
>

export type PortableTextTypeComponent<V extends TypedObject = any> = ComponentType<
  PortableTextTypeComponentProps<V>
>

/**
 * Object defining the different React components to use for rendering various aspects
 * of Portable Text and user-provided types, where only the overrides needs to be provided.
 */
export type PortableTextComponents = Partial<PortableTextReactComponents>

/**
 * Object definining the different React components to use for rendering various aspects
 * of Portable Text and user-provided types.
 */
export interface PortableTextReactComponents {
  /**
   * Object of React components that renders different types of objects that might appear
   * both as part of the blocks array, or as inline objects _inside_ of a block,
   * alongside text spans.
   *
   * Use the `isInline` property to check whether or not this is an inline object or a block
   *
   * The object has the shape `{typeName: ReactComponent}`, where `typeName` is the value set
   * in individual `_type` attributes.
   */
  types: Record<string, PortableTextTypeComponent | undefined>

  /**
   * Object of React components that renders different types of marks that might appear in spans.
   *
   * The object has the shape `{markName: ReactComponent}`, where `markName` is the value set
   * in individual `_type` attributes, values being stored in the parent blocks `markDefs`.
   */
  marks: Record<string, PortableTextMarkComponent | undefined>

  /**
   * Object of React components that renders blocks with different `style` properties.
   *
   * The object has the shape `{styleName: ReactComponent}`, where `styleName` is the value set
   * in individual `style` attributes on blocks.
   *
   * Can also be set to a single React component, which would handle block styles of _any_ type.
   */
  block: Record<BlockStyle, PortableTextBlockComponent | undefined> | PortableTextBlockComponent

  /**
   * Object of React components used to render lists of different types (bulleted vs numbered,
   * for instance, which by default is `<ul>` and `<ol>`, respectively)
   *
   * There is no actual "list" node type in the Portable Text specification, but a series of
   * list item blocks with the same `level` and `listItem` properties will be grouped into a
   * virtual one inside of this library.
   *
   * Can also be set to a single React component, which would handle lists of _any_ type.
   */
  list: Record<ListItemType, PortableTextListComponent | undefined> | PortableTextListComponent

  /**
   * Object of React components used to render different list item styles.
   *
   * The object has the shape `{listItemType: ReactComponent}`, where `listItemType` is the value
   * set in individual `listItem` attributes on blocks.
   *
   * Can also be set to a single React component, which would handle list items of _any_ type.
   */
  listItem:
    | Record<ListItemType, PortableTextListItemComponent | undefined>
    | PortableTextListItemComponent

  /**
   * Component to use for rendering "hard breaks", eg `\n` inside of text spans
   * Will by default render a `<br />`. Pass `false` to render as-is (`\n`)
   */
  hardBreak: ComponentType<{}> | false

  /**
   * React component used when encountering a mark type there is no registered component for
   * in the `components.marks` prop.
   */
  unknownMark: PortableTextMarkComponent

  /**
   * React component used when encountering an object type there is no registered component for
   * in the `components.types` prop.
   */
  unknownType: PortableTextComponent<UnknownNodeType>

  /**
   * React component used when encountering a block style there is no registered component for
   * in the `components.block` prop. Only used if `components.block` is an object.
   */
  unknownBlockStyle: PortableTextComponent<PortableTextBlock>

  /**
   * React component used when encountering a list style there is no registered component for
   * in the `components.list` prop. Only used if `components.list` is an object.
   */
  unknownList: PortableTextComponent<ReactPortableTextList>

  /**
   * React component used when encountering a list item style there is no registered component for
   * in the `components.listItem` prop. Only used if `components.listItem` is an object.
   */
  unknownListItem: PortableTextComponent<PortableTextListItemBlock>
}

/**
 * Props received by most Portable Text components
 *
 * @template T Type of data this component will receive in its `value` property
 */
export interface PortableTextComponentProps<T> {
  /**
   * Data associated with this portable text node, eg the raw JSON value of a block/type
   */
  value: T

  /**
   * Index within its parent
   */
  index: number

  /**
   * Whether or not this node is "inline" - ie as a child of a text block,
   * alongside text spans, or a block in and of itself.
   */
  isInline: boolean

  /**
   * React child nodes of this block/component
   */
  children?: ReactNode

  /**
   * Function used to render any node that might appear in a portable text array or block,
   * including virtual "toolkit"-nodes like lists and nested spans. You will rarely need
   * to use this.
   */
  renderNode: NodeRenderer
}

/**
 * Props received by any user-defined type in the input array that is not a text block
 *
 * @template T Type of data this component will receive in its `value` property
 */
export type PortableTextTypeComponentProps<T> = Omit<PortableTextComponentProps<T>, 'children'>

/**
 * Props received by Portable Text mark rendering components
 *
 * @template M Shape describing the data associated with this mark, if it is an annotation
 */
export interface PortableTextMarkComponentProps<M extends TypedObject = ArbitraryTypedObject> {
  /**
   * Mark definition, eg the actual data of the annotation. If the mark is a simple decorator, this will be `undefined`
   */
  value?: M

  /**
   * Text content of this mark
   */
  text: string

  /**
   * Key for this mark. The same key can be used amongst multiple text spans within the same block, so don't rely on this for React keys.
   */
  markKey?: string

  /**
   * Type of mark - ie value of `_type` in the case of annotations, or the name of the decorator otherwise - eg `em`, `italic`.
   */
  markType: string

  /**
   * React child nodes of this mark
   */
  children: ReactNode

  /**
   * Function used to render any node that might appear in a portable text array or block,
   * including virtual "toolkit"-nodes like lists and nested spans. You will rarely need
   * to use this.
   */
  renderNode: NodeRenderer
}

/**
 * Any node type that we can't identify - eg it has an `_type`,
 * but we don't know anything about its other properties
 */
export type UnknownNodeType = {[key: string]: unknown; _type: string} | TypedObject

/**
 * A set of _common_ (but not required/standarized) block styles
 */
export type BlockStyle = 'normal' | 'blockquote' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | string

/**
 * A set of _common_ (but not required/standardized) list item types
 */
export type ListItemType = 'bullet' | 'number' | string

/**
 * A Portable Text Block can be thought of as one paragraph, quote or list item.
 * In other words, it is a container for text, that can have a visual style associated with it.
 * The actual text value is stored in portable text spans inside of the `childen` array.
 *
 * @template M Mark types that be used for text spans
 * @template C Types allowed as children of this block
 */
export interface PortableTextBlock<
  M extends MarkDefinition = MarkDefinition,
  C extends TypedObject = ArbitraryTypedObject | PortableTextSpan
> extends TypedObject {
  /**
   * Type name identifying this as a portable text block.
   * All items within a portable text array should have a `_type` property.
   *
   * Usually 'block', but can be customized to other values
   */
  _type: 'block' | string

  /**
   * A key that identifies this block uniquely within the parent array. Used to more easily address
   * the block when editing collaboratively, but is also very useful for keys inside of React and
   * other rendering frameworks that can use keys to optimize operations.
   */
  _key?: string

  /**
   * Array of inline items for this block. Usually contain text spans, but can be
   * configured to include inline objects of other types as well.
   */
  children: C[]

  /**
   * Array of mark definitions used in child text spans. By having them be on the block level,
   * the same mark definition can be reused for multiple text spans, which is often the case
   * with nested marks.
   */
  markDefs?: M[]

  /**
   * Visual style of the block
   * Common values: 'normal', 'blockquote', 'h1'...'h6'
   */
  style?: BlockStyle

  /**
   * If this block is a list item, identifies which style of list item this is
   * Common values: 'bullet', 'number', but can be configured
   */
  listItem?: ListItemType

  /**
   * If this block is a list item, identifies which level of nesting it belongs within
   */
  level?: number
}

/**
 * Strictly speaking the same as a portable text block, but `listItem` is required
 */
export interface PortableTextListItemBlock<
  M extends MarkDefinition = MarkDefinition,
  C extends TypedObject = PortableTextSpan
> extends Omit<PortableTextBlock<M, C>, 'listItem'> {
  listItem: string
}

/**
 * A Portable Text Span holds a chunk of the actual text value of a Portable Text Block
 */
export interface PortableTextSpan {
  /**
   * Type is always `span` for portable text spans, as these don't vary in shape
   */
  _type: 'span'

  /**
   * Unique (within parent block) key for this portable text span
   */
  _key?: string

  /**
   * The actual text value of this text span
   */
  text: string

  /**
   * An array of marks this text span is annotated with, identified by its `_key`.
   * If the key cannot be found in the parent blocks mark definition, the mark is assumed to be a
   * decorator (a simpler mark without any properties - for instance `strong` or `em`)
   */
  marks?: string[]
}

/**
 * A mark definition holds information for marked text. For instance, a text span could reference
 * a mark definition for a hyperlink, a geoposition, a reference to a document or anything that is
 * representable as a JSON object.
 */
export interface MarkDefinition {
  /**
   * Unknown properties
   */
  [key: string]: unknown

  /**
   * Identifies the type of mark this is, and is used to pick the correct React components to use
   * when rendering a text span marked with this mark type.
   */
  _type: string

  /**
   * Uniquely identifies this mark definition within the block
   */
  _key: string
}

/**
 * Any object with an `_type` property (which is required in portable text arrays),
 * as well as a _potential_ `_key` (highly encouraged)
 */
export interface TypedObject {
  /**
   * Identifies the type of object/span this is, and is used to pick the correct React components
   * to use when rendering a span or inline object with this type.
   */
  _type: string

  /**
   * Uniquely identifies this object within its parent block.
   * Not _required_, but highly encouraged.
   */
  _key?: string
}

export type ArbitraryTypedObject = TypedObject & {[key: string]: any}

/**
 * Function that renders any node that might appear in a portable text array or block,
 * including virtual "toolkit"-nodes like lists and nested spans
 */
export type NodeRenderer = <T extends TypedObject>(options: Serializable<T>) => ReactNode

export type NodeType = 'block' | 'mark' | 'blockStyle' | 'listStyle' | 'listItemStyle'

export type MissingComponentHandler = (
  message: string,
  options: {type: string; nodeType: NodeType}
) => void

export interface Serializable<T> {
  node: T
  index: number
  isInline: boolean
  renderNode: NodeRenderer
}

// Re-exporting these as we don't want to refer to "toolkit" outside of this module

/**
 * A virtual "list" node for Portable Text - not strictly part of Portable Text,
 * but generated by this library to ease the rendering of lists in HTML etc
 */
export type ReactPortableTextList = ToolkitPortableTextList

/**
 * A virtual "list item" node for Portable Text - not strictly any different from a
 * regular Portable Text Block, but we can guarantee that it has a `listItem` property.
 */
export type ReactPortableTextListItem = ToolkitPortableTextListItem
