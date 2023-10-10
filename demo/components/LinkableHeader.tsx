import {PortableTextBlockComponent, toPlainText} from '../../src'

/**
 * This is obviously extremely simplistic, you'd want to use something "proper"
 */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export const LinkableHeader: PortableTextBlockComponent = ({value, children}) => {
  const slug = slugify(toPlainText(value))
  return (
    <h2 id={slug}>
      {children}{' '}
      <a className="slug-anchor" href={`#${slug}`}>
        #
      </a>
    </h2>
  )
}
