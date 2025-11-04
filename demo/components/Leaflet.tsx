import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'

// Yes, this is unfortunately required, and an intentional side-effect :/
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

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
