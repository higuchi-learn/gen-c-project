import { MapContainer, TileLayer } from 'react-leaflet';

// 初期表示の中心座標（東京）
const DEFAULT_CENTER: [number, number] = [35.6812, 139.7671];
const DEFAULT_ZOOM = 13;

export function MapView() {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100svh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}
