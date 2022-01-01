# react-portable-text

Render [Portable Text](https://portabletext.org/) with React.

## Installation

```
npm install --save react-portable-text
```

## Basic usage

```js
import {PortableText} from 'react-portable-text'

<PortableText blocks={[/* array of portable text blocks */]}>
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
    image: ({node}) => <img src={node.imageUrl} />,
    callToAction: ({node, isInline}) =>
      isInline ? (
        <a href={node.url}>{node.text}</a>
      ) : (
        <div className="callToAction">{node.text}</div>
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
  return <PortableText blocks={props.blocks} components={myPortableTextComponents} />
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
        <PortableText blocks={somePortableTextInput} />
      </div>
    </PortableTextComponentsProvider>
  )
}
```

## License

MIT © [Sanity.io](https://www.sanity.io/)

```

```
