import { useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker } from 'react-leaflet';
import { useSpots } from '../../../hooks/useSpots';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { SpotDetail } from '../../spots/components/SpotDetail';
import type { DiscoveryPopupType } from '../../spots/components/SpotDetail';
import { LoginRequiredPopup } from '../../../components/ui/LoginRequiredPopup';
import styles from './MapView.module.css';

// 初期の地図の拡大度
const DEFAULT_ZOOM = 18;

// 発見関連のポップアップの状態を管理する型定義
type DiscoveryPopupState = {
  type: DiscoveryPopupType;
  discover?: () => Promise<void>;
} | null;

export function MapView() {
  const { spots } = useSpots();
  const { position, loading, isCurrentLocation } = useGeolocation();
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [discoveryPopup, setDiscoveryPopup] = useState<DiscoveryPopupState>(null);
  const [discovering, setDiscovering] = useState(false);

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
      {selectedSpotId && (
        <SpotDetail
          spotId={selectedSpotId}
          onClose={() => setSelectedSpotId(null)}
          onShowDiscoveryPopup={(type, discover) => setDiscoveryPopup({ type, discover })}
          isPopupOpen={discoveryPopup !== null}
        />
      )}
      {/* 発見関連ポップアップ（Drawerの外で描画） */}
      {discoveryPopup?.type === 'login' && (
        <LoginRequiredPopup featureName="発見登録" onBack={() => setDiscoveryPopup(null)} />
      )}
      // 発見確認ポップアップ
      {discoveryPopup?.type === 'confirm' && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p className={styles.popupMessage}>このスポットを発見できましたか？</p>
            <div className={styles.popupActions}>
              <button className={styles.popupBtnSecondary} onClick={() => setDiscoveryPopup(null)}>
                探索中
              </button>
              <button
                className={styles.popupBtnPrimary}
                disabled={discovering}
                onClick={() => {
                  // 発見処理がない場合は何もしない
                  if (!discoveryPopup.discover) return;
                  setDiscovering(true);
                  // 発見処理を実行し、完了後にポップアップを閉じる
                  void discoveryPopup.discover().then(() => {
                    setDiscoveryPopup(null);
                    setDiscovering(false);
                  });
                }}
              >
                発見した！
              </button>
            </div>
          </div>
        </div>
      )}
      // すでに発見済みのポップアップ
      {discoveryPopup?.type === 'alreadyDiscovered' && (
        <div className={styles.popupOverlay} onClick={() => setDiscoveryPopup(null)}>
          <div className={styles.popup}>
            <p className={styles.popupMessage}>発見済みです</p>
            <button className={styles.popupBtnSecondary} onClick={() => setDiscoveryPopup(null)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
