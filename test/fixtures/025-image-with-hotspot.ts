import type {ArbitraryTypedObject, PortableTextBlock} from '@portabletext/types'

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
    _type: 'image',
    _key: '53811e851487',
    asset: {
      _type: 'reference',
      _ref: 'image-c2f0fc30003e6d7c79dcb5338a9b3d297cab4a8a-2000x1333-jpg',
    },
    crop: {
      top: 0.0960960960960961,
      bottom: 0.09609609609609615,
      left: 0.2340000000000001,
      right: 0.2240000000000001,
    },
    hotspot: {
      /* eslint-disable id-length */
      x: 0.505,
      y: 0.49999999999999994,
      /* eslint-enable id-length */
      height: 0.8078078078078077,
      width: 0.5419999999999998,
    },
  },
]

export default {
  input,
  output: [
    '<div>',
    '<p>Also, images are pretty common.</p>',
    '<figure><img src="https://cdn.sanity.io/images/3do82whm/production/c2f0fc30003e6d7c79dcb5338a9b3d297cab4a8a-2000x1333.jpg?rect=468,128,1084,1077&amp;w=320&amp;h=240"/></figure>',
    '</div>',
  ].join(''),
}
