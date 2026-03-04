import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ClickToPick({ onChange }) {
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

  const [mapKey, setMapKey] = useState(0);
  useEffect(() => setMapKey((k) => k + 1), [center?.lat, center?.lng]);

  const [layer, setLayer] = useState("OSM"); // "OSM" | "SAT"

  const tile =
    layer === "SAT"
      ? {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attr: "Tiles © Esri",
        }
      : {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        };

  return (
    <div className="w-full overflow-hidden rounded-xl border">
      {/* small toggle */}
      <div className="flex gap-2 p-2 border-b bg-white">
        <button
          type="button"
          className={`px-3 py-1 rounded-lg text-sm border ${
            layer === "OSM" ? "bg-black text-white" : "bg-white"
          }`}
          onClick={() => setLayer("OSM")}
        >
          OSM
        </button>
        <button
          type="button"
          className={`px-3 py-1 rounded-lg text-sm border ${
            layer === "SAT" ? "bg-black text-white" : "bg-white"
          }`}
          onClick={() => setLayer("SAT")}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        key={mapKey}
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height }}
        scrollWheelZoom
      >
        <TileLayer attribution={tile.attr} url={tile.url} />
        <ClickToPick onChange={onChange} />
        <Marker
          position={[pos.lat, pos.lng]}
          draggable
          eventHandlers={{
            dragend(e) {
              const p = e.target.getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
