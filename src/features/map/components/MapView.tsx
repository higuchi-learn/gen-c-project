import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useSpots } from '../../../hooks/useSpots';
import { useGeolocation } from '../../../hooks/useGeolocation';

// 初期の地図の拡大度
const DEFAULT_ZOOM = 13;

export function MapView() {
  const { spots } = useSpots();
  const { position, loading } = useGeolocation();

  if (loading) return null;

  return (
    <MapContainer center={position} zoom={DEFAULT_ZOOM} style={{ height: '100svh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      // 存在するスポットの数だけMarkerコンポーネントを表示する
      {spots.map((spot) => (
        // 指定した位置にマーカーを表示するコンポーネント
        <Marker key={spot.id} position={[spot.lat, spot.lng]} />
      ))}
    </MapContainer>
  );
}
