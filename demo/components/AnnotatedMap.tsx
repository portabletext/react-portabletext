import 'leaflet/dist/leaflet.css'

import {Suspense, use} from 'react'

import {PortableTextTypeComponent} from '../../src'

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

const promise = import('./Leaflet').then((leafletApi) => leafletApi.default)

const AnnotatedMapComponent: PortableTextTypeComponent<AnnotatedMapBlock> = ({value}) => {
  const Leaflet = use(promise)

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

export const AnnotatedMap: PortableTextTypeComponent<AnnotatedMapBlock> = (props) => {
  return (
    <Suspense
      fallback={
        <div className="annotated-map loading">
          <div>Loading map…</div>
        </div>
      }
    >
      <AnnotatedMapComponent {...props} />
    </Suspense>
  )
}
