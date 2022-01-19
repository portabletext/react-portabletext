import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'

export interface ReducedLeafletApi {
  MapContainer: typeof MapContainer
  TileLayer: typeof TileLayer
  Marker: typeof Marker
  Popup: typeof Popup
}

const LeafletApi: ReducedLeafletApi = {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
}

export default LeafletApi
