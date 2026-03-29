import { useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, useMapEvents } from 'react-leaflet';
import { useSpots } from '../../../hooks/useSpots';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { LocationPickerPopup } from './LocationPickerPopup';

// 初期の地図の拡大度
const DEFAULT_ZOOM = 18;

// マップクリックで座標を取得するコンポーネント
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface SpotLocationPickerProps {
  // 場所が確定されたときに親へ座標を渡すコールバック
  onConfirm: (lat: number, lng: number) => void;
}

export function SpotLocationPicker({ onConfirm }: SpotLocationPickerProps) {
  const { spots } = useSpots();
  const { position, loading, isCurrentLocation } = useGeolocation();

  // タップした座標を管理する状態（nullのときはポップアップ非表示）
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 位置情報取得中はローディング表示
  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>現在地を取得中...</span>
      </div>
    );
  }

  return (
    <>
      <MapContainer center={position} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* マップクリックで仮マーカーを設置 */}
        <MapClickHandler onMapClick={(lat, lng) => setPickedLocation({ lat, lng })} />

        {/* 現在地マーカー（実際の現在地が取得できた場合のみ表示） */}
        {isCurrentLocation && (
          <CircleMarker
            center={position}
            radius={8}
            pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 1 }}
          />
        )}

        {/* 既存スポットのマーカー（参考表示） */}
        {spots.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]} />
        ))}

        {/* タップした仮マーカー */}
        {pickedLocation && (
          <CircleMarker
            center={[pickedLocation.lat, pickedLocation.lng]}
            radius={10}
            pathOptions={{ color: '#16a34a', fillColor: '#4ade80', fillOpacity: 0.9 }}
          />
        )}
      </MapContainer>

      {/* タップ前のガイドテキスト */}
      {!pickedLocation && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            zIndex: 1000,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          追加したい場所をタップしてください
        </div>
      )}

      {/* 位置確認ポップアップ */}
      {pickedLocation && (
        <LocationPickerPopup
          lat={pickedLocation.lat}
          lng={pickedLocation.lng}
          onCancel={() => setPickedLocation(null)}
          onConfirm={() => onConfirm(pickedLocation.lat, pickedLocation.lng)}
        />
      )}
    </>
  );
}
