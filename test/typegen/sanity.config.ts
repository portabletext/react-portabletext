import {defineConfig, defineType, defineField, defineArrayMember} from 'sanity'

const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          name: 'image',
          type: 'image',
          title: 'Image',
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'quote',
          title: 'Quote',
          fields: [
            defineField({
              name: 'text',
              type: 'text',
              title: 'Quote Text',
            }),
            defineField({
              name: 'attribution',
              type: 'string',
              title: 'Attribution',
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'code',
          title: 'Code Block',
          fields: [
            defineField({
              name: 'language',
              type: 'string',
              title: 'Language',
            }),
            defineField({
              name: 'code',
              type: 'text',
              title: 'Code',
            }),
            defineField({
              name: 'filename',
              type: 'string',
              title: 'Filename',
            }),
          ],
        }),
      ],
    }),
  ],
})

const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  }),
                ],
              },
            ],
          },
          lists: [],
        }),
      ],
    }),
  ],
})

export default defineConfig({
  name: 'default',
  title: 'Typegen Test',
  projectId: 'test-project',
  dataset: 'production',
  schema: {
    types: [post, author],
  },
})
