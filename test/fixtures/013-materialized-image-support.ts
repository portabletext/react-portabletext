import type {PortableTextBlock, ArbitraryTypedObject} from '@portabletext/types'

const input: (PortableTextBlock | ArbitraryTypedObject)[] = [
  {
    style: 'normal',
    _type: 'block',
    _key: 'bd73ec5f61a1',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: 'Also, images are pretty common.',
        marks: [],
      },
    ],
  },
  {
    _key: 'bd45080bf448',
    _type: 'image',
    asset: {
      _createdAt: '2017-08-02T23:04:57Z',
      _id: 'image-caC3MscJLd3mNAbMdQ6-5748x3832-jpg',
      _rev: 'ch7HXy1Ux9jmVKZ6TKPoZ8',
      _type: 'sanity.imageAsset',
      _updatedAt: '2017-09-19T18:05:06Z',
      assetId: 'caC3MscJLd3mNAbMdQ6',
      extension: 'jpg',
      metadata: {
        dimensions: {
          aspectRatio: 1.5,
          height: 3832,
          width: 5748,
        },
      },
      mimeType: 'image/jpeg',
      path: 'images/3do82whm/production/caC3MscJLd3mNAbMdQ6-5748x3832.jpg',
      url: 'https://cdn.sanity.io/images/3do82whm/production/caC3MscJLd3mNAbMdQ6-5748x3832.jpg',
    },
  },
]

export default {
  input,
  output: [
    '<div>',
    '<p>Also, images are pretty common.</p>',
    '<figure><img src="https://cdn.sanity.io/images/3do82whm/production/caC3MscJLd3mNAbMdQ6-5748x3832.jpg"/></figure>',
    '</div>',
  ].join(''),
}
