---
"@portabletext/react": minor
---

# TypeGen-aware Portable Text components

`<PortableText>` now infers the shape of every component handler from the `value` prop. When you pass a value typed by [Sanity TypeGen](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen), `components.types`, `components.marks`, `components.block`, `components.list`, and `components.listItem` all receive precise `value` props for the exact content the query returned.

Three new utility types ship with this feature:

- `InferComponents<T>` - same inference as the inline `components` prop, for hoisting components out of JSX.
- `InferStrictComponents<T>` - strict variant that requires a handler for every inferred custom type, mark, block style, and list style, and rejects handlers that aren't in the schema (and therefore not visible to TypeGen).
- `InferValue<T>` - derives a Portable Text array value type from any TypeGen query result type, useful for re-usable wrapper components.

## Schema

Every example below assumes the same `sanity.config.ts`:

```ts
// sanity.config.ts
import {defineArrayMember, defineConfig, defineField, defineType} from 'sanity'

export default defineConfig({
  name: 'default',
  projectId: 'abc123',
  dataset: 'production',
  schema: {
    types: [
      defineType({
        name: 'post',
        type: 'document',
        fields: [
          defineField({name: 'title', type: 'string'}),
          defineField({
            name: 'content',
            type: 'array',
            of: [
              defineArrayMember({type: 'block'}),
              defineArrayMember({
                type: 'image',
                options: {hotspot: true},
                fields: [defineField({name: 'alt', type: 'string'})],
              }),
            ],
          }),
        ],
      }),
    ],
  },
})
```

## Before: hand-typing handlers

Previously, every handler had to be typed by hand to mirror the generated query shape:

```tsx
// app/[slug]/page.tsx
import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {PortableText} from '@portabletext/react'
import {defineQuery} from 'groq'

const client = createClient({
  projectId: 'abc123',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-05-04',
})
const builder = createImageUrlBuilder(client)

export default async function Page({slug}: {slug: string}) {
  const query = defineQuery(`*[_type == "post" && slug.current == $slug][0]{title,content}`)
  const data = await client.fetch(query, {slug})

  if (!data) return notFound()

  return (
    <article>
      <h1>{data.title}</h1>
      <PortableText
        components={{
          types: {
            image: ({
              value,
            }: {
              value: {
                asset?: {
                  _ref: string
                  _type: 'reference'
                  _weak?: boolean
                }
                hotspot?: {
                  _type: 'sanity.imageHotspot'
                  x?: number
                  y?: number
                  height?: number
                  width?: number
                }
                crop?: {
                  _type: 'sanity.imageCrop'
                  top?: number
                  bottom?: number
                  left?: number
                  right?: number
                }
                alt?: string
                _type: 'image'
                _key: string
              }
            }) => <img src={builder.image(value).url()} alt={value.alt || ''} />,
          },
        }}
        value={data.content}
      />
    </article>
  )
}
```

## After: automatic inference

Now the same handler is fully typed straight from `data.content`:

```tsx
// app/[slug]/page.tsx
import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {PortableText} from '@portabletext/react'
import {defineQuery} from 'groq'

const client = createClient({
  projectId: 'abc123',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-05-04',
})
const builder = createImageUrlBuilder(client)

export default async function Page({slug}: {slug: string}) {
  const query = defineQuery(`*[_type == "post" && slug.current == $slug][0]{title,content}`)
  const data = await client.fetch(query, {slug})

  if (!data) return notFound()

  return (
    <article>
      <h1>{data.title}</h1>
      <PortableText
        components={{
          types: {
            // value is fully typed from the query result, no annotation needed
            image: ({value}) => (
              <img src={builder.image(value).url()} alt={value.alt || ''} />
            ),
          },
        }}
        value={data.content}
      />
    </article>
  )
}
```

## `InferComponents`: hoisting components without losing inference

Move the `components` map out of JSX and keep the same inferred handler types:

```tsx
// app/[slug]/page.tsx
import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {PortableText, type InferComponents} from '@portabletext/react'
import {defineQuery} from 'groq'

const client = createClient({
  projectId: 'abc123',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-05-04',
})
const builder = createImageUrlBuilder(client)

export default async function Page({slug}: {slug: string}) {
  const query = defineQuery(`*[_type == "post" && slug.current == $slug][0]{title,content}`)
  const data = await client.fetch(query, {slug})

  if (!data) return notFound()

  const components = {
    types: {
      image: ({value}) => <img src={builder.image(value).url()} alt={value.alt || ''} />,
    },
  } satisfies InferComponents<typeof data.content>

  return (
    <article>
      <h1>{data.title}</h1>
      <PortableText components={components} value={data.content} />
    </article>
  )
}
```

## `InferStrictComponents` + `InferValue`: a strict, re-usable wrapper

`InferValue<SanityQueries[keyof SanityQueries]>` collects every Portable Text item shape from every registered TypeGen query into an array value type, and `InferStrictComponents` requires a handler for each of them. Together they're perfect for a single `CustomPortableText` you reuse across the app:

```tsx
// app/[slug]/page.tsx
import {createClient, type SanityQueries} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {
  PortableText,
  type InferStrictComponents,
  type InferValue,
} from '@portabletext/react'
import {defineQuery} from 'groq'

const client = createClient({
  projectId: 'abc123',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2026-05-04',
})
const builder = createImageUrlBuilder(client)

// Array value type for every Portable Text item shape across all registered queries.
type PortableTextValue = InferValue<SanityQueries[keyof SanityQueries]>

function CustomPortableText({value}: {value: PortableTextValue}) {
  const components = {
    types: {
      image: ({value}) => <img src={builder.image(value).url()} alt={value.alt || ''} />,
    },
  } satisfies InferStrictComponents<PortableTextValue>
  //   ^ TypeScript errors when the schema gains a custom type, mark, or list
  //     style without a matching handler defined here

  return <PortableText components={components} value={value} />
}

export default async function Page({slug}: {slug: string}) {
  const query = defineQuery(`*[_type == "post" && slug.current == $slug][0]{title,content}`)
  const data = await client.fetch(query, {slug})

  if (!data) return notFound()

  return (
    <article>
      <h1>{data.title}</h1>
      {Array.isArray(data.content) && <CustomPortableText value={data.content} />}
    </article>
  )
}
```
