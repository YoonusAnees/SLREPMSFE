import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Vite/React issue)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MiniMap({ lat, lng, zoom = 14 }) {
  const _lat = Number(lat);
  const _lng = Number(lng);

  if (!Number.isFinite(_lat) || !Number.isFinite(_lng)) {
    return <div className="text-xs text-gray-400">No Map</div>;
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[_lat, _lng]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[_lat, _lng]} />
      </MapContainer>
    </div>
  );
}
