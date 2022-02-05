# Migrating from @sanity/block-content-to-react to @portabletext/react

This document outlines the differences between [@portabletext/react](https://www.npmjs.com/package/@portabletext/react) and [@sanity/block-content-to-react](https://www.npmjs.com/package/@sanity/block-content-to-react) so you can adjust your code to use the newer @portabletext/react.

The goal of the new package is to make the module more ergonomic to use, and more in line with what you'd expect from a React component.

## `BlockContent` renamed to `PortableText`

PortableText is an [open-source specification](https://portabletext.org/), and as such we're giving it more prominence through the library and component renaming.

Also note that the component is now a named export, not the default export as in @sanity/block-content-to-react:

```jsx
// From:
import BlockContent from '@sanity/block-content-to-react'
<BlockContent {/* ... */} />

// ✅ To:
// Not the default export anymore
import { PortableText } from '@portabletext/react'
<PortableText {/* ... */} />
```

## `blocks` renamed to `value`

This component renders any Portable Text content or custom object (such as `codeBlock`, `mapLocation` or `callToAction`). As `blocks` is tightly coupled to text blocks, we've renamed the main input to `value`.

```jsx
// From:
<BlockContent blocks={[/* ... */]} />

// ✅ To:
<PortableText value={[/* ... */]} />
```

## `serializers` renamed to `components`

"Serializers" are now named "Components", which should make their role as custom renderers of content more understandable for React developers.

```jsx
// From:
<BlockContent {/* ... */} serializers={{
  marks: {/* ... */},
  types: {/* ... */},
  list: {/* ... */},
  // ...
}} />

// ✅ To:
<PortableText {/* ... */} components={{
  marks: {/* ... */},
  types: {/* ... */},
  list: {/* ... */},
  // ...
}} />
```

## Easier customization of individual block styles

Previously, if you wanted to override you'd need to override the rendering of headings, blockquotes, or other block styles, you'd need to re-define the entire block renderer (`serializers.types.block`):

```jsx
// From:
const BlockRenderer = (props) => {
  const {style = 'normal'} = props.node

  if (/^h\d/.test(style)) {
    const level = style.replace(/[^\d]/g, '')
    return React.createElement(style, {className: `heading-${level}`}, props.children)
  }

  if (style === 'blockquote') {
    return <blockquote>- {props.children}</blockquote>
  }

  // Fall back to default handling
  return BlockContent.defaultSerializers.types.block(props)
}

<BlockContent blocks={input} serializers={{types: {block: BlockRenderer}}} />
```

You are now able to provide different React components for different block styles - handy if you just want to override the rendering of headings, but not other styles, for instance.

```jsx
// ✅ To:
<PortableText
  value={input}
  components={{
    block: {
      // Customize block types with ease
      h1: ({children}) => <h1 className="text-2xl">{children}</h1>,

      // Same applies to custom styles
      customHeading: ({children}) => (
        <h2 className="text-lg text-primary text-purple-700">{children}</h2>
      ),
    },
  }}
/>
```

## Images aren't handled by default anymore

We've removed the only Sanity-specific part of the module, which was image handling. You'll have to provide a component to specify how images should be rendered yourself in this new version.

We've seen the community have vastly different preferences on how images should be rendered, so having a generic image component included out of the box felt unnecessary.

```jsx
import urlBuilder from '@sanity/image-url'
import { getImageDimensions } from '@sanity/asset-utils'

// Barebones lazy-loaded image component
const SampleImageComponent = ({value}) => {
  const {width, height} = getImageDimensions(value)
  return (
    <img
      src={urlBuilder().image(value).width(800).fit('max').auto('format').url()}
      alt={value.alt || ' '}
      loading="lazy"
      style={{
        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
      }}
    />
  )
}

// You'll now need to define your own image component
<PortableText
  value={input}
  components={{
    // ...
    types: {
      image: SampleImageComponent,
    },
  }}
/>
```

## Written in Typescript

The new module is written in TypeScript - which means a better experience when you're building with TypeScript yourself, but also with editors/IDEs which provide auto-completing the available props and warnings about mistypes.
