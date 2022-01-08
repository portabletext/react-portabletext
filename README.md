# react-portable-text

Render [Portable Text](https://portabletext.org/) with React.

## Installation

```
npm install --save react-portable-text
```

## Basic usage

```js
import {PortableText} from 'react-portable-text'

<PortableText value={[/* array of portable text blocks */]}>
```

## Styling the output

The rendered HTML does not have any styling applied, so you will want to either render a parent container with a class name you can target in your CSS, or pass [custom components](#customizing-components) if you want to pass specific class names, or you are using frameworks such as styled-components or similar.

## Customizing components

Default components are provided for all standard features of the Portable Text spec, with logical HTML defaults. You can pass an object of components to use, both to override the defaults and to provide components for your custom content types. This can be done in two ways:

### Passing a `components` prop

This overrides/provides components on a per-use basis, and will be merged with the defaults. In other words, you only need to provide the things you want to override.

**Note**: Make sure the object does not change on every render - eg do not create the object within a React component, or if you do, use `useMemo` to ensure referential identity between renders.

```js
const myPortableTextComponents = {
  types: {
    image: ({data}) => <img src={data.imageUrl} />,
    callToAction: ({data, isInline}) =>
      isInline ? (
        <a href={data.url}>{data.text}</a>
      ) : (
        <div className="callToAction">{data.text}</div>
      ),
  },

  marks: {
    link: ({children, markDef}) => (
      <a
        href={markDef.href}
        rel={!markDef.href.startsWith('/') ? 'noreferrer noopener' : undefined}
      >
        {children}
      </a>
    ),
  },
}

const YourComponent = (props) => {
  return <PortableText value={props.value} components={myPortableTextComponents} />
}
```

### Using a context

You can also use the `<PortableTextComponentsProvider>` to provide the same set of components to all `<PortableText>` instances below it in the tree.

This is useful for recursive rendering as well as in cases where you have the same configuration for all/most uses.

When using the context, the passed components gets merged with the defaults - you only need to provide overrides and components for custom types.

**Note**: Make sure the object does not change on every render - eg do not create the object within a React component, or if you do, use `useMemo` to ensure referential identity between renders.

```js
import {PortableTextComponentsProvider, PortableText} from 'react-portable-text'

export default function MyComponent() {
  return (
    <PortableTextComponentsProvider components={myPortableTextComponents}>
      <div className="portable-text">
        <PortableText value={somePortableTextInput} />
      </div>
    </PortableTextComponentsProvider>
  )
}
```

## Available components

These are the overridable/implementable keys:

### `types`

An object of React components that renders different types of objects that might appear both as part of the input array, or as inline objects within text blocks - eg alongside text spans.

Use the `isInline` property to check whether or not this is an inline object or a block.

The object has the shape `{typeName: ReactComponent}`, where `typeName` is the value set in individual `_type` attributes.

### `marks`

Object of React components that renders different types of marks that might appear in spans. Marks can be either be simple "decorators" (eg emphasis, underline, italic) or full "annotations" which include associated data (eg links, references, descriptions).

If the mark is a decorator, the component will receive a `markType` prop which has the name of the decorator (eg `em`). If the mark is an annotation, it will receive both a `markType` with the associated `_type` property (eg `link`), and a `markDef` property with an object holding the data for this mark.

The component also receives a `children` prop that should (usually) be returned in whatever parent container component makes sense for this mark (eg `<a>`, `<em>`).

### `block`

An object of React components that renders portable text blocks with different `style` properties. The object has the shape {styleName: ReactComponent}`, where `styleName`is the value set in individual `style` attributes on blocks (`normal` being the default).

Can also be set to a single React component, which would handle block styles of _any_ type.

### `list`

Object of React components used to render lists of different types (`bullet` vs `number`, for instance, which by default is `<ul>` and `<ol>`, respectively).

Note that there is no actual "list" node type in the Portable Text specification, but a series of list item blocks with the same `level` and `listItem` properties will be grouped into a virtual one inside of this library.

The property can also be set to a single React component, which would handle lists of _any_ type.

### `listItem`

Object of React components used to render different list item styles. The object has the shape `{listItemType: ReactComponent}`, where `listItemType` is the value set in individual `listItem` attributes on blocks.

Can also be set to a single React component, which would handle list items of _any_ type.

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

## Rendering Plain Text

As a bonus, `react-portable-text` offers a function that will render your
portable text content to a plain-text string. This is often useful for previews
and such in the Studio and for ancillary uses of content in contexts where
formatting is not supported (e.g. calendar invite descriptions, meta tags,
etc.).

```jsx
import {toPlainText} from 'react-portable-text'

const MetaDescription = ({value}) => {
  return <meta name="description" value={toPlainText(value)} />
}
```

## License

MIT © [Sanity.io](https://www.sanity.io/)
