import type {ArbitraryTypedObject} from '@portabletext/types'

const input: ArbitraryTypedObject[] = [
  {
    _type: 'image',
    _key: 'd234a4fa317a',
    asset: {
      _type: 'reference',
      _ref: 'image-YiOKD0O6AdjKPaK24WtbOEv0-3456x2304-jpg',
    },
  },
]

export default {
  input,
  output: [
    '<img alt="Such image" src="',
    'https://cdn.sanity.io/images/3do82whm/production/YiOKD0O6AdjKPaK24WtbOEv0-3456x2304.jpg',
    '"/>',
  ].join(''),
}
