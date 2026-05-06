import {
  type InferComponents,
  type InferStrictComponents,
  type InferValue,
  PortableText,
  type PortableTextComponentProps,
  type PortableTextMarkComponentProps,
  type PortableTextTypeComponentProps,
} from '@portabletext/react'
/**
 * Type-level tests for @portabletext/react with Sanity TypeGen generated types.
 *
 * These tests document the desired behavior for TypeGen integration.
 * Currently, all tests pass because they are structured to verify both:
 * - What already works (e.g., non-null TypeGen arrays are assignable to `value`)
 * - What we want to support (documented via placeholder tests and comments)
 *
 * The goal is:
 * 1. `value` prop should accept TypeGen query results directly (including `null` and optional values)
 * 2. `components` should infer allowed custom types, marks, and styles from the `value` type
 * 3. Expose `InferComponents<T>` - same inference behavior as the components prop
 * 4. Expose `InferStrictComponents<T>` - strict mode, no extras allowed
 */
import {createClient, type SanityQueries} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {defineQuery} from 'groq'
import {describe, expectTypeOf, test} from 'vitest'

import type {AllSanitySchemaTypes} from './sanity.types'

const client = createClient({
  projectId: 'test',
  dataset: 'test',
  useCdn: true,
  apiVersion: '2024-01-01',
})
const builder = createImageUrlBuilder(client)

// do not explicitly type the return of `fetchPost` or `fetchAuthor` as we rely on inference and client overloading
async function fetchPost(slug: string) {
  const postQuery = defineQuery(
    `*[_type == "post" && slug.current == $slug][0]{title,author->{name,avatar},content}`,
  )
  return await client.fetch(postQuery, {slug})
}

async function fetchAuthor(id: string) {
  const authorQuery = defineQuery(`*[_type == "author" && _id == $id][0]{name,avatar,bio}`)
  return await client.fetch(authorQuery, {id})
}

async function fetchCategory(id: string) {
  const categoryQuery = defineQuery(`*[_type == "category" && _id == $id][0]{title,description[]{
    ...,
    _type == "featuredPost" => {
      ...,
      post->{title,author->{name,"avatar":avatar.asset->url},"slug":slug.current}
    }
  }}`)
  return await client.fetch(categoryQuery, {id})
}

describe('TypeGen value prop compatibility', () => {
  test('PostQueryResult.content should be assignable to PortableText value', async () => {
    const post = await fetchPost('foo')

    ;<PortableText value={post?.content} />
  })

  test('AuthorQueryResult.bio should be assignable to value prop', async () => {
    const author = await fetchAuthor('123')

    ;<PortableText value={author?.bio} />
  })
})

describe('PortableText component with TypeGen types', () => {
  test('should infer custom types in components.types from post content', async () => {
    const post = await fetchPost('foo')
    const content = post?.content
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]
    type CustomTypes = Exclude<PostContentBlock, {_type: 'block'}>

    // When passing TypeGen content to PortableText, the `components.types`
    // should autocomplete with 'image', 'quote', 'code' from the content union.
    ;<PortableText
      value={content}
      components={{
        types: {
          image: ({value, isInline}) => {
            expectTypeOf(value).toEqualTypeOf<
              PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'image'}>>['value']
            >()
            const width = 1920
            const height = 1080
            return (
              <img
                src={builder
                  .image(value)
                  .width(width)
                  .height(height)
                  .fit('max')
                  .auto('format')
                  .url()}
                alt={value.alt || ''}
                loading="lazy"
                height={height}
                width={width}
                style={{
                  // Display alongside text if image appears inside a block text span
                  display: isInline ? 'inline-block' : 'block',
                }}
              />
            )
          },
          quote: ({value}) => {
            expectTypeOf(value).toEqualTypeOf<
              PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'quote'}>>['value']
            >()
            return (
              <figure>
                <blockquote>
                  <p>{value.text}</p>
                </blockquote>
                <figcaption>{value.attribution}</figcaption>
              </figure>
            )
          },
          code: ({value}) => {
            expectTypeOf(value).toEqualTypeOf<
              PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'code'}>>['value']
            >()
            return (
              <pre>
                <code>{value.code}</code>
              </pre>
            )
          },
        },
      }}
    />
  })

  test('should infer annotation marks in components.marks from post content', async () => {
    const post = await fetchPost('foo')
    const content = post?.content
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]
    type BlockType = Extract<PostContentBlock, {_type: 'block'}>
    type MarkDefs = NonNullable<BlockType['markDefs']>
    type MarkType = MarkDefs[number]

    // When passing TypeGen content to PortableText, the `components.marks`
    // should autocomplete with marks from the block markDefs union.
    ;<PortableText
      value={content}
      components={{
        marks: {
          link: ({value}) => {
            expectTypeOf(value).toEqualTypeOf<
              PortableTextMarkComponentProps<Extract<MarkType, {_type: 'link'}>>['value']
            >()
            return null
          },
          glossaryTerm: ({value}) => {
            expectTypeOf(value).toEqualTypeOf<
              PortableTextMarkComponentProps<Extract<MarkType, {_type: 'glossaryTerm'}>>['value']
            >()
            return null
          },
        },
      }}
    />
  })

  test('should infer block styles in components.block from post content', async () => {
    const post = await fetchPost('foo')
    const content = post?.content
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]
    type BlockType = Extract<PostContentBlock, {_type: 'block'}>

    // When passing TypeGen content to PortableText, the `components.block`
    // should autocomplete with styles from the block style union.
    ;<PortableText
      value={content}
      components={{
        block: {
          normal: ({value}) => {
            expectTypeOf(value.style).toEqualTypeOf<'normal' | undefined>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          h2: ({value}) => {
            expectTypeOf(value.style).toEqualTypeOf<'h2' | undefined>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          h3: ({value}) => {
            expectTypeOf(value.style).toEqualTypeOf<'h3' | undefined>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          blockquote: ({value}) => {
            expectTypeOf(value.style).toEqualTypeOf<'blockquote' | undefined>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          lead: ({value}) => {
            expectTypeOf(value.style).toEqualTypeOf<'lead' | undefined>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
        },
      }}
    />
  })

  test('should infer list styles in components.list and components.listItem from post content', async () => {
    const post = await fetchPost('foo')
    const content = post?.content
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]
    type BlockType = Extract<PostContentBlock, {_type: 'block'}>
    type ListItemType = NonNullable<BlockType['listItem']>

    expectTypeOf<'checklist'>().toExtend<ListItemType>()
    expectTypeOf<'steps'>().toExtend<ListItemType>()

    // When passing TypeGen content to PortableText, `components.list` and
    // `components.listItem` should autocomplete with the block listItem union.
    ;<PortableText
      value={content}
      components={{
        list: {
          checklist: ({value}) => {
            expectTypeOf(value.listItem).toEqualTypeOf<'checklist'>()
            return null
          },
          steps: ({value}) => {
            expectTypeOf(value.listItem).toEqualTypeOf<'steps'>()
            return null
          },
          legacyList: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
        listItem: {
          checklist: ({value}) => {
            expectTypeOf(value.listItem).toEqualTypeOf<'checklist'>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          steps: ({value}) => {
            expectTypeOf(value.listItem).toEqualTypeOf<'steps'>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          legacyList: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
      }}
    />
  })

  test('author bio should not offer image/quote/code in components.types', async () => {
    const author = await fetchAuthor('123')
    const bio = author?.bio

    // Since author bio only has block type (no custom types),
    // components.types should not autocomplete with 'image', 'quote', 'code'
    ;<PortableText
      value={bio}
      components={{
        types: {
          image: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
          quote: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
          code: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
      }}
    />
  })

  test('author bio should not infer custom list styles in components.list or components.listItem', async () => {
    const author = await fetchAuthor('123')
    const bio = author?.bio
    type AuthorData = NonNullable<typeof author>
    type AuthorBio = NonNullable<AuthorData['bio']>
    type AuthorBioBlock = AuthorBio[number]
    type BlockType = Extract<AuthorBioBlock, {_type: 'block'}>
    type ListItemType = NonNullable<BlockType['listItem']>

    expectTypeOf<ListItemType>().toEqualTypeOf<never>()

    // Since author bio has no list styles, custom list/listItem handlers are
    // allowed but should not get precise TypeGen value props.
    ;<PortableText
      value={bio}
      components={{
        list: {
          checklist: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
        listItem: {
          checklist: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
      }}
    />
  })

  test('author bio should only infer normal in components.block', async () => {
    const author = await fetchAuthor('123')
    const bio = author?.bio
    type AuthorData = NonNullable<typeof author>
    type AuthorBio = NonNullable<AuthorData['bio']>
    type AuthorBioBlock = AuthorBio[number]
    type BlockType = Extract<AuthorBioBlock, {_type: 'block'}>

    // Since author bio only has normal blocks,
    // components.block should autocomplete with 'normal' but not richer post styles.
    ;<PortableText
      value={bio}
      components={{
        block: {
          normal: ({value}) => {
            expectTypeOf(value.style).toEqualTypeOf<'normal' | undefined>()
            expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
            return null
          },
          h2: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
          h3: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
          blockquote: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
      }}
    />
  })

  test('defining a type handler for a type NOT in content should be allowed by default', async () => {
    const post = await fetchPost('foo')
    const content = post?.content
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]
    type CustomTypes = Exclude<PostContentBlock, {_type: 'block'}>

    // For the "forgiving" default behavior:
    // If I define a handler for a type that doesn't exist in the content,
    // TypeScript should NOT error. This supports the case where:
    // - Old content might still have that type
    // - The handler is shared across multiple content types
    ;<PortableText
      value={content}
      components={{
        types: {
          image: ({value}) => {
            expectTypeOf(value).toEqualTypeOf<
              PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'image'}>>['value']
            >()
            return null
          },
          // This type doesn't exist in our schema but should be allowed
          legacyEmbed: ({value}) => {
            expectTypeOf(value).toBeAny()
            return null
          },
        },
      }}
    />
  })
})

describe('InferStrictComponents utility type', () => {
  // This utility type should:
  // - Require handlers for all custom types in the content
  // - Disallow extra handlers (strict mode)

  test('author bio should only have block type (no custom types)', async () => {
    const author = await fetchAuthor('123')
    type AuthorData = NonNullable<typeof author>
    type AuthorBio = NonNullable<AuthorData['bio']>
    type AuthorBioBlock = AuthorBio[number]

    // Author bio only has blocks with text formatting, no custom types
    type BioCustomTypes = Exclude<AuthorBioBlock, {_type: 'block'}>
    expectTypeOf<BioCustomTypes>().toEqualTypeOf<never>()
  })

  test('author bio block should only have normal style', async () => {
    const author = await fetchAuthor('123')
    type AuthorData = NonNullable<typeof author>
    type AuthorBio = NonNullable<AuthorData['bio']>
    type AuthorBioBlock = AuthorBio[number]

    type BlockType = Extract<AuthorBioBlock, {_type: 'block'}>
    type StyleType = NonNullable<BlockType['style']>
    expectTypeOf<StyleType>().toEqualTypeOf<'normal'>()
  })

  test('requires all custom handlers and disallows extras', async () => {
    const post = await fetchPost('foo')
    const content = post?.content
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]
    type CustomTypes = Exclude<PostContentBlock, {_type: 'block'}>
    type BlockType = Extract<PostContentBlock, {_type: 'block'}>
    type MarkDefs = NonNullable<BlockType['markDefs']>
    type MarkType = MarkDefs[number]

    const components = {
      types: {
        image: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'image'}>>['value']
          >()
          return null
        },
        quote: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'quote'}>>['value']
          >()
          return null
        },
        code: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'code'}>>['value']
          >()
          return null
        },
      },
      marks: {
        // `link` is handled by default, so only the custom annotation is required.
        glossaryTerm: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextMarkComponentProps<Extract<MarkType, {_type: 'glossaryTerm'}>>['value']
          >()
          return null
        },
      },
      block: {
        // Default block styles are handled by default, so only `lead` is required.
        lead: ({value}) => {
          expectTypeOf(value.style).toEqualTypeOf<'lead' | undefined>()
          expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
          return null
        },
      },
      list: {
        // `number` and `bullet` are handled by default, so only custom list styles are required.
        checklist: ({value}) => {
          expectTypeOf(value.listItem).toEqualTypeOf<'checklist'>()
          return null
        },
        steps: ({value}) => {
          expectTypeOf(value.listItem).toEqualTypeOf<'steps'>()
          return null
        },
      },
      // `listItem` is intentionally omitted: the default top-level function handles all list item styles.
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a custom type handler is missing', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      // @ts-expect-error Missing required `code` type handler
      types: {
        image: () => null,
        quote: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a custom mark handler is missing', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      // @ts-expect-error Missing required `glossaryTerm` mark handler
      marks: {},
      block: {
        lead: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a mark handler is not inferred or handled by default', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
        link: () => null,
        // @ts-expect-error `legacyMark` is not inferred and not handled by default
        legacyMark: () => null,
      },
      block: {
        lead: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a custom block style handler is missing', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
      },
      // @ts-expect-error Missing required `lead` block style handler
      block: {},
      list: {
        checklist: () => null,
        steps: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a block style handler is not inferred or handled by default', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
      },
      block: {
        lead: () => null,
        h2: () => null,
        // @ts-expect-error `legacyStyle` is not inferred and not handled by default
        legacyStyle: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a custom list style handler is missing', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
      },
      block: {
        lead: () => null,
      },
      // @ts-expect-error Missing required `steps` list style handler
      list: {
        checklist: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a list style handler is not inferred from the content', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
      },
      block: {
        lead: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
        // @ts-expect-error `bullet` is handled by default, but is not in the content type union
        bullet: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('requires all inferred list item handlers when listItem is an object', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
      },
      block: {
        lead: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
      },
      // @ts-expect-error Missing required `steps` list item handler
      listItem: {
        checklist: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('allows listItem as a function because it handles all list item styles', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
      },
      marks: {
        glossaryTerm: () => null,
      },
      block: {
        lead: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
      },
      listItem: ({children}) => {
        return <li>{children}</li>
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('errors when a custom type handler is not in the content', async () => {
    const post = await fetchPost('foo')
    const content = post?.content

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
        // @ts-expect-error `legacyEmbed` is not in the content type union
        legacyEmbed: () => null,
      },
    } satisfies InferStrictComponents<typeof content>

    ;<PortableText value={content} components={components} />
  })

  test('does not require type handlers when content has no custom types', async () => {
    const author = await fetchAuthor('123')
    const bio = author?.bio

    const components = {} satisfies InferStrictComponents<typeof bio>

    ;<PortableText value={bio} components={components} />
  })

  test('does not allow overriding default handles if they are not used in the content', async () => {
    const author = await fetchAuthor('123')
    const bio = author?.bio
    type BioData = NonNullable<typeof bio>
    type BioDataBlocks = BioData[number]
    type BlockType = Extract<BioDataBlocks, {_type: 'block'}>

    const components = {
      block: {
        normal: ({value}) => {
          expectTypeOf(value.style).toEqualTypeOf<'normal' | undefined>()
          expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
          return null
        },
        // @ts-expect-error `h1` is not in the content type union
        h1: () => null,
      },
    } satisfies InferStrictComponents<typeof bio>

    ;<PortableText value={bio} components={components} />
  })

  test('errors on type handlers when content has no custom types', async () => {
    const author = await fetchAuthor('123')
    const bio = author?.bio

    const components = {
      types: {
        // @ts-expect-error Author bio has no custom type handlers
        legacyEmbed: () => null,
      },
    } satisfies InferStrictComponents<typeof bio>

    ;<PortableText value={bio} components={components} />
  })
})

describe('InferValue utility type', () => {
  test('extracts portable text members from all schema types', () => {
    type PortableTextValue = InferValue<AllSanitySchemaTypes>
    type PortableTextItem = PortableTextValue[number]
    type TypeNames = PortableTextItem['_type']

    expectTypeOf<'block'>().toExtend<TypeNames>()
    expectTypeOf<'image'>().toExtend<TypeNames>()
    expectTypeOf<'quote'>().toExtend<TypeNames>()
    expectTypeOf<'code'>().toExtend<TypeNames>()
    expectTypeOf<'featuredPost'>().toExtend<TypeNames>()

    type CustomTypes = Exclude<PortableTextItem, {_type: 'block'}>
    expectTypeOf<Extract<CustomTypes, {_type: 'featuredPost'}>>().toHaveProperty('post')

    type BlockType = Extract<PortableTextItem, {_type: 'block'}>
    type StyleType = NonNullable<BlockType['style']>
    expectTypeOf<'normal'>().toExtend<StyleType>()
    expectTypeOf<'lead'>().toExtend<StyleType>()

    type ListItemType = NonNullable<BlockType['listItem']>
    expectTypeOf<'checklist'>().toExtend<ListItemType>()
    expectTypeOf<'steps'>().toExtend<ListItemType>()

    type MarkDefs = NonNullable<BlockType['markDefs']>
    type MarkType = MarkDefs[number]
    type MarkTypeNames = MarkType['_type']
    expectTypeOf<'link'>().toExtend<MarkTypeNames>()
    expectTypeOf<'glossaryTerm'>().toExtend<MarkTypeNames>()
  })

  test('works as input to InferStrictComponents and PortableText', () => {
    type PortableTextValue = InferValue<AllSanitySchemaTypes>
    type PortableTextItem = PortableTextValue[number]
    type CustomTypes = Exclude<PortableTextItem, {_type: 'block'}>
    type BlockType = Extract<PortableTextItem, {_type: 'block'}>
    type MarkDefs = NonNullable<BlockType['markDefs']>
    type MarkType = MarkDefs[number]

    const components = {
      types: {
        image: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'image'}>>['value']
          >()
          return null
        },
        quote: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'quote'}>>['value']
          >()
          return null
        },
        code: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'code'}>>['value']
          >()
          return null
        },
        featuredPost: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<Extract<CustomTypes, {_type: 'featuredPost'}>>['value']
          >()
          return null
        },
      },
      marks: {
        glossaryTerm: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextMarkComponentProps<Extract<MarkType, {_type: 'glossaryTerm'}>>['value']
          >()
          return null
        },
        link: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextMarkComponentProps<Extract<MarkType, {_type: 'link'}>>['value']
          >()
          return null
        },
      },
      block: {
        lead: ({value}) => {
          expectTypeOf(value.style).toEqualTypeOf<'lead' | undefined>()
          expectTypeOf(value).toExtend<PortableTextComponentProps<BlockType>['value']>()
          return null
        },
      },
      list: {
        checklist: ({value}) => {
          expectTypeOf(value.listItem).toEqualTypeOf<'checklist'>()
          return null
        },
        steps: ({value}) => {
          expectTypeOf(value.listItem).toEqualTypeOf<'steps'>()
          return null
        },
      },
    } satisfies InferStrictComponents<PortableTextValue>

    const value = [] as PortableTextValue
    ;<PortableText components={components} value={value} />
  })

  test('works as input to InferComponents for hoisted partial components', () => {
    type PortableTextValue = InferValue<AllSanitySchemaTypes>
    type PortableTextItem = PortableTextValue[number]

    const components = {
      types: {
        featuredPost: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<
            PortableTextTypeComponentProps<
              Extract<PortableTextItem, {_type: 'featuredPost'}>
            >['value']
          >()
          return null
        },
        legacyEmbed: ({value}) => {
          expectTypeOf(value).toBeAny()
          return null
        },
      },
    } satisfies InferComponents<PortableTextValue>

    const value = [] as PortableTextValue
    ;<PortableText components={components} value={value} />
  })

  test('can handle SanityQueries', async () => {
    const author = await fetchAuthor('123')
    const category = await fetchCategory('456')
    type PortableTextValue = InferValue<typeof author | typeof category>

    const components = {
      block: {},
      marks: {},
      types: {
        featuredPost: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<{
            _key: string
            _type: 'featuredPost'
            post: {
              title: string | null
              author: {name: string | null; avatar: string | null} | null
              slug: string | null
            } | null
          }>()
          return null
        },
      },
    } satisfies InferStrictComponents<PortableTextValue>

    const value = [] as PortableTextValue
    ;<PortableText components={components} value={value} />
  })

  test('can require handlers for all Portable Text returned by SanityQueries', () => {
    type PortableTextValue = InferValue<SanityQueries[keyof SanityQueries]>

    const components = {
      types: {
        image: () => null,
        quote: () => null,
        code: () => null,
        featuredPost: ({value}) => {
          expectTypeOf(value).toEqualTypeOf<{
            _key: string
            _type: 'featuredPost'
            post: {
              title: string | null
              author: {name: string | null; avatar: string | null} | null
              slug: string | null
            } | null
          }>()
          return null
        },
      },
      marks: {
        glossaryTerm: () => null,
      },
      block: {
        lead: () => null,
      },
      list: {
        checklist: () => null,
        steps: () => null,
      },
    } satisfies InferStrictComponents<PortableTextValue>

    const value = [] as PortableTextValue
    ;<PortableText components={components} value={value} />
  })

  test('can use a mock query technique to type props.value for a re-usable component', async () => {
    // The point of this technique is an escape hatch that is faster than having to iterate over the entirety of `SanityQueries`
    // as it can be a massive union of types, and only some of them are relevant to portable text

    const mockQuery = defineQuery(`*[_type in ["author", "category", "post"]]{
      _type == "author" => {bio},
      _type == "category" => {
        description[]{
          ...,
          _type == "featuredPost" => {
            ...,
            post->{title,author->{name,"avatar":avatar.asset->url},"slug":slug.current}
          }
        }
      },
      _type == "post" => {content},
    }`)
    function CustomPortableText({
      value,
    }: {
      value: InferValue<SanityQueries[typeof mockQuery]> | null | undefined
    }) {
      const components = {
        types: {
          code: () => null,
          featuredPost: () => null,
          image: () => null,
          quote: () => null,
        },
        marks: {
          glossaryTerm: () => null,
        },
        block: {
          lead: () => null,
        },
        list: {
          checklist: () => null,
          steps: () => null,
        },
      } satisfies InferStrictComponents<typeof value>
      return <PortableText components={components} value={value} />
    }
    // The mock query technique should be compatible with the existing typegen queries
    const author = await fetchAuthor('123')
    ;<CustomPortableText value={author?.bio} />
    const category = await fetchCategory('456')
    ;<CustomPortableText value={category?.description} />
    const post = await fetchPost('789')
    ;<CustomPortableText value={post?.content} />
  })
})
