export default function MiniMap({ lat, lng }) {
  const _lat = Number(lat);
  const _lng = Number(lng);

  if (!Number.isFinite(_lat) || !Number.isFinite(_lng)) {
    return <div className="text-xs text-gray-400">No Map</div>;
  }

  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${_lat},${_lng}&zoom=14&size=220x140&markers=${_lat},${_lng},red-pushpin`;

  return (
    <img src={url} alt="map" className="w-full h-full object-cover rounded" />
  );
}
