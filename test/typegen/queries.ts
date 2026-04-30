import {defineQuery} from 'groq'

export const postQuery = defineQuery(
  `*[_type == "post" && slug.current == $slug][0]{title,author->,content}`,
)

export const authorQuery = defineQuery(
  `*[_type == "author" && slug.current == $slug][0]{name,bio}`,
)
