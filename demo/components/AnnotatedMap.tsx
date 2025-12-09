// oxlint-disable-next-line no-unassigned-import
import 'leaflet/dist/leaflet.css'
import {type PortableTextTypeComponent} from '@portabletext/react'
import {Suspense, use, useState} from 'react'

import type {ReducedLeafletApi} from './Leaflet'

export interface Geopoint {
  _type: 'geopoint'
  lat: number
  lng: number
}

export interface MapMarker {
  _type: 'mapMarker'
  _key: string
  position: Geopoint
  title: string
  description?: string
}

export interface AnnotatedMapBlock {
  _type: 'annotatedMap'
  center?: Geopoint
  markers?: MapMarker[]
}

function getLeaflet() {
  return import('./Leaflet').then((module) => module.default)
}

export const AnnotatedMap: PortableTextTypeComponent<AnnotatedMapBlock> = ({value}) => {
  const [leafletPromise] = useState(() => getLeaflet())

  return (
    <Suspense
      fallback={
        <div className="annotated-map loading">
          <div>Loading map…</div>
        </div>
      }
    >
      <AnnotatedMapContent leafletPromise={leafletPromise} value={value} />
    </Suspense>
  )
}

function AnnotatedMapContent({
  leafletPromise,
  value,
}: {
  leafletPromise: Promise<ReducedLeafletApi>
  value: AnnotatedMapBlock
}) {
  const Leaflet = use(leafletPromise)
  return (
    <Leaflet.MapContainer
      center={value.center || [51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
      className="annotated-map"
    >
      <Leaflet.TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value.markers?.map((marker) => (
        <Leaflet.Marker key={marker._key} position={marker.position}>
          <Leaflet.Popup>{marker.title}</Leaflet.Popup>
        </Leaflet.Marker>
      ))}
    </Leaflet.MapContainer>
  )
}
