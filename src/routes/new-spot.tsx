import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../features/auth/AuthContext';
import { SpotLocationPicker } from '../features/spots/components/SpotLocationPicker';
import { SpotRegistrationForm } from '../features/spots/components/SpotRegistrationForm';
import { LoginRequiredPopup } from '../components/ui/LoginRequiredPopup';

export const Route = createFileRoute('/new-spot')({
  component: NewSpotPage,
});

function NewSpotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 確定した座標を管理する状態（nullのときはマップ選択ステップを表示）
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 未ログインの場合はログイン誘導ポップアップを表示
  if (!user) {
    return <LoginRequiredPopup featureName="スポット登録" onBack={() => void navigate({ to: '/' })} />;
  }

  return (
    <div style={{ minHeight: '100svh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => {
            // フォームステップの場合はマップ選択に戻る、マップステップの場合はトップへ戻る
            if (pickedLocation) {
              setPickedLocation(null);
            } else {
              void navigate({ to: '/' });
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>スポットを追加</h1>
      </div>

      {/* ステップ1: マップで場所を選択 */}
      {!pickedLocation && (
        <div style={{ flex: 1, position: 'relative' }}>
          <SpotLocationPicker onConfirm={(lat, lng) => setPickedLocation({ lat, lng })} />
        </div>
      )}

      {/* ステップ2: 情報を入力して登録 */}
      {pickedLocation && (
        <div style={{ padding: '20px', maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          <SpotRegistrationForm lat={pickedLocation.lat} lng={pickedLocation.lng} userId={user.id} />
        </div>
      )}
    </div>
  );
}
