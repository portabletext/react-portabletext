// oxlint-disable-next-line no-unassigned-import
import 'leaflet/dist/leaflet.css'

import {useEffect, useState} from 'react'

import {PortableTextTypeComponent} from '../../src'
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

export const AnnotatedMap: PortableTextTypeComponent<AnnotatedMapBlock> = ({value}) => {
  const [Leaflet, setLeaflet] = useState<ReducedLeafletApi | undefined>(undefined)

  useEffect(() => {
    import('./Leaflet').then((leafletApi) => setLeaflet(leafletApi.default))
  }, [Leaflet, setLeaflet])

  if (!Leaflet) {
    return (
      <div className="annotated-map loading">
        <div>Loading map…</div>
      </div>
    )
  }

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
