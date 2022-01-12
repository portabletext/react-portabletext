import 'leaflet/dist/leaflet.css'
import React from 'react'
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'

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

export const AnnotatedMap: PortableTextTypeComponent<AnnotatedMapBlock> = ({value}) => {
  return (
    <MapContainer
      center={value.center || [51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
      className="annotated-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value.markers?.map((marker) => (
        <Marker key={marker._key} position={marker.position}>
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
