import type {
  ToolkitListNestMode,
  ToolkitPortableTextList,
  ToolkitPortableTextListItem,
} from '@portabletext/toolkit'
import type {
  ArbitraryTypedObject,
  PortableTextBlock,
  PortableTextBlockStyle,
  PortableTextListItemBlock,
  PortableTextListItemType,
  TypedObject,
} from '@portabletext/types'
import type {ComponentType, ReactNode} from 'react'

/**
 * Properties for the Portable Text react component
 *
 * @template B Types that can appear in the array of blocks
 */
export interface PortableTextProps<
  B extends TypedObject = PortableTextBlock | ArbitraryTypedObject,
> {
  /**
   * One or more blocks to render
   */
  value: B | B[] | null | undefined

  /**
   * React components to use for rendering
   */
  components?: PortableTextComponents<B>

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
  listNestingMode?: ToolkitListNestMode
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

type LooseRecord<K extends string, V> = Record<string, V> & {
  [P in K]?: V // autocompleted keys
}

// Pull literal `_type` names out of TypeGen unions so component maps can offer
// precise keys like `image`, `quote`, `link`, etc.
type TypeName<T> = T extends {_type: infer Name} ? (Name extends string ? Name : never) : never

// `@portabletext/types` exposes defaults as literal unions plus `(string & {})`
// for custom values. Keep only the literal default members.
type BuiltInPortableTextString<T> = T extends string ? (string extends T ? never : T) : never

type CustomPortableTextType<B extends TypedObject> = Exclude<B, {_type: 'block'}>

type CustomPortableTextTypeName<B extends TypedObject> = TypeName<CustomPortableTextType<B>>

type PortableTextBlockType<B extends TypedObject> = Extract<B, {_type: 'block'}>

export type DefaultPortableTextBlockStyle = BuiltInPortableTextString<PortableTextBlockStyle>

// Extract block style literals from the value union, for example `normal | h2`.
type PortableTextBlockStyleName<B extends TypedObject> =
  PortableTextBlockType<B> extends {style?: infer Style}
    ? NonNullable<Style> extends string
      ? NonNullable<Style>
      : never
    : never

type CustomPortableTextBlockStyleName<B extends TypedObject> = Exclude<
  PortableTextBlockStyleName<B>,
  DefaultPortableTextBlockStyle
>

// Contextualize each style handler with the matching block style. The `style`
// property remains optional because Portable Text blocks may omit it at runtime.
type PortableTextBlockForStyle<B extends TypedObject, Style extends string> =
  PortableTextBlockType<B> extends infer Block
    ? Block extends TypedObject
      ? Omit<Block, 'style'> & {style?: Extract<Block extends {style?: infer S} ? S : never, Style>}
      : never
    : never

type PortableTextBlockComponentFor<B extends TypedObject> =
  PortableTextBlockType<B> extends never
    ? PortableTextBlockComponent
    : PortableTextComponent<PortableTextBlockType<B>>

type PortableTextBlockComponents<B extends TypedObject> =
  string extends PortableTextBlockStyleName<B>
    ? LooseRecord<PortableTextBlockStyle, PortableTextBlockComponent | undefined>
    : PortableTextBlockStyleName<B> extends never
      ? LooseRecord<PortableTextBlockStyle, PortableTextBlockComponent | undefined>
      : // Known styles get precise value props; unknown extra styles stay allowed
        // and fall back to `any` for the forgiving default behavior.
        Record<string, PortableTextComponent<any> | undefined> & {
          [Style in PortableTextBlockStyleName<B>]?: PortableTextComponent<
            PortableTextBlockForStyle<B, Style>
          >
        }

// Extract list item style literals from the value union, for example
// `checklist | steps`.
type PortableTextListItemName<B extends TypedObject> =
  PortableTextBlockType<B> extends {listItem?: infer ListItem}
    ? NonNullable<ListItem> extends string
      ? NonNullable<ListItem>
      : never
    : never

export type DefaultPortableTextListItem = BuiltInPortableTextString<PortableTextListItemType>

type CustomPortableTextListItemName<B extends TypedObject> = Exclude<
  PortableTextListItemName<B>,
  DefaultPortableTextListItem
>

// Lists are virtual toolkit nodes created from list item blocks. Keep the
// toolkit shape, but narrow `listItem` to the specific style being rendered.
type PortableTextListForItem<ListItem extends string> = ReactPortableTextList extends infer List
  ? List extends ReactPortableTextList
    ? Omit<List, 'listItem'> & {listItem: ListItem}
    : never
  : never

// List item renderers receive the original block, but only after the toolkit
// has identified it as a list item, so `listItem` is required for the handler.
type PortableTextBlockForListItem<B extends TypedObject, ListItem extends string> =
  PortableTextBlockType<B> extends infer Block
    ? Block extends TypedObject
      ? Omit<Block, 'listItem'> & {
          listItem: Extract<Block extends {listItem?: infer Item} ? Item : never, ListItem>
        }
      : never
    : never

type PortableTextListComponentFor<B extends TypedObject> =
  PortableTextListItemName<B> extends never
    ? PortableTextListComponent
    : PortableTextComponent<PortableTextListForItem<PortableTextListItemName<B>>>

type PortableTextListItemComponentFor<B extends TypedObject> =
  PortableTextListItemName<B> extends never
    ? PortableTextListItemComponent
    : PortableTextComponent<PortableTextBlockForListItem<B, PortableTextListItemName<B>>>

type PortableTextListComponents<B extends TypedObject> =
  string extends PortableTextListItemName<B>
    ? LooseRecord<PortableTextListItemType, PortableTextListComponent | undefined>
    : PortableTextListItemName<B> extends never
      ? Record<string, PortableTextComponent<any> | undefined>
      : // Known list styles get precise virtual list props; unknown extra list
        // styles stay allowed and fall back to `any`.
        Record<string, PortableTextComponent<any> | undefined> & {
          [ListItem in PortableTextListItemName<B>]?: PortableTextComponent<
            PortableTextListForItem<ListItem>
          >
        }

type PortableTextListItemComponents<B extends TypedObject> =
  string extends PortableTextListItemName<B>
    ? LooseRecord<PortableTextListItemType, PortableTextListItemComponent | undefined>
    : PortableTextListItemName<B> extends never
      ? Record<string, PortableTextComponent<any> | undefined>
      : // Known list item styles get precise block props; unknown extra list item
        // styles stay allowed and fall back to `any`.
        Record<string, PortableTextComponent<any> | undefined> & {
          [ListItem in PortableTextListItemName<B>]?: PortableTextComponent<
            PortableTextBlockForListItem<B, ListItem>
          >
        }

// Extract annotation mark definitions from block `markDefs`.
type PortableTextMarkType<B extends TypedObject> =
  PortableTextBlockType<B> extends {markDefs?: infer MarkDefs}
    ? NonNullable<MarkDefs> extends readonly (infer MarkDef)[]
      ? Extract<MarkDef, TypedObject>
      : never
    : never

type PortableTextMarkTypeName<B extends TypedObject> = TypeName<PortableTextMarkType<B>>

// Unlike block styles and list items, `@portabletext/types` does not expose a
// default mark-name union. Keep this union aligned with `defaultMarks`, which
// is typed as `Record<DefaultPortableTextMark, ...>` to enforce coverage.
export type DefaultPortableTextMark =
  | 'em'
  | 'strong'
  | 'code'
  | 'underline'
  | 'strike-through'
  | 'link'

type CustomPortableTextMarkTypeName<B extends TypedObject> = Exclude<
  PortableTextMarkTypeName<B>,
  DefaultPortableTextMark
>

type PortableTextMarkComponents<B extends TypedObject> =
  string extends PortableTextMarkTypeName<B>
    ? Record<string, PortableTextMarkComponent | undefined>
    : PortableTextMarkTypeName<B> extends never
      ? Record<string, PortableTextMarkComponent | undefined>
      : // Known marks get precise `value` props; unknown extra marks stay allowed
        // and fall back to `any`.
        Record<string, PortableTextMarkComponent | undefined> & {
          [Type in PortableTextMarkTypeName<B>]?: PortableTextMarkComponent<
            Extract<PortableTextMarkType<B>, {_type: Type}>
          >
        }

type PortableTextTypeComponents<B extends TypedObject> =
  string extends CustomPortableTextTypeName<B>
    ? Record<string, PortableTextTypeComponent | undefined>
    : CustomPortableTextTypeName<B> extends never
      ? Record<string, PortableTextTypeComponent | undefined>
      : // Known custom object types get precise `value` props; unknown extra types
        // stay allowed and fall back to `any`.
        Record<string, PortableTextTypeComponent | undefined> & {
          [Type in CustomPortableTextTypeName<B>]?: PortableTextTypeComponent<
            Extract<CustomPortableTextType<B>, {_type: Type}>
          >
        }

type PortableTextValueItem<T> = Extract<
  NonNullable<T> extends readonly (infer B)[] ? B : NonNullable<T>,
  TypedObject
>

type PortableTextArrayItem<T> =
  NonNullable<T> extends readonly (infer Item)[]
    ? Extract<NonNullable<Item>, {_type: 'block'}> extends never
      ? never
      : Extract<NonNullable<Item>, TypedObject>
    : never

type InferPortableTextTypedObject<T> = T extends unknown
  ? PortableTextArrayItem<T> extends never
    ? NonNullable<T> extends readonly (infer Item)[]
      ? InferPortableTextTypedObject<Item>
      : NonNullable<T> extends object
        ? {
            [Key in keyof NonNullable<T>]: InferPortableTextTypedObject<NonNullable<T>[Key]>
          }[keyof NonNullable<T>]
        : never
    : PortableTextArrayItem<T>
  : never

type StrictPortableTextTypeComponents<B extends TypedObject> =
  string extends CustomPortableTextTypeName<B>
    ? Record<string, PortableTextTypeComponent | undefined>
    : CustomPortableTextTypeName<B> extends never
      ? Record<string, never>
      : {
          [Type in CustomPortableTextTypeName<B>]-?: PortableTextTypeComponent<
            Extract<CustomPortableTextType<B>, {_type: Type}>
          >
        }

type StrictPortableTextTypeComponentOverrides<B extends TypedObject> =
  CustomPortableTextTypeName<B> extends never
    ? {types?: StrictPortableTextTypeComponents<B>}
    : {types: StrictPortableTextTypeComponents<B>}

type StrictPortableTextMarkComponents<B extends TypedObject> =
  string extends PortableTextMarkTypeName<B>
    ? Record<string, PortableTextMarkComponent | undefined>
    : PortableTextMarkTypeName<B> extends never
      ? Record<string, never>
      : {
          [Type in CustomPortableTextMarkTypeName<B>]-?: PortableTextMarkComponent<
            Extract<PortableTextMarkType<B>, {_type: Type}>
          >
        } & {
          [Type in Extract<
            DefaultPortableTextMark,
            PortableTextMarkTypeName<B>
          >]?: PortableTextMarkComponent<Extract<PortableTextMarkType<B>, {_type: Type}>>
        }

type StrictPortableTextMarkComponentOverrides<B extends TypedObject> =
  CustomPortableTextMarkTypeName<B> extends never
    ? {marks?: StrictPortableTextMarkComponents<B>}
    : {marks: StrictPortableTextMarkComponents<B>}

type StrictPortableTextBlockComponents<B extends TypedObject> =
  string extends PortableTextBlockStyleName<B>
    ? LooseRecord<PortableTextBlockStyle, PortableTextBlockComponent | undefined>
    : PortableTextBlockStyleName<B> extends never
      ? Record<string, never>
      : {
          [Style in CustomPortableTextBlockStyleName<B>]-?: PortableTextComponent<
            PortableTextBlockForStyle<B, Style>
          >
        } & {
          [Style in Extract<
            DefaultPortableTextBlockStyle,
            PortableTextBlockStyleName<B>
          >]?: PortableTextComponent<PortableTextBlockForStyle<B, Style>>
        }

type StrictPortableTextBlockComponentOverrides<B extends TypedObject> =
  CustomPortableTextBlockStyleName<B> extends never
    ? {block?: StrictPortableTextBlockComponents<B> | PortableTextBlockComponentFor<B>}
    : {block: StrictPortableTextBlockComponents<B> | PortableTextBlockComponentFor<B>}

type StrictPortableTextListComponents<B extends TypedObject> =
  string extends PortableTextListItemName<B>
    ? LooseRecord<PortableTextListItemType, PortableTextListComponent | undefined>
    : PortableTextListItemName<B> extends never
      ? Record<string, never>
      : {
          [ListItem in CustomPortableTextListItemName<B>]-?: PortableTextComponent<
            PortableTextListForItem<ListItem>
          >
        } & {
          [ListItem in Extract<
            DefaultPortableTextListItem,
            PortableTextListItemName<B>
          >]?: PortableTextComponent<PortableTextListForItem<ListItem>>
        }

type StrictPortableTextListComponentOverrides<B extends TypedObject> =
  CustomPortableTextListItemName<B> extends never
    ? {list?: StrictPortableTextListComponents<B> | PortableTextListComponentFor<B>}
    : {list: StrictPortableTextListComponents<B> | PortableTextListComponentFor<B>}

type StrictPortableTextListItemComponents<B extends TypedObject> =
  string extends PortableTextListItemName<B>
    ? LooseRecord<PortableTextListItemType, PortableTextListItemComponent | undefined>
    : PortableTextListItemName<B> extends never
      ? Record<string, never>
      : {
          [ListItem in PortableTextListItemName<B>]-?: PortableTextComponent<
            PortableTextBlockForListItem<B, ListItem>
          >
        }

type StrictPortableTextListItemComponentOverrides<B extends TypedObject> = {
  listItem?: StrictPortableTextListItemComponents<B> | PortableTextListItemComponentFor<B>
}

/**
 * Object defining the different React components to use for rendering various aspects
 * of Portable Text and user-provided types, where only the overrides needs to be provided.
 */
export type PortableTextComponents<B extends TypedObject = any> = Partial<
  PortableTextReactComponents<B>
>

/**
 * Infer Portable Text components from a value type. This matches the inference
 * behavior of the `components` prop on `<PortableText>`.
 *
 * This is useful when working with
 * [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen),
 * where `defineQuery()` and `client.fetch()` can infer the shape of Portable
 * Text fields.
 *
 * @example
 * ```tsx
 * import {PortableText, type InferComponents} from '@portabletext/react'
 * import {createClient} from '@sanity/client'
 * import {defineQuery} from 'groq'
 *
 * const client = createClient(...)
 *
 * export default async function Page({slug}: {slug: string}) {
 *   const query = defineQuery(`*[_type == "post" && slug.current == $slug][0]{title,content}`)
 *   const data = await client.fetch(query, {slug})
 *   const components = {
 *     block: {
 *       // custom types are autocompleted and fully typed
 *     },
 *   } satisfies InferComponents<typeof data.content>
 *
 *   return (
 *     <>
 *       ...
 *       {Array.isArray(data?.content) && <PortableText components={components} value={data.content} />}
 *     </>
 *   )
 * }
 * ```
 */
export type InferComponents<T> = PortableTextComponents<PortableTextValueItem<T>>

/**
 * Infer the Portable Text array value type from
 * [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen)
 * generated types.
 *
 * Useful when building a re-usable wrapper component that only takes `value`
 * as an input prop and sets up `components` internally. Pass a TypeGen-
 * generated query result type that contains Portable Text fields - such as
 * an individual query result like `PostQueryResult`, or the `SanityQueries`
 * interface from `@sanity/client` - and `InferValue<T>` returns an array type
 * containing every Portable Text item shape it can find.
 *
 * Always feed `InferValue<T>` query result types, not Sanity schema types.
 * Schema types describe how content is stored, which can differ from how it
 * is queried (e.g. references resolved with `->`).
 *
 * @example
 * ```tsx
 * // Re-usable component typed against specific query results.
 * import {PortableText, type InferValue} from '@portabletext/react'
 * import {createImageUrlBuilder} from '@sanity/image-url'
 *
 * import type {AuthorQueryResult, PostQueryResult} from './sanity.types'
 *
 * type PortableTextValue = InferValue<PostQueryResult | AuthorQueryResult>
 *
 * export function CustomPortableText(props: {value: PortableTextValue}) {
 *   const builder = createImageUrlBuilder()
 *
 *   return (
 *     <PortableText
 *       components={{
 *         types: {
 *           image: ({value}) => {
 *             const width = 1920
 *             const height = 1080
 *             return (
 *               <img
 *                 src={builder
 *                   .image(value)
 *                   .width(width)
 *                   .height(height)
 *                   .fit('max')
 *                   .auto('format')
 *                   .url()}
 *                 alt={value.alt || ''}
 *                 loading="lazy"
 *                 height={height}
 *                 width={width}
 *               />
 *             )
 *           },
 *         },
 *       }}
 *       value={props.value}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Strictly typed re-usable component that handles every Portable Text shape
 * // returned by registered queries. Relies on `overloadClientMethods` being
 * // enabled in `sanity.cli.ts#typegen` (the default).
 * import {type SanityQueries} from '@sanity/client'
 * import {createImageUrlBuilder} from '@sanity/image-url'
 * import {
 *   PortableText,
 *   type InferStrictComponents,
 *   type InferValue,
 * } from '@portabletext/react'
 *
 * type PortableTextValue = InferValue<SanityQueries[keyof SanityQueries]>
 *
 * export function CustomPortableText(props: {value: PortableTextValue}) {
 *   const builder = createImageUrlBuilder()
 *
 *   const components = {
 *     types: {
 *       image: ({value}) => {
 *         const width = 1920
 *         const height = 1080
 *         return (
 *           <img
 *             src={builder
 *               .image(value)
 *               .width(width)
 *               .height(height)
 *               .fit('max')
 *               .auto('format')
 *               .url()}
 *             alt={value.alt || ''}
 *             loading="lazy"
 *             height={height}
 *             width={width}
 *           />
 *         )
 *       },
 *     },
 *   } satisfies InferStrictComponents<PortableTextValue>
 *
 *   return <PortableText components={components} value={props.value} />
 * }
 * ```
 */
export type InferValue<T> = Exclude<InferPortableTextTypedObject<T>, undefined>[]

/**
 * Infer Portable Text components from a value type, requiring handlers for all
 * custom object types and disallowing extra custom object type handlers.
 *
 * This is used the same way as {@link InferComponents}, but serves a different
 * purpose: `InferComponents` is forgiving and mirrors the inline
 * `<PortableText components={...} />` experience, allowing custom handlers to
 * be omitted and allowing handlers for types that do not exist in, or could not
 * be inferred from, the value type. `InferStrictComponents` is strict: it
 * requires inferred custom handlers and rejects unknown ones.
 */
export type InferStrictComponents<T> = Omit<
  PortableTextComponents<PortableTextValueItem<T>>,
  'types' | 'marks' | 'block' | 'list' | 'listItem'
> &
  StrictPortableTextTypeComponentOverrides<PortableTextValueItem<T>> &
  StrictPortableTextMarkComponentOverrides<PortableTextValueItem<T>> &
  StrictPortableTextBlockComponentOverrides<PortableTextValueItem<T>> &
  StrictPortableTextListComponentOverrides<PortableTextValueItem<T>> &
  StrictPortableTextListItemComponentOverrides<PortableTextValueItem<T>>

/**
 * Object definining the different React components to use for rendering various aspects
 * of Portable Text and user-provided types.
 */
export interface PortableTextReactComponents<B extends TypedObject = any> {
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
  types: PortableTextTypeComponents<B>

  /**
   * Object of React components that renders different types of marks that might appear in spans.
   *
   * The object has the shape `{markName: ReactComponent}`, where `markName` is the value set
   * in individual `_type` attributes, values being stored in the parent blocks `markDefs`.
   */
  marks: PortableTextMarkComponents<B>

  /**
   * Object of React components that renders blocks with different `style` properties.
   *
   * The object has the shape `{styleName: ReactComponent}`, where `styleName` is the value set
   * in individual `style` attributes on blocks.
   *
   * Can also be set to a single React component, which would handle block styles of _any_ type.
   */
  block: PortableTextBlockComponents<B> | PortableTextBlockComponentFor<B>

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
  list: PortableTextListComponents<B> | PortableTextListComponentFor<B>

  /**
   * Object of React components used to render different list item styles.
   *
   * The object has the shape `{listItemType: ReactComponent}`, where `listItemType` is the value
   * set in individual `listItem` attributes on blocks.
   *
   * Can also be set to a single React component, which would handle list items of _any_ type.
   */
  listItem: PortableTextListItemComponents<B> | PortableTextListItemComponentFor<B>

  /**
   * Component to use for rendering "hard breaks", eg `\n` inside of text spans
   * Will by default render a `<br />`. Pass `false` to render as-is (`\n`)
   */
  hardBreak: ComponentType | false

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
export type UnknownNodeType =
  | {
      _type: string
      [key: string]: unknown
    }
  | TypedObject

/**
 * Function that renders any node that might appear in a portable text array or block,
 * including virtual "toolkit"-nodes like lists and nested spans
 */
export type NodeRenderer = <T extends TypedObject>(options: Serializable<T>) => ReactNode

export type NodeType = 'block' | 'mark' | 'blockStyle' | 'listStyle' | 'listItemStyle'

export type MissingComponentHandler = (
  message: string,
  options: {type: string; nodeType: NodeType},
) => void

export interface Serializable<T> {
  node: T
  index: number
  isInline: boolean
  renderNode: NodeRenderer
}

export interface SerializedBlock {
  _key: string
  children: ReactNode
  index: number
  isInline: boolean
  node: PortableTextBlock | PortableTextListItemBlock
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
