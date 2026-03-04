import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

function ClickToPick({ value, onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapPicker({
  value,
  onChange,
  center,
  zoom = 11,
  height = 360,
}) {
  const pos = useMemo(
    () => ({
      lat: Number(value?.lat ?? center?.lat),
      lng: Number(value?.lng ?? center?.lng),
    }),
    [value, center],
  );

  // force re-center when city changes
  const [mapKey, setMapKey] = useState(0);
  useEffect(() => {
    setMapKey((k) => k + 1);
  }, [center?.lat, center?.lng]);

  return (
    <div className="w-full overflow-hidden rounded-xl border">
      <MapContainer
        key={mapKey}
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height }}
        scrollWheelZoom
      >
        {/* Satellite (Esri) */}
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {/* Click to set marker */}
        <ClickToPick value={pos} onChange={onChange} />

        {/* Draggable marker */}
        <Marker
          position={[pos.lat, pos.lng]}
          draggable
          eventHandlers={{
            dragend(e) {
              const m = e.target;
              const p = m.getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
