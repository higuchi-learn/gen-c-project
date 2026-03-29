import { useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker } from 'react-leaflet';
import { useSpots } from '../../../hooks/useSpots';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { SpotDetail } from '../../spots/components/SpotDetail';

// 初期の地図の拡大度
const DEFAULT_ZOOM = 18;

export function MapView() {
  const { spots } = useSpots();
  const { position, loading, isCurrentLocation } = useGeolocation();
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // 位置情報取得中はローディング表示
  if (loading) {
    return (
      <div style={{ height: 'calc(100svh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>現在地を取得中...</span>
      </div>
    );
  }

  return (
    <>
      <MapContainer center={position} zoom={DEFAULT_ZOOM} style={{ height: 'calc(100svh - 80px)', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* 現在地マーカー（実際の現在地が取得できた場合のみ表示） */}
        {isCurrentLocation && (
          <CircleMarker
            center={position}
            radius={8}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 1 }}
          />
        )}
        {/* スポットマーカー */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            eventHandlers={{ click: () => setSelectedSpotId(spot.id) }}
          />
        ))}
      </MapContainer>
      {/* スポット詳細（マーカークリック時にオーバーレイ表示） */}
      {selectedSpotId && <SpotDetail spotId={selectedSpotId} onClose={() => setSelectedSpotId(null)} />}
    </>
  );
}
