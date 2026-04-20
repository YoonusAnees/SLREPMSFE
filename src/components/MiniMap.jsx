import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths (important for Vite / modern bundlers)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MiniMap({
  lat,
  lng,
  zoom = 15,
  height = "140px",
  className = "",
  markerColor = "#ef4444", // red default (emergency/attention)
}) {
  const _lat = Number(lat);
  const _lng = Number(lng);

  if (!Number.isFinite(_lat) || !Number.isFinite(_lng)) {
    return (
      <div
        className={`
          w-full h-full min-h-[120px] flex items-center justify-center
          bg-slate-900/70 backdrop-blur-sm border border-slate-700/60
          rounded-lg text-slate-500 text-sm
          ${className}
        `}
      >
        No location data
      </div>
    );
  }

  return (
    <div
      className={`
        relative w-full rounded-xl overflow-hidden
        border-2 border-slate-700/70 shadow-lg shadow-black/40
        bg-slate-950/60 backdrop-blur-sm
        ${className}
      `}
      style={{ height }}
    >
      <MapContainer
        center={[_lat, _lng]}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        className="z-0"
      >
        {/* Dark-themed OpenStreetMap tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Custom colored marker */}
        <Marker
          position={[_lat, _lng]}
          icon={L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: ${markerColor};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 0 4px rgba(239,68,68,0.4);
              transform: translate(-50%, -50%);
            "></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        />
      </MapContainer>

      {/* Subtle overlay gradient for depth */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 to-transparent z-10" />

      {/* Optional tiny label / coordinates hint */}
      <div className="absolute bottom-2 left-2 z-20 text-xs text-slate-300/80 bg-slate-950/60 px-2 py-1 rounded-md backdrop-blur-sm">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </div>
    </div>
  );
}
