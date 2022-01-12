import type {PortableTextBlock} from '../src'
import type {AnnotatedMapBlock} from './components/AnnotatedMap'
import type {CodeBlock} from './components/Code'

const exampleCode = `
import {PortableText, PortableTextTypeComponent} from '@portabletext/react'

interface CodeBlock {
  _type: 'code'
  code: string
  language?: string
}

const Code: PortableTextComponent<CodeBlock> = ({value}) => {
  return <Lowlight language={value.language || 'js'} value={value.code} />
}
`.trim()

export const blocks: (PortableTextBlock | CodeBlock | AnnotatedMapBlock)[] = [
  {
    _type: 'block',
    _key: 'head',
    style: 'h1',
    markDefs: [],
    children: [{_type: 'span', text: '@portabletext/react demo'}],
  },
  {
    _type: 'block',
    _key: 'text-format-header',
    style: 'h2',
    children: [{_type: 'span', _key: 'a', text: 'Basic text formatting'}],
  },
  {
    _type: 'block',
    _key: 'text-formatting',
    markDefs: [{_type: 'link', _key: 'd4tl1nk', href: 'https://portabletext.org/'}],
    children: [
      {_type: 'span', _key: 'a', text: 'Plain, '},
      {_type: 'span', _key: 'b', text: 'emphasized, ', marks: ['em']},
      {_type: 'span', _key: 'c', text: 'linked', marks: ['d4tl1nk']},
      {_type: 'span', _key: 'd', text: ' and ', marks: ['em']},
      {_type: 'span', _key: 'e', text: 'strong', marks: ['strong']},
      {_type: 'span', _key: 'f', text: ' text, that can also be ', marks: []},
      {_type: 'span', _key: 'g', text: 'combined', marks: ['em', 'strong', 'd4tl1nk']},
      {_type: 'span', _key: 'g', text: '. Obviously it also supports ', marks: []},
      {_type: 'span', _key: 'h', text: 'inline code', marks: ['code']},
      {_type: 'span', _key: 'i', text: ', '},
      {_type: 'span', _key: 'j', text: 'underlined text', marks: ['underline']},
      {_type: 'span', _key: 'k', text: ' and '},
      {_type: 'span', _key: 'l', text: 'strike-through', marks: ['strike-through']},
      {_type: 'span', _key: 'm', text: '.'},
    ],
  },
  {
    _type: 'block',
    _key: 'text-annotations',
    markDefs: [
      {
        _type: 'definition',
        _key: 'd3f',
        details: 'a statement of the exact meaning of a word, especially in a dictionary.',
      },
      {_type: 'characterReference', _key: 'b34n', characterId: 'nedStark'},
      {_type: 'speech', _key: 'sp33ch', pitch: 1},
      {_type: 'speech', _key: 'p17ch', pitch: 1.5},
    ],
    children: [
      {
        _type: 'span',
        _key: 'a',
        text: 'But aside from that, it also supports completely custom annotations - be it structured references to ',
      },
      {_type: 'span', _key: 'b', text: 'book/movie characters', marks: ['b34n']},
      {_type: 'span', _key: 'c', text: ', term '},
      {_type: 'span', _key: 'd', text: 'definitions', marks: ['d3f']},
      {_type: 'span', _key: 'e', text: ', '},
      {_type: 'span', _key: 'f', text: 'speech synthesis controls', marks: ['sp33ch']},
      {_type: 'span', _key: 'g', text: ' '},
      {_type: 'span', _key: 'h', text: '(configurable)', marks: ['p17ch']},
      {_type: 'span', _key: 'i', text: ' or some other fun and creative use.'},
    ],
  },
  {
    _type: 'block',
    _key: 'blocks-expl-header',
    style: 'h2',
    children: [{_type: 'span', _key: 'z', text: 'Blocks'}],
  },
  {
    _type: 'block',
    _key: 'block-intro',
    children: [
      {
        _type: 'span',
        _key: 'z',
        text: '"Blocks" in Portable Text are... well, block-level items.\nBy default, you will see things like blockquotes, headings and regular paragraphs.',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'cool-custom',
    style: 'normal',
    markDefs: [{_type: 'link', _key: 'lllink', href: 'https://github.com/rexxars/react-lowlight'}],
    children: [
      {
        _type: 'span',
        text: 'Aside from that, you can drop in pretty much any data you want, as long as you define a React component to render it. Here is a code block, highlighted by ',
      },
      {_type: 'span', text: 'react-lowlight', marks: ['lllink']},
      {_type: 'span', text: ', for instance:'},
    ],
  },
  {
    _type: 'code',
    code: exampleCode,
    language: 'typescript',
  },
  {
    _type: 'block',
    _key: 'cool-custom-map',
    style: 'normal',
    children: [
      {
        _type: 'span',
        text: 'But it can really be anything - like a map of annotated markers, for instance - all represented by structured JSON:',
      },
    ],
  },
  {
    _type: 'annotatedMap',
    _key: 'bar-map',
    center: {_type: 'geopoint', lat: 37.778225, lng: -122.427743},
    markers: [
      {
        _key: '8e63881c-50b3-41ae-afbe-5d546e961c45',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.77006534953728,
          lng: -122.47415458826903,
        },
        title: 'Golden Gate Park',
      },
      {
        _key: '48d621c4-ead9-4343-b1be-4cda4942e40c',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.8199286,
          lng: -122.4782551,
        },
        title: 'Golden Gate Bridge',
      },
      {
        _key: '4a07e89c-be09-43da-9541-ed37c74c65a3',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.8590937,
          lng: -122.4852507,
        },
        title: 'Sausalito',
      },
      {
        _key: '4908563a-89c8-4fc4-baf2-21fff1f83def',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7935724,
          lng: -122.483638,
        },
        title: 'Baker Beach',
      },
      {
        _key: 'bde29009-7f5f-4ff9-808d-a26e930e3952',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.78044439999999,
          lng: -122.51365,
        },
        title: 'Lands End / Sutro Baths',
      },
      {
        _key: '14e3a0e9-375c-4692-8757-b2e2576c73ec',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7925153,
          lng: -122.4382307,
        },
        title: 'Pacific Heights',
      },
      {
        _key: 'adb4463e-4934-45d9-bde0-bfd1108ffc89',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.8029308,
          lng: -122.4484231,
        },
        title: 'Palace of Fine Arts',
      },
      {
        _key: '2e7088ad-bb10-465a-a953-16b96f112379',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.8036667,
          lng: -122.4368151,
        },
        title: 'Marina',
      },
      {
        _key: '872c6817-0482-44a0-8be6-a56a8c4c9a06',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.80105959999999,
          lng: -122.4194486,
        },
        title: 'Russian Hill',
      },
      {
        _key: '1a583dac-80dc-44e8-99cc-c50f627bfd31',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.8013407,
          lng: -122.4056674,
        },
        title: 'Telegraph Hill',
      },
      {
        _key: '7a557e3c-8920-4d0f-99a5-161b041c593c',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7857182,
          lng: -122.4010508,
        },
        title: 'SF MoMA',
      },
      {
        _key: '4944a4a0-2404-41f3-8f0b-8139fd292486',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7692204,
          lng: -122.4481393,
        },
        title: 'Haight/Ashbury',
      },
      {
        _key: 'e2435821-ed8e-44f8-8420-9a77f4628b48',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.75939210000001,
          lng: -122.510734,
        },
        title: 'Ocean Beach',
      },
      {
        _key: 'f291d51f-6c0e-4966-85f1-30a24fc824fe',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7614531211161,
          lng: -122.42172718048096,
        },
        title: 'Mission/Dolores',
      },
      {
        _key: '6883eb7a-df7b-425d-baf9-857c527146f7',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7544066,
          lng: -122.4476845,
        },
        title: 'Twin Peaks',
      },
      {
        _key: '32d53c0e-308e-4f6f-a7fc-88d42ce5e8b0',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7552213,
          lng: -122.4527624,
        },
        title: 'Sutro Tower',
      },
      {
        _key: 'b4e8b5d5-65e7-4def-92a1-09928964acdb',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7906226,
          lng: -122.4172174,
        },
        title: 'Liquid Gold',
      },
      {
        _key: 'b6460976-3750-444d-b656-0d6cbc34fc00',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7998951,
          lng: -122.407345,
        },
        title: 'Church Key',
      },
      {
        _key: '0a72c257-6536-4172-bb05-24459a9b0538',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7589398,
          lng: -122.4122858,
        },
        title: 'Flour + Water',
      },
      {
        _key: 'cf824249-1842-4f14-9ae2-308df3755962',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7719042,
          lng: -122.4312295,
        },
        title: 'Toronado',
      },
      {
        _key: 'a5706d60-9d3b-4c77-ac1d-1c64958f196d',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7771765,
          lng: -122.4107242,
        },
        title: 'Cellarmaker',
      },
      {
        _key: '9d294f43-415c-4ed9-865f-17eb748f448b',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7785719,
          lng: -122.4122471,
        },
        title: 'City Beer Store',
      },
      {
        _key: '48a249f0-3df6-408f-9761-ef5dcc5e4816',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.76985570000001,
          lng: -122.420367,
        },
        title: 'The Crafty Fox',
      },
      {
        _key: '95f2d308-c87d-4edc-ab51-ddb081032378',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.77002299999999,
          lng: -122.4221172,
        },
        title: 'Zeitgeist',
      },
      {
        _key: '4a0b5ae8-9eca-45c4-b955-3c3e3296b6de',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7647206,
          lng: -122.422986,
        },
        title: "The Monk's Kettle",
      },
      {
        _key: 'ec2ea212-02d7-486f-a663-b797bbd630d1',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.739413,
          lng: -122.4182559,
        },
        title: 'Holy Water',
      },
      {
        _key: '552d23bd-8e1c-4139-8695-57758c9a7d6d',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.757149,
          lng: -122.4213259,
        },
        title: 'Senor Sisig',
      },
      {
        _key: '60edf5c3-9f4f-4229-ae16-f491be6c804f',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.76869349999999,
          lng: -122.4148318,
        },
        title: 'Pink Onion',
      },
      {
        _key: '0b02c5e8-e0b4-416a-9f8c-6d8d3a802a04',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.8266636,
          lng: -122.4230122,
        },
        title: 'Alcatraz Island',
      },
      {
        _key: '35d9f82e-3d5d-43d6-8fb9-121028d9ffa9',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7770619,
          lng: -122.4123798,
        },
        title: 'Sanity HQ',
      },
      {
        _key: '96afa0c1-a72a-427b-a9e5-db1ca70eb5e5',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7398597,
          lng: -122.4091179,
        },
        title: 'Barebottle Brewing Company',
      },
      {
        _key: '5416b5c1-20c3-410c-b95f-cd59831e3794',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7955917,
          lng: -122.3935498,
        },
        title: 'Ferry Building',
      },
      {
        _key: '37207e40-4f00-4aa6-b0c1-664549f3a30e',
        _type: 'mapMarker',
        position: {
          _type: 'geopoint',
          lat: 37.7988737,
          lng: -122.4661937,
        },
        title: 'Presidio',
      },
    ],
  },
  {
    _type: 'block',
    _key: 'list-head',
    style: 'h2',
    markDefs: [],
    children: [{_type: 'span', text: 'Lists'}],
  },
  {
    _type: 'block',
    _key: 'list-intrp',
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', text: 'Of course, you will want lists!'}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    children: [{_type: 'span', text: 'They are fully supported'}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    children: [{_type: 'span', text: 'They can be unordered or ordered'}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    children: [{_type: 'span', text: 'Reasons why ordered lists might be better:'}],
  },
  {
    _type: 'block',
    listItem: 'number',
    level: 2,
    children: [
      {_type: 'span', text: 'Most lists have '},
      {_type: 'span', text: 'some', marks: ['em']},
      {_type: 'span', text: ' priority'},
    ],
  },
  {
    _type: 'block',
    listItem: 'number',
    level: 2,
    children: [{_type: 'span', text: 'Not conveying importance/priority is lazy'}],
  },
  {
    _type: 'block',
    _key: 'bb',
    children: [
      {
        _type: 'span',
        text: 'You can also go beyond ordered/unordered...',
      },
    ],
  },
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        text: 'Here is a list of schnauzers, as indicated by the schnauzer list type and icon:',
      },
    ],
  },
  {
    _type: 'block',
    listItem: 'schnauzer',
    children: [{_type: 'span', text: 'Kokos'}],
  },
  {
    _type: 'block',
    listItem: 'schnauzer',
    children: [{_type: 'span', text: 'Pippi'}],
  },
]
