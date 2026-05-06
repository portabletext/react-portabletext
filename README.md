# @portabletext/react

[![npm version](https://img.shields.io/npm/v/@portabletext/react.svg?style=flat-square)](https://www.npmjs.com/package/@portabletext/react)[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@portabletext/react?style=flat-square)](https://bundlephobia.com/result?p=@portabletext/react)[![Build Status](https://img.shields.io/github/actions/workflow/status/portabletext/react-portabletext/main.yml?branch=main&style=flat-square)](https://github.com/portabletext/react-portabletext/actions?query=workflow%3Atest)

Render [Portable Text](https://portabletext.org/) with React.

Migrating from [@sanity/block-content-to-react](https://www.npmjs.com/package/@sanity/block-content-to-react)? Refer to the [migration docs](https://github.com/portabletext/react-portabletext/blob/main/MIGRATING.md).

## Table of contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
- [Styling](#styling-the-output)
- [Customizing components](#customizing-components)
- [Available components](#available-components)
  - [types](#types)
  - [marks](#marks)
  - [block](#block)
  - [list](#list)
  - [listItem](#listItem)
  - [hardBreak](#hardBreak)
  - [unknown components](#unknownMark)
- [Disable warnings / Handling unknown types](#disabling-warnings--handling-unknown-types)
- [Rendering Plain Text](#rendering-plain-text)
- [Sanity TypeGen Compatibility](#sanity-typegen-compatibility)
  - [A re-usable `CustomPortableText` component](#a-re-usable-customportabletext-component)
  - [Choosing what to feed `InferValue<T>`](#choosing-what-to-feed-infervaluet)
  - [`InferComponents` vs `InferStrictComponents`](#infercomponents-vs-inferstrictcomponents)
- [Manually Typing Portable Text](#manually-typing-portable-text)

## Installation

```
npm install --save @portabletext/react
```

## Basic usage

```js
import {PortableText} from '@portabletext/react'

<PortableText
  value={[/* array of portable text blocks */]}
  components={/* optional object of custom components to use */}
/>
```

## Styling the output

The rendered HTML does not have any styling applied, so you will either render a parent container with a class name you can target in your CSS, or pass [custom components](#customizing-components) if you want to control the direct markup and CSS of each element.

## Customizing components

Default components are provided for all standard features of the Portable Text spec, with logical HTML defaults. You can pass an object of components to use, both to override the defaults and to provide components for your custom content types.

Provided components will be merged with the defaults. In other words, you only need to provide the things you want to override.

**Note**: Make sure the object does not change on every render - eg do not create the object within a React component, or if you do, use `useMemo` to ensure referential identity between renders for better performance.

```js
const myPortableTextComponents = {
  types: {
    image: ({value}) => <img src={value.imageUrl} />,
    callToAction: ({value, isInline}) =>
      isInline ? (
        <a href={value.url}>{value.text}</a>
      ) : (
        <div className="callToAction">{value.text}</div>
      ),
  },

  marks: {
    link: ({children, value}) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined
      return (
        <a href={value.href} rel={rel}>
          {children}
        </a>
      )
    },
  },
}

const YourComponent = (props) => {
  return <PortableText value={props.value} components={myPortableTextComponents} />
}
```

## Available components

These are the overridable/implementable keys:

### `types`

An object of React components that renders different types of objects that might appear both as part of the input array, or as inline objects within text blocks - eg alongside text spans.

Use the `isInline` property to check whether or not this is an inline object or a block.

The object has the shape `{typeName: ReactComponent}`, where `typeName` is the value set in individual `_type` attributes.

Example of rendering a custom `image` object:

```jsx
import {PortableText} from '@portabletext/react'
import urlBuilder from '@sanity/image-url'
import {getImageDimensions} from '@sanity/asset-utils'

// Barebones lazy-loaded image component
const SampleImageComponent = ({value, isInline}) => {
  const {width, height} = getImageDimensions(value)
  return (
    <img
      src={urlBuilder()
        .image(value)
        .width(isInline ? 100 : 800)
        .fit('max')
        .auto('format')
        .url()}
      alt={value.alt || ''}
      loading="lazy"
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? 'inline-block' : 'block',

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
      }}
    />
  )
}

const components = {
  types: {
    image: SampleImageComponent,
    // Any other custom types you have in your content
    // Examples: mapLocation, contactForm, code, featuredProjects, latestNews, etc.
  },
}

const YourComponent = (props) => {
  return <PortableText value={somePortableTextInput} components={components} />
}
```

### `marks`

Object of React components that renders different types of marks that might appear in spans. Marks can either be simple "decorators" (eg emphasis, underline, italic) or full "annotations" which include associated data (eg links, references, descriptions).

If the mark is a decorator, the component will receive a `markType` prop which has the name of the decorator (eg `em`). If the mark is an annotation, it will receive both a `markType` with the associated `_type` property (eg `link`), and a `value` property with an object holding the data for this mark.

The component also receives a `children` prop that should (usually) be returned in whatever parent container component makes sense for this mark (eg `<a>`, `<em>`).

```tsx
// `components` object you'll pass to PortableText w/ optional TS definition
import {PortableTextComponents} from '@portabletext/react'

const components = {
  marks: {
    // Ex. 1: custom renderer for the em / italics decorator
    em: ({children}) => <em className="text-gray-600 font-semibold">{children}</em>,

    // Ex. 2: rendering a custom `link` annotation
    link: ({value, children}) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
      return (
        <a href={value?.href} target={target} rel={target === '_blank' && 'noindex nofollow'}>
          {children}
        </a>
      )
    },
  },
} satisfies PortableTextComponents
```

### `block`

An object of React components that renders portable text blocks with different `style` properties. The object has the shape `{styleName: ReactComponent}`, where `styleName` is the value set in individual `style` attributes on blocks (`normal` being the default).

```tsx
import {PortableText, PortableTextReactComponents} from '@portabletext/react'

// `components` object you'll pass to PortableText
const components = {
  block: {
    // Ex. 1: customizing common block types
    normal: ({children}) => <p className="text-sm">{children}</p>,
    h1: ({children}) => <h1 className="text-2xl">{children}</h1>,
    blockquote: ({children}) => <blockquote className="border-l-purple-500">{children}</blockquote>,

    // Ex. 2: rendering custom styles
    customHeading: ({children}) => (
      <h2 className="text-lg text-primary text-purple-700">{children}</h2>
    ),
  },
} satisfies Partial<PortableTextReactComponents>
```

The `block` object can also be set to a single React component, which would handle block styles of _any_ type.

### `list`

Object of React components used to render lists of different types (`bullet` vs `number`, for instance, which by default is `<ul>` and `<ol>`, respectively).

Note that there is no actual "list" node type in the Portable Text specification, but a series of list item blocks with the same `level` and `listItem` properties will be grouped into a virtual one inside of this library.

```jsx
const components = {
  list: {
    // Ex. 1: customizing common list types
    bullet: ({children}) => <ul className="mt-xl">{children}</ul>,
    number: ({children}) => <ol className="mt-lg">{children}</ol>,

    // Ex. 2: rendering custom lists
    checkmarks: ({children}) => <ol className="m-auto text-lg">{children}</ol>,
  },
}
```

The `list` property can also be set to a single React component, which would handle lists of _any_ type.

### `listItem`

Object of React components used to render different list item styles. The object has the shape `{listItemType: ReactComponent}`, where `listItemType` is the value set in individual `listItem` attributes on blocks.

```jsx
const components = {
  listItem: {
    // Ex. 1: customizing common list types
    bullet: ({children}) => <li style={{listStyleType: 'disclosure-closed'}}>{children}</li>,

    // Ex. 2: rendering custom list items
    checkmarks: ({children}) => <li>✅ {children}</li>,
  },
}
```

The `listItem` property can also be set to a single React component, which would handle list items of _any_ type.

### `hardBreak`

Component to use for rendering "hard breaks", eg `\n` inside of text spans.

Will by default render a `<br />`. Pass `false` to render as-is (`\n`)

### `unknownMark`

React component used when encountering a mark type there is no registered component for in the `components.marks` prop.

### `unknownType`

React component used when encountering an object type there is no registered component for in the `components.types` prop.

### `unknownBlockStyle`

React component used when encountering a block style there is no registered component for in the `components.block` prop. Only used if `components.block` is an object.

### `unknownList`

React component used when encountering a list style there is no registered component for in the `components.list` prop. Only used if `components.list` is an object.

### `unknownListItem`

React component used when encountering a list item style there is no registered component for in the `components.listItem` prop. Only used if `components.listItem` is an object.

## Disabling warnings / handling unknown types

When the library encounters a block, mark, list or list item with a type that is not known (eg it has no corresponding component in the `components` property), it will by default print a console warning.

To disable this behavior, you can either pass `false` to the `onMissingComponent` property, or give it a custom function you want to use to report the error. For instance:

```tsx
import {PortableText} from '@portabletext/react'

<PortableText
  value={[/* array of portable text blocks */]}
  onMissingComponent={false}
/>

// or, pass it a function:

<PortableText
  value={[/* array of portable text blocks */]}
  onMissingComponent={(message, options) => {
    myErrorLogger.report(message, {
      // eg `someUnknownType`
      type: options.type,

      // 'block' | 'mark' | 'blockStyle' | 'listStyle' | 'listItemStyle'
      nodeType: options.nodeType
    })
  }}
/>
```

## Rendering Plain Text

This module also exports a function (`toPlainText()`) that will render one or more Portable Text blocks as plain text. This is helpful in cases where formatted text is not supported, or you need to process the raw text value.

For instance, to render an OpenGraph meta description for a page:

```tsx
import {toPlainText} from '@portabletext/react'

const MetaDescription = (myPortableTextData) => {
  return <meta name="og:description" value={toPlainText(myPortableTextData)} />
}
```

Or to generate element IDs for headers, in order for them to be linkable:

```tsx
import {PortableText, toPlainText, PortableTextComponents} from '@portabletext/react'
import slugify from 'slugify'

const LinkableHeader = ({children, value}) => {
  // `value` is the single Portable Text block of this header
  const slug = slugify(toPlainText(value))
  return <h2 id={slug}>{children}</h2>
}

const components = {
  block: {
    h2: LinkableHeader,
  },
} satisfies PortableTextComponents
```

## Sanity TypeGen Compatibility

When you use [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen), `@portabletext/react` infers everything for you - which custom types, marks, block styles, and list styles your handlers receive, and what shape their `value` props have - directly from your queries. No manual generics or hand-written type unions needed.

The library exposes three utility types to make this ergonomic:

- `InferValue<T>` - derives a Portable Text array value type from any TypeGen query result type.
- `InferComponents<T>` - forgiving component map type, mirrors the inline `components` prop inference.
- `InferStrictComponents<T>` - strict component map type, requires inferred handlers and rejects unknown ones.

### A re-usable `CustomPortableText` component

This is the recommended pattern for a single Portable Text renderer that you reuse across your app. `InferValue<SanityQueries[keyof SanityQueries]>` collects every Portable Text item shape returned by every registered TypeGen query into an array value type, and `InferStrictComponents` forces you to define a handler for each of them.

```tsx
import type { SanityQueries} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {
  PortableText,
  type InferStrictComponents,
  type InferValue,
} from '@portabletext/react'

const builder = createImageUrlBuilder(...)

// Array value type for every Portable Text item shape across all registered queries.
type PortableTextValue = InferValue<SanityQueries[keyof SanityQueries]>

export function CustomPortableText({value}: {value: PortableTextValue}) {
  const components = {
    types: {
      // `value` is fully typed from the inferred image variant.
      image: ({value}) => <img src={builder.image(value).url()} alt={value.alt || ''} />,
    },
    // Add `types`, `marks`, `block`, `list` etc. handlers as your schema requires.
  } satisfies InferStrictComponents<PortableTextValue>
  //   ^ TypeScript errors when the schema gains a custom type, block, mark, or list
  //     style without a matching handler defined here.

  return <PortableText components={components} value={value} />
}
```

You can drop this component in anywhere a TypeGen-typed Portable Text array shows up:

```tsx
import {createClient} from '@sanity/client'
import {defineQuery} from 'groq'

const client = createClient(...)


export default async function Page({slug}: {slug: string}) {
  const postQuery = defineQuery(`*[_type == "post" && slug.current == $slug][0]{title,content}`)
  const data = await client.fetch(postQuery, {slug})

  if (!data) return notFound()

  return (
    <article>
      <h1>{data.title}</h1>
      {Array.isArray(data.content) && <CustomPortableText value={data.content} />}
    </article>
  )
}
```

### Choosing what to feed `InferValue<T>`

`InferValue<T>` is meant for re-usable wrapper components that accept Portable Text via a `value` prop. You feed it a TypeGen-generated _query_ result type (or union of them) so the component covers every shape it might be asked to render. It returns the array value type directly, so `type PortableTextValue = InferValue<...>` can be used as the `value` prop type without adding `[]` yourself.

> Feed `InferValue` query result types, not Sanity schema types. Schema types describe how content is **stored** in Sanity, not how it's **queried**. For example, an `inlineAuthor` value with an `author` reference is stored as `{_type: 'inlineAuthor', author: {_ref: string, _type: 'reference'}}`, but a query that follows the reference with `author->` will return `{_type: 'inlineAuthor', author: {_id: string, _type: 'author', ...}}`. Always type from query results.

There are three common strategies:

**Preferred: every registered query**

```tsx
import {type SanityQueries} from '@sanity/client'

type PortableTextValue = InferValue<SanityQueries[keyof SanityQueries]>
```

This auto-updates as you add or remove queries, so you don't have to come back and adjust the prop type later. Requires `overloadClientMethods` in `sanity.cli.ts#typegen` (on by default).

**Fallback: specific named queries**

If `SanityQueries[keyof SanityQueries]` produces too large a union and slows down type-checking, narrow it to the specific query results that contain Portable Text fields:

```tsx
import type {AuthorQueryResult, PostQueryResult} from './sanity.types'

type PortableTextValue = InferValue<AuthorQueryResult | PostQueryResult>
```

You'll have to keep this union in sync as you add or change queries; that trade-off is the cost of skipping the wide one.

**Alternative: a scoped mock query**

You can define a focused GROQ query inside `CustomPortableText` purely for type generation. TypeGen registers it in `SanityQueries` like any other, but you only feed _its_ result type into `InferValue`, keeping the union tight:

```tsx
import {type SanityQueries} from '@sanity/client'
import {defineQuery} from 'groq'

const mockQuery = defineQuery(`*[_type in ["author", "category", "post"]]{
  _type == "author" => {bio},
  _type == "category" => {description},
  _type == "post" => {content},
}`)

function CustomPortableText({value}: {value: InferValue<SanityQueries[typeof mockQuery]>}) {
  // ...
}
```

Use this when `SanityQueries[keyof SanityQueries]` is too slow but you don't want to maintain a hand-written union of named query results either.

**Don't combine** the mock query with `SanityQueries[keyof SanityQueries]` - the mock query gets added to `SanityQueries` and bloats the union you're trying to avoid. Pick one strategy or the other.

### `InferComponents` vs `InferStrictComponents`

Both utilities derive component handler types from a value type. They differ in how strict they are.

**`InferComponents<T>`** - forgiving. Mirrors the same inference behavior as inlining `components` directly on `<PortableText>`:

- All handlers are optional.
- Extra handlers for types not present in `T` are allowed (they fall back to `any`).
- Best for: incremental migration, partial coverage, schemas that change often.

```tsx
import {PortableText, type InferComponents} from '@portabletext/react'

const components = {
  types: {
    image: ({value}) => <img src={builder.image(value).url()} alt={value.alt || ''} />,
    // Optional: legacy types not in the current schema are allowed.
  },
} satisfies InferComponents<typeof data.content>
```

**`InferStrictComponents<T>`** - strict. Treats your schema as the contract:

- Custom types, marks, block styles, and list styles inferred from `T` are **required**.
- Handlers for keys that aren't inferred from `T` are **rejected**.
- Default handlers (`em`, `strong`, `link`, `normal`, `h1`-`h6`, `bullet`, `number`, etc.) remain optional - the library renders them by default.
- Best for: production-grade renderers where missing or stale handlers should fail TypeScript.

```tsx
import {PortableText, type InferStrictComponents} from '@portabletext/react'

const components = {
  types: {
    image: ({value}) => <img src={builder.image(value).url()} alt={value.alt || ''} />,
    // Omit `image` and TypeScript errors.
    // Add `legacyEmbed` and TypeScript errors.
  },
} satisfies InferStrictComponents<typeof data.content>
```

Pick `InferComponents` when you want flexibility, and `InferStrictComponents` when you want TypeScript to scream the moment your schema and your renderer go out of sync.

## Manually Typing Portable Text

If you're not using Sanity TypeGen, Portable Text data can be typed using the [`@portabletext/types`](https://www.npmjs.com/package/@portabletext/types) package.

### Basic usage

Use `PortableTextBlock` without generics for loosely typed defaults.

```ts
import {PortableTextBlock} from '@portabletext/types'

interface MySanityDocument {
  portableTextField: (PortableTextBlock | SomeBlockType)[]
}
```

### Narrow types, marks, inline-blocks and lists

`PortableTextBlock` supports generics, and has the following signature:

```ts
interface PortableTextBlock<
  M extends PortableTextMarkDefinition = PortableTextMarkDefinition,
  C extends TypedObject = ArbitraryTypedObject | PortableTextSpan,
  S extends string = PortableTextBlockStyle,
  L extends string = PortableTextListItemType,
> {}
```

Create your own, narrowed Portable text type:

```ts
import {PortableTextBlock, PortableTextMarkDefinition, PortableTextSpan} from '@portabletext/types'

// MARKS
interface FirstMark extends PortableTextMarkDefinition {
  _type: 'firstMark'
  // ...other fields
}

interface SecondMark extends PortableTextMarkDefinition {
  _type: 'secondMark'
  // ...other fields
}

type CustomMarks = FirstMark | SecondMark

// INLINE BLOCKS

interface MyInlineBlock {
  _type: 'myInlineBlock'
  // ...other fields
}

type InlineBlocks = PortableTextSpan | MyInlineBlock

// STYLES

type TextStyles = 'normal' | 'h1' | 'myCustomStyle'

// LISTS

type ListStyles = 'bullet' | 'myCustomList'

// CUSTOM PORTABLE TEXT BLOCK

// Putting it all together by specifying generics
// all of these are valid:
// type CustomPortableTextBlock = PortableTextBlock<CustomMarks>
// type CustomPortableTextBlock = PortableTextBlock<CustomMarks, InlineBlocks>
// type CustomPortableTextBlock = PortableTextBlock<CustomMarks, InlineBlocks, TextStyles>
type CustomPortableTextBlock = PortableTextBlock<CustomMarks, InlineBlocks, TextStyles, ListStyles>

// Other BLOCKS that can appear inbetween text

interface MyCustomBlock {
  _type: 'myCustomBlock'
  // ...other fields
}

// TYPE FOR PORTABLE TEXT FIELD ITEMS
type PortableTextFieldType = CustomPortableTextBlock | MyCustomBlock

// Using it in your document type
interface MyDocumentType {
  portableTextField: PortableTextFieldType[]
}
```

## License

MIT © [Sanity.io](https://www.sanity.io/)
