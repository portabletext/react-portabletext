/**
 * Type-level tests for @portabletext/react with Sanity TypeGen generated types.
 *
 * These tests document the desired behavior for TypeGen integration.
 * Currently, all tests pass because they are structured to verify both:
 * - What already works (e.g., non-null TypeGen arrays are assignable to `value`)
 * - What we want to support (documented via placeholder tests and comments)
 *
 * The actual type improvements (making `value` accept `null`, exposing
 * `InferPortableTextComponents` and `InferStrictPortableTextComponents`) will
 * be implemented in a follow-up PR, at which point these tests will be extended
 * with assertions that currently would fail.
 *
 * The goal is:
 * 1. `value` prop should accept TypeGen query results directly (including `null` and optional values)
 * 2. `components` should infer allowed custom types, marks, and styles from the `value` type
 * 3. Expose `InferPortableTextComponents<T>` - requires all custom types but allows extras
 * 4. Expose `InferStrictPortableTextComponents<T>` - strict mode, no extras allowed
 */
import {createClient} from '@sanity/client'
import {defineQuery} from 'groq'
import {assertType, describe, expectTypeOf, test} from 'vitest'

import type {PortableTextComponents, PortableTextProps} from '../../src/types'

const client = createClient({
  projectId: 'test',
  dataset: 'test',
  useCdn: true,
  apiVersion: '2024-01-01',
})

// do not explicitly type the return of `fetchPost` or `fetchAuthor` as we rely on inference and client overloading
async function fetchPost(slug: string) {
  const postQuery = defineQuery(
    `*[_type == "post" && slug.current == $slug][0]{title,author->{name},content}`,
  )
  return await client.fetch(postQuery, {slug})
}

async function fetchAuthor(id: string) {
  const authorQuery = defineQuery(`*[_type == "author" && _id == $id][0]{name,bio}`)
  return await client.fetch(authorQuery, {id})
}

describe('TypeGen value prop compatibility', () => {
  test('PostQueryResult.content should be assignable to PortableTextProps value (currently fails)', async () => {
    const post = await fetchPost('foo')
    type PostData = NonNullable<typeof post>

    // The `content` field from TypeGen is `Array<...> | null`
    // PortableText's `value` prop currently requires `TypedObject | TypedObject[]`
    // We want it to accept `null` (render nothing) or the TypeGen array directly
    type PostContentType = PostData['content']

    // This is the key test: can we pass TypeGen output directly?
    // @ts-expect-error - Currently fails because `value` doesn't accept `null`
    // In the future, this should work without the ts-expect-error
    expectTypeOf<PostContentType>().toMatchTypeOf<PortableTextProps['value']>()
  })

  test('Non-null PostQueryResult.content is assignable to value prop', async () => {
    const post = await fetchPost('foo')
    type PostData = NonNullable<typeof post>

    // After removing null, the TypeGen array type IS compatible with value prop
    // because each member has a required `_type` literal which satisfies TypedObject
    type NonNullContent = NonNullable<PostData['content']>

    expectTypeOf<NonNullContent>().toMatchTypeOf<PortableTextProps['value']>()
  })

  test('AuthorQueryResult.bio should be assignable to value prop (currently fails)', async () => {
    const author = await fetchAuthor('123')
    type AuthorData = NonNullable<typeof author>
    type AuthorBioType = AuthorData['bio']

    // @ts-expect-error - Same issue as above with null and optional fields
    expectTypeOf<AuthorBioType>().toMatchTypeOf<PortableTextProps['value']>()
  })

  test('Individual block types have _type and _key as required by TypedObject', async () => {
    const post = await fetchPost('foo')
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]

    // TypeGen generates `_type: "block"` which is a literal string - good!
    // But `_key` is required in TypeGen output, which should satisfy TypedObject
    expectTypeOf<PostContentBlock>().toHaveProperty('_type')
    expectTypeOf<PostContentBlock>().toHaveProperty('_key')
  })
})

describe('TypeGen components inference for post content', () => {
  test('should be able to extract custom block types from content union', async () => {
    const post = await fetchPost('foo')
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]

    // From the TypeGen output, the custom types in post content are: image, quote, code
    type CustomTypes = Exclude<PostContentBlock, {_type: 'block'}>
    type CustomTypeNames = CustomTypes['_type']

    // Verify the union contains the expected types
    expectTypeOf<'image'>().toMatchTypeOf<CustomTypeNames>()
    expectTypeOf<'quote'>().toMatchTypeOf<CustomTypeNames>()
    expectTypeOf<'code'>().toMatchTypeOf<CustomTypeNames>()
  })

  test('should be able to extract mark types from block markDefs', async () => {
    const post = await fetchPost('foo')
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]

    type BlockType = Extract<PostContentBlock, {_type: 'block'}>
    type MarkDefs = NonNullable<BlockType['markDefs']>
    type MarkType = MarkDefs[number]

    // The only annotation mark in post content is 'link'
    expectTypeOf<MarkType>().toHaveProperty('_type')
    type MarkTypeNames = MarkType['_type']
    expectTypeOf<'link'>().toMatchTypeOf<MarkTypeNames>()
  })

  test('should be able to extract block styles', async () => {
    const post = await fetchPost('foo')
    type PostData = NonNullable<typeof post>
    type PostContent = NonNullable<PostData['content']>
    type PostContentBlock = PostContent[number]

    type BlockType = Extract<PostContentBlock, {_type: 'block'}>
    type StyleType = NonNullable<BlockType['style']>

    // Post content supports: normal, h2, h3, blockquote
    expectTypeOf<'normal'>().toMatchTypeOf<StyleType>()
    expectTypeOf<'h2'>().toMatchTypeOf<StyleType>()
    expectTypeOf<'h3'>().toMatchTypeOf<StyleType>()
    expectTypeOf<'blockquote'>().toMatchTypeOf<StyleType>()
  })
})

describe('TypeGen components inference for author bio', () => {
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
})

describe('Desired: PortableText component with TypeGen types', () => {
  test('should accept components.types matching custom types in content (currently fails)', () => {
    // This test documents the desired behavior where defining components
    // for custom types that exist in the content should be type-safe

    // Ideally, when passing TypeGen content to PortableText, the `components.types`
    // should autocomplete with 'image', 'quote', 'code'
    const _components: Partial<PortableTextComponents> = {
      types: {
        image: ({value}) => {
          // value should ideally be typed as the image block type from TypeGen
          // Currently it's typed as `any` from PortableTextTypeComponent
          assertType<{_type: string}>(value)
          return null
        },
        quote: ({value}) => {
          assertType<{_type: string}>(value)
          return null
        },
        code: ({value}) => {
          assertType<{_type: string}>(value)
          return null
        },
      },
    }

    // Verify the components object is valid
    expectTypeOf(_components).toMatchTypeOf<Partial<PortableTextComponents>>()
  })

  test('defining a type handler for a type NOT in content should be allowed by default', () => {
    // For the "forgiving" default behavior:
    // If I define a handler for a type that doesn't exist in the content,
    // TypeScript should NOT error. This supports the case where:
    // - Old content might still have that type
    // - The handler is shared across multiple content types
    const _components: Partial<PortableTextComponents> = {
      types: {
        image: ({value}) => {
          assertType<{_type: string}>(value)
          return null
        },
        // This type doesn't exist in our schema but should be allowed
        legacyEmbed: ({value}) => {
          assertType<{_type: string}>(value)
          return null
        },
      },
    }

    expectTypeOf(_components).toMatchTypeOf<Partial<PortableTextComponents>>()
  })
})

describe('Desired: InferPortableTextComponents utility type', () => {
  // This utility type should:
  // - Require handlers for all custom types in the content
  // - Allow extra handlers (forgiving for types not in the current schema)

  test.skip('documents the desired InferPortableTextComponents behavior', () => {
    // In the future, we want to expose:
    // type InferPortableTextComponents<T> = ...
    //
    // Usage:
    // const components = {
    //   types: {
    //     image: ({value}) => <Image {...value} />,
    //     quote: ({value}) => <blockquote>{value.text}</blockquote>,
    //     code: ({value}) => <pre>{value.code}</pre>,
    //     // missing one? TypeScript should error because 'code' etc might be needed
    //   }
    // } satisfies InferPortableTextComponents<typeof data.content>
    //
    // Extra types (like `legacyEmbed`) should be allowed
    // Missing required types (like omitting `image`) should error
  })
})

describe('Desired: InferStrictPortableTextComponents utility type', () => {
  // This utility type should:
  // - Require handlers for all custom types in the content
  // - Disallow extra handlers (strict mode)

  test.skip('documents the desired InferStrictPortableTextComponents behavior', () => {
    // In the future, we want to expose:
    // type InferStrictPortableTextComponents<T> = ...
    //
    // Usage:
    // const components = {
    //   types: {
    //     image: ({value}) => <Image {...value} />,
    //     foo: () => <div/>, // ERROR: 'foo' is not in the content types
    //   }
    // } satisfies InferStrictPortableTextComponents<typeof data.content>
    //
    // Both missing AND extra types should cause TypeScript errors
  })
})

describe('Desired: value prop typed component inference', () => {
  test.skip('image handler value should be typed from TypeGen when passing content directly', () => {
    // When we pass TypeGen content to PortableText, the image handler's `value`
    // should be automatically typed as the image type from the content union:
    //
    // type ImageBlock = {
    //   asset?: SanityImageAssetReference;
    //   media?: unknown;
    //   hotspot?: SanityImageHotspot;
    //   crop?: SanityImageCrop;
    //   alt?: string;
    //   caption?: string;
    //   _type: "image";
    //   _key: string;
    // }
    //
    // Currently, the value is typed as `any` regardless of what's passed to `value`
  })
})
