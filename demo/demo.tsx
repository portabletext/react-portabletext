import React from 'react'
import {render} from 'react-dom'
import {PortableText} from '../src/react-portable-text'
import {PortableTextBlock} from '../src/types'

const blocks: PortableTextBlock[] = [
  {
    _type: 'block',
    _key: 'head',
    style: 'h1',
    markDefs: [],
    children: [{_type: 'span', text: 'Portable Text demo!'}],
  },
  {
    _type: 'block',
    _key: 'a',
    markDefs: [{_type: 'link', _key: 'd4tl1nk', href: 'https://espen.codes/'}],
    children: [
      {_type: 'span', _key: 'a', text: 'Plain '},
      {_type: 'span', _key: 'b', text: 'emphasized, ', marks: ['em']},
      {_type: 'span', _key: 'c', text: 'linked', marks: ['d4tl1nk']},
      {_type: 'span', _key: 'd', text: ' and ', marks: ['em']},
      {_type: 'span', _key: 'e', text: 'strong', marks: ['em', 'strong']},
      {_type: 'span', _key: 'f', text: ' text', marks: []},
    ],
  },
  {
    _type: 'block',
    _key: 'quotyquote',
    style: 'blockquote',
    markDefs: [],
    children: [
      {_type: 'span', _key: 'a', text: '<div />', marks: ['code']},
      {_type: 'span', _key: 'b', text: ' ', marks: []},
      {_type: 'span', _key: 'c', text: 'is', marks: ['underline']},
      {_type: 'span', _key: 'd', text: ' usable for a ', marks: []},
      {_type: 'span', _key: 'e', text: 'variety', marks: ['strike-through']},
      {_type: 'span', _key: 'e', text: 'bunch of different things', marks: []},
    ],
  },
  {
    _type: 'block',
    _key: 'moop',
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', text: '(Some) reasons you should be using Portable Text:'}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    children: [{_type: 'span', text: "It's what the cool kids use"}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    children: [
      {_type: 'span', text: 'It lets you embed (really) rich embeds, with structured JSON'},
    ],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    children: [{_type: 'span', text: 'It takes minimal parsing'}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    level: 2,
    children: [{_type: 'span', text: '(its already json)'}],
  },
  {
    _type: 'block',
    listItem: 'bullet',
    level: 1,
    children: [{_type: 'span', text: 'It works well in a collaborative setting'}],
  },
]

render(<PortableText blocks={blocks} />, document.getElementById('root'))
